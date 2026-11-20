# Training Event Invitations API Endpoints

## Overview
Migration from `training_event_smme` table to `training_event_invitations` table with full invitation workflow support.

## Database Schema Changes

### Old Table: `training_event_smme`
```sql
CREATE TABLE training_event_smme (
  event_id INT,
  smme_id INT, 
  created_at TIMESTAMP
);
```

### New Table: `training_event_invitations`
```sql
CREATE TABLE training_event_invitations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  training_event_id INT NOT NULL,
  smme_id INT NOT NULL,
  invitation_status ENUM('invited', 'confirmed', 'declined', 'attended', 'cancelled'),
  invited_by INT,
  invited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  response_at TIMESTAMP NULL,
  notes TEXT,
  FOREIGN KEY (training_event_id) REFERENCES training_events(id) ON DELETE CASCADE,
  FOREIGN KEY (smme_id) REFERENCES smme(id) ON DELETE CASCADE,
  UNIQUE KEY unique_invitation (training_event_id, smme_id)
);
```

## API Endpoints

### 1. Legacy Compatibility (During Migration)
```
GET /api/training/event/{event_id}/confirmed-beneficiaries
```
**Purpose**: Replace old `api/training/smme/{event_id}` 
**Returns**: Only confirmed/attended beneficiaries (maintains backward compatibility)
**Response**: Same format as old endpoint

### 2. New Invitation Management Endpoints

#### Get Event Invitations
```
GET /api/training/event/{event_id}/invitations
```
**Purpose**: Get all invitations for an event (all statuses)
**Response**: 
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "training_event_id": 42,
      "smme_id": 467,
      "smme_name": "Company Name",
      "invitation_status": "confirmed",
      "invited_by": 1,
      "invited_at": "2024-08-20T10:00:00Z",
      "response_at": "2024-08-21T14:30:00Z",
      "notes": "Confirmed attendance"
    }
  ]
}
```

#### Create Single Invitation
```
POST /api/training/invitations
```
**Body**:
```json
{
  "training_event_id": 42,
  "smme_id": 467,
  "invited_by": 1,
  "notes": "Initial invitation"
}
```

#### Bulk Invite
```
POST /api/training/invitations/bulk
```
**Body**:
```json
{
  "training_event_id": 42,
  "smme_ids": [467, 468, 469],
  "invited_by": 1,
  "notes": "Bulk invitation for HR training"
}
```

#### Update Invitation Status
```
PATCH /api/training/invitations/{invitation_id}/status
```
**Body**:
```json
{
  "status": "confirmed",
  "notes": "Confirmed via phone call"
}
```

#### Delete Invitation
```
DELETE /api/training/invitations/{invitation_id}
```

#### Bulk Delete Invitations  
```
POST /api/training/invitations/bulk-delete
```
**Body**:
```json
{
  "ids": [1, 2, 3]
}
```

#### Get Invitation Statistics
```
GET /api/training/event/{event_id}/invitation-stats
```
**Response**:
```json
{
  "success": true,
  "data": {
    "total_invitations": 10,
    "invited": 3,
    "confirmed": 5,
    "declined": 1,
    "attended": 1,
    "cancelled": 0
  }
}
```

## Migration Steps

1. **Phase 1**: Create new table alongside old table
2. **Phase 2**: Update API to read from new table, maintain old endpoints
3. **Phase 3**: Migrate existing data with status 'confirmed'
4. **Phase 4**: Update frontend to use new invitation system
5. **Phase 5**: Remove old table and endpoints

## Frontend Updates Needed

1. **TrainingEventService**: Update to use new endpoints
2. **ViewBeneficiaries**: Update to call confirmed-beneficiaries endpoint  
3. **ManageInvitations**: Already using new invitation service
4. **TrainingRegister**: Update to use confirmed beneficiaries

## Status Workflow

```
invited → confirmed/declined
confirmed → attended/cancelled  
declined → (can be re-invited)
attended → (final status)
cancelled → (final status)
```