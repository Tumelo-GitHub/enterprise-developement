<?php

namespace App\Controllers;

use App\Models\SmmeModel;
use App\Models\AddressModel;
use App\Models\SmmeContactModel;
use App\Models\AnnualTurnoverModel;
use App\Models\SmmeEmpStatsModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class Smme extends BaseController
{
    /**
     * Get all smme
     * @return Response
     */
    public function index()
    {
        $model = new SmmeModel();
        $smmes = $model->findAll();

        for ($i = 0; $i < count($smmes); $i++) {
            // get smme address, turnovers, emp stats and contacts
            $smmes[$i]['address'] = $this->getUpdatedAddress($smmes[$i]['id']);

            $smmes[$i]['contacts'] = $this->getUpdatedContacts($smmes[$i]['id']);

            $smmes[$i]['annual_turnovers'] = $this->getUpdatedAnnualTurnovers($smmes[$i]['id']);

            $smmes[$i]['emp_stats'] = $this->getUpdatedEmpStats($smmes[$i]['id']);
        }

        return $this->getResponse(
            [
                'message' => 'Beneficiary Companies retrieved',
                'data' => $smmes
            ]
        );
    }

    /**
     * Create a new smme
     */
    public function create()
    {
        $rules = [
            'smme_name' => 'required|is_unique[smme.smme_name]',
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                $this->validator->getErrors(),
                ResponseInterface::HTTP_BAD_REQUEST
            );
        }

        // Extract related data
        $contacts = $input['contacts'];
        $address = $input['address'];
        $annual_turnovers = $input['annual_turnovers'];
        $emp_stats = $input['emp_stats'];

        unset($input['contacts'], $input['address'], $input['annual_turnovers'], $input['emp_stats']);

        $model = new SmmeModel();

        // Save SMME and check if successful
        if ($model->save($input)) {
            $smme = $model->where('smme_name', $input['smme_name'])->first();

            // Save related data
            $this->saveAddress($smme['id'], $address);
            $this->saveRelatedRecords(new SmmeContactModel(), $contacts, $smme['id']);
            $this->saveRelatedRecords(new AnnualTurnoverModel(), $annual_turnovers, $smme['id']);
            $this->saveRelatedRecords(new SmmeEmpStatsModel(), $emp_stats, $smme['id']);

            $address = $this->getUpdatedAddress($smme['id']);

            return $this->getResponse([
                'message' => 'Beneficiary Company added successfully',
                'data' => array_merge($smme, $address),
            ]);
        }

        return $this->getResponse([
            'message' => 'Failed to add Beneficiary Company'
        ], ResponseInterface::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Update an existing Company
     */
    public function update($id = null)
    {
        try {
            $model = new SmmeModel();
            $model->findSmmeById($id);

            $input = $this->getRequestInput($this->request);
            $contacts = $input['contacts'];
            $address = $input['address'];
            $annual_turnovers = $input['annual_turnovers'];
            $emp_stats = $input['emp_stats'];

            unset($input['contacts'], $input['address'], $input['annual_turnovers'], $input['emp_stats']);

            // Update SMME details
            $model->update($id, $input);
            $smme = $model->findSmmeById($id);

            // Update address
            $this->updateAddress($id, $address, $smme);

            // Update contacts
            $this->syncRelatedRecords(
                new SmmeContactModel(),
                $contacts,
                'smme_id',
                $id
            );
            $smme['contacts'] = $this->getUpdatedContacts($id);

            // Update annual turnovers
            $this->syncRelatedRecords(
                new AnnualTurnoverModel(),
                $annual_turnovers,
                'smme_id',
                $id
            );
            $smme['annual_turnovers'] = $this->getUpdatedAnnualTurnovers($id);

            // Update employee stats
            $this->syncRelatedRecords(
                new SmmeEmpStatsModel(),
                $emp_stats,
                'smme_id',
                $id
            );
            $smme['emp_stats'] = $this->getUpdatedEmpStats($id);

            return $this->getResponse([
                'message' => 'SMME updated successfully',
                'data' => $smme,
            ]);
        } catch (Exception $exception) {
            return $this->getResponse([
                'message' => $exception->getMessage(),
            ], ResponseInterface::HTTP_NOT_FOUND);
        }
    }

    /**
     * Function to save beneficiary address
     */
    private function saveAddress($smmeId, $addressData)
    {
        $addressModel = new AddressModel();
        $addressData['smme_id'] = $smmeId;
        $addressModel->save($addressData);
    }

    /**
     * Function to save beneficiary related records e.g contacts, turnover and emp stats
     */
    private function saveRelatedRecords($model, $records, $smmeId)
    {
        foreach ($records as $record) {
            unset($record['id']); // Ensure IDs are unset for new records
            $record['smme_id'] = $smmeId;
            $model->save($record);
        }
    }

    private function updateAddress($smmeId, $addressData, &$smme)
    {
        (new AddressModel())->where(['smme_id' => $smmeId])->set($addressData)->update();
        // $addressModel->updateAddress($smmeId, $addressData); // old code
        $smme['address'] = $this->getUpdatedAddress($smmeId);
    }

    private function syncRelatedRecords($model, $newRecords, $foreignKey, $parentId)
    {
        $currentIds = (array) $model->where([$foreignKey => $parentId])->findColumn('id');
        // $newIds = array_filter(array_map(fn($item) => $item['id'] ?? null, $newRecords));
        $newIds = array_map(function ($item) {
            return $item['id'];
        }, $newRecords);

        // Delete records that no longer exist
        $idsToDelete = array_diff($currentIds, $newIds);
        if (!empty($idsToDelete)) {
            $model->delete($idsToDelete);
        }

        // Insert or update records
        foreach ($newRecords as $record) {
            if (empty($record['id'])) {
                // Handle new record
                unset($record['id']);
                $record[$foreignKey] = $parentId;
                $model->save($record);
            } else {
                // Update existing record
                $model->update($record['id'], $record);
            }
        }
    }

    private function getUpdatedContacts($smmeId)
    {
        return (new SmmeContactModel())->where('smme_id', $smmeId)->findAll();
    }

    private function getUpdatedAnnualTurnovers($smmeId)
    {
        return (new AnnualTurnoverModel())->where('smme_id', $smmeId)->findAll();
    }

    private function getUpdatedEmpStats($smmeId)
    {
        return (new SmmeEmpStatsModel())->where('smme_id', $smmeId)->findAll();
    }

    private function getUpdatedAddress($smmeId)
    {
        return (new AddressModel)->where('smme_id', $smmeId)->first();
    }

    /**
     * Get a single SMME by ID (same structure as index)
     */
    public function show($id = null)
    {
        try {
            $model = new SmmeModel();
            $smme = $model->findSmmeById($id);  // throws if not found

            // Attach related data (same as index())
            $smme['address'] = $this->getUpdatedAddress($id);
            $smme['contacts'] = $this->getUpdatedContacts($id);
            $smme['annual_turnovers'] = $this->getUpdatedAnnualTurnovers($id);
            $smme['emp_stats'] = $this->getUpdatedEmpStats($id);

            return $this->getResponse([
                'message' => 'Beneficiary Company retrieved',
                'data'    => $smme
            ]);
        } catch (Exception $e) {
            return $this->getResponse(
                ['message' => 'Could not find Beneficiary Company for specified ID'],
                ResponseInterface::HTTP_NOT_FOUND
            );
        }
    }


    /**
     * Delete existing smme
     */
    public function delete($id = null)
    {
        try {
            $model = new SmmeModel();
            $smme = $model->findSmmeById($id);
            $model->delete($smme);

            return $this->getResponse(
                [
                    'message' => 'Smme deleted successfully',
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
