<?php

namespace App\Controllers;

use App\Models\RawServiceProviderModel;
use App\Models\ServiceProviderRatingModel;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class MoreServiceProvider extends BaseController
{
    /**
     * Get all Other Service Providers
     * @return Response
     */
    public function index()
    {
        $model = new RawServiceProviderModel();
        $providers = $model->findAll();

        $ratingSummary = (new ServiceProviderRatingModel())->getSummaryForAllProviders();

        return $this->getResponse([
            'message' => 'Other service providers retrieved',
            'data' => array_map(function (array $provider) use ($ratingSummary) {
                return $this->formatProvider($provider, $ratingSummary);
            }, $providers)
        ]);
    }

    /**
     * Get one Other Service Provider by ID
     */
    public function show($id = null)
    {
        try {
            $model = new RawServiceProviderModel();
            $provider = $model->findProviderById($id);

            $summary = (new ServiceProviderRatingModel())->getSummaryForProvider((int) $id);

            return $this->getResponse([
                'message' => 'Other service provider retrieved successfully',
                'data' => $this->formatProvider($provider, [(int) $id => $summary])
            ]);
        } catch (Exception $e) {
            return $this->getResponse([
                'message' => $e->getMessage()
            ], ResponseInterface::HTTP_NOT_FOUND);
        }
    }

    /**
     * Create a new Other Service Provider
     */
    public function create()
    {
        $rules = [
            'name' => 'required',
            'surname' => 'required',
            'company_name' => 'required',
            'city' => 'required',
            'province' => 'required',
            'tel_no' => 'required',
            'cell_no' => 'required',
            'email' => 'required',
            'service_type' => 'required'
        ];

        $input = $this->normalizeInput($this->getRequestInput($this->request));

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $model = new RawServiceProviderModel();
        $id = $model->insert($input);
        $provider = $model->findProviderById($id);

        return $this->getResponse([
            'message' => 'Other service provider added successfully',
            'data' => $this->formatProvider($provider)
        ]);
    }

    /**
     * Update an existing Other Service Provider
     */
    public function update($id = null)
    {
        try {
            $model = new RawServiceProviderModel();
            $model->findProviderById($id);

            $input = $this->normalizeInput($this->getRequestInput($this->request));
            $model->update($id, $input);
            $provider = $model->findProviderById($id);

            return $this->getResponse([
                'message' => 'Other service provider updated successfully',
                'data' => $this->formatProvider($provider)
            ]);
        } catch (Exception $exception) {
            return $this->getResponse([
                'message' => $exception->getMessage()
            ], ResponseInterface::HTTP_NOT_FOUND);
        }
    }

    /**
     * Delete an existing Other Service Provider
     */
    public function delete($id = null)
    {
        try {
            $model = new RawServiceProviderModel();
            $model->findProviderById($id);
            $model->delete($id);

            return $this->getResponse([
                'message' => 'Other service provider deleted successfully'
            ]);
        } catch (Exception $exception) {
            return $this->getResponse([
                'message' => $exception->getMessage()
            ], ResponseInterface::HTTP_NOT_FOUND);
        }
    }

    private function normalizeInput(?array $input): array
    {
        if (!$input) {
            return [];
        }

        if (array_key_exists('tell_number', $input) && !array_key_exists('tel_no', $input)) {
            $input['tel_no'] = $input['tell_number'];
        }

        if (array_key_exists('cell_number', $input) && !array_key_exists('cell_no', $input)) {
            $input['cell_no'] = $input['cell_number'];
        }

        unset($input['tell_number'], $input['cell_number'], $input['id'], $input['ID']);

        return $input;
    }

    private function formatProvider(array $provider, array $ratingSummary = []): array
    {
        $id = (int) $provider['ID'];
        $summary = $ratingSummary[$id] ?? ['average_rating' => null, 'rating_count' => 0];

        return [
            'id' => $id,
            'name' => $provider['name'] ?? '',
            'surname' => $provider['surname'] ?? '',
            'company_name' => $provider['company_name'] ?? '',
            'city' => $provider['city'] ?? '',
            'province' => $provider['province'] ?? '',
            'tel_no' => $provider['tel_no'] ?? '',
            'cell_no' => $provider['cell_no'] ?? '',
            'email' => $provider['email'] ?? '',
            'service_type' => $provider['service_type'] ?? '',
            'comment' => $provider['comment'] ?? '',
            'average_rating' => $summary['average_rating'],
            'rating_count' => $summary['rating_count']
        ];
    }
}
