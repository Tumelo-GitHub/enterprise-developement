<?php

use App\Models\UserModel;
use Config\Services;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

function getJWTFromRequest($authenticationHeader): string
{
    if (is_null($authenticationHeader)) { //JWT is absent
        throw new Exception('Missing or invalid JWT in request');
    }
    //JWT is sent from client in the format Bearer XXXXXXXXX
    return explode(' ', $authenticationHeader)[1];
}

function validateJWTFromRequest(string $encodedToken)
{
    getLoggedInUser($encodedToken);
}

function getSignedJWTForUser($user)
{
    $issuedAtTime = time();
    $tokenTimeToLive = getenv('JWT_TIME_TO_LIVE');
    $tokenExpiration = $issuedAtTime + $tokenTimeToLive;    // expire time in seconds
    $notBeforeClaim = $issuedAtTime + 0;                   // not before in seconds
    $payload = [
        "iss" => base_url(), // this can be the servername. Example: https://domain.com
        "aud" => "Audience that the JWT",
        "sub" => "Subject of the JWT",
        "nbf" => $notBeforeClaim,
        'iat' => $issuedAtTime,
        'exp' => $tokenExpiration,
        'typ' => 'access',
        "data" => array(
            'user' => $user
        )
    ];

    $jwt = encodeJWT($payload);
    return $jwt;
}

/**
 * The active user an access token belongs to. Throws for invalid/expired tokens and for
 * refresh or password-reset tokens, so those can never be used to call the API.
 */
function getLoggedInUser(string $encodedToken) {
    $decoded = decodeJWT($encodedToken);
    if (($decoded->typ ?? 'access') !== 'access' || empty($decoded->data->user->email)) {
        throw new Exception('Invalid access token');
    }
    return (new UserModel())->findUserByEmailAddress($decoded->data->user->email);
}

/**
 * Short fingerprint of the user's current password hash. Embedded in refresh and reset
 * tokens so that changing the password invalidates them (and a reset link works once).
 */
function passwordFingerprint(array $user): string
{
    return substr(hash_hmac('sha256', (string) ($user['password'] ?? ''), (string) Services::getSecretKey()), 0, 24);
}

/** Long-lived token that can only be exchanged for a new access token. */
function getSignedRefreshTokenForUser(array $user): string
{
    $now = time();
    return encodeJWT([
        'iss' => base_url(),
        'iat' => $now,
        'nbf' => $now,
        'exp' => $now + (int) (getenv('JWT_REFRESH_TIME_TO_LIVE') ?: 604800), // default 7 days
        'typ' => 'refresh',
        'sub' => (int) $user['id'],
        'pfp' => passwordFingerprint($user),
    ]);
}

/** Single-use (via the password fingerprint) token for the reset-password link. */
function getSignedResetTokenForUser(array $user, int $ttl = 3600): string
{
    $now = time();
    return encodeJWT([
        'iat' => $now,
        'exp' => $now + $ttl,
        'typ' => 'reset',
        'sub' => (int) $user['id'],
        'pfp' => passwordFingerprint($user),
    ]);
}

/**
 * Validates a refresh/reset token and returns its active user. Throws if the token is
 * invalid, expired, the wrong type, or the password changed since it was issued.
 */
function getUserFromPurposeToken(string $encodedToken, string $type): array
{
    $decoded = decodeJWT($encodedToken);
    if (($decoded->typ ?? null) !== $type || empty($decoded->sub)) {
        throw new Exception('Invalid token');
    }
    $user = (new UserModel())->asArray()->where(['id' => (int) $decoded->sub, 'active' => 1])->first();
    if (!$user || !hash_equals(passwordFingerprint($user), (string) ($decoded->pfp ?? ''))) {
        throw new Exception('Invalid token');
    }
    return $user;
}

function decodeJWT(string $encodedToken) {
    $key = Services::getSecretKey();
    return JWT::decode($encodedToken, new key($key, 'HS256'));
}

function encodeJWT($payload) {
    return JWT::encode($payload, Services::getSecretKey(), 'HS256');
}