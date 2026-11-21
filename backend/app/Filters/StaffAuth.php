<?php

namespace App\Filters;

/**
 * Any signed-in user except consultants, who only get their own timesheet.
 * Replaces 'auth' on the route.
 */
class StaffAuth extends RoleAuth
{
    protected function allows(array $user): bool
    {
        return strtolower((string) ($user['role'] ?? '')) !== 'consultant';
    }

    protected function deniedMessage(): string
    {
        return 'You do not have access to this resource.';
    }
}
