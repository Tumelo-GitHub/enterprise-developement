<?php

namespace App\Controllers;

use App\Models\TrainingEventRegisterModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class TrainingEventRegister extends BaseController
{
    /**
     * Get event register
     * @return Response
     */
    public function index()
    {
        $eventIds = $this->request->getGet('event_ids');
        $eventIdsArray = explode(',', $eventIds);
        $model = new TrainingEventRegisterModel();
        return $this->getResponse(
            [
                'message' => 'Event register retrieved',
                'data' => $model->select("training_event_attendance.*, smme.smme_name, registered, black_owned, woman_owned, youth_owned, disabled_owned, industry, products, event_date, address.location_type, programme.programme_name, course.course_name, venue_name, training_venue.address as venue_address,
                        smme_contact.full_names AS contact_name,
                        smme_contact.tell_number AS contact_tel,
                        smme_contact.cell_number AS contact_cell,
                        smme_contact.position AS contact_position,
                        smme_contact.email AS contact_email")
                    ->join('smme', 'training_event_attendance.smme_id = smme.id', 'inner')
                    ->join('address', 'smme.id = address.smme_id', 'inner')
                    ->join('training_event', 'training_event_attendance.event_id = training_event.id', 'inner')
                    ->join('programme_course', 'training_event.programme_course_id = programme_course.id', 'inner')
                    ->join('programme', 'programme_course.programme_id = programme.id', 'inner')
                    ->join('course', 'programme_course.course_id = course.id', 'inner')
                    ->join('training_venue', 'training_event.venue_id = training_venue.id', 'inner')
                    ->join("(SELECT sc1.* 
                                         FROM smme_contacts sc1 
                                         WHERE sc1.id = (
                                             SELECT MIN(sc2.id) 
                                             FROM smme_contacts sc2 
                                             WHERE sc2.smme_id = sc1.smme_id
                                         )
                                ) AS smme_contact", 'smme_contact.smme_id = smme.id', 'left')
                    ->whereIn('event_id', $eventIdsArray)
                    ->findAll()
            ]
        );
    }

    /**
     * Create register
     */
    public function create()
    {
        $rules = [
            'event_id ' => 'required',
            'smme_id' => 'required',
            'attendee' => 'required',
            'email' => 'required',
            'tel_number' => 'required',
            'age' => 'required',
            'gender' => 'required',
            'qualification' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $model = new TrainingEventRegisterModel();
        $id = $model->insert($input);

        return $this->getResponse(
            [
                'message' => 'Attendance added successfully',
                'data' => $model->findRegisterById($id)
            ]
        );
    }

    /**
     * Update an existing record
     */
    public function update($id = null)
    {
        try {
            $model = new TrainingEventRegisterModel();
            $model->findEntryById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);

            return $this->getResponse(
                [
                    'message' => 'Record updated successfully',
                    'data' => $model->findRegisterById($id)
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
     * Delete an existing Programme record
     */
    public function delete($id = null)
    {
        try {
            $model = new TrainingEventRegisterModel();
            $record = $model->findEntryById($id);
            $model->delete($id);

            return $this->getResponse(
                [
                    'message' => 'Record deleted successfully',
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
