"use strict";

export interface IResponseModelBase<T = {}> {
    message: string,
    data: T
}

export interface IUser {
  id?: number;
  firstName?: string; 
  lastName?: string; 
  phoneNumber?: string; 
  email?: string;
  updated_at?: string | null;
  created_at?: string;
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