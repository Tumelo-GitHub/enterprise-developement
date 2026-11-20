<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class GenericCompanyModel extends Model
{
    protected $table = 'generic_company';
    protected $allowedFields = [
        'company_name',
        'physical_address',
        'postal_address',
        'dept_name',
        'dept_address',
        'contact_name',
        'contact_surname',
        'contact_cell',
        'contact_alt_cell',
        'contact_email'
    ];
    protected $updatedField = 'updated_at';

    public function findCompanyById($id)
    {
        $company = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$company) throw new Exception('Could not find company for specified ID');

        return $company;
    }
}