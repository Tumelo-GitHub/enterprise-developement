<?php

namespace App\Controllers;

use App\Models\ComplianceModel;
use App\Models\DocumentModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;
use CodeIgniter\Files\File;

class Compliance extends BaseController
{
    /**
     * Get all Compliances
     * @return Response
     */
    public function index($id = null)
    {
        $model = new ComplianceModel();
        return $this->getResponse(
            [
                'message' => 'Compliances retrieved',
                'data' => $model->findComplianceByCompanyId($id)
            ]
        );
    }

    /**
     * Create a new Compliance
     */
    public function create()
    {
        helper(['form', 'url']);
        $rules = [
            'type_id' => 'required'
        ];

        // $input = $this->getRequestInput($this->request);
        $input = $this->request->getPost();
        
        // contruct file object
        if ($_FILES)
        {
            $data = [
                'category' => 'company_compliance',
                'category_id' => 0,
                'document_name' => $_FILES['file']['name'],
                'document_type' => $_FILES['file']['type'],
                'document_content' => base64_encode(file_get_contents($_FILES['file']['tmp_name']))
            ];
        }

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }
        
        // remove file from compliance obj
        if ($_FILES)
        {
            unset($input['file']);
        }

        $model = new ComplianceModel();
        $id = $model->insert($input);
        
        // save file to the database
        if ($_FILES)
        {
            $data['category_id'] = $id;
            $docModel = new DocumentModel();
            $docModel->save($data);
        }
        // retrieve new compliance
        $compliance = $model->findComplianceById($id);

        return $this->getResponse(
            [
                'message' => 'Compliance added successfully',
                'data' => $compliance
            ]
        );
    }

    /**
     * Get a single compliance by ID
     */
    public function show($id = null)
    {
        try {
            $model = new ComplianceModel();
            $compliance = $model->findComplianceById($id);

            return $this->getResponse(
                [
                    'message' => 'Compliance retrieved successfully',
                    'data' => $compliance
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find compliance for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Compliance
     */
    public function update($id = null)
    {
        helper(['form', 'url']);
        try {
            $model = new ComplianceModel();
            $model->findComplianceById($id);
            $docModel = new DocumentModel();

            $input = $this->request->getPost();
            
            // contruct file object
            $docid = $input['docid'];
            unset($input['docid']);
            if ($_FILES)
            {
                $data = [
                    'category' => 'company_compliance',
                    'category_id' => $id,
                    'document_name' => $_FILES['file']['name'],
                    'document_type' => $_FILES['file']['type'],
                    'document_content' => base64_encode(file_get_contents($_FILES['file']['tmp_name']))
                ];
                
                if ($docid && $docModel->document_exists($docid))
                {
                    // update document
                    $docModel->update($docid, $data);
                }
                else
                {
                    // add new document
                    $docModel->save($data);
                }
                
                unset($input['file']);
            }

            $model->update($id, $input);
            $compliance = $model->findComplianceById($id);

            return $this->getResponse(
                [
                    'message' => 'Compliance updated successfully',
                    'data' => $compliance,
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
     * Delete an existing Compliance
     */
    public function delete($id = null)
    {
        try {
            $model = new ComplianceModel();
            $compliance = $model->findComplianceById($id);
            $model->delete($id);

            return $this->getResponse(
                    [
                        'message' => 'Compliance deleted successfully',
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

    public function getComplianceTypes() {
        try {
            $model = new ComplianceModel();
            $types = $model->getCompliantTypes();

            return $this->getResponse(
                [
                    'message' => 'Compliance Types retrieved successfully',
                    'data' => $types
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find compliance types'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    public function getComplianceStatus() {
        try {
            $model = new ComplianceModel();
            $status = $model->getCompliantStatus();

            return $this->getResponse(
                [
                    'message' => 'Compliance Status retrieved successfully',
                    'data' => $status
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find compliance status'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }
}