<?php

namespace App\Controllers;

use App\Libraries\AccountMailer;
use App\Models\UserModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Admin user management: approve sign-ups, activate/deactivate accounts, change roles.
 * Routes are protected by the 'admin' filter.
 *
 * status is derived: active -> 'active'; inactive and never logged in -> 'pending'
 * (waiting for approval); inactive after logging in before -> 'deactivated'.
 */
class UserAdmin extends BaseController
{
    private const DEFAULT_ROLES = ['admin', 'consultant'];

    public function index()
    {
        $users = (new UserModel())->asArray()
            ->select('id, first_name, last_name, email, phone_number, role, active, last_login')
            ->orderBy('active', 'ASC')
            ->orderBy('first_name', 'ASC')
            ->orderBy('last_name', 'ASC')
            ->findAll();

        return $this->getResponse([
            'message' => 'Users retrieved',
            'data' => [
                'users' => array_map(fn ($u) => $this->present($u), $users),
                'roles' => $this->roles(),
            ],
        ]);
    }

    /** Body: { active?: 0|1, role?: string }. */
    public function update($id = null)
    {
        $model = new UserModel();
        $user = $model->asArray()->find((int) $id);
        if (!$user) {
            return $this->getResponse(['message' => 'User not found', 'data' => null], ResponseInterface::HTTP_NOT_FOUND);
        }

        $input = $this->getRequestInput($this->request) ?? [];
        $changes = [];

        if (array_key_exists('active', $input)) {
            if (!in_array((string) $input['active'], ['0', '1'], true)) {
                return $this->badRequest('active must be 0 or 1.');
            }
            $changes['active'] = (int) $input['active'];
        }
        if (array_key_exists('role', $input)) {
            $role = strtolower(trim((string) $input['role']));
            if (!in_array($role, $this->roles(), true)) {
                return $this->badRequest('Unknown role.');
            }
            $changes['role'] = $role;
        }
        if (!$changes) {
            return $this->badRequest('Nothing to update.');
        }

        // An admin can't lock themselves out
        $me = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));
        if ((int) $me['id'] === (int) $user['id']
            && ((isset($changes['active']) && $changes['active'] === 0) || (isset($changes['role']) && $changes['role'] !== 'admin'))) {
            return $this->badRequest("You can't deactivate your own account or remove your own admin role.");
        }

        $model->update($user['id'], $changes);
        $updated = $model->asArray()->find($user['id']);

        $emailed = null;
        if ((int) $user['active'] === 0 && (int) $updated['active'] === 1) {
            $emailed = AccountMailer::approved($updated);
        }

        return $this->getResponse([
            'message' => 'User updated',
            'data' => $this->present($updated) + ['emailed' => $emailed],
        ]);
    }

    /**
     * Declines a sign-up by removing it. Only for pending accounts (inactive, never logged in),
     * so it can't remove anyone who has used the system. They can sign up again.
     */
    public function delete($id = null)
    {
        $model = new UserModel();
        $user = $model->asArray()->find((int) $id);
        if (!$user) {
            return $this->getResponse(['message' => 'User not found', 'data' => null], ResponseInterface::HTTP_NOT_FOUND);
        }
        if ($this->present($user)['status'] !== 'pending') {
            return $this->getResponse(
                ['message' => 'Only sign-ups waiting for approval can be declined. Deactivate this account instead.', 'data' => null],
                ResponseInterface::HTTP_CONFLICT
            );
        }

        $model->delete($user['id']);

        return $this->getResponse(['message' => 'Sign-up declined', 'data' => null]);
    }

    private function present(array $u): array
    {
        $active = (int) $u['active'] === 1;
        return [
            'id' => (int) $u['id'],
            'first_name' => $u['first_name'],
            'last_name' => $u['last_name'],
            'email' => $u['email'],
            'phone_number' => $u['phone_number'] ?? null,
            'role' => $u['role'],
            'active' => $active ? 1 : 0,
            'last_login' => $u['last_login'] ?? null,
            'status' => $active ? 'active' : (empty($u['last_login']) ? 'pending' : 'deactivated'),
        ];
    }

    /** Roles in use plus the standard ones, so admins can only pick real roles. */
    private function roles(): array
    {
        $rows = (new UserModel())->asArray()->select('role')->distinct()->where('role IS NOT NULL')->findAll();
        $roles = array_map(fn ($r) => strtolower(trim((string) $r['role'])), $rows);
        $roles = array_values(array_unique(array_filter(array_merge(self::DEFAULT_ROLES, $roles))));
        sort($roles);
        return $roles;
    }

    private function badRequest(string $message)
    {
        return $this->getResponse(['message' => $message, 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
    }
}
