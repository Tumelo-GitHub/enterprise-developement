<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class UserModel extends Model
{
    protected $table = 'user';
    protected $allowedFields = [
        'first_name',
        'last_name',
        'phone_number',
        'email',
        'job_title',
        'department',
        'bio',
        'role',
        'active',
        'password',
        'failed_login_attempts',
        'lockout_time',
        'last_login'
    ];
    protected $updatedField = 'updated_at';

    protected $beforeInsert = ['beforeInsert'];
    protected $beforeUpdate = ['beforeUpdate'];

    protected function beforeInsert(array $data): array
    {
        return $this->getUpdatedDataWithHashedPassword($data);
    }

    protected function beforeUpdate(array $data): array
    {
        return $this->getUpdatedDataWithHashedPassword($data);
    }

    private function getUpdatedDataWithHashedPassword(array $data): array
    {
        if (isset($data['data']['password'])) {
            $plaintextPassword = $data['data']['password'];
            $data['data']['password'] = $this->hashPassword($plaintextPassword);
        }
        $data['data']['updated_at'] = date('Y-m-d H:i:s');
        return $data;
    }

    private function hashPassword(string $plaintextPassword): string
    {
        return password_hash($plaintextPassword, PASSWORD_BCRYPT);
    }
                                      
    public function findUserByEmailAddress(string $emailAddress)
    {
        $user = $this
            ->asArray()
            ->where(['email' => $emailAddress, 'active' => 1])
            ->first();

        if (!$user) 
            throw new Exception('User does not exist for specified email address');

        return $user;
    }

    public function incrementFailedLoginAttempts(array $user)
    {
        $this->where('email', $user['email'])->set([
            'failed_login_attempts' => $user['failed_login_attempts'] + 1,
            'lockout_time' => ($user['failed_login_attempts'] >= 2) ? date('Y-m-d H:i:s', strtotime('+15 minutes')) : null, // 3rd attempt locks out
        ], false)->update();
    }

    public function resetFailedLoginAttempts(string $email)
    {
        $this->where('email', $email)->set([
            'failed_login_attempts' => 0,
            'lockout_time' => null,
        ])->update();
    }

    public function isAccountLocked(string $email): bool
    {
        $user = $this->where('email', $email)->first();

        if (!$user) {
            return false;
        }

        if ($user['lockout_time'] && $user['failed_login_attempts'] >= 3) {
            return true; // Account is locked
        }

        return false;
    }
}
