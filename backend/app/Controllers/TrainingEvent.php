<?php

namespace App\Controllers;

use App\Models\TrainingEventModel;
use App\Models\TrainingEventInvitedSmmeModel;
use App\Models\ProgrammeCourseModel;
use App\Libraries\MyMobileAPI;
use App\Models\SmmeContactModel;
use App\Models\TrainingEventRegisterModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class TrainingEvent extends BaseController
{
    /**
     * Get all Training events
     * @return Response
     */
    public function index()
    {
        $model = new TrainingEventModel();
        $invited_smme_model = new TrainingEventInvitedSmmeModel();
        $events = $model->findAllEvents();

        // loop events
        for ($x = 0; $x < count($events); $x++) {
            $smme_ids = array();
            $current_smme_ids = $invited_smme_model->where('training_event_id', $events[$x]['id'])->findAll();

            for ($i = 0; $i < count($current_smme_ids); $i++) {
                array_push($smme_ids, $current_smme_ids[$i]['smme_id']);
            }

            $events[$x]['smme_id'] = $smme_ids;
        }

        return $this->getResponse(
            [
                'message' => 'Training events retrieved',
                'data' => $events
            ]
        );
    }

    /**
     * Create a new Training event
     */
    public function create()
    {
        $rules = [
            'programme_id ' => 'required',
            'course_id' => 'required',
            'status_id' => 'required',
            'service_provider_id' => 'required',
            'venue_id' => 'required',
            'event_date' => 'required',
            'start_time' => 'required',
            'end_time' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        // Fetch the programme course
        $programmeCourse = (new ProgrammeCourseModel())
            ->where([
                'programme_id' => $input['programme_id'],
                'course_id' => $input['course_id']
            ])
            ->first();

        if (!$programmeCourse) {
            return $this->getResponse(
                ['message' => 'Programme course not found'],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        // Extract and unset unnecessary fields from input
        $smmeIds = $input['smme_id'];
        $notification = $input['notification'] ?? [];
        unset($input['programme_id'], $input['course_id'], $input['smme_id'], $input['notification']);

        $input['programme_course_id'] = $programmeCourse['id'];

        // Insert the event and fetch the newly created event
        $model = new TrainingEventModel();
        $eventId = $model->insert($input);
        $event = $model->findEventById($eventId);

        if (!$event) {
            return $this->getResponse(
                ['message' => 'Failed to create event'],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }

        // check if smmeIds is array is not empty
        if (!empty($smmeIds)) {
            // Save invited SMMEs
            $this->saveInvitedSmmes($eventId, $smmeIds);

            // Fetch contact persons for the SMMEs
            $contacts = $this->getSmmeContacts($smmeIds);

            // Auto-fill register and handle notifications
            // $this->autoFillRegister($contacts, $eventId);
            $this->communication($notification, $contacts);
        }

        return $this->getResponse(
            [
                'message' => 'Event added successfully',
                'data' => $event
            ]
        );
    }

    /**
     * Save invited SMMEs for the event.
     */
    private function saveInvitedSmmes($eventId, $smmeIds)
    {
        $invitedSmmeModel = new TrainingEventInvitedSmmeModel();

        $data = array_map(function ($smmeId) use ($eventId) {
            return [
                'training_event_id' => $eventId,
                'smme_id' => $smmeId,
                'invitation_status' => 'invited'
            ];
        }, $smmeIds);

        $invitedSmmeModel->insertBatch($data);
    }

    /**
     * Get contact persons for the given SMMEs.
     */
    private function getSmmeContacts($smmeIds)
    {
        return (new SmmeContactModel())
            ->select("smme_contacts.*, smme.smme_name")
            ->join('smme', 'smme_contacts.smme_id = smme.id', 'inner')
            ->whereIn('smme_id', $smmeIds)
            ->findAll();
    }

    /**
     * Auto fill register with SMME's contact persons.
     */
    public function autofillRegister($eventId)
    {

        $invitedSmmeModel = new TrainingEventInvitedSmmeModel();
        $smmeContactsModel = new SmmeContactModel();
        $trainingEventRegisterModel = new TrainingEventRegisterModel();

        // Check if there are already entries for this event in the register
        $existingEntries = $trainingEventRegisterModel
            ->where('event_id', $eventId)
            ->countAllResults();

        if ($existingEntries > 0) {
            return $this->getResponse(
                ['message' => 'Register already contains entries for this event. Autofill is not allowed.'],
                ResponseInterface::HTTP_CONFLICT
            );
        }

        // Fetch SMMEs by event ID and invitation status
        $invitedSmmes = $invitedSmmeModel
            ->whereIn('invitation_status', ['attended', 'confirmed'])
            ->where('training_event_id', $eventId)
            ->findAll();

        if (empty($invitedSmmes)) {
            return $this->getResponse(
                ['message' => 'No SMMEs found for the given criteria'],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }

        // Fetch SMME contacts
        $smmeIds = array_column($invitedSmmes, 'smme_id');
        $smmeContacts = $smmeContactsModel
            ->whereIn('smme_id', $smmeIds)
            ->findAll();

        // Prepare data for the training event register
        $registerRecords = array_map(function ($smme) use ($eventId, $smmeContacts) {
            $contact = array_filter($smmeContacts, function ($contact) use ($smme) {
                return $contact['smme_id'] === $smme['smme_id'];
            });

            $contact = reset($contact); // Get the first matching contact

            return [
                'event_id' => $eventId,
                'smme_id' => $contact['smme_id'],
                'attendee' => $contact['full_names'],
                'email' => $contact['email'],
                'tel_number' => $contact['cell_number'],
                'age' => null,
                'gender' => null,
                'qualification' => null,
            ];
        }, $invitedSmmes);

        // Insert into the training event register
        $trainingEventRegisterModel->insertBatch($registerRecords);

        return $this->getResponse(
            [
                'message' => 'Training event register autofilled successfully',
                'data' => $registerRecords
            ]
        );
    }

    /**
     * Send communication to contacts
     */
    private function communication($type = [], $contacts)
    {
        if (in_array('sms', $type)) {
            foreach ($contacts as $contact) {
                $message = sprintf("Hello %s, %s has been shedules for training on COURSE_NAME. Details are as follows below", [$contact['full_names'], $contact['smme_name']]);
                (new MyMobileAPI())->sendSms($contact['cell_number'], $message);
            }
        }

        if (in_array('email', $type)) {
            // send email to contact person
            $email = \Config\Services::email();

            $email->setFrom('support@devwizard.com', 'DevWizard');
            // loop each contact
            foreach ($contacts as $contact) {
                $email->setTo($contact['email']);
                $message = sprintf("Hello %s, <br><br> %s has been shedules for training on COURSE_NAME. Details are as follows below: <br><br>
                <ul>
                    <li>Programme: Enterprise Development</li>
                    <li>Course: Risk  Management</li>
                    <li>Trainer: John Doe</li>
                    <li>Date: 2024/09/09</li>
                </ul>", $contact['full_names'], $contact['smme_name']);

                $email->setSubject('Training Scheduled');
                $email->setMessage('Good day<br><br> This is a test email from Devwizard enterprise software development.<br><br>Kind Regards<br>Support');

                $email->send();
            }
        }
    }

    /**
     * Get a single event by ID
     */
    public function show($id = null)
    {
        try {
            return $this->getResponse(
                [
                    'message' => 'Course retrieved successfully',
                    'data' => (new TrainingEventModel())->findEventById($id)
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find course for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing event
     */
    public function update($id = null)
    {
        try {
            $model = new TrainingEventModel();
            $model->findTrainingEventById($id);

            $input = $this->getRequestInput($this->request);

            // get programme course
            $programmeCourse = $this->getProgrammeCourse($input['programme_id'], $input['course_id']);

            $input['programme_course_id'] = $programmeCourse['id'];
            unset($input['programme_id'], $input['course_id'], $input['smme_id']);

            // update event
            $model->update($id, $input);
            $event = $model->findEventById($id);

            return $this->getResponse([
                'message' => 'Event updated successfully',
                'data' => $event,
            ]);
        } catch (Exception $exception) {
            return $this->getResponse([
                'message' => $exception->getMessage()
            ], ResponseInterface::HTTP_NOT_FOUND);
        }
    }

    private function getProgrammeCourse($programme_id, $course_id)
    {
        $programmeCourseModel = new ProgrammeCourseModel();
        return $programmeCourseModel->where(['programme_id' => $programme_id, 'course_id' => $course_id])->first();
    }


    /**
     * Delete an existing Event
     */
    public function delete($id = null)
    {
        try {
            $model = new TrainingEventModel();
            $course = $model->findTrainingEventById($id);
            $model->delete($id);

            return $this->getResponse(
                [
                    'message' => 'Event deleted successfully',
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

    public function getTrainingVenue()
    {
        $model = new TrainingEventModel();
        return $this->getResponse(
            [
                'message' => 'Venues retrieved',
                'data' => $model->getVenues()
            ]
        );
    }

    public function getSmmeByEventId($id = null)
    {
        $model = new TrainingEventInvitedSmmeModel();

        return $this->getResponse(
            [
                'message' => 'Venues retrieved',
                'data' => $model->findSmmeByEventId($id)
            ]
        );
    }

    public function getEventInvitations($eventId = null)
    {
        $model = new TrainingEventInvitedSmmeModel();

        return $this->getResponse(
            [
                'message' => 'Event Invitations retrieved',
                'data' => $model->select("training_event_invitations.*, smme.smme_name")
                            ->join('smme', 'training_event_invitations.smme_id = smme.id', 'inner')
                            ->where('training_event_id', $eventId)
                            ->findAll()
            ]
        );
    }

    public function getEventInvitationStats($eventId)
    {
        $model = new TrainingEventInvitedSmmeModel();

        return $this->getResponse(
            [
                'message' => 'Event Invitations retrieved',
                'data' => $model->getInvitationStats($eventId)
            ]
        );
    }

    public function inviteBeneficiary()
    {
        $rules = [
            'training_event_id' => 'required',
            'smme_ids' => 'required',
            'invitation_status' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $eventId = $input['training_event_id'];
        $smmeIds = is_array($input['smme_ids']) ? $input['smme_ids'] : [$input['smme_ids']];
        $status  = $input['invitation_status'];
        $notes   = $input['notes'] ?? null;
        $invitedBy = $input['invited_by'] ?? null;

        $invitedSmmeModel = new TrainingEventInvitedSmmeModel();

        // Build records
        $records = array_map(function ($smmeId) use ($eventId, $status, $notes, $invitedBy) {
            return [
                'training_event_id' => $eventId,
                'smme_id' => $smmeId,
                'invitation_status' => $status,
                'notes' => $notes,
                'invited_by' => $invitedBy
            ];
        }, $smmeIds);

        // Save invitations
        $invitedSmmeModel->insertBatch($records);

        // Fetch newly inserted invitations
        $newInvitations = $invitedSmmeModel
            ->where('training_event_id', $eventId)
            ->whereIn('smme_id', $smmeIds)
            ->findAll();

        return $this->getResponse([
            'message' => 'Beneficiary / Beneficiaries invited successfully',
            'data' => $newInvitations
        ]);
    }


    /*
        Get Training invitation by id
    */
    public function getInvitationById($id)
    {
        return $this->getResponse(
            [
                'message' => 'Event Invitations retrieved',
                'data' => (new TrainingEventInvitedSmmeModel())->where('id', $id)->first()
            ]
        );
    }

    public function UpdateInvitationStatus($id)
    {
        $model = new TrainingEventInvitedSmmeModel();
        $input = $this->getRequestInput($this->request);
        $model->update($id, $input);

        return $this->getResponse(
            [
                'message' => 'Event Invitation updated',
                'data' => $model->where('id', $id)->first()
            ]
        );
    }

    public function deleteSingleInvitation($id = null)
    {
        try {
            $invitedSmmeModel = new TrainingEventInvitedSmmeModel();
            $registerModel = new TrainingEventRegisterModel();

            // Fetch the invitation to get the associated SMME ID and event ID
            $invitation = $invitedSmmeModel
                ->where('id', $id)
                ->first();

            if (empty($invitation)) {
                return $this->getResponse(
                    ['message' => 'No invitation found for the given ID'],
                    ResponseInterface::HTTP_NOT_FOUND
                );
            }

            // Extract the SMME ID and event ID from the invitation
            $smmeId = $invitation['smme_id'];
            $eventId = $invitation['training_event_id'];

            // Delete the invitation
            $invitedSmmeModel->delete($id);

            // Delete the corresponding register entry
            $registerModel
                ->where('smme_id', $smmeId)
                ->where('event_id', $eventId)
                ->delete();

            return $this->getResponse(
                [
                    'message' => 'Invitation and corresponding register entry deleted successfully',
                ]
            );
        } catch (Exception $exception) {
            return $this->getResponse(
                [
                    'message' => $exception->getMessage()
                ],
                ResponseInterface::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    public function deleteInvitation()
    {
        try {
            $rules = [
                'invitation_ids' => 'required'
            ];
    
            $input = $this->getRequestInput($this->request);
    
            if (!$this->validateRequest($input, $rules)) {
                return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
            }

            $invitationIds = is_array($input['invitation_ids']) ? $input['invitation_ids'] : [$input['invitation_ids']];
            $invitedSmmeModel = new TrainingEventInvitedSmmeModel();
            $registerModel = new TrainingEventRegisterModel();

            // Fetch the invitations to get the associated SMME IDs and event IDs
            $invitations = $invitedSmmeModel
                ->whereIn('id', $invitationIds)
                ->findAll();

            if (empty($invitations)) {
                return $this->getResponse(
                    ['message' => 'No invitations found for the given IDs'],
                    ResponseInterface::HTTP_NOT_FOUND
                );
            }

            // Extract the SMME IDs and event IDs from the invitations
            $smmeIds = array_column($invitations, 'smme_id');
            $eventIds = array_column($invitations, 'training_event_id');

            // delete invitations
            $invitedSmmeModel->delete($invitationIds);
            
            // Delete the corresponding register entries
            $registerModel
                ->whereIn('smme_id', $smmeIds)
                ->whereIn('event_id', $eventIds)
                ->delete();

            return $this->getResponse(
                [
                    'message' => 'Invite deleted successfully',
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
}
