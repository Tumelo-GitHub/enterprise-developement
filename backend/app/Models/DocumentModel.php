<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class DocumentModel extends Model
{
    protected $table = 'documents';
    protected $allowedFields = [
        'category',
        'category_id',
        'document_name',
        'document_type',
        'document_content'
    ];

    public function findDocumentById($id)
    {
        $client = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$client) throw new Exception('Could not find document for specified ID');

        return $client;
    }
    
    public function document_exists($id)
    {
        $db = db_connect();
        $document = $db->query("SELECT * FROM documents WHERE id =:id:", ['id' => $id])->getNumRows();
        
        if ($document == 1)
            return true;
        else
            return false;
    }
}