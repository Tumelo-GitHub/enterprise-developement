<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class SmmeEmpStatsModel extends Model
{
    protected $table = 'smme_employee_stats';
    protected $allowedFields = [
        'smme_id',
        'full_time',
        'part_time',
        'casual',
        'updated_date'
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