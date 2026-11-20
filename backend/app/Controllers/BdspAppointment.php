<?php

namespace App\Controllers;

use App\Models\BdspAppointmentModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class BdspAppointment extends BaseController
{
    /**
     * Get all Bdsp appoints by programme id
     * @return Response
     */
    public function index($id = null)
    {
        $model = new BdspAppointmentModel();
        return $this->getResponse(
            [
                'message' => 'Appointed Bdsp retrieved',
                'data' => $model->findBdspAppointmentByProgrammeId($id)
            ]
        );
    }

    /**
     * Create a new Bdsp
     */
    public function create()
    {
        // TODO: input validations
        $rules = [
            'bdsp_id' => 'required',
            'programme_id' => 'required',
            'appointment_date' => 'required',
            'contract_start_date' => 'required',
            'contract_end_date' => 'required',
            'description' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $appointedBdsp = array();
        $bdspList = $input['bdsp_id'];
        unset($input['bdsp_id']);
        $model = new BdspAppointmentModel();
        // loop each Bdsp
        foreach($bdspList as $bdsp) {
            $input['bdsp_id'] = $bdsp;
            $id = $model->insert($input);
            array_push($appointedBdsp, $model->findBdspAppointmentById($id));
        }

        return $this->getResponse(
            [
                'message' => 'Bdsp appointed successfully',
                'data' => $appointedBdsp
            ]
        );
    }

    /**
     * Get a single company by ID
     */
    public function show($id = null)
    {
        try {
            $model = new BdspAppointmentModel();
            $Bdsp = $model->findBdspById($id);

            return $this->getResponse(
                [
                    'message' => 'Bdsp retrieved successfully',
                    'data' => $Bdsp
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
            $model = new BdspAppointmentModel();
            $model->findAppointedBdspById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);

            return $this->getResponse(
                [
                    'message' => 'Updated successfully',
                    'data' => $model->findBdspAppointmentById($id)
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
     * Delete existing Bdsp
     */
    public function delete($id = null) {
        try {
            $model = new BdspAppointmentModel();
            $appointment = $model->findAppointedBdspById($id);
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