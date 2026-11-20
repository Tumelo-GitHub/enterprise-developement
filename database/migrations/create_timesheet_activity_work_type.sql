-- Moves timesheet "General Activity" and "Work Type" from hardcoded frontend lists
-- (stored as free text on each timesheet row) into admin-managed lookup tables.
--
-- Why: renaming a value used to split reports, because old rows kept the old text.
-- Rows now reference the lookup by id, so a rename applies to all history.
--
-- Safe to re-run: tables use IF NOT EXISTS, seeding uses INSERT IGNORE, and the
-- backfill only touches rows whose id is still NULL. Run step 3 only once
-- (MySQL < 8.0.29 has no ADD COLUMN IF NOT EXISTS). Check the counts in step 5.
--
-- The legacy text columns (timesheet.general_activity, timesheet.work_type) are kept
-- and still written by the API, so the previous frontend keeps working if you need
-- to roll back. They can be dropped in a later migration once everything is settled.

-- 1. Lookup tables --------------------------------------------------------------

CREATE TABLE IF NOT EXISTS timesheet_activity (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_timesheet_activity_name (name)
);

CREATE TABLE IF NOT EXISTS timesheet_work_type (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_timesheet_work_type_name (name)
);

-- 2. Seed: the lists that were hardcoded in timesheet-form.component.ts,
--    plus any other values already present in captured timesheets.
--    The unique key (case-insensitive collation) merges case variants.

INSERT IGNORE INTO timesheet_activity (name) VALUES
  ('Credit Collection Group'),
  ('GPG - Group'),
  ('Intro Session'),
  ('Meeting - General Project'),
  ('Meeting - Minutes'),
  ('Meeting - Credit'),
  ('Meeting - Assessment'),
  ('Meeting - Naswenda'),
  ('Meeting - SBSA Status'),
  ('Payments'),
  ('Phone call'),
  ('Recruitment'),
  ('Reporting');

INSERT IGNORE INTO timesheet_activity (name)
SELECT DISTINCT TRIM(general_activity)
FROM timesheet
WHERE general_activity IS NOT NULL AND TRIM(general_activity) NOT IN ('', '0');

INSERT IGNORE INTO timesheet_work_type (name) VALUES
  ('Access to market'),
  ('Access to finance'),
  ('Business development'),
  ('Project management'),
  ('Special projects'),
  ('Business Assessment');

INSERT IGNORE INTO timesheet_work_type (name)
SELECT DISTINCT TRIM(work_type)
FROM timesheet
WHERE work_type IS NOT NULL AND TRIM(work_type) NOT IN ('', '0');

-- 3. Reference columns on timesheet (run once) ---------------------------------

ALTER TABLE timesheet
  ADD COLUMN activity_id INT NULL AFTER general_activity,
  ADD COLUMN work_type_id INT NULL AFTER work_type,
  ADD INDEX idx_timesheet_activity (activity_id),
  ADD INDEX idx_timesheet_work_type (work_type_id),
  ADD CONSTRAINT fk_timesheet_activity FOREIGN KEY (activity_id) REFERENCES timesheet_activity(id),
  ADD CONSTRAINT fk_timesheet_work_type FOREIGN KEY (work_type_id) REFERENCES timesheet_work_type(id);

-- 4. Backfill ids from the existing text ---------------------------------------

UPDATE timesheet t
JOIN timesheet_activity a ON a.name = TRIM(t.general_activity)
SET t.activity_id = a.id
WHERE t.activity_id IS NULL;

UPDATE timesheet t
JOIN timesheet_work_type w ON w.name = TRIM(t.work_type)
SET t.work_type_id = w.id
WHERE t.work_type_id IS NULL;

-- 5. Verify: both counts should be 0 --------------------------------------------

SELECT COUNT(*) AS activity_text_without_id
FROM timesheet
WHERE activity_id IS NULL AND general_activity IS NOT NULL AND TRIM(general_activity) NOT IN ('', '0');

SELECT COUNT(*) AS work_type_text_without_id
FROM timesheet
WHERE work_type_id IS NULL AND work_type IS NOT NULL AND TRIM(work_type) NOT IN ('', '0');
