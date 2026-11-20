<?php

namespace App\Controllers;

// use App\Controllers\BaseController;
use App\Models\TimesheetDisbursementModel;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class TimesheetDisbursement extends BaseController {
    /**
     * Get event register
     * @return Response
     */
    public function create() {
        $rules = [
            'item_name ' => 'required',
            'price_per_unit' => 'required',
            'units' => 'required',
            'date' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        $input['user_id'] = getLoggedInUser(getJWTFromRequest($this->request->getServer('HTTP_AUTHORIZATION')))['id'];
        $id = (new TimesheetDisbursementModel())->insert($input);

        return $this->getResponse(
            [
                'message' => 'Timesheet Item added successfully',
                'data' => (new TimesheetDisbursementModel())->find($id)
            ]
        );
    }

    /**
     * Update an existing Timesheet Disbursement Item
     */
    public function update($id = null)
    {
        try {
            $model = new TimesheetDisbursementModel();
            $model->findItemById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);

            return $this->getResponse(
                [
                    'message' => 'Timesheet Item updated successfully',
                    'data' => $model->find($id)
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
            $model = new TimesheetDisbursementModel();
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
}