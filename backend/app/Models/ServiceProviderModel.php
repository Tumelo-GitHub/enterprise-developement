<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ServiceProviderModel extends Model
{
    protected $table = 'service_provider';
    protected $allowedFields = [
        'name',
        'surname',
        'email',
        'tel_number',
        'cell_number',
        'qualification',
        'specialization'
    ];

    public function findServiceProviderById ($id)
    {
        $sp = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$sp) throw new Exception('Could not find Service Provider Info for specified ID');

        return $sp;
    }

    public function findServiceProviderRoles($id)
    {
        $course = $this->db->query("SELECT service_type_id, service_type.type AS service_type_name
                                    FROM service_provider_role
                                    INNER JOIN service_type
                                    ON service_provider_role.service_type_id = service_type.id
                                    WHERE service_provider_id = :id:",
                                    ['id' => $id]
                                )->getResultArray();

        return $course;
    }
}