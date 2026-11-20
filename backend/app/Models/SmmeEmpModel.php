<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class SmmeEmpModel extends Model
{
    protected $table = 'smme_emp';
    protected $allowedFields = [
        'company',
        'name',
        'surname',
        'position',
        'role',
        'cell_number',
        'email'
    ];

    public function findEmpById ($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find Employee for specified ID');

        return $smme;
    }
}