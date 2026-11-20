<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TimesheetCompanyModel extends Model
{
    protected $table = 'timesheet_companies';
    protected $allowedFields = [
        'company_name',
    ];

    public function findItemById ($id)
    {
        $sheet = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$sheet) throw new Exception('Could not find Timesheet with specific ID');

        return $sheet;
    }

    public function getProjects() {
        return $this->db->query('SELECT * FROM timesheet_project')->getResultArray();
    }

    public function getCompaniesByProjectId($id) {
        return $this->db->query('SELECT timesheet_companies.id, company_name, timesheet_company_status.status
                                FROM timesheet_project_companies
                                INNER JOIN timesheet_companies
                                ON timesheet_project_companies.company_id = timesheet_companies.id
                                INNER JOIN timesheet_company_status
                                ON timesheet_project_companies.status = timesheet_company_status.id
                                WHERE project_id = :id:
                                ORDER BY company_name',
                                ['id' => $id])->getResultArray();
    }
}