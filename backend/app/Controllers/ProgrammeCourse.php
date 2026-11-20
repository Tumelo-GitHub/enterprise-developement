<?php

namespace App\Controllers;

use App\Models\ProgrammeCourseModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class ProgrammeCourse extends BaseController
{
    /**
     * Get all Programmme Courses
     * @return Response
     */
    public function index($id = null)
    {
        $model = new ProgrammeCourseModel();
        return $this->getResponse(
            [
                'message' => 'Programme Course retrieved',
                'data' => $model->findProgrammeCourseByProgrammeId($id)
            ]
        );
    }

    /**
     * Create a new Programme Course
     */
    public function create()
    {
        $rules = [
            'programme_id' => 'required',
            'course_id' => 'required',
            'status' => 'required',
            'budget' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new ProgrammeCourseModel();
        $id = $model->insert($input);
        $course = $model->findProgrammeCourseById($id);

        return $this->getResponse(
            [
                'message' => 'Course added successfully',
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
            $model = new ProgrammeCourseModel();
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
            $model = new ProgrammeCourseModel();
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
            $model = new ProgrammeCourseModel();
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