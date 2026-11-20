<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TrainingVenueModel extends Model
{
    protected $table = 'training_venue';
    protected $allowedFields = [
        'venue_name',
        'address',
        'tel_number',
        'email'
    ];

    public function finVenueById($id)
    {
        $address = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$address) throw new Exception('Could not find venue for specified ID');

        return $address;
    }
}