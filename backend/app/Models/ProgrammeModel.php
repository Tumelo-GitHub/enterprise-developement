<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class ProgrammeModel extends Model
{
    protected $table = 'programme';
    protected $allowedFields = [
        'programme_name',
        'description',
        'programme_type',
        'generic_company_id',
        'start_date',
        'end_date',
        'budget',
        'sponsor_name',
        'sponsor_surname',
        'sponsor_cell',
        'sponsor_alt_cell',
        'sponsor_email'
    ];
    
    public function findProgrammeRawDataById($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find Programme for specified ID');

        return $smme;
    }

    public function findProgrammeById($id)
    {
        $db = db_connect();
        $programme = $this->db->query('SELECT programme.*, programme_type.type_name, generic_company.company_name
                                        FROM programme
                                        INNER JOIN generic_company
                                        ON generic_company.id = programme.generic_company_id
                                        INNER JOIN programme_type
                                        ON programme_type.id = programme.programme_type
                                        WHERE programme.id = :id:',
                                        ['id' => $id])->getRow();

        if (!$programme) throw new Exception('Could not find Programme for specified ID');

        return $programme;
    }

    public function getAllProgrammes() {
        $db = db_connect();
        $programme = $this->db->query('SELECT programme.*, programme_type.type_name, generic_company.company_name
                                        FROM programme
                                        INNER JOIN generic_company
                                        ON generic_company.id = programme.generic_company_id
                                        INNER JOIN programme_type
                                        ON programme_type.id = programme.programme_type')->getResultArray();
    
        // if (!$programme) throw new Exception('Could not find programme for specified ID');

        return $programme;
    }

    public function getProgrammeTypes() {
        $db = db_connect();
        $types = $this->db->query('SELECT * FROM programme_type')->getResultArray();

        return $types;
    }
}