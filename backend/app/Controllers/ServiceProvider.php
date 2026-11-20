<?php

namespace App\Controllers;

use App\Models\ServiceProviderModel;
use App\Models\ServiceProviderRoleModel;
// use App\Controllers\BaseController;
use CodeIgniter\HTTP\Response;
use CodeIgniter\HTTP\ResponseInterface;
use Exception;

class ServiceProvider extends BaseController
{
    /**
     * Get all Service Providers
     * @return Response
     */
    public function index()
    {
        $model = new ServiceProviderModel();
        $role_model = new ServiceProviderRoleModel();
        $providers = $model->findAll();
        

        for ($x = 0; $x < count($providers); $x++) {
            $service_ids = array();
            $current_provider_service_ids = $role_model->findServiceProviderRoles($providers[$x]['id']);

            for ($i = 0; $i < count($current_provider_service_ids); $i++) {
                array_push($service_ids, $current_provider_service_ids[$i]['service_type_id']);
            }
            $providers[$x]['service_type'] = $service_ids;
        }

        return $this->getResponse(
            [
                'message' => 'Service providers retrieved',
                'data' => $providers
            ]
        );
    }

    /**
     * Create a new Service provider
     */
    public function create()
    {
        $rules = [
            'name' => 'required',
            'surname' => 'required',
            'email' => 'required',
            'tel_number' => 'required',
            'cell_number' => 'required',
            'qualification' => 'required',
            'service_type' => 'required'
        ];

        $input = $this->getRequestInput($this->request);

        if (!$this->validateRequest($input, $rules)) {
            return $this->getResponse(
                    $this->validator->getErrors(),
                    ResponseInterface::HTTP_BAD_REQUEST
                );
        }

        $service_types = $input['service_type'];
        unset($input['service_type']);


        $model = new ServiceProviderModel();
        $role_model = new ServiceProviderRoleModel();
        $id = $model->insert($input);

        for ($x = 0; $x < count($service_types); $x++) {
            $data =[
                'service_provider_id' => $id,
                'service_type_id' => $service_types[$x]
            ];
            $role_model->save($data);
        }

        
        $service_provider = $model->where('id', $id)->first();
        // $current_provider_service_id = $role_model->findServiceProviderRoles($id);
        $service_provider['service_type'] = $service_types;

        // for ($i = 0; $i < count($current_provider_service_ids); $i++) {
        //     array_push($service_provider['service_type'], $current_provider_service_ids[$i]['service_type_id']);
        // }

        return $this->getResponse(
            [
                'message' => 'Service provider added successfully',
                'data' => $service_provider
            ]
        );
    }

    /**
     * Get a single course by ID
     */
    public function show($id = null)
    {
        try {
            $model = new ServiceProviderModel();
            $course = $model->findCourseById($id);

            return $this->getResponse(
                [
                    'message' => 'Course retrieved successfully',
                    'data' => $course
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
     * Update an existing Course
     */
    public function update($id = null)
    {
        try {
            $model = new ServiceProviderModel();
            $model->findServiceProviderById($id);

            $input = $this->getRequestInput($this->request);

            $model->update($id, $input);
            $course = $model->findServiceProviderById($id);

            return $this->getResponse(
                [
                    'message' => 'Course updated successfully',
                    'data' => $course,
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
     * Delete an existing Service Provider
     */
    public function delete($id = null)
    {
        try {
            $model = new ServiceProviderModel();
            $service_provider = $model->findServiceProviderById($id);
            $model->delete($service_provider);

            return $this->getResponse(
                    [
                        'message' => 'Service provider deleted successfully',
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

    public function getByRole ($id = null) {
        $role_model = new ServiceProviderRoleModel();
        return $this->getResponse(
            [
                'message' => 'Service providers retrieved',
                'data' => $role_model->getServiceProvidersbyRoleId($id)
            ]
        );
    }
}