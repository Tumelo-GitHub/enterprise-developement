-- Adds integrity constraints to timesheet_project_companies (the companies linked to each project).
--
-- Why: the table had no unique key or foreign keys, so the same company could be linked to a
-- project twice (it then shows up twice in the timesheet form), and links could point at
-- projects, companies or statuses that no longer exist.
--
-- The API already prevents duplicates and removes links when a project or company is deleted;
-- these constraints make the database enforce the same rules.
--
-- Timesheet entries store project_id/company_id directly, not the link id, so removing
-- duplicate or orphaned links below does not affect any captured time.
--
-- Run the steps in order. Steps 1-3 are safe to re-run; step 4 runs once.

-- 1. Pre-flight: the referencing and referenced columns must have the same type
--    (e.g. all INT, or all INT UNSIGNED). If they differ, step 4 fails with error 3780/150;
--    align the types with ALTER TABLE ... MODIFY first.

SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND (
    (TABLE_NAME = 'timesheet_project_companies' AND COLUMN_NAME IN ('project_id', 'company_id', 'status'))
    OR (TABLE_NAME IN ('timesheet_project', 'timesheet_companies', 'timesheet_company_status') AND COLUMN_NAME = 'id')
  )
ORDER BY TABLE_NAME, COLUMN_NAME;

-- 2. Remove duplicate links, keeping the oldest row for each project/company pair.

DELETE pc
FROM timesheet_project_companies pc
JOIN timesheet_project_companies keep
  ON keep.project_id = pc.project_id
 AND keep.company_id = pc.company_id
 AND keep.id < pc.id;

-- 3. Remove links to projects or companies that no longer exist.

DELETE pc
FROM timesheet_project_companies pc
LEFT JOIN timesheet_project p ON p.id = pc.project_id
LEFT JOIN timesheet_companies c ON c.id = pc.company_id
WHERE p.id IS NULL OR c.id IS NULL;

-- Links with an unknown status are already hidden from the timesheet form (it inner-joins the
-- status table). This should return 0 rows; if not, set those rows to a valid status before step 4.

SELECT pc.*
FROM timesheet_project_companies pc
LEFT JOIN timesheet_company_status s ON s.id = pc.status
WHERE s.id IS NULL;

-- 4. Constraints (run once). Deleting a project/company/status that still has links is refused;
--    the API removes a project's or company's links itself before deleting it.

ALTER TABLE timesheet_project_companies
  ADD UNIQUE KEY uq_project_company (project_id, company_id),
  ADD INDEX idx_project_companies_company (company_id),
  ADD INDEX idx_project_companies_status (status),
  ADD CONSTRAINT fk_project_companies_project FOREIGN KEY (project_id) REFERENCES timesheet_project(id),
  ADD CONSTRAINT fk_project_companies_company FOREIGN KEY (company_id) REFERENCES timesheet_companies(id),
  ADD CONSTRAINT fk_project_companies_status FOREIGN KEY (status) REFERENCES timesheet_company_status(id);
