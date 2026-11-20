<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class SmmeAppointmentModel extends Model
{
    protected $table = 'smme_appointment';
    protected $allowedFields = [
        'smme_id',
        'programme_id',
        'appointment_date',
        'status'
    ];

    public function findAppointedSmmeById($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find SMME Appointment for specified ID');

        return $smme;
    }

    public function findSmmeAppointmentByProgrammeId($id)
    {
        $smmeAppointment = $this->db->query("SELECT smme_appointment.id, smme_name, smme_id, appointment_date, smme_status.status_name, status
                                        FROM smme_appointment, smme_status, smme
                                        WHERE smme_appointment.smme_id = smme.id AND smme_appointment.status = smme_status.ID AND programme_id = :programme_id:",
                                    ['programme_id' => $id]
                                )->getResultArray();

        // if (!$smmeAppointment) throw new Exception('Could not find Compliances');

        return $smmeAppointment;
    }

    public function findSmmeAppointmentById($id)
    {
        $smmeAppointment = $this->db->query("SELECT smme_appointment.id, smme_name, smme_id, appointment_date, smme_status.status_name, status
                                            FROM smme_appointment, smme_status, smme
                                            WHERE smme_appointment.smme_id = smme.id 
                                            AND smme_appointment.status = smme_status.ID 
                                            AND smme_appointment.id = :id:",
                                    ['id' => $id]
                                )->getRow();

        return $smmeAppointment;
    }
}