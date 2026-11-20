<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ServiceProviderRoleModel extends Model
{
    protected $table = 'service_provider_role';
    protected $allowedFields = [
        'service_provider_id',
        'service_type_id'
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

    public function findServiceProviderRoles ($id)
    {
        $service_type = $this->db->query("SELECT service_type_id
                                    FROM service_provider_role
                                    WHERE service_provider_id = :id:",
                                    ['id' => $id]
                                )->getResultArray();

        return $service_type;
    }

    public function getServiceProvidersbyRoleId ($id) {
        $service_provider = $this->db->query("SELECT service_provider.*
                                        FROM service_provider_role
                                        INNER JOIN service_provider
                                        ON service_provider.id = service_provider_role.service_provider_id
                                        WHERE service_provider_role.service_type_id = :id:",
                                    ['id' => $id]
                                )->getResultArray();

        return $service_provider;
    }
}