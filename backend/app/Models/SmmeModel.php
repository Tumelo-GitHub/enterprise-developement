<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class SmmeModel extends Model
{
    protected $table = 'smme';
    protected $allowedFields = [
        'smme_name',
        'trading_name',
        'business_type',
        'products',
        'description',
        'postal_address',
        'registration_number',
        'web_address',
        'tax_number',
        'bbbee',
        'black_owned',
        'woman_owned',
        'youth_owned',
        'disabled_owned',
        'industry',
        'business_years',
        'programme',
        'contact_origin',
        'registered',
        'vat_number',
        'vendor_number',
        'is_primary_bank',
        'primary_bank_name'
    ];
    protected $updatedField = 'updated_at';

    public function findSmmeById($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find Smme for specified ID');

        return $smme;
    }

    public function getAllSmme() {
        $db = db_connect();
        $smme = $this->db->query('SELECT smme.*, street_address_1, street_address_2, city, province, code, country, address_note FROM smme, address WHERE smme.ID = address.smme_id')->getResultArray();
    
        if (!$smme) throw new Exception('Could not find Smme for specified ID');

        return $smme;
    }
}