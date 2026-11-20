<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;

/**
 * Restricts a route to authenticated users whose role is 'admin'.
 *
 * Validates the JWT itself (same as JWTAuth) because Config\Feature::$multipleFilters
 * is off, so a route can only carry one filter. Use 'admin' instead of 'auth', not both.
 *
 * - Invalid/missing token -> 401 (lets the frontend interceptor refresh the token)
 * - Valid token, not admin  -> 403
 *
 * The role is read from the user record in the database rather than the token,
 * so a demoted user loses access immediately instead of when their token expires.
 */
class AdminAuth implements FilterInterface
{
    public function __construct()
    {
        helper('jwt');
    }

    public function before(RequestInterface $request, $arguments = null)
    {
        try {
            $encodedToken = getJWTFromRequest($request->getServer('HTTP_AUTHORIZATION'));
            validateJWTFromRequest($encodedToken);
        } catch (Exception $ex) {
            return Services::response()
                ->setJSON(['error' => $ex->getMessage()])
                ->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
        }

        try {
            $user = getLoggedInUser($encodedToken);
            if (($user['role'] ?? null) === 'admin') {
                return $request;
            }
        } catch (Exception $ex) {
            // fall through to forbidden
        }

        return Services::response()
            ->setJSON([
                'message' => 'Unauthorized. Admin access required.',
                'data' => null
            ])
            ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        //
    }
}
