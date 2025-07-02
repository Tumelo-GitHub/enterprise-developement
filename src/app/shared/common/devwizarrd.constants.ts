'use strict';

import { IComplianceStatus } from "../interfaces";

export let beneficiaries: any[] = [];
export const CONFIRM_DELETE_MESSAGE: string = "Are you sure you want to delete this?";
export const DELETE_TITLE: string = "Delete";

/*
 * Programme course status
 */
export const programmeCourseStatus: any[] = [
    {
        id: '1',
        status_name: 'Approved'
    },
    {
        id: '2',
        status_name: 'Declined'
    }
];

/*
 * Service provider service types
 */
export const SERVICE_TYPE: any[] = [
    {
        id: '1',
        type_name: 'Coach'
    },
    {
        id: '2',
        type_name: 'Mentor'
    },
    {
        id: '3',
        type_name: 'Trainer'
    },
    {
        id: '4',
        type_name: 'Consultant'
    }
]

/*
 * Beneficiary appointment status
 */
export const APPOINTMENT_STATUS: IComplianceStatus[] = [
    {
        id: 1,
        status_name: 'Appointed',
        date_created: '',
    },
    {
        id: 2,
        status_name: 'Dismissed',
        date_created: '',
    },
    {
        id: 3,
        status_name: 'On-hold',
        date_created: '',
    },
    {
        id: 4,
        status_name: 'Completed',
        date_created: '',
    },
];

/**
 * Register Qualifications
 */

export const QUALIFICATIONS: string[] = [
    'No formal education',
    'Primary School',
    'High School',
    'College Diploma',
    'University degree',
    'Postgraduate Degree'
];

export const GENDER: any[] = [
    {
        value: 'M',
        description: 'Male'
    },
    {
        value: 'F',
        description: 'Female'
    },
    {
        value: 'Other',
        description: 'Other'
    }
];

export function setBeneficiaries(items: any[]) : void {
    beneficiaries = items;
}

export const INSTITUDES = [
    {
        id: 1,
        name: "Tshwane University of Technology"
    },
    {
        id: 8,
        name: 'Naswenda Training'
    },
    {
        id: 4,
        name: 'Richfield Technical College'
    }
];

export const INCOME_TYPE = [
    'Salary / Wages',
    'Business Income',
    'Support from family',
    'Government Grant',
    'Hustling',
    'Pension',
    'Investment',
    'Other',
    'None'
];

export const HOME_OWNERSHIP = [
    'Owned',
    'Rented',
    'Family Home',
    'Other',
    'None'
];

export const TRANSPORT_MODE = [
    'Own Car',
    'Bus',
    'Taxi',
    'Train',
    'Other',
    'None'
];

export const BUDGET = [
    'Myself',
    'Spouse',
    'Parent',
    'Child',
    'Sibling',
    'Other',
    'None'
];

export const LOCATION_TYPE = [
    'City',
    'Urban',
    'Suburb',
    'Township',
    'Other'
];

export const PROVINCES = [
    'Eastern Cape',
    'Free State',
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'North West',
    'Northern Cape',
    'Western Cape'
];

export const RACE = [
    'Black',
    'Coloured',
    'Indian',
    'White',
    'Other'
];

export const GENDER_OPTIONS = [
    
];