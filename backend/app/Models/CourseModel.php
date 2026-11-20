<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class CourseModel extends Model
{
    protected $table = 'course';
    protected $allowedFields = [
        'training_institute_id',
        'course_name',
        'course_code',
        'duration',
        'credits',
        'nqf_level',
        'description',
        'exam',
        'target_audiance'
    ];

    // public function findCourseById ($id)
    // {
    //     $course = $this
    //         ->asArray()
    //         ->where(['id' => $id])
    //         ->first();

    //     if (!$course) throw new Exception('Could not find Course Info for specified ID');

    //     return $course;
    // }

    public function findAllCourses()
    {
        $course = $this->db->query("SELECT course.*, training_institude.name AS training_institute_name
                                        FROM course
                                        INNER JOIN training_institude
                                        ON training_institude.id = course.training_institute_id"
                                )->getResultArray();

        return $course;
    }

    public function findCourseById($id) {
        $course = $this->db->query("SELECT course.*, training_institude.name AS training_institute_name
                                        FROM course
                                        INNER JOIN training_institude
                                        ON training_institude.id = course.training_institute_id
                                        WHERE course.id = :id:",
                                        ['id' => $id]
                                )->getRow();

        if (!$course) throw new Exception('Could not find Course Info for specified ID');

        return $course;
    }
}