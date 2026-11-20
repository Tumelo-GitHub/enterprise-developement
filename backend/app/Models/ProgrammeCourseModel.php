<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ProgrammeCourseModel extends Model
{
    protected $table = 'programme_course';
    protected $allowedFields = [
        'programme_id',
        'course_id',
        'status',
        'budget'
    ];
    
    public function findProgrammeCourseRawDataById($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find Programme Course for specified ID');

        return $smme;
    }

    public function findProgrammeCourseById ($id)
    {
        $course = $this->db->query("SELECT pc.id, pc.programme_id, c.course_name, pc.course_id, s.status_name, pc.status, pc.budget
                                    FROM programme_course pc
                                    INNER JOIN programme_course_status s
                                    ON s.ID = pc.status
                                    INNER JOIN course c
                                    ON c.id = pc.course_id
                                    WHERE pc.id = :id:",
                                    ['id' => $id]
                                )->getRow();

        if (!$course) throw new Exception('Could not find Programme Course Info for specified ID');

        return $course;
    }

    public function findProgrammeCourseByProgrammeId($id)
    {
        $course = $this->db->query("SELECT pc.id, pc.programme_id, c.course_name, pc.course_id, s.status_name, pc.status, pc.budget
                                        FROM programme_course pc
                                        INNER JOIN programme_course_status s
                                        ON s.ID = pc.status
                                        INNER JOIN course c
                                        ON c.id = pc.course_id
                                        WHERE pc.programme_id = :id:",
                                        ['id' => $id]
                                    )->getResultArray();

        if (!$course) throw new Exception('Could not find Course');

        return $course;
    }
}