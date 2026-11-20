<?php

namespace App\Models;

use CodeIgniter\Model;

class TimesheetProjectCompanyModel extends Model
{
    protected $table = 'timesheet_project_companies';
    protected $returnType = 'array';
    protected $allowedFields = [
        'project_id',
        'company_id',
        'status',
    ];
}
