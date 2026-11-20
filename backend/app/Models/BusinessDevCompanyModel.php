<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class BusinessDevCompanyModel extends Model
{
    protected $table = 'bdsp';
    protected $allowedFields = [
        'bdsp_name',
        'physical_address',
        'postal_address',
        'tell_number',
        'cell_number',
        'email',
        'description',
        'registration',
        'tax_number',
        'bbbee_level',
        'products'
    ];

    public function findBDSPById($id)
    {
        $bdsp = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$bdsp) throw new Exception('Could not find Business Development Company for specified ID');

        return $bdsp;
    }
}