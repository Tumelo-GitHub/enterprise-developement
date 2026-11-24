<?php

namespace App\Controllers;

use App\Models\DocumentModel;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

/**
 * Stored documents (file content is kept base64-encoded in the documents table).
 */
class Document extends BaseController
{
    /** Multipart upload: file, category, category_id. */
    public function create()
    {
        $file = $this->request->getFile('file');
        if (!$file || !$file->isValid()) {
            return $this->getResponse(['message' => 'Please attach a valid file.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $input = $this->request->getPost();
        if (empty($input['category']) || empty($input['category_id'])) {
            return $this->getResponse(['message' => 'category and category_id are required.'], ResponseInterface::HTTP_BAD_REQUEST);
        }

        $data = [
            'category' => $input['category'],
            'category_id' => (int) $input['category_id'],
            'document_name' => $file->getClientName(),
            'document_type' => $file->getClientMimeType(),
            'document_content' => base64_encode(file_get_contents($file->getTempName())),
        ];

        $model = new DocumentModel();
        $id = $model->insert($data);

        return $this->getResponse([
            'message' => 'Document uploaded',
            'data' => ['id' => $id, 'document_name' => $data['document_name']],
        ]);
    }

    /** Downloads the document as a file. */
    public function display($id = null)
    {
        try {
            $document = (new DocumentModel())->findDocumentById($id);
        } catch (Exception $e) {
            return $this->getResponse(['message' => 'Could not find document for specified ID'], ResponseInterface::HTTP_NOT_FOUND);
        }

        // Strip characters that could break out of the header value
        $filename = str_replace(['"', '\\', "\r", "\n"], '', (string) $document['document_name']) ?: 'document';

        return $this->response
            ->setHeader('Content-Type', $document['document_type'] ?: 'application/octet-stream')
            ->setHeader('Content-Disposition', 'attachment; filename="' . $filename . '"')
            ->setBody(base64_decode($document['document_content']));
    }
}
