<?php

namespace App\Controllers;

use App\Models\ProgrammeDocumentModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class ProgrammeDocument extends BaseController
{
    /**
     * Get all Programmme Documents
     * @return Response
     */
    public function index($id = null)
    {
        $model = new ProgrammeDocumentModel();
        return $this->getResponse(
            [
                'message' => 'Programme Documents retrieved',
                'data' => $model->where('programme_id', $id)->findAll()
            ]
        );
    }

    /**
     * Create a new Programme Course
     */
    public function create()
    {
        $rules = [
            'category' => 'required',
            'document_content' => 'required',
            'document_name' => 'required',
            'document_type' => 'required',
            'file_size' => 'required',
            'programme_id' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new ProgrammeDocumentModel();
        $id = $model->insert($input);
        $course = $model->where('id', $id)->first();

        return $this->getResponse(
            [
                'message' => 'File Uploaded',
                'data' => $course
            ]
        );
    }

    /**
     * Get a single client by ID
     */
    public function show($id = null)
    {
        try {
            $model = new ProgrammeDocumentModel();
            $client = $model->findClientById($id);

            return $this->getResponse(
                [
                    'message' => 'Client retrieved successfully',
                    'data' => $client
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find client for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Programme Course
     */
    public function update($id = null)
    {
        try {
            $model = new ProgrammeDocumentModel();
            $model->findProgrammeCourseById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $course = $model->findProgrammeCourseById($id);

            return $this->getResponse(
                [
                    'message' => 'Course updated successfully',
                    'data' => $course,
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
            $model = new ProgrammeDocumentModel();
            $course = $model->findProgrammeCourseRawDataById($id);
            $model->delete($course);

            return $this->getResponse(
                    [
                        'message' => 'Course deleted successfully',
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