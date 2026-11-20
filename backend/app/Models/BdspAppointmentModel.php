<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class BdspAppointmentModel extends Model
{
    protected $table = 'bdsp_appointment';
    protected $allowedFields = [
        'bdsp_id',
        'programme_id',
        'appointment_date',
        'contract_start_date',
        'contract_end_date',
        'description'
    ];

    public function findAppointedBdspById($id)
    {
        $bdsp = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$bdsp) throw new Exception('Could not find BDSP Appointment for specified ID');

        return $bdsp;
    }

    public function findBdspAppointmentByProgrammeId($id)
    { 
        $bdspAppointment = $this->db->query("SELECT bdsp_appointment.*, bdsp.bdsp_name, programme.programme_name
                                            FROM bdsp_appointment
                                            INNER JOIN bdsp
                                            ON bdsp.id = bdsp_appointment.bdsp_id
                                            INNER JOIN programme
                                            ON programme.id = bdsp_appointment.programme_id
                                            WHERE programme_id = :programme_id:",
                                    ['programme_id' => $id]
                                )->getResultArray();

        return $bdspAppointment;
    }

    public function findBdspAppointmentById($id)
    {
        $smmeAppointment = $this->db->query("SELECT bdsp_appointment.*, bdsp.bdsp_name, programme.programme_name
                                            FROM bdsp_appointment
                                            INNER JOIN bdsp
                                            ON bdsp.id = bdsp_appointment.bdsp_id
                                            INNER JOIN programme
                                            ON programme.id = bdsp_appointment.programme_id
                                            WHERE bdsp_appointment.id = :id:",
                                    ['id' => $id]
                                )->getRow();

        // if (!$smmeAppointment) throw new Exception('Could not find Compliances');

        return $smmeAppointment;
    }
    // public function getCompliantTypes () {
    //     $types = $this->db->query('SELECT * FROM `compliance_type`')->getResultArray();
    
    //     if (!$types) throw new Exception('Could not find Compliance types');

    //     return $types;
    // }

    // public function getCompliantStatus () {
    //     $status = $this->db->query('SELECT * FROM `compliance_status`')->getResultArray();
    
    //     if (!$status) throw new Exception('Could not find Compliance status');

    //     return $status;
    // }
}