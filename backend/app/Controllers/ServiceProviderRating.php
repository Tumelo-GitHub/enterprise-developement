<?php

namespace App\Controllers;

use App\Models\RawServiceProviderModel;
use App\Models\ServiceProviderRatingModel;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class ServiceProviderRating extends BaseController
{
    /**
     * Get all feedback entries (and summary) for a specific service provider
     * @return Response
     */
    public function index($providerId = null)
    {
        if (!$providerId) {
            return $this->getResponse([
                'message' => 'Service provider ID is required'
            ], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $model = new ServiceProviderRatingModel();
        $ratings = $model->findByProviderId((int) $providerId);

        return $this->getResponse([
            'message' => 'Service provider feedback retrieved',
            'data' => array_map([$this, 'formatRating'], $ratings),
            'summary' => $model->getSummaryForProvider((int) $providerId)
        ]);
    }

    /**
     * Capture a new piece of feedback for a service provider
     */
    public function create()
    {
        $rules = [
            'service_provider_id' => 'required|is_natural_no_zero',
            'focus_area' => 'required',
            'rating' => 'required|is_natural_no_zero|greater_than_equal_to[1]|less_than_equal_to[5]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        try {
            (new RawServiceProviderModel())->findProviderById($input['service_provider_id']);
        } catch (Exception $exception) {
            return $this->getResponse([
                'message' => $exception->getMessage()
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $model = new ServiceProviderRatingModel();
        $id = $model->insert([
            'service_provider_id' => (int) $input['service_provider_id'],
            'focus_area' => $input['focus_area'],
            'rating' => (int) $input['rating'],
            'comment' => $input['comment'] ?? null,
            'rated_by' => $input['rated_by'] ?? null
        ]);

        return $this->getResponse([
            'message' => 'Feedback added successfully',
            'data' => $this->formatRating($model->find($id))
        ]);
    }

    /**
     * Update an existing piece of feedback
     */
    public function update($id = null)
    {
        $model = new ServiceProviderRatingModel();
        $rating = $model->find($id);

        if (!$rating) {
            return $this->getResponse([
                'message' => 'Could not find feedback for specified ID'
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $rules = [
            'focus_area' => 'required',
            'rating' => 'required|is_natural_no_zero|greater_than_equal_to[1]|less_than_equal_to[5]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $model->update($id, [
            'focus_area' => $input['focus_area'],
            'rating' => (int) $input['rating'],
            'comment' => $input['comment'] ?? null,
            'rated_by' => $input['rated_by'] ?? null
        ]);

        return $this->getResponse([
            'message' => 'Feedback updated successfully',
            'data' => $this->formatRating($model->find($id))
        ]);
    }

    /**
     * Delete a piece of feedback
     */
    public function delete($id = null)
    {
        $model = new ServiceProviderRatingModel();
        $rating = $model->find($id);

        if (!$rating) {
            return $this->getResponse([
                'message' => 'Could not find feedback for specified ID'
            ], ResponseInterface::HTTP_NOT_FOUND);
        }

        $model->delete($id);

        return $this->getResponse([
            'message' => 'Feedback deleted successfully'
        ]);
    }

    private function formatRating(array $rating): array
    {
        return [
            'id' => (int) $rating['id'],
            'service_provider_id' => (int) $rating['service_provider_id'],
            'focus_area' => $rating['focus_area'],
            'rating' => (int) $rating['rating'],
            'comment' => $rating['comment'],
            'rated_by' => $rating['rated_by'],
            'created_at' => $rating['created_at']
        ];
    }
}
