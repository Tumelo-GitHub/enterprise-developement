<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class RawServiceProviderModel extends Model
{
    protected $table = 'raw_service_providers';
    protected $primaryKey = 'ID';
    protected $returnType = 'array';
    protected $allowedFields = [
        'name',
        'surname',
        'company_name',
        'city',
        'province',
        'tel_no',
        'cell_no',
        'email',
        'service_type',
        'comment'
    ];

    public function findProviderById($id)
    {
        $provider = $this
            ->asArray()
            ->where(['ID' => $id])
            ->first();

        if (!$provider) {
            throw new Exception('Could not find other service provider for specified ID');
        }

        return $provider;
    }
}
