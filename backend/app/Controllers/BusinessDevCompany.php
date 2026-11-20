<?php

namespace App\Controllers;

use App\Models\BusinessDevCompanyModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class BusinessDevCompany extends BaseController
{
    /**
     * Get all Bdsps
     * @return Response
     */
    public function index()
    {
        $model = new BusinessDevCompanyModel();
        return $this->getResponse(
            [
                'message' => 'Companies retrieved',
                'data' => $model->findAll()
            ]
        );
    }

    /**
     * Create a new Client
     */
    public function create()
    {
        $rules = [
            'bdsp_name' => 'required|is_unique[bdsp.bdsp_name]'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $bdsp_name = $input['bdsp_name'];
        $model = new BusinessDevCompanyModel();
        $model->save($input);
        $bdsp = $model->where('bdsp_name', $bdsp_name)->first();

        return $this->getResponse(
            [
                'message' => 'Company added successfully',
                'data' => $bdsp
            ]
        );
    }

    /**
     * Get a single company by ID
     */
    public function show($id = null)
    {
        try {
            $model = new BusinessDevCompanyModel();
            $company = $model->findBDSPById($id);

            return $this->getResponse(
                [
                    'message' => 'Company retrieved successfully',
                    'data' => $company
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find company for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Company
     */
    public function update($id = null)
    {
        try {
            $model = new BusinessDevCompanyModel();
            $model->findBDSPById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $company = $model->findBDSPById($id);

            return $this->getResponse(
                [
                    'message' => 'Company updated successfully',
                    'data' => $company,
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
     * Delete an existing Company
     */
    public function delete($id = null)
    {
        try {
            $model = new BusinessDevCompanyModel();
            $company = $model->findBDSPById($id);
            $model->delete($company);

            return $this->getResponse(
                    [
                        'message' => 'Company deleted successfully',
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