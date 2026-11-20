<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ComplianceModel extends Model
{
    protected $table = 'company_compliance';
    protected $allowedFields = [
        'type_id',
        'registration_num',
        'smme_id',
        'issued_date',
        'expiry_date',
        'status',
        'isVerified',
        'verified_person'
    ];

    public function findComplianceById ($id)
    {
        $compliance = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$compliance) throw new Exception('Could not find Compliance Info for specified ID');

        return $compliance;
    }

    public function findComplianceByCompanyId($id)
    {
        $compliances = $this->db->query("SELECT c.*, d.id AS docid, d.document_name
                                    FROM company_compliance AS c
                                    LEFT JOIN documents AS d
                                    ON d.category = 'company_compliance' AND d.category_id = c.id
                                    WHERE c.smme_id = :id:",
                                    ['id' => $id]
                                )->getResultArray();

        if (!$compliances) throw new Exception('Could not find Compliances');

        return $compliances;
    }

    public function getCompliantTypes () {
        $types = $this->db->query('SELECT * FROM `compliance_type`')->getResultArray();
    
        if (!$types) throw new Exception('Could not find Compliance types');

        return $types;
    }

    public function getCompliantStatus () {
        $status = $this->db->query('SELECT * FROM `compliance_status`')->getResultArray();
    
        if (!$status) throw new Exception('Could not find Compliance status');

        return $status;
    }
}