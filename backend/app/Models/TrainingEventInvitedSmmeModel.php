<?php

namespace App\Models;

use CodeIgniter\Model;
use Exception;

class TrainingEventInvitedSmmeModel extends Model
{
    protected $table = 'training_event_invitations';
    protected $allowedFields = [
        'training_event_id',
        'smme_id',
        'invitation_status',
        'invited_by',
        'response_at',
        'notes'
    ];

    public function findById ($id)
    {
        $smme = $this
            ->asArray()
            ->where(['id' => $id])
            ->first();

        if (!$smme) throw new Exception('Could not find Employee for specified ID');

        return $smme;
    }

    public function findSmmeByEventId($id) {
        $smme = $this->db->query("SELECT smme.id, smme.smme_name 
                                    FROM training_event_invitations 
                                    INNER JOIN smme 
                                    ON training_event_invitations.smme_id = smme.id 
                                    WHERE training_event_invitations.training_event_id = :id:",
                                    ['id' => $id])->getResultArray();

        return $smme;
    }

    public function getInvitationStats($eventId)
    {
        return $this->db->query("SELECT COUNT(*) as total_invitations,
                SUM(CASE WHEN invitation_status = 'invited' THEN 1 ELSE 0 END) as invited,
                SUM(CASE WHEN invitation_status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN invitation_status = 'declined' THEN 1 ELSE 0 END) as declined,
                SUM(CASE WHEN invitation_status = 'attended' THEN 1 ELSE 0 END) as attended,
                SUM(CASE WHEN invitation_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
                FROM training_event_invitations
                WHERE training_event_invitations.training_event_id = :id:",
                ['id' => $eventId])->getResultArray();
    }
}