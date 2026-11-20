<?php

namespace App\Controllers;

use App\Models\TimesheetDisbursementModel;
use App\Models\TimesheetModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class Timesheet extends BaseController
{
    /**
     * Get Timesheets between dates or for a specific user
     * Only admin users can retrieve timesheets for other users.
     * @return Response
     */
    public function index()
    {
        $startDate = $this->request->getGet('start_date'); // Retrieve start date from query parameter
        $endDate = $this->request->getGet('end_date'); // Retrieve end date from query parameter
        $userId = $this->request->getGet('user_id'); // Retrieve user_id from query parameter

        // Get logged-in user details
        $loggedInUser = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));
        $loggedInUserId = $loggedInUser['id'];
        $isAdmin = $loggedInUser['role'] === 'admin'; // Assume 'role' is part of the user data

        // If a specific user's timesheet is requested, check admin privileges
        if ($userId && !$isAdmin) {
            return $this->getResponse(
                [
                    'message' => 'Unauthorized. Only admin users can access other users\' timesheets.',
                    'data' => null
                ],
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        // Determine the target user (use logged-in user if user_id is not provided)
        $filterUserId = $userId ?: $loggedInUserId;

        // If no date range is provided, use the current month's date range
        if (!$startDate || !$endDate) {
            $startDate = date('Y-m-01'); // First day of the current month
            $endDate = date('Y-m-t'); // Last day of the current month
        }

        $model = new TimesheetModel();
        $disbursementModel = new TimesheetDisbursementModel();

        // Build the query
        $query = $this->itemQuery($model)
            ->where('timesheet.user_id', $filterUserId)
            ->where('timesheet.date >=', $startDate)
            ->where('timesheet.date <=', $endDate)
            ->orderBy('timesheet.date', 'ASC');

        $companyFilter = filter_var($this->request->getGet('company_id'), FILTER_VALIDATE_INT);
        if ($companyFilter) {
            $query->where('timesheet.company_id', $companyFilter);
        }

        $disbursementQuery = $disbursementModel->where([
            'user_id' => $filterUserId, 
            'date >=' => $startDate,
            'date <=' => $endDate])
            ->orderBy('date', 'ASC');

        // Execute the query and fetch results
        $data = [
            'timesheetItems' => $query->findAll(),
            'disbursementItems' => $disbursementQuery->findAll()
        ];
        

        return $this->getResponse(
            [
                'message' => 'Timesheets retrieved',
                'data' => $data
            ]
        );
    }

    /**
     * Get project totals for a company within a date range. Admin access only.
     */
    public function companyReport()
    {
        $loggedInUser = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')));
        if (($loggedInUser['role'] ?? null) !== 'admin') {
            return $this->getResponse(
                ['message' => 'Unauthorized. Only admin users can access company timesheet reports.', 'data' => null],
                ResponseInterface::HTTP_FORBIDDEN
            );
        }

        $companyIdInput = $this->request->getGet('company_id');
        $companyId = ($companyIdInput === null || $companyIdInput === '')
            ? null
            : filter_var($companyIdInput, FILTER_VALIDATE_INT);
        $userIdInput = $this->request->getGet('user_id');
        $reportUserId = ($userIdInput === null || $userIdInput === '') ? null : filter_var($userIdInput, FILTER_VALIDATE_INT);
        $startDate = $this->request->getGet('start_date');
        $endDate = $this->request->getGet('end_date');
        $start = is_string($startDate) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $startDate) : false;
        $end = is_string($endDate) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $endDate) : false;

        if (
            ($companyIdInput !== null && $companyIdInput !== '' && (!$companyId || $companyId < 1)) ||
            ($userIdInput !== null && $userIdInput !== '' && (!$reportUserId || $reportUserId < 1)) ||
            !$start || $start->format('Y-m-d') !== $startDate ||
            !$end || $end->format('Y-m-d') !== $endDate ||
            $start > $end
        ) {
            return $this->getResponse(
                ['message' => 'A valid date range and optional company are required.', 'data' => null],
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $extraWhere = '';
        $bindings = [$startDate, $endDate];

        if ($companyId !== null) {
            $extraWhere .= ' AND timesheet.company_id = ?';
            $bindings[] = $companyId;
        }

        if ($reportUserId !== null) {
            $extraWhere .= ' AND timesheet.user_id = ?';
            $bindings[] = $reportUserId;
        }

        $rows = \Config\Database::connect()->query(
            "SELECT timesheet.project_id, timesheet_project.project_name, timesheet.company_id,
                    timesheet_companies.company_name,
                    SUM(TIME_TO_SEC(timesheet.duration)) AS total_seconds,
                    GROUP_CONCAT(NULLIF(NULLIF(TRIM(timesheet.comment), ''), '0') SEPARATOR ', ') AS comments
             FROM timesheet
             INNER JOIN timesheet_project ON timesheet_project.id = timesheet.project_id
             INNER JOIN timesheet_companies ON timesheet_companies.id = timesheet.company_id
             WHERE timesheet.date >= ?
               AND timesheet.date <= ?
               $extraWhere
               AND timesheet.duration != '00:00:00'
             GROUP BY timesheet.project_id, timesheet_project.project_name,
                      timesheet.company_id, timesheet_companies.company_name
             ORDER BY timesheet_companies.company_name, timesheet_project.project_name",
            $bindings
        )->getResultArray();

        foreach ($rows as &$row) {
            $totalSeconds = max(0, (int) $row['total_seconds']);
            $hours = intdiv($totalSeconds, 3600);
            $minutes = intdiv($totalSeconds % 3600, 60);
            $seconds = $totalSeconds % 60;
            $row['total_seconds'] = $totalSeconds;
            $row['total_time'] = sprintf('%02d:%02d:%02d', $hours, $minutes, $seconds);
        }
        unset($row);

        return $this->getResponse([
            'message' => 'Company timesheet report retrieved',
            'data' => $rows
        ]);
    }

    /**
     * Create a new sheet record
     */
    public function create()
{
    $rules = [
        '*.date' => 'required',
        '*.project_id' => 'required',
        '*.company_id' => 'required',
        '*.duration' => 'required',
    ];

    $input = $this->getRequestInput($this->request);

    if (!$this->validateRequest($input, $rules)) {
        return $this->getResponse(
            $this->validator->getErrors(),
            ResponseInterface::HTTP_BAD_REQUEST
        );
    }

    // Resolve all lookups before inserting anything, so a bad row doesn't leave a partial save
    try {
        $input = array_map(fn ($item) => $this->applyLookups($item), $input);
    } catch (\InvalidArgumentException $e) {
        return $this->getResponse(['message' => $e->getMessage(), 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
    }

    $userId = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')))['id'];
    $timesheetModel = new TimesheetModel();
    $insertedItems = [];

    foreach ($input as $item) {
        $item['user_id'] = $userId;
        $id = $timesheetModel->insert($item);
        $insertedItems[] = $this->getTimesheetItem($id);
    }

    return $this->getResponse([
        'message' => 'Timesheet items added successfully',
        'data' => $insertedItems
    ]);
}



    /**
     * Update an existing Timesheet Item
     */
    public function update($id = null)
    {
        try {
            $model = new TimesheetModel();
            $model->findItemById($id);

            $input = $this->getRequestInput($this->request);

            try {
                $input = $this->applyLookups($input ?? []);
            } catch (\InvalidArgumentException $e) {
                return $this->getResponse(['message' => $e->getMessage(), 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
            }

            $model->update($id, $input);

            return $this->getResponse(
                [
                    'message' => 'Timesheet Item updated successfully',
                    'data' => $this->getTimesheetItem($id)
                ]
            );
        } catch (Exception $exception) {

            return $this->getResponse(
                [
                    'message' => $exception->getMessage()
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Delete an existing Timesheet item
     */
    public function delete($id = null)
    {
        try {
            $model = new TimesheetModel();
            $item = $model->findItemById($id);
            $model->delete($item);

            return $this->getResponse(
                [
                    'message' => 'Item deleted successfully',
                ]
            );
        } catch (Exception $exception) {
            return $this->getResponse(
                [
                    'message' => $exception->getMessage()
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Get all timesheet projects
     * @return Response
     */
    public function getProjects()
    {
        $model = new TimesheetModel();
        return $this->getResponse(
            [
                'message' => 'Timesheet projects retrieved',
                'data' => $model->getProjects()
            ]
        );
    }

    public function getCompanies()
    {
        $companies = \Config\Database::connect()
            ->table('timesheet_companies')
            ->select('id, company_name')
            ->orderBy('company_name', 'ASC')
            ->get()
            ->getResultArray();

        return $this->getResponse([
            'message' => 'Timesheet companies retrieved',
            'data' => $companies
        ]);
    }

    /**
     * Get all timesheet comapanies by project
     * @return Response
     */
    public function getCompaniesByProjectId($id = null)
    {
        $model = new TimesheetModel();
        return $this->getResponse(
            [
                'message' => 'Timesheet projects retrieved',
                'data' => $model->getCompaniesByProjectId($id)
            ]
        );
    }

    private function getTimesheetItem($id)
    {
        return $this->itemQuery(new TimesheetModel())
            ->where('timesheet.id', $id)
            ->first();
    }

    /**
     * Timesheet rows with display names joined in.
     * general_activity / work_type come from the lookup tables (so renames apply to history),
     * falling back to the legacy text for rows that were never matched to a lookup.
     * The aliases come after timesheet.* so they override the raw text columns.
     */
    private function itemQuery(TimesheetModel $model): TimesheetModel
    {
        return $model->select(
                'timesheet.*, '
                . 'COALESCE(timesheet_activity.name, timesheet.general_activity) AS general_activity, '
                . 'COALESCE(timesheet_work_type.name, timesheet.work_type) AS work_type, '
                . 'timesheet_project.project_name, timesheet_companies.company_name, user.first_name, user.last_name',
                false
            )
            ->join('timesheet_project', 'timesheet_project.id = timesheet.project_id', 'inner')
            ->join('timesheet_companies', 'timesheet_companies.id = timesheet.company_id', 'inner')
            ->join('user', 'user.id = timesheet.user_id', 'inner')
            ->join('timesheet_activity', 'timesheet_activity.id = timesheet.activity_id', 'left')
            ->join('timesheet_work_type', 'timesheet_work_type.id = timesheet.work_type_id', 'left');
    }

    /**
     * Fills activity_id/general_activity and work_type_id/work_type from whichever the client sent.
     * New clients send ids; the legacy text is still accepted (matched by name) so an older
     * frontend keeps working. Only touches fields present in $item, so partial updates are safe.
     *
     * @throws \InvalidArgumentException when an id doesn't exist
     */
    private function applyLookups(array $item): array
    {
        $map = [
            ['table' => 'timesheet_activity', 'id' => 'activity_id', 'text' => 'general_activity', 'label' => 'activity'],
            ['table' => 'timesheet_work_type', 'id' => 'work_type_id', 'text' => 'work_type', 'label' => 'work type'],
        ];

        $db = \Config\Database::connect();

        foreach ($map as $m) {
            if (!array_key_exists($m['id'], $item) && !array_key_exists($m['text'], $item)) {
                continue;
            }

            $id = $item[$m['id']] ?? null;
            $text = trim((string) ($item[$m['text']] ?? ''));
            $row = null;

            if ($id !== null && $id !== '') {
                $row = $db->table($m['table'])->select('id, name')->where('id', (int) $id)->get()->getRowArray();
                if (!$row) {
                    throw new \InvalidArgumentException("Unknown {$m['label']}.");
                }
            } elseif ($text !== '' && $text !== '0') {
                $row = $db->table($m['table'])->select('id, name')->where('name', $text)->get()->getRowArray();
            }

            $item[$m['id']] = $row ? (int) $row['id'] : null;
            $item[$m['text']] = $row ? $row['name'] : (($text !== '' && $text !== '0') ? $text : null);
        }

        return $item;
    }

    /**
     * Active and archived activities, for the timesheet form.
     * The form only offers active ones, but needs archived names to show existing entries.
     */
    public function getActivities()
    {
        return $this->getResponse([
            'message' => 'Timesheet activities retrieved',
            'data' => $this->lookupRows('timesheet_activity')
        ]);
    }

    public function getWorkTypes()
    {
        return $this->getResponse([
            'message' => 'Timesheet work types retrieved',
            'data' => $this->lookupRows('timesheet_work_type')
        ]);
    }

    private function lookupRows(string $table): array
    {
        $rows = \Config\Database::connect()->table($table)
            ->select('id, name, is_active')
            ->orderBy('name', 'ASC')
            ->get()->getResultArray();

        return array_map(static fn ($r) => [
            'id' => (int) $r['id'],
            'name' => $r['name'],
            'is_active' => (bool) $r['is_active'],
        ], $rows);
    }
}
