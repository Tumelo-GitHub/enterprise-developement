<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class AddressModel extends Model
{
    protected $table = 'address';
    // protected $primaryKey = 'smme_id';
    protected $allowedFields = [
        'smme_id',
        'street_address_1',
        'street_address_2',
        'city',
        'province',
        'code',
        'country',
        'address_note',
        'location_type'
    ];

    public function findAddressById($id)
    {
        $address = $this
            ->asArray()
            ->where(['smme_id' => $id])
            ->first();

        if (!$address) throw new Exception('Could not find Addresss for specified ID');

        return $address;
    }

    public function updateAddress($id = null, $data = null): bool {
        $db = db_connect();
        $sql = "UPDATE address SET street_address_1 = :street_address_1:, street_address_2 = :street_address_2:, city = :city:, province = :province:, code = :code:, country =:country:, address_note = :address_note: WHERE smme_id = :id:";
    
        $db->query($sql, [
            'street_address_1'     => $data['street_address_1'],
            'street_address_2'     => $data['street_address_2'],
            'city' => $data['city'],
            'province'   => $data['province'],
            'code' => $data['code'],
            'country' => $data['country'],
            'address_note' => $data['address_note'],
            'id' => $id
        ]);

        if($db->affectedRows() == 1){
            return true;
        } else {
            return false;
        }
    }
}