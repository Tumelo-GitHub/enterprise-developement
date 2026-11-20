<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class AnnualTurnoverModel extends Model
{
    protected $table = 'smme_turnover';
    protected $allowedFields = [
        'smme_id',
        'turnover',
        'year'
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