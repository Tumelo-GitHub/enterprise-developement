<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TrainingEventRegisterModel extends Model
{
    protected $table = 'training_event_attendance';
    protected $allowedFields = [
        'event_id',
        'smme_id',
        'attendee',
        'email',
        'tel_number',
        'age',
        'gender',
        'qualification'
    ];
    protected $updatedField = 'updated_at';

    public function findEntryById ($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find event for specified ID');

        return $smme;
    }

    /**
     * Function to get the whole attendance register of the event
     */
    public function getRegisterByEventId ($id) {
        $register = $this->db->query("SELECT training_event_attendance.*, smme.smme_name, registered, black_owned, woman_owned, youth_owned, disabled_owned, products, industry, address.location_type, training_event.event_date, course.course_name, training_venue.venue_name
                                    FROM training_event_attendance
                                    INNER JOIN smme
                                    ON training_event_attendance.smme_id = smme.id
                                    INNER JOIN training_event
                                    ON training_event_attendance.event_id = training_event.id
                                    INNER JOIN programme_course
                                    ON training_event.programme_course_id = programme_course.id
                                    INNER JOIN course
                                    ON programme_course.course_id = course.id
                                    INNER JOIN training_venue
                                    ON training_event.venue_id = training_venue.id
                                    INNER JOIN address
                                    ON smme.id = address.smme_id
                                    WHERE event_id = :id:",
                                    ['id' => $id])->getResultArray();

        return $register;
    }

    /*
    function to get single entry in register
    */
    public function findRegisterById ($id) {
        $register = $this->db->query("SELECT training_event_attendance.*, smme.smme_name, registered, black_owned, woman_owned, youth_owned, disabled_owned, address.location_type
                                    FROM training_event_attendance
                                    INNER JOIN smme
                                    ON training_event_attendance.smme_id = smme.id
                                    INNER JOIN address
                                    ON smme.id = address.smme_id
                                    WHERE training_event_attendance.id = :id:",
                                    ['id' => $id])->getRow();

        return $register;
    }
}