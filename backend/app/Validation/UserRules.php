<?php

namespace App\Validation;

use App\Models\UserModel;
use Exception;

class UserRules
{
    public function validateUser(string $str, string $fields, array $data): bool
    {
        $model = new UserModel();
        try {
            if ($model->isAccountLocked($data['email'])) {
                return false; // Account is locked
            }

            $user = $model->findUserByEmailAddress($data['email']);

            if (!password_verify($data['password'], $user['password'])) {
                $model->incrementFailedLoginAttempts($user);
                return false; // Invalid credentials
            }

            // Reset failed attempts on successful login
            $model->resetFailedLoginAttempts($data['email']);
            return true;
        } catch (Exception $ex) {
            log_message('error', 'Login validation error: ' . $ex->getMessage());
            return false;
        }
    }
}