<?php

namespace App\Controllers;

use App\Models\CourseModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class Course extends BaseController
{
    /**
     * Get all Courses
     * @return Response
     */
    public function index()
    {
        $model = new CourseModel();
        return $this->getResponse(
            [
                'message' => 'Course retrieved',
                'data' => $model->findAllCourses()
            ]
        );
    }

    /**
     * Create a new Programme Course
     */
    public function create()
    {
        $rules = [
            'training_institute_id ' => 'required',
            'course_name' => 'required',
            'course_code' => 'required',
            'duration' => 'required',
            'credits' => 'required',
            'nqf_level' => 'required',
            'description' => 'required',
            'exam' => 'required',
            'target_audiance' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new CourseModel();
        $id = $model->insert($input);
        $course = $model->findCourseById($id);

        return $this->getResponse(
            [
                'message' => 'Course added successfully',
                'data' => $course
            ]
        );
    }

    /**
     * Get a single course by ID
     */
    public function show($id = null)
    {
        try {
            $model = new CourseModel();
            $course = $model->findCourseById($id);

            return $this->getResponse(
                [
                    'message' => 'Course retrieved successfully',
                    'data' => $course
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find course for specified ID'
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
            $model = new CourseModel();
            $model->findCourseById($id);

            $input = $this->getRequestInput($this->request);

            // TODO: update findCourseId to return institude name
            $model->update($id, $input);
            $course = $model->findCourseById($id);

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
            $model = new CourseModel();
            $course = $model->findCourseById($id);
            $model->delete($course->id);

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