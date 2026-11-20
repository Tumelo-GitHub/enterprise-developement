<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TrainingEventModel extends Model
{
    protected $table = 'training_event';
    protected $allowedFields = [
        'programme_course_id',
        'status_id',
        'service_provider_id',
        'venue_id',
        'event_date',
        'start_time',
        'end_time'
    ];
    protected $updatedField = 'updated_at';

    public function findTrainingEventById($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find event for specified ID');

        return $smme;
    }

    public function findAllEvents() 
    {
        $events = $this->db->query("SELECT training_event.*, p.programme_name, c.course_name, CONCAT(sp.name, ' ',sp.surname) AS service_provider_name, s.status_name, training_venue.venue_name, training_venue.address, pc.programme_id, pc.course_id
                                    FROM training_event
                                    INNER JOIN programme_course pc
                                    ON training_event.programme_course_id = pc.id
                                    INNER JOIN programme p
                                    ON pc.programme_id = p.id
                                    INNER JOIN course c
                                    ON pc.course_id = c.id
                                    INNER JOIN training_event_status s
                                    ON training_event.status_id = s.ID
                                    INNER JOIN service_provider sp
                                    ON training_event.service_provider_id = sp.id
                                    INNER JOIN training_venue
                                    ON training_event.venue_id = training_venue.id
                                    ORDER BY event_date DESC")->getResultArray();

        return $events;
    }

    public function findEventById($id) {
        $events = $this->db->query("SELECT training_event.*, p.programme_name, c.course_name, CONCAT(sp.name, ' ',sp.surname) AS service_provider_name, s.status_name, training_venue.venue_name, training_venue.address, pc.programme_id, pc.course_id
                                    FROM training_event
                                    INNER JOIN programme_course pc
                                    ON training_event.programme_course_id = pc.id
                                    INNER JOIN programme p
                                    ON pc.programme_id = p.id
                                    INNER JOIN course c
                                    ON pc.course_id = c.id
                                    INNER JOIN training_event_status s
                                    ON training_event.status_id = s.ID
                                    INNER JOIN service_provider sp
                                    ON training_event.service_provider_id = sp.id
                                    INNER JOIN training_venue
                                    ON training_event.venue_id = training_venue.id
                                    WHERE training_event.id = :id:",
                                    ['id' => $id])->getRow();

        return $events;
    }
    
// TODO: to have separate model and controller
    public function getVenues () {
        $venue = $this->db->query("SELECT *
                                    FROM training_venue")->getResultArray();

        return $venue;
    }

    public function getInvitedBeneficiaries($event_id) {
        return $this->db->query("SELECT smme_id
                                FROM training_event_smme
                                WHERE event_id = :id:",
                                ['id' => $event_id])->getResultArray();
    }

}