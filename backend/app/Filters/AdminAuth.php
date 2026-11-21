<?php

namespace App\Filters;

/** Restricts a route to users whose role is 'admin'. Replaces 'auth' on the route. */
class AdminAuth extends RoleAuth
{
    protected function allows(array $user): bool
    {
        return ($user['role'] ?? null) === 'admin';
    }

    protected function deniedMessage(): string
    {
        return 'Unauthorized. Admin access required.';
    }
}
