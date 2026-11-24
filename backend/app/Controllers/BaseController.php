<?php

namespace App\Controllers;

use CodeIgniter\Controller;
use CodeIgniter\HTTP\CLIRequest;
use CodeIgniter\HTTP\IncomingRequest;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Psr\Log\LoggerInterface;
use CodeIgniter\Validation\Exceptions\ValidationException;
use Config\Services;
use CodeIgniter\RESTful\ResourceController;

/**
 * Class BaseController
 *
 * BaseController provides a convenient place for loading components
 * and performing functions that are needed by all your controllers.
 * Extend this class in any new controllers:
 *     class Home extends BaseController
 *
 * For security be sure to declare any new methods as protected or private.
 */
abstract class BaseController extends Controller
{
    /**
     * Instance of the main Request object.
     *
     * @var CLIRequest|IncomingRequest
     */
    protected $request;

    /**
     * An array of helpers to be loaded automatically upon
     * class instantiation. These helpers will be available
     * to all other controllers that extend BaseController.
     *
     * @var array
     */
    protected $helpers = [];

    /**
     * Be sure to declare properties for any property fetch you initialized.
     * The creation of dynamic property is deprecated in PHP 8.2.
     */
    // protected $session;

    /**
     * @return void
     */
    public function initController(RequestInterface $request, ResponseInterface $response, LoggerInterface $logger)
    {
        // Do Not Edit This Line
        parent::initController($request, $response, $logger);

        // Preload any models, libraries, etc, here.
        helper('jwt', 'url');

        // E.g.: $this->session = \Config\Services::session();
    }

    /**
     * Returns a JSON response. Error responses (4xx/5xx) always carry a readable 'message',
     * so the frontend can rely on error.error.message; see normalizeErrorBody().
     */
    public function getResponse(array $responseBody, int $code = ResponseInterface::HTTP_OK)
    {
        if ($code >= 400) {
            $responseBody = $this->normalizeErrorBody($responseBody);
        }

        return $this
            ->response
            ->setStatusCode($code)
            ->setJSON($responseBody);
    }

    /**
     * Controllers report errors in three shapes: ['message' => ...], ['error' => ...] (auth),
     * and a bare validator map ['field' => 'problem', ...]. This adds 'message' (and 'errors'
     * for validator maps) without removing the original keys, so existing clients keep working.
     */
    private function normalizeErrorBody(array $body): array
    {
        if (isset($body['message']) && is_string($body['message']) && $body['message'] !== '') {
            return $body;
        }

        if (isset($body['error']) && is_string($body['error'])) {
            return ['message' => $body['error']] + $body;
        }

        if (isset($body['errors']) && is_array($body['errors']) && $body['errors']) {
            return ['message' => (string) reset($body['errors'])] + $body;
        }

        // Bare validator map: every value is a string keyed by field name
        $isList = array_keys($body) === range(0, count($body) - 1);
        if ($body && !$isList && count(array_filter($body, 'is_string')) === count($body)) {
            return ['message' => (string) reset($body), 'errors' => $body] + $body;
        }

        return ['message' => 'Something went wrong. Please try again.'] + $body;
    }

    /**
     * Checks both fields in a request to get its content
     * Don’t forget to import the IncomingRequest class. [use CodeIgniter\HTTP\IncomingRequest;]
     */
    public function getRequestInput(IncomingRequest $request){
        $input = $request->getPost();
        if (empty($input)) {
            //convert request body to associative array
            $input = json_decode($request->getBody(), true);
        }
        return $input;
    }

    /**
     * Checks both fields in a request to get its content
     * Don’t forget to import the necessary classes. 
     * [use CodeIgniter\Validation\Exceptions\ValidationException;]
     * [use Config\Services;]
     */
    public function validateRequest($input, array $rules, array $messages =[]){
        $this->validator = Services::Validation()->setRules($rules);
        // If you replace the $rules array with the name of the group
        if (is_string($rules)) {
            $validation = config('Validation');
    
            // If the rule wasn't found in the \Config\Validation, we
            // should throw an exception so the developer can find it.
            if (!isset($validation->$rules)) {
                throw ValidationException::forRuleNotFound($rules);
            }
    
            // If no error message is defined, use the error message in the Config\Validation file
            if (!$messages) {
                $errorName = $rules . '_errors';
                $messages = $validation->$errorName ?? [];
            }
    
            $rules = $validation->$rules;
        }
        return $this->validator->setRules($rules, $messages)->run($input);
    }
}
