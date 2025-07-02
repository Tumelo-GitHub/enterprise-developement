"use strict";

export interface IResponseModelBase<T = {}> {
    message: string,
    data: T
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface IRegisterRequest {
  first_name: string;
  last_name: string;
  phone_number: string;
  password: string;
  email: string;
}

export interface IUser {
  id?: number;
  first_name?: string; 
  last_name?: string; 
  phone_number?: string; 
  email?: string;
  updated_at?: string | null;
  created_at?: string;
  active?: number;
  role?: string
}

export interface IClient {
  id?: number;
  name?: string;
  db_name?: string;
  email?: string;
  contact_number?: string;
  alt_contact_number?: string;
  start_date?: string;
  expiry_date?: string;
}

export interface ICompliance {
    id: number,
    type_id: number,
    registration_num: string,
    smme_id: number,
    issued_date: string,
    expiry_date: string,
    status: number,
    isVerified: string,
    verified_person: string,
    docid: number,
    document_name: string
}


export interface IComplianceStatus {
    id: number,
    status_name: string,
    date_created: string
}
  
export interface IComplianceType {
    id: number,
    type_name: string,
    date_created: string
}

export interface IMenu {
    route: string;
    name: string;
    type: 'link' | 'sub' | 'extLink' | 'extTabLink';
    icon: string;
    label?: MenuTag;
    badge?: MenuTag;
    children?: MenuChildrenItem[];
    permissions: MenuPermissions;
  }
  
  export interface MenuTag {
    color: string; // background color
    value: string;
  }
  
  export interface MenuPermissions {
    only: string | string[];
    except: string | string[];
  }
  
  export interface MenuChildrenItem {
    route: string;
    name: string;
    type: 'link' | 'sub' | 'extLink' | 'extTabLink';
    children?: MenuChildrenItem[];
    permissions?: MenuPermissions;
  }

  export interface IEmployee {
    id: number,
    company: number,
    name: string,
    surname: string,
    position: string,
    role: string,
    cell_number: string,
    email: string
  }

  export interface IProgramme {
    id: number,
    programme_name: string,
    description: string,
    programme_type: number,
    generic_company_id: number,
    start_date: string,
    end_date: string,
    sponsor_name: string,
    sponsor_surname: string,
    sponsor_cell: string,
    sponsor_alt_cell: string,
    sponsor_email: string
  }

  export interface IBDSP {
    bbbee_level: number,
    bdsp_name: string,
    cell_number: string, 
    description: string,
    email: string,
    id: number,
    physical_address: string,
    postal_address: string,
    products: string,
    registration: string,
    tax_number: string,
    tell_number: string,
  }

  export interface IServiceProvider {
    id: number,
    name: string,
    surname: string,
    email: string,
    tel_number: string,
    cell_number: string,
    qualification: string,
    specialization: string,
    service_type: number[]
  }

  export interface ISmme {
    id: number
    smme_name: string
    trading_name: null,
    business_type: number
    products: string
    description: string
    postal_address: string
    registration_number: string
    web_address: string
    tax_number: string
    vat_number: string
    vendor_number: string
    bbbee: number
    black_owned: string
    woman_owned: string
    youth_owned: string
    disabled_owned: string
    industry: number
    business_years: number
    programme: string
    contact_origin: string
    registered: string
    is_primary_bank: string
    primary_bank_name: string
    updated_at: null,
    created_at: string
    address: {
        smme_id: string
        street_address_1: string
        street_address_2: string
        city: string
        province: string
        code: string
        country: string
        address_note: string
        location_type: string
    },
    contacts: IContact[],
    annual_turnovers: ITurnover[],
    emp_stats: []
}

export interface IContact {
  id: string
  smme_id: string
  full_names: string
  tell_number: string
  cell_number: string
  position: string
  email: string
}

export interface ITurnover {
  id: string
  smme_id: string
  turnover: string
  year: string
}

export interface ITimesheet {
  id: number,
  date: string,
  project_id: number,
  project_name: string,
  company_id: number,
  company_name: string,
  general_activity: string,
  duration: string,
  comment: string,
  user_id: number,
  first_name: string,
  last_name: string,
  work_type: string
}

export interface ICourse {
  id: number,
  training_institute_id: string,
  course_name: string,
  course_code: string,
  duration: string,
  credits: string,
  nqf_level: string,
  description: string,
  exam: string,
  target_audiance: string,
  training_institute_name: string
}

export interface IPerson {
  id: number,
  name: string,
  surname: string,
  id_number: string,
  gender: string,
  race: string,
  age: number,
  occupation: string,
  cell_number: string,
  email: string,
  address: string,
  tell_number: string
}