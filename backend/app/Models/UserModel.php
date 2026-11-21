<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class UserModel extends Model
{
    /** Wrong passwords in a row before the account is locked. */
    public const MAX_FAILED_ATTEMPTS = 3;
    public const LOCKOUT_MINUTES = 15;

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

    /** Records a wrong password; the MAX_FAILED_ATTEMPTS-th in a row locks the account for LOCKOUT_MINUTES. */
    public function incrementFailedLoginAttempts(array $user)
    {
        $attempts = (int) ($user['failed_login_attempts'] ?? 0) + 1;

        $this->update($user['id'], [
            'failed_login_attempts' => $attempts,
            'lockout_time' => $attempts >= self::MAX_FAILED_ATTEMPTS
                ? date('Y-m-d H:i:s', strtotime('+' . self::LOCKOUT_MINUTES . ' minutes'))
                : null,
        ]);
    }

    public function resetFailedLoginAttempts(string $email)
    {
        $this->where('email', $email)->set([
            'failed_login_attempts' => 0,
            'lockout_time' => null,
        ])->update();
    }

    /**
     * Whether the account is currently locked. Once the lockout time has passed the lock is
     * cleared and the user gets a fresh set of attempts.
     */
    public function isAccountLocked(string $email): bool
    {
        $user = $this->asArray()->where('email', $email)->first();

        if (!$user || empty($user['lockout_time'])) {
            return false;
        }

        if (strtotime($user['lockout_time']) > time()) {
            return true;
        }

        $this->resetFailedLoginAttempts($email); // lock expired
        return false;
    }

    /** Minutes until the lock lifts (at least 1), or 0 if the account isn't locked. */
    public function lockoutMinutesRemaining(string $email): int
    {
        $user = $this->asArray()->select('lockout_time')->where('email', $email)->first();
        $until = $user && !empty($user['lockout_time']) ? strtotime($user['lockout_time']) : 0;
        return $until > time() ? (int) ceil(($until - time()) / 60) : 0;
    }
}
