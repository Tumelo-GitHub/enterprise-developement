<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class SmmeContactModel extends Model
{
    protected $table = 'smme_contacts';
    protected $allowedFields = [
        'smme_id',
        'full_names',
        'position',
        'tell_number',
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