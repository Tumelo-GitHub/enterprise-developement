<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Config\Services;
use Exception;

/**
 * Base for filters that require a valid JWT and a role check.
 *
 * Validates the JWT itself (same as JWTAuth) because Config\Feature::$multipleFilters
 * is off, so a route can only carry one filter. Use a role filter instead of 'auth', not both.
 *
 * - Invalid/missing token -> 401 (lets the frontend refresh the token)
 * - Valid token, role not allowed -> 403
 *
 * The role is read from the user record in the database rather than the token,
 * so a role change applies immediately instead of when the token expires.
 */
abstract class RoleAuth implements FilterInterface
{
    public function __construct()
    {
        helper('jwt');
    }

    /** Whether this user (a row from the user table) may use the route. */
    abstract protected function allows(array $user): bool;

    abstract protected function deniedMessage(): string;

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
            if ($this->allows(getLoggedInUser($encodedToken))) {
                return $request;
            }
        } catch (Exception $ex) {
            // fall through to forbidden
        }

        return Services::response()
            ->setJSON(['message' => $this->deniedMessage(), 'data' => null])
            ->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        //
    }
}
