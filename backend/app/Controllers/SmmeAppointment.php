<?php

namespace App\Controllers;

use App\Models\SmmeAppointmentModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class SmmeAppointment extends BaseController
{
    /**
     * Get all smme appoints by programme id
     * @return Response
     */
    public function index($id = null)
    {
        $model = new SmmeAppointmentModel();
        return $this->getResponse(
            [
                'message' => 'Appointed SMME retrieved',
                'data' => $model->findSmmeAppointmentByProgrammeId($id)
            ]
        );
    }

    /**
     * Create a new smme
     */
    public function create()
    {
        // TODO: input validations
        $rules = [
            'smme_id' => 'required',
            'programme_id' => 'required',
            'appointment_date' => 'required',
            'status' => 'required',
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $appointedSmme = array();
        $programme_id = $input['programme_id'];
        $model = new SmmeAppointmentModel();
        // loop each smme
        foreach($input['smme_id'] as $smme) {
            $data = [
                'smme_id' => $smme,
                'programme_id' => $programme_id,
                'appointment_date' => $input['appointment_date'],
                'status' => $input['status']
            ];
            $id = $model->insert($data);
            array_push($appointedSmme, $model->findSmmeAppointmentById($id));
        }

        return $this->getResponse(
            [
                'message' => 'Smme appointed successfully',
                'data' => $appointedSmme
            ]
        );
    }

    /**
     * Get a single company by ID
     */
    public function show($id = null)
    {
        try {
            $model = new SmmeAppointmentModel();

            return $this->getResponse(
                [
                    'message' => 'Smme retrieved successfully',
                    'data' => $model->findSmmeAppointmentById($id)
                ]
            );
        } catch (Exception $e) {
            return $this->getResponse(
                [
                    'message' => 'Could not find company for specified ID'
                ],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update an existing Company
     */
    public function update($id = null)
    {
        try {
            $model = new SmmeAppointmentModel();
            $model->findAppointedSmmeById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);

            return $this->getResponse(
                [
                    'message' => 'Updated successfully',
                    'data' => $model->findSmmeAppointmentById($id)
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
     * Delete existing smme
     */
    public function delete($id = null) {
        try {
            $model = new SmmeAppointmentModel();
            $appointment = $model->findAppointedSmmeById($id);
            $model->delete($appointment);

            return $this->getResponse(
                    [
                        'message' => 'Deleted successfully',
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
?>