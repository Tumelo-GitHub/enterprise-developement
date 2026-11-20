<?php

namespace App\Controllers;

class Home extends BaseController
{
    public function index(): string
    {
        return view('welcome_message');
    }

    public function business_industries()
    {
        $industries = [
            "Advertising/Media management",
            "Attorneys",
            "Audio Visual/ Event",
            "Branding",
            "Cleaning Services",
            "Construction",
            "Debt Collection",
            "Diesel",
            "Electrical Contractor"  ,
            "Electrical Equipment Manufacturers / Generator/UPS",
            "Electronic Security Sytems",
            "Event Management",
            "Geyser Manufacturers",
            "IT Services",
            "Panelbeaters",
            "Plumbing",
            "Signage Manufacture/Printing",
            "Towing & Roadside Assist",
            "Transports services",
            "Valuation services"  
        ];

        return $this->getResponse(
            [
                'message' => 'Industries retrieved successfully',
                'data' => $industries,
            ]
        );
    }

    public function banking_options()
    {
        $banking_options = [
            "Absa Bank Ltd",
            "African Bank Ltd",
            "Albaraka Bank Limited",
            "Bidvest Bank Limited",
            "BoE Private Clients",
            "Capitec Bank Ltd",
            "FirstRand Bank Ltd",
            "Grindrod Bank",
            "Habib Overseas Bank Limited",
            "HBZ Bank Limited",
            "Investec Bank Ltd",
            "Mercantile Bank Limited",
            "Nedbank Group Limited",
            "Rand Merchant Bank",
            "RMB Private Bank ",
            "Sasfin Bank Ltd",
            "South African Bank of Athens Limited",
            "Standard Bank of SA Ltd",
            "Wesbank"
        ];

        return $this->getResponse(
            [
                'message' => 'Banking options retrieved successfully',
                'data' => $banking_options,
            ]
        );
    }

    public function smme_program_options()
    {
        return $this->getResponse(
            [
                'message' => 'Banking options retrieved successfully',
                'data' => [
                    'SBSA',
                    'Financial Literacy',
                    'Risk Management',
                    'Finacial Literacy & Risk Management'
                ],
            ]
        );
    }
}
