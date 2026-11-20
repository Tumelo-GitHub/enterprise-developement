<?php

namespace App\Controllers;

use App\Models\BdspEmpModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class BdspEmp extends BaseController
{
    /**
     * Get all Clients
     * @return Response
     */
    public function index($id = null)
    {
        $model = new BdspEmpModel();
        return $this->getResponse(
            [
                'message' => 'Employees retrieved',
                'data' => $model->where('company', $id)->findAll()
            ]
        );
    }

    /**
     * Create a new employee
     */
    public function create()
    {
        $rules = [
            'name' => 'required',
            'surname' => 'required',
            'email' => 'required|min_length[6]|max_length[50]|valid_email',
            'cell_number' => 'required',
            'company' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $model = new BdspEmpModel();
        $id = $model->insert($input);
        $employee = $model->where('id', $id)->first();

        return $this->getResponse(
            [
                'message' => 'Employee added successfully',
                'data' => $employee
            ]
        );
    }

    /**
     * Update an existing Employee
     */
    public function update($id = null)
    {
        try {
            $model = new BdspEmpModel();
            $model->findEmpById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $employee = $model->findEmpById($id);

            return $this->getResponse(
                [
                    'message' => 'Employee updated successfully',
                    'data' => $employee,
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
     * Delete an existing employee
     */
    public function delete($id = null)
    {
        try {
            $model = new BdspEmpModel();
            $employee = $model->findEmpById($id);
            $model->delete($employee);

            return $this->getResponse(
                    [
                        'message' => 'Employee deleted successfully',
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