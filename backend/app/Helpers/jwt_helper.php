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
    $decodedToken = decodeJWT($encodedToken);
    $userModel = new UserModel();
    $userModel->findUserByEmailAddress($decodedToken->data->user->email);
}

function getSignedJWTForUser($user)
{
    $issuedAtTime = time();
    $tokenTimeToLive = getenv('JWT_TIME_TO_LIVE');
    $tokenExpiration = $issuedAtTime + $tokenTimeToLive;    // expire time in seconds
    $notBeforeClaim = $issuedAtTime + 0;                   // not before in seconds
    $pvtKey = Services::getPrivateKey();                    // get RSA private key (NOT IN USE)
    $payload = [
        "iss" => base_url(), // this can be the servername. Example: https://domain.com
        "aud" => "Audience that the JWT",
        "sub" => "Subject of the JWT",
        "nbf" => $notBeforeClaim,
        'iat' => $issuedAtTime,
        'exp' => $tokenExpiration,
        "data" => array(
            'user' => $user
        )
    ];

    $jwt = encodeJWT($payload);
    return $jwt;
}

function getLoggedInUser(string $encodedToken) {
    return (new UserModel())->findUserByEmailAddress(decodeJWT($encodedToken)->data->user->email);
}

function decodeJWT(string $encodedToken) {
    $key = Services::getSecretKey();
    return JWT::decode($encodedToken, new key($key, 'HS256'));
}

function encodeJWT($payload) {
    return JWT::encode($payload, Services::getSecretKey(), 'HS256');
}