<?php

namespace App\Filters;

use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\Filters\FilterInterface;

/**
 * CORS headers. Allowed origins come from `cors.allowedOrigins` in .env (comma-separated,
 * e.g. "https://app.example.com,http://localhost:4200"). Only a listed origin is echoed back.
 * If the setting is empty, any origin is allowed (the previous behaviour), so set it on servers.
 */
class Cors implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $allowed = array_filter(array_map('trim', explode(',', (string) env('cors.allowedOrigins', ''))));
        $origin = $request->getHeaderLine('Origin');

        if (!$allowed) {
            header('Access-Control-Allow-Origin: *');
        } elseif ($origin !== '' && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Access-Control-Allow-Credentials: true');
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Headers: X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method, Authorization');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE');

        if ($request->getMethod(true) === 'OPTIONS') {
            exit;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        //
    }
}
