<?php

namespace App\Controllers;

use App\Models\TimesheetCompanyModel;
use App\Models\TimesheetProjectCompanyModel;
use App\Models\TimesheetProjectModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Admin management of timesheet projects, companies and which companies belong to which project.
 * All routes are protected by the 'admin' filter (see Config/Routes.php).
 *
 * Rule: anything that already has timesheet entries cannot be deleted, because that would
 * orphan or silently lose captured time. Project/company links are deactivated instead.
 */
class TimesheetAdmin extends BaseController
{
    // ---------------------------------------------------------------------
    // Statuses
    // ---------------------------------------------------------------------

    public function statuses()
    {
        $rows = $this->db()->table('timesheet_company_status')
            ->select('id, status')
            ->orderBy('id', 'ASC')
            ->get()->getResultArray();

        return $this->ok('Statuses retrieved', $this->castInts($rows, ['id']));
    }

    // ---------------------------------------------------------------------
    // Projects
    // ---------------------------------------------------------------------

    public function projects()
    {
        return $this->ok('Projects retrieved', $this->projectRows());
    }

    public function createProject()
    {
        $name = $this->validName('project_name');
        if ($name instanceof ResponseInterface) return $name;

        if ($this->nameExists('timesheet_project', 'project_name', $name)) {
            return $this->conflict("A project named \"$name\" already exists.");
        }

        $id = (new TimesheetProjectModel())->insert(['project_name' => $name]);

        return $this->ok('Project created', $this->projectRows((int) $id)[0] ?? null);
    }

    public function updateProject($id = null)
    {
        $id = (int) $id;
        if (!$this->exists('timesheet_project', $id)) return $this->notFound('Project not found.');

        $name = $this->validName('project_name');
        if ($name instanceof ResponseInterface) return $name;

        if ($this->nameExists('timesheet_project', 'project_name', $name, $id)) {
            return $this->conflict("A project named \"$name\" already exists.");
        }

        (new TimesheetProjectModel())->update($id, ['project_name' => $name]);

        return $this->ok('Project updated', $this->projectRows($id)[0] ?? null);
    }

    public function deleteProject($id = null)
    {
        $id = (int) $id;
        if (!$this->exists('timesheet_project', $id)) return $this->notFound('Project not found.');

        $entries = $this->db()->table('timesheet')->where('project_id', $id)->countAllResults();
        if ($entries > 0) {
            return $this->conflict("This project has $entries timesheet entries and cannot be deleted. Deactivate its companies instead.");
        }

        $db = $this->db();
        $db->transStart();
        $db->table('timesheet_project_companies')->where('project_id', $id)->delete();
        $db->table('timesheet_project')->where('id', $id)->delete();
        $db->transComplete();

        if (!$db->transStatus()) {
            return $this->getResponse(['message' => 'Failed to delete project.', 'data' => null], ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->ok('Project deleted', null);
    }

    // ---------------------------------------------------------------------
    // Companies
    // ---------------------------------------------------------------------

    public function companies()
    {
        return $this->ok('Companies retrieved', $this->companyRows());
    }

    public function createCompany()
    {
        $name = $this->validName('company_name');
        if ($name instanceof ResponseInterface) return $name;

        if ($this->nameExists('timesheet_companies', 'company_name', $name)) {
            return $this->conflict("A company named \"$name\" already exists.");
        }

        $id = (new TimesheetCompanyModel())->insert(['company_name' => $name]);

        return $this->ok('Company created', $this->companyRows((int) $id)[0] ?? null);
    }

    public function updateCompany($id = null)
    {
        $id = (int) $id;
        if (!$this->exists('timesheet_companies', $id)) return $this->notFound('Company not found.');

        $name = $this->validName('company_name');
        if ($name instanceof ResponseInterface) return $name;

        if ($this->nameExists('timesheet_companies', 'company_name', $name, $id)) {
            return $this->conflict("A company named \"$name\" already exists.");
        }

        (new TimesheetCompanyModel())->update($id, ['company_name' => $name]);

        return $this->ok('Company updated', $this->companyRows($id)[0] ?? null);
    }

    public function deleteCompany($id = null)
    {
        $id = (int) $id;
        if (!$this->exists('timesheet_companies', $id)) return $this->notFound('Company not found.');

        $entries = $this->db()->table('timesheet')->where('company_id', $id)->countAllResults();
        if ($entries > 0) {
            return $this->conflict("This company has $entries timesheet entries and cannot be deleted. Deactivate it on its projects instead.");
        }

        $db = $this->db();
        $db->transStart();
        $db->table('timesheet_project_companies')->where('company_id', $id)->delete();
        $db->table('timesheet_companies')->where('id', $id)->delete();
        $db->transComplete();

        if (!$db->transStatus()) {
            return $this->getResponse(['message' => 'Failed to delete company.', 'data' => null], ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->ok('Company deleted', null);
    }

    // ---------------------------------------------------------------------
    // Companies within a project
    // ---------------------------------------------------------------------

    public function projectCompanies($projectId = null)
    {
        $projectId = (int) $projectId;
        if (!$this->exists('timesheet_project', $projectId)) return $this->notFound('Project not found.');

        return $this->ok('Project companies retrieved', $this->projectCompanyRows($projectId));
    }

    /**
     * Body: { company_ids: number[], status?: number }
     * Companies already linked to the project are skipped. Returns the project's full company list.
     */
    public function addProjectCompanies($projectId = null)
    {
        $projectId = (int) $projectId;
        if (!$this->exists('timesheet_project', $projectId)) return $this->notFound('Project not found.');

        $input = $this->getRequestInput($this->request) ?? [];
        $companyIds = array_values(array_unique(array_filter(
            array_map('intval', (array) ($input['company_ids'] ?? [])),
            static fn ($id) => $id > 0
        )));

        if (empty($companyIds)) {
            return $this->badRequest('Select at least one company.');
        }

        $found = $this->db()->table('timesheet_companies')->whereIn('id', $companyIds)->countAllResults();
        if ($found !== count($companyIds)) {
            return $this->badRequest('One or more selected companies do not exist.');
        }

        $status = isset($input['status']) ? (int) $input['status'] : $this->activeStatusId();
        if (!$status || !$this->exists('timesheet_company_status', $status)) {
            return $this->badRequest('Invalid status.');
        }

        $existing = array_map('intval', array_column(
            $this->db()->table('timesheet_project_companies')
                ->select('company_id')
                ->where('project_id', $projectId)
                ->whereIn('company_id', $companyIds)
                ->get()->getResultArray(),
            'company_id'
        ));

        $rows = [];
        foreach (array_diff($companyIds, $existing) as $companyId) {
            $rows[] = ['project_id' => $projectId, 'company_id' => $companyId, 'status' => $status];
        }

        if ($rows) {
            (new TimesheetProjectCompanyModel())->insertBatch($rows);
        }

        $added = count($rows);
        $skipped = count($companyIds) - $added;
        $message = "$added " . ($added === 1 ? 'company' : 'companies') . ' added to project'
            . ($skipped ? " ($skipped already linked)" : '');

        return $this->ok($message, $this->projectCompanyRows($projectId));
    }

    /**
     * Body: { status: number }
     */
    public function updateProjectCompany($id = null)
    {
        $id = (int) $id;
        $link = (new TimesheetProjectCompanyModel())->find($id);
        if (!$link) return $this->notFound('Project company not found.');

        $input = $this->getRequestInput($this->request) ?? [];
        $status = (int) ($input['status'] ?? 0);
        if (!$status || !$this->exists('timesheet_company_status', $status)) {
            return $this->badRequest('Invalid status.');
        }

        (new TimesheetProjectCompanyModel())->update($id, ['status' => $status]);

        $row = array_values(array_filter(
            $this->projectCompanyRows((int) $link['project_id']),
            static fn ($r) => $r['id'] === $id
        ))[0] ?? null;

        return $this->ok('Status updated', $row);
    }

    public function deleteProjectCompany($id = null)
    {
        $id = (int) $id;
        $link = (new TimesheetProjectCompanyModel())->find($id);
        if (!$link) return $this->notFound('Project company not found.');

        $entries = $this->db()->table('timesheet')
            ->where('project_id', $link['project_id'])
            ->where('company_id', $link['company_id'])
            ->countAllResults();

        if ($entries > 0) {
            return $this->conflict("Time has been captured against this company on this project ($entries entries). Set it to inactive instead of removing it.");
        }

        (new TimesheetProjectCompanyModel())->delete($id);

        return $this->ok('Company removed from project', null);
    }

    // ---------------------------------------------------------------------
    // Activities & work types (lookup lists)
    // Used ones can't be deleted, only archived (is_active = 0): archived values
    // disappear from the capture form but still show on existing entries.
    // ---------------------------------------------------------------------

    private const LOOKUPS = [
        'activity' => ['table' => 'timesheet_activity', 'fk' => 'activity_id', 'label' => 'activity'],
        'work_type' => ['table' => 'timesheet_work_type', 'fk' => 'work_type_id', 'label' => 'work type'],
    ];

    public function activities()           { return $this->ok('Activities retrieved', $this->lookupRows('activity')); }
    public function createActivity()       { return $this->createLookup('activity'); }
    public function updateActivity($id)    { return $this->updateLookup('activity', (int) $id); }
    public function deleteActivity($id)    { return $this->deleteLookup('activity', (int) $id); }

    public function workTypes()            { return $this->ok('Work types retrieved', $this->lookupRows('work_type')); }
    public function createWorkType()       { return $this->createLookup('work_type'); }
    public function updateWorkType($id)    { return $this->updateLookup('work_type', (int) $id); }
    public function deleteWorkType($id)    { return $this->deleteLookup('work_type', (int) $id); }

    private function lookupRows(string $kind, ?int $id = null): array
    {
        $l = self::LOOKUPS[$kind];
        $where = $id ? 'WHERE l.id = ?' : '';
        $rows = $this->db()->query(
            "SELECT l.id, l.name, l.is_active,
                    (SELECT COUNT(*) FROM timesheet t WHERE t.{$l['fk']} = l.id) AS usage_count
             FROM {$l['table']} l
             $where
             ORDER BY l.name",
            $id ? [$id] : []
        )->getResultArray();

        return array_map(static fn ($r) => [
            'id' => (int) $r['id'],
            'name' => $r['name'],
            'is_active' => (bool) $r['is_active'],
            'usage_count' => (int) $r['usage_count'],
        ], $rows);
    }

    /** Body: { name } */
    private function createLookup(string $kind)
    {
        $l = self::LOOKUPS[$kind];
        $name = $this->validName('name', 'max_length[150]');
        if ($name instanceof ResponseInterface) return $name;

        if ($this->nameExists($l['table'], 'name', $name)) {
            return $this->conflict(ucfirst($l['label']) . " \"$name\" already exists.");
        }

        $this->db()->table($l['table'])->insert(['name' => $name, 'is_active' => 1]);
        $id = (int) $this->db()->insertID();

        return $this->ok(ucfirst($l['label']) . ' created', $this->lookupRows($kind, $id)[0] ?? null);
    }

    /**
     * Body: { name?, is_active? }. Renaming applies to every existing entry,
     * since entries reference the id and names are joined in on read.
     */
    private function updateLookup(string $kind, int $id)
    {
        $l = self::LOOKUPS[$kind];
        if (!$this->exists($l['table'], $id)) return $this->notFound(ucfirst($l['label']) . ' not found.');

        $input = $this->getRequestInput($this->request) ?? [];
        $changes = [];

        if (array_key_exists('name', $input)) {
            $name = $this->validName('name', 'max_length[150]');
            if ($name instanceof ResponseInterface) return $name;
            if ($this->nameExists($l['table'], 'name', $name, $id)) {
                return $this->conflict(ucfirst($l['label']) . " \"$name\" already exists.");
            }
            $changes['name'] = $name;
        }

        if (array_key_exists('is_active', $input)) {
            $changes['is_active'] = filter_var($input['is_active'], FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        }

        if (!$changes) return $this->badRequest('Nothing to update.');

        $db = $this->db();
        $db->transStart();
        $db->table($l['table'])->where('id', $id)->update($changes);
        // Keep the legacy text column in step so a rolled-back frontend still shows the new name
        if (isset($changes['name'])) {
            $textColumn = $kind === 'activity' ? 'general_activity' : 'work_type';
            $db->table('timesheet')->where($l['fk'], $id)->update([$textColumn => $changes['name']]);
        }
        $db->transComplete();

        if (!$db->transStatus()) {
            return $this->getResponse(['message' => 'Failed to update ' . $l['label'] . '.', 'data' => null], ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
        }

        $message = isset($changes['name']) ? ucfirst($l['label']) . ' renamed'
            : ($changes['is_active'] ? ucfirst($l['label']) . ' restored' : ucfirst($l['label']) . ' archived');

        return $this->ok($message, $this->lookupRows($kind, $id)[0] ?? null);
    }

    private function deleteLookup(string $kind, int $id)
    {
        $l = self::LOOKUPS[$kind];
        if (!$this->exists($l['table'], $id)) return $this->notFound(ucfirst($l['label']) . ' not found.');

        $used = $this->db()->table('timesheet')->where($l['fk'], $id)->countAllResults();
        if ($used > 0) {
            return $this->conflict("This {$l['label']} is used on $used timesheet entries and cannot be deleted. Archive it instead.");
        }

        $this->db()->table($l['table'])->where('id', $id)->delete();

        return $this->ok(ucfirst($l['label']) . ' deleted', null);
    }

    // ---------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------

    private function projectRows(?int $id = null): array
    {
        $where = $id ? 'WHERE p.id = ?' : '';
        $rows = $this->db()->query(
            "SELECT p.id, p.project_name,
                    COUNT(pc.id) AS company_count,
                    COALESCE(SUM(s.status = 'Active'), 0) AS active_company_count,
                    (SELECT COUNT(*) FROM timesheet t WHERE t.project_id = p.id) AS entry_count
             FROM timesheet_project p
             LEFT JOIN timesheet_project_companies pc ON pc.project_id = p.id
             LEFT JOIN timesheet_company_status s ON s.id = pc.status
             $where
             GROUP BY p.id, p.project_name
             ORDER BY p.project_name",
            $id ? [$id] : []
        )->getResultArray();

        return $this->castInts($rows, ['id', 'company_count', 'active_company_count', 'entry_count']);
    }

    private function companyRows(?int $id = null): array
    {
        $where = $id ? 'WHERE c.id = ?' : '';
        $rows = $this->db()->query(
            "SELECT c.id, c.company_name,
                    COUNT(pc.id) AS project_count,
                    GROUP_CONCAT(p.project_name ORDER BY p.project_name SEPARATOR ', ') AS project_names,
                    (SELECT COUNT(*) FROM timesheet t WHERE t.company_id = c.id) AS entry_count
             FROM timesheet_companies c
             LEFT JOIN timesheet_project_companies pc ON pc.company_id = c.id
             LEFT JOIN timesheet_project p ON p.id = pc.project_id
             $where
             GROUP BY c.id, c.company_name
             ORDER BY c.company_name",
            $id ? [$id] : []
        )->getResultArray();

        return $this->castInts($rows, ['id', 'project_count', 'entry_count']);
    }

    private function projectCompanyRows(int $projectId): array
    {
        $rows = $this->db()->query(
            "SELECT pc.id, pc.project_id, pc.company_id, c.company_name,
                    pc.status AS status_id, s.status,
                    (SELECT COUNT(*) FROM timesheet t
                      WHERE t.project_id = pc.project_id AND t.company_id = pc.company_id) AS entry_count
             FROM timesheet_project_companies pc
             INNER JOIN timesheet_companies c ON c.id = pc.company_id
             LEFT JOIN timesheet_company_status s ON s.id = pc.status
             WHERE pc.project_id = ?
             ORDER BY c.company_name",
            [$projectId]
        )->getResultArray();

        return $this->castInts($rows, ['id', 'project_id', 'company_id', 'status_id', 'entry_count']);
    }

    // ---------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------

    private function db()
    {
        return \Config\Database::connect();
    }

    /** @return string|ResponseInterface trimmed name, or a 400 response */
    private function validName(string $field, string $maxRule = 'max_length[255]')
    {
        $input = $this->getRequestInput($this->request) ?? [];
        $input[$field] = trim((string) ($input[$field] ?? ''));

        if (!$this->validateRequest($input, [$field => "required|$maxRule"])) {
            return $this->getResponse(
                ['message' => implode(' ', $this->validator->getErrors()), 'data' => null],
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        return $input[$field];
    }

    /** $table and $column are internal constants, never user input. */
    private function nameExists(string $table, string $column, string $name, ?int $exceptId = null): bool
    {
        $row = $this->db()->query(
            "SELECT COUNT(*) AS n FROM $table WHERE LOWER($column) = LOWER(?) AND id != ?",
            [$name, $exceptId ?? 0]
        )->getRowArray();

        return (int) ($row['n'] ?? 0) > 0;
    }

    private function exists(string $table, int $id): bool
    {
        return $id > 0 && $this->db()->table($table)->where('id', $id)->countAllResults() > 0;
    }

    private function activeStatusId(): ?int
    {
        $row = $this->db()->table('timesheet_company_status')->where('status', 'Active')->get()->getRowArray();
        return $row ? (int) $row['id'] : null;
    }

    private function castInts(array $rows, array $fields): array
    {
        foreach ($rows as &$row) {
            foreach ($fields as $field) {
                if (array_key_exists($field, $row) && $row[$field] !== null) {
                    $row[$field] = (int) $row[$field];
                }
            }
        }
        unset($row);
        return $rows;
    }

    private function ok(string $message, $data)
    {
        return $this->getResponse(['message' => $message, 'data' => $data]);
    }

    private function badRequest(string $message)
    {
        return $this->getResponse(['message' => $message, 'data' => null], ResponseInterface::HTTP_BAD_REQUEST);
    }

    private function notFound(string $message)
    {
        return $this->getResponse(['message' => $message, 'data' => null], ResponseInterface::HTTP_NOT_FOUND);
    }

    private function conflict(string $message)
    {
        return $this->getResponse(['message' => $message, 'data' => null], ResponseInterface::HTTP_CONFLICT);
    }
}
