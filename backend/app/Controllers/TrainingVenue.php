<?php

namespace App\Controllers;

use App\Models\TrainingVenueModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class TrainingVenue extends BaseController
{
    /**
     * Get Venues
     * @return Response
     */
    public function index()
    {
        $model = new TrainingVenueModel();
        return $this->getResponse(
            [
                'message' => 'Training Venues retrieved successfully',
                'data' => $model->findAll()
            ]
        );
    }

    /**
     * Create a new Training venue
     */
    public function create()
    {
        $rules = [
            'venue_name ' => 'required',
            'address' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new TrainingVenueModel();
        $id = $model->insert($input);

        return $this->getResponse(
            [
                'message' => 'Course added successfully',
                'data' => $model->where('id', $id)->first()
            ]
        );
    }

    /**
     * Get a single venue by ID
     */
    public function show($id = null)
    {
        try {
            $model = new TrainingVenueModel();
            $venue = $model->findCourseById($id);

            return $this->getResponse(
                [
                    'message' => 'Course retrieved successfully',
                    'data' => $venue
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find venue for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Course
     */
    public function update($id = null)
    {
        try {
            $model = new TrainingVenueModel();
            $model->find($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $venue = $model->find($id);

            return $this->getResponse(
                [
                    'message' => 'Course updated successfully',
                    'data' => $venue,
                ]
            );
        } catch (Exception $exception) {

            return $this->getResponse(
                [
                    'message' => $exception->getMessage()
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Delete an existing Programme Course
     */
    public function delete($id = null)
    {
        try {
            $model = new TrainingVenueModel();
            $venue = $model->find($id);
            $model->delete($venue->id);

            return $this->getResponse(
                    [
                        'message' => 'Training venue deleted successfully',
                    ]
                );
        } catch (Exception $exception) {
            return $this->getResponse(
                [
                    'message' => $exception->getMessage()
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }
}