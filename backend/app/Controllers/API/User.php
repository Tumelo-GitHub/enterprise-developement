<?php

namespace App\Controllers\API;

use App\Models\UserModel;
use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use CodeIgniter\RESTful\ResourceController;
use CodeIgniter\API\ResponseTrait;
use Exception;
use ReflectionException;

class User extends BaseController
{
    /**
     * Register a new user
     * @return Response
     * @throws ReflectionException
     */
    public function register()
    {
        $rules = [
            'first_name' => 'required|min_length[3]|max_length[50]',
            'last_name' => 'required|min_length[3]|max_length[50]',
            'email' => 'required|min_length[6]|max_length[50]|valid_email|is_unique[user.email]',
            'password' => 'required|min_length[6]|max_length[255]',
            'phone_number' => 'required|min_length[10]|max_length[15]'
        ];

        $input = $this->getRequestInput($this->request) ?? [];
        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        // Only these fields come from the request. Role and status are never client-controlled:
        // self-registered users are always consultants.
        $data = array_intersect_key($input, array_flip(['first_name', 'last_name', 'email', 'password', 'phone_number']));
        $data['role'] = 'consultant';

        $userModel = new UserModel();
        $userModel->insert($data);

        return $this->getResponse(
            [
                'message' => 'User registered successfully',
                'data' => true
            ]
        );
    }

    /**
     * Authenticate Existing User
     * @return Response
     */
    public function login()
    {
        $rules = [
            'email' => 'required|valid_email',
            'password' => 'required|validateUser[email, password]'
        ];

        $userModel = new UserModel();
        $input = $this->getRequestInput($this->request);

        // Log the login attempt with the email
        log_message('info', "Login attempt for email: {email}", ['email' => $input['email']]);

        // Check if the account is locked
        if ($userModel->isAccountLocked($input['email'])) {
            log_message('warning', "Login attempt for locked account: {email}", ['email' => $input['email']]);
            return $this->getResponse(
                ['error' => 'Your account is temporarily locked. Try again later.'],
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        // Validate input credentials
        if (!$this->validateRequest($input, $rules)) {
            log_message('error', "Invalid login attempt for email: {email}", ['email' => $input['email']]);
            return $this->getResponse(
                ['error' => 'Invalid login credentials provided'],
                ResponseInterface::HTTP_UNAUTHORIZED
            );
        }

        // Fetch user data for JWT generation
        try {
            $user = $userModel->findUserByEmailAddress($input['email']);
            $userModel->update($user['id'], ['last_login' => date("Y-m-d H:i:s")]);
            log_message('info', "User authenticated successfully: {email}", ['email' => $input['email']]);
            return $this->getJWTForUser($user);
        } catch (Exception $e) {
            log_message('critical', "Error during login for email: {email}. Error: {error}", [
                'email' => $input['email'],
                'error' => $e->getMessage()
            ]);
            return $this->getResponse(
                ['error' => 'An unexpected error occurred. Please try again later.'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }


    public function logout()
    {
        // TODO: destory all user sessions, returns true
        $session = \Config\Services::session();
        $session->destroy();

        return $this->getResponse(
            [
                'message' => 'Logged out',
                'data' => true
            ]
        );
    }

    /**
     * Forgot Password - Request reset link
     */
    public function forgotPassword()
    {
        $rules = [
            'email' => 'required|valid_email',
        ];

        if (!$this->validate($rules)) {
            return $this->getResponse(['errors' => $this->validator->getErrors()], ResponseInterface::HTTP_BAD_REQUEST);
        }

        // Same answer whether or not the address exists, so this can't be used to find accounts
        $generic = $this->getResponse(
            ['message' => 'If that email address has an account, a password reset link has been sent.'],
            ResponseInterface::HTTP_OK
        );

        $user = (new UserModel())->asArray()
            ->where(['email' => $this->request->getVar('email'), 'active' => 1])
            ->first();
        if (!$user) {
            return $generic;
        }

        helper('jwt');
        if (!$this->sendResetEmail($user, getSignedResetTokenForUser($user))) {
            return $this->getResponse(
                ['error' => 'We could not send the reset email right now. Please try again later.'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        return $generic;
    }

    /**
     * Reset Password
     */
    public function resetPassword()
    {
        $rules = [
            'password' => 'required|min_length[6]|max_length[255]',
            'token' => 'required'
        ];

        if (!$this->validate($rules)) {
            return $this->getResponse(['errors' => $this->validator->getErrors()], ResponseInterface::HTTP_BAD_REQUEST);
        }

        helper('jwt');
        try {
            // Rejects expired, wrong-type and already-used links (the password fingerprint changes on use)
            $user = getUserFromPurposeToken((string) $this->request->getVar('token'), 'reset');
        } catch (Exception $e) {
            return $this->getResponse(
                ['error' => 'This reset link is invalid, expired or has already been used.'],
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        (new UserModel())->update($user['id'], [
            'password' => $this->request->getVar('password'),
            'failed_login_attempts' => 0,
            'lockout_time' => null,
        ]);

        return $this->getResponse(
            ['message' => 'Password updated successfully.'],
            ResponseInterface::HTTP_OK
        );
    }

    /**
     * Change Password
     * @return Response
     */
    public function changePassword()
    {
        $rules = [
            'current_password' => 'required',
            'new_password' => 'required|min_length[6]|max_length[255]',
        ];

        if (!$this->validate($rules)) {
            return $this->getResponse(['errors' => $this->validator->getErrors()], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $input = $this->getRequestInput($this->request);
        $userModel = new UserModel();

        // Retrieve logged-in user details from JWT
        $loggedInUser = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));

        try {
            $user = $userModel->find($loggedInUser['id']);

            // Verify current password
            if (!password_verify($input['current_password'], $user['password'])) {
                // 400, not 401: a 401 makes the frontend try to refresh the session
                return $this->getResponse(
                    ['error' => 'Current password is incorrect.'],
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            // update new password
            $userModel->update($user['id'], ['password' => $input['new_password']]);

            // Changing the password revokes existing refresh tokens; give this session a new one
            return $this->getResponse(
                [
                    'message' => 'Password changed successfully.',
                    'refresh_token' => getSignedRefreshTokenForUser($userModel->asArray()->find($user['id']))
                ],
                ResponseInterface::HTTP_OK
            );
        } catch (Exception $e) {
            return $this->getResponse(
                ['error' => 'An unexpected error occurred. Please try again later.'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Update User Information
     * @param int $id
     * @return Response
     */
    public function updateUser($id)
    {
        $loggedInUser = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));
        $isAdmin = ($loggedInUser['role'] ?? null) === 'admin';
        if (!$isAdmin && (int) $loggedInUser['id'] !== (int) $id) {
            return $this->getResponse(
                ['message' => 'You can only update your own profile.', 'data' => null],
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        $rules = [
            'first_name' => 'required|min_length[2]|max_length[50]',
            'last_name' => 'required|min_length[2]|max_length[50]',
            'phone_number' => 'required|min_length[10]|max_length[15]',
        ];

        $input = $this->getRequestInput($this->request) ?? [];

        // Validate the input
        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $userModel = new UserModel();

        // Check if the user exists
        $user = $userModel->find($id);
        if (!$user) {
            return $this->getResponse(
                ['message' => 'User not found'],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        // Profile fields only. Role, status, password and email can't be changed here
        // (email identifies the user in their login token).
        $data = array_intersect_key($input, array_flip(['first_name', 'last_name', 'phone_number', 'job_title', 'department', 'bio']));
        $userModel->update($id, $data);

        return $this->getResponse(
            ['message' => 'User information updated successfully'],
            ResponseInterface::HTTP_OK
        );
    }

    /**
     * Retrieve All Users
     * Only accessible by admin users.
     * @return Response
     */
    public function getAllUsers()
    {
        // Retrieve logged-in user details from JWT
        $loggedInUser = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));

        // Check if the logged-in user is an admin
        if ($loggedInUser['role'] !== 'admin') {
            return $this->getResponse(
                [
                    'message' => 'Unauthorized. Only admin users can access this resource.',
                    'data' => null
                ],
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        // Fetch all users from the database
        $userModel = new UserModel();
        $users = $userModel->select('id, first_name, last_name, email, role, active')
            ->findAll();

        return $this->getResponse(
            [
                'message' => 'Users retrieved successfully',
                'data' => $users
            ]
        );
    }

    /**
     * Refresh JWT Token
     */
    public function refreshToken()
    {
        helper('jwt');

        $input = $this->getRequestInput($this->request) ?? [];
        $refreshToken = (string) ($input['refresh_token'] ?? '');

        try {
            // Must be a refresh token (not an access token), unexpired, for an active user
            // whose password hasn't changed since it was issued.
            $user = getUserFromPurposeToken($refreshToken, 'refresh');
        } catch (Exception $e) {
            return $this->getResponse(
                ['error' => 'Your session has expired. Please log in again.'],
                ResponseInterface::HTTP_UNAUTHORIZED
            );
        }

        return $this->getJWTForUser($user);
    }

    /** Sends the reset link. @return bool whether the email was sent */
    private function sendResetEmail(array $user, string $token): bool
    {
        // Link to the frontend reset page. app.frontendURL must be set in .env on each server.
        $frontend = rtrim((string) (env('app.frontendURL') ?: base_url()), '/');
        $resetLink = esc($frontend . '/auth/password-reset?token=' . urlencode($token), 'attr');
        $firstName = esc($user['first_name'] ?? '');

        $emailService = \Config\Services::email();
        $emailService->setTo($user['email']);
        $emailService->setSubject('Password Reset Request');
        $emailService->setMessage("
            <p>Hi $firstName,</p>
            <p>We received a request to reset your password. Please click the link below to reset your password. The link works once and expires in 1 hour.</p>
            <p><a href=\"$resetLink\" style=\"color: #007bff; text-decoration: none;\">Reset Password</a></p>
            <p>If you did not request this change, you can safely ignore this email.</p>
            <p>Thank you,<br>The Support Team</p>
        ");

        if (!$emailService->send()) {
            log_message('error', 'Failed to send password reset email: ' . $emailService->printDebugger(['headers']));
            return false;
        }
        return true;
    }

    /**
     * Generate a JWT for the user
     * @param array $user
     * @return ResponseInterface
     */
    private function getJWTForUser(array $user)
    {
        try {
            helper('jwt');
            $refreshToken = getSignedRefreshTokenForUser($user); // needs the password hash
            unset($user['password']);

            return $this->getResponse(
                [
                    'message' => 'User authenticated successfully',
                    'data' => getSignedJWTForUser($user),
                    'refresh_token' => $refreshToken
                ]
            );
        } catch (Exception $ex) {
            log_message('error', 'Token generation failed: {error}', ['error' => $ex->getMessage()]);
            return $this->getResponse(
                ['error' => 'Could not sign you in. Please try again.'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
