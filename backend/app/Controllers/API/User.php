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

        $input = $this->getRequestInput($this->request);
        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $userModel = new UserModel();
        $userModel->save($input);

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

        $email = $this->request->getVar('email');
        $userModel = new UserModel();

        try {
            $user = $userModel->where('email', $email)->first();

            if (!$user) {
                return $this->getResponse(
                    ['message' => 'Email address not found'],
                    ResponseInterface::HTTP_NOT_FOUND
                );
            }

            // Generate JWT reset token
            helper('jwt');
            $resetToken = encodeJWT([
                'email' => $user['email'],
                'exp' => time() + 3600, // Token expires in 1 hour
            ]);

            // Send reset email (with token)
            $this->sendResetEmail($user, $resetToken);

            return $this->getResponse(
                ['message' => 'Password reset email sent.'],
                ResponseInterface::HTTP_OK
            );
        } catch (Exception $e) {
            return $this->getResponse(
                ['error' => $e->getMessage()],
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }
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

        $token = $this->request->getVar('token');
        $password = $this->request->getVar('password');

        helper('jwt');
        try {
            $decoded = decodeJWT($token);

            $email = $decoded->email;
            $userModel = new UserModel();
            $user = $userModel->findUserByEmailAddress($email);

            // Update password
            $userModel->update($user['id'], ['password' => $password]);

            return $this->getResponse(
                ['message' => 'Password updated successfully.'],
                ResponseInterface::HTTP_OK
            );
        } catch (Exception $e) {
            return $this->getResponse(
                ['error' => 'Invalid or expired reset token.'],
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }
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
                return $this->getResponse(
                    ['error' => 'Current password is incorrect.'],
                    ResponseInterface::HTTP_UNAUTHORIZED
                );
            }

            // update new password
            $userModel->update($user['id'], ['password' => $input['new_password']]);

            return $this->getResponse(
                ['message' => 'Password changed successfully.'],
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
        $rules = [
            'first_name' => 'required|min_length[2]|max_length[50]',
            'last_name' => 'required|min_length[2]|max_length[50]',
            'phone_number' => 'required|min_length[10]|max_length[15]',
        ];

        $input = $this->getRequestInput($this->request);

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

        $userModel->update($id, $input);

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
        helper('jwt'); // Load the JWT helper

        // Get the token from the Authorization header
        $encodedToken = $this->request->getHeaderLine('Authorization');
        $encodedToken = str_replace('Bearer ', '', $encodedToken); // Remove 'Bearer ' prefix

        try {
            // Decode the existing token
            $decodedToken = decodeJWT($encodedToken);

            // Fetch the user from the database
            $userModel = new UserModel();
            $user = $userModel->findUserByEmailAddress($decodedToken->data->user->email);

            if (!$user) {
                return $this->getResponse(
                    ['error' => 'User not found.'],
                    ResponseInterface::HTTP_NOT_FOUND
                );
            }

            // Generate a new token
            return $this->getJWTForUser($user);
        } catch (Exception $e) {
            log_message('error', "Error refreshing token: {error}", ['error' => $e->getMessage()]);
            return $this->getResponse(
                ['error' => 'Invalid or expired token. Please log in again.'],
                ResponseInterface::HTTP_UNAUTHORIZED
            );
        }
    }

    /**
     * Send Reset Email
     */
    private function sendResetEmail($user, $token)
    {
        $resetLink = site_url("reset-password?token=$token");
        $firstName = $user['first_name'];

        $emailService = \Config\Services::email();
        $emailService->setTo($user['email']);
        $emailService->setSubject('Password Reset Request');
        $emailService->setMessage("
            <pHi $firstName,</p>
            <p>We received a request to reset your password. Please click the link below to reset your password:</p>
            <p><a href='$resetLink' style='color: #007bff; text-decoration: none;'>Reset Password</a></p>
            <p>If you did not request this change, you can safely ignore this email.</p>
            <p>Thank you,<br>The Support Team</p>
        ");

        if (!$emailService->send()) {
            log_message('error', 'Failed to send password reset email: ' . $emailService->printDebugger());
            return $this->getResponse(
                ['message' => 'Failed to send password reset email'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Generate a JWT for the user
     * @param array $user
     * @return ResponseInterface
     */
    private function getJWTForUser(array $user)
    {
        try {
            unset($user['password']);
            helper('jwt');

            return $this->getResponse(
                [
                    'message' => 'User authenticated successfully',
                    'data' => getSignedJWTForUser($user)
                ]
            );
        } catch (Exception $ex) {
            return $this->getResponse(
                [
                    'error' => $ex->getMessage(),
                ]
            );
        }
    }
}
