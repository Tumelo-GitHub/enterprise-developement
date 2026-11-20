<?php

namespace App\Controllers;

use App\Models\GenericCompanyModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class GenericCompany extends BaseController
{
    /**
     * Get all Companies
     * @return Response
     */
    public function index()
    {
        $model = new GenericCompanyModel();
        return $this->getResponse(
            [
                'message' => 'Companies retrieved',
                'data' => $model->findAll()
            ]
        );
    }

    /**
     * Create a new Company
     */
    public function create()
    {
        $rules = [
            'name' => 'required',
            'email' => 'required|min_length[6]|max_length[50]|valid_email|is_unique[client.email]',
            'retainer_fee' => 'required|max_length[255]'
        ];

        $input = $this->getRequestInput($this->request);

        // if (!$this->validateRequest($input, $rules)) {
        //     return $this->getResponse(
        //             $this->validator->getErrors(),
        //             ResponseInterface::HTTP_BAD_REQUEST
        //         );
        // }

        $companyEmail = $input['contact_email'];
        $model = new GenericCompanyModel();
        $model->save($input);
        $company = $model->where('contact_email', $companyEmail)->first();

        return $this->getResponse(
            [
                'message' => 'Company added successfully',
                'data' => $company
            ]
        );
    }

    /**
     * Get a single company by ID
     */
    public function show($id = null)
    {
        try {
            $model = new GenericCompanyModel();
            $company = $model->findCompanyById($id);

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
            $model = new GenericCompanyModel();
            $model->findCompanyById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $company = $model->findCompanyById($id);

            return $this->getResponse(
                [
                    'message' => 'Company updated successfully',
                    'data' => $company
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
     * Delete existing Generic company
     */
    public function delete($id = null) {
        try {
            $model = new GenericCompanyModel();
            $company = $model->findCompanyById($id);
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
?>