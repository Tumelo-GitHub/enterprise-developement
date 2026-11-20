<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TimesheetDisbursementModel extends Model
{
    protected $table = 'timesheet_disbursement';
    protected $allowedFields = [
        'user_id',
        'item_name',
        'units',
        'price_per_unit',
        'date'
    ];

    public function findItemById ($id)
    {
        $disbursement = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$disbursement) throw new Exception('Could not find disbursement with specific ID');

        return $disbursement;
    }
}