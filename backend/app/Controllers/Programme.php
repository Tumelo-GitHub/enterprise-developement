<?php

namespace App\Controllers;

use App\Models\ProgrammeModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class Programme extends BaseController
{
    /**
     * Get all programme
     * @return Response
     */
    public function index()
    {
        $model = new ProgrammeModel();
        return $this->getResponse(
            [
                'message' => 'Programmes retrieved',
                'data' => $model->getAllProgrammes()
            ]
        );
    }

    /**
     * Create a new programme
     */
    public function create()
    {
        $rules = [
            'programme_name' => 'required|is_unique[programme.programme_name]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new ProgrammeModel();
        $id = $model->insert($input);
        // $programme = $model->where('programme_name', $programme_name)->first();
        $programme = $model->findProgrammeById($id);;

        return $this->getResponse(
            [
                'message' => 'Programme added successfully',
                'data' => $programme
            ]
        );
    }

    /**
     * Get a single programme by ID
     */
    public function show($id = null)
    {
        try {
            $model = new ProgrammeModel();
            $programme = $model->findProgrammeById($id);

            return $this->getResponse(
                [
                    'message' => 'Programme retrieved successfully',
                    'data' => $programme
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find programme for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Programme
     */
    public function update($id = null)
    {
        try {
            $model = new ProgrammeModel();
            $model->findProgrammeById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $programme = $model->findProgrammeById($id);

            return $this->getResponse(
                [
                    'message' => 'Programme updated successfully',
                    'data' => $programme
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
     * Delete existing smme
     */
    public function delete($id = null) {
        try {
            $model = new ProgrammeModel();
            $smme = $model->findProgrammeRawDataById($id);
            $model->delete($id);

            return $this->getResponse(
                    [
                        'message' => 'Programme deleted successfully',
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

    // TODO: create separate controller and Model
    public function getProgrammeTypes() {
        $model = new ProgrammeModel();
        return $this->getResponse(
            [
                'message' => 'Programmes retrieved',
                'data' => $model->getProgrammeTypes()
            ]
        );
    }
}
?>