<?php

namespace App\Libraries;

use App\Models\UserModel;

/**
 * Emails about user accounts. Sending is best-effort: failures are logged and reported
 * as false, never thrown, so a mail problem can't break sign-up or approval.
 */
class AccountMailer
{
    /** Absolute link into the Angular app. app.frontendURL must be set in .env on each server. */
    public static function frontendUrl(string $path = ''): string
    {
        $base = rtrim((string) (env('app.frontendURL') ?: base_url()), '/');
        return $base . '/' . ltrim($path, '/');
    }

    /** Tells every active admin that someone signed up and is waiting for approval. */
    public static function newSignup(array $user): bool
    {
        $admins = (new UserModel())->asArray()
            ->select('email')
            ->where(['role' => 'admin', 'active' => 1])
            ->findAll();
        $to = array_column($admins, 'email');
        if (!$to) {
            return false;
        }

        $name = esc(trim(($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '')));
        $email = esc($user['email'] ?? '');
        $link = esc(self::frontendUrl('administration/users'), 'attr');

        return self::send($to, 'New account waiting for approval', "
            <p>Hi,</p>
            <p><strong>$name</strong> ($email) has signed up and is waiting for an administrator to approve their account.</p>
            <p><a href=\"$link\" style=\"color: #007bff; text-decoration: none;\">Review pending accounts</a></p>
        ");
    }

    /** Lets a user know their account is active and they can log in. */
    public static function approved(array $user): bool
    {
        $name = esc($user['first_name'] ?? '');
        $link = esc(self::frontendUrl('auth/login'), 'attr');

        return self::send([$user['email']], 'Your account has been approved', "
            <p>Hi $name,</p>
            <p>Your account has been approved. You can now log in.</p>
            <p><a href=\"$link\" style=\"color: #007bff; text-decoration: none;\">Log in</a></p>
            <p>Thank you,<br>The Support Team</p>
        ");
    }

    private static function send(array $to, string $subject, string $html): bool
    {
        try {
            $email = \Config\Services::email();
            $email->setTo($to);
            $email->setSubject($subject);
            $email->setMessage($html);
            if ($email->send()) {
                return true;
            }
            log_message('error', 'Account email "{subject}" failed: {debug}', [
                'subject' => $subject,
                'debug' => $email->printDebugger(['headers']),
            ]);
        } catch (\Throwable $e) {
            log_message('error', 'Account email "{subject}" failed: {error}', ['subject' => $subject, 'error' => $e->getMessage()]);
        }
        return false;
    }
}
