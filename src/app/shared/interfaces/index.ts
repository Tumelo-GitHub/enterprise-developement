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

export interface IResponseModelBase<T = {}> {
    message: string,
    data: T
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