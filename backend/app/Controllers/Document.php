<?php

namespace App\Controllers;

use App\Models\DocumentModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;
use CodeIgniter\Files\File;

class Document extends BaseController
{
    /**
     * Get all Clients
     * @return Response
     */
    public function index()
    {
        $model = new DocumentModel();
        return $this->getResponse(
            [
                'message' => 'Clients retrieved',
                'clients' => $model->findAll()
            ]
        );
    }

    /**
     * Create a new Client
     */
    public function create()
    {
        helper(['form', 'url']);

        $rules = [
            'file' => 'uploaded[file]'
        ];

        $input = $this->request->getPost();
        $file = $this->request->getFile('file');

        $data = [
            'category' => $input['category'],
            'category_id' => (int) $input['category_id'],
            'document_name' => $_FILES['file']['name'],
            'document_type' => $_FILES['file']['type'],
            'document_content' => base64_encode(file_get_contents($_FILES['file']['tmp_name']))
        ];

        $model = new DocumentModel();
        $model->save($data);

        return $this->getResponse(
            [
                'message' => 'Document uploaded',
                'data' => $this->request->getPost()
            ]
        );
    }

    public function display($id = null)
    {
        try {
            $model = new DocumentModel();
            $document = $model->findDocumentById($id);

            header('Content-Disposition: attachment; filename="' . $document['document_name'] . '"');
            header('Content-type: '. $document['document_type']);
            // header('Content-Transfer-Encoding: binary');
            // header('Accept-Range: bytes');
            echo (base64_decode($document['document_content']));

            return $this->getResponse(
                [
                    'message' => 'Document retrieved successfully',
                    'document' => $document['document_name']
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find document for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Get a single client by ID
     */
    public function show($id = null)
    {
        try {
            $model = new DocumentModel();
            $client = $model->findClientById($id);

            return $this->getResponse(
                [
                    'message' => 'Client retrieved successfully',
                    'client' => $client
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
     * Update an existing Client
     */
    public function update($id = null)
    {
        try {
            $model = new DocumentModel();
            $model->findClientById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $client = $model->findClientById($id);

            return $this->getResponse(
                [
                    'message' => 'Client updated successfully',
                    'client' => $client,
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
     * Delete an existing Client
     */
    public function delete($id = null)
    {
        try {
            $model = new DocumentModel();
            $client = $model->findClientById($id);
            $model->delete($id);

            return $this->getResponse(
                    [
                        'message' => 'Client deleted successfully',
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