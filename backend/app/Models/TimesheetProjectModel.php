<?php

namespace App\Models;

use CodeIgniter\Model;

class TimesheetProjectModel extends Model
{
    protected $table = 'timesheet_project';
    protected $returnType = 'array';
    protected $allowedFields = [
        'project_name',
    ];
}
