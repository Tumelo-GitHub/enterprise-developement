<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ProgrammeDocumentModel extends Model
{
    protected $table = 'programme_documents';
    protected $allowedFields = [
        'programme_id',
        'category',
        'category_id',
        'document_name',
        'document_type',
        'document_content',
        'file_size',
        'uploaded_by'
    ];

    public function findDocumentById($id)
    {
        $doc = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$doc) throw new Exception('Could not find document for specified ID');

        return $doc;
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