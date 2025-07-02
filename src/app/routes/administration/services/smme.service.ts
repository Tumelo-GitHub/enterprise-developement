import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IResponseModelBase } from 'src/app/shared';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SmmeService {

  constructor(private http: HttpClient) { }

  deleteCompany(id: number) : Observable<any> {
    return this.http.delete(`api/smme/${id}`);
  }

  getSmme() : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>("api/smme");
  }

  create(data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>('api/smme', data)
  }

  getCompanyById(id: number) : Observable<IResponseModelBase<any>> {
    return this.http.get<IResponseModelBase<any>>(`api/smme/${id}`)
  }

  update(id: number, data: any) : Observable<IResponseModelBase<any>> {
    return this.http.post<IResponseModelBase<any>>(`api/smme/${id}`, data);
  }
  getBankingOptions() : Observable<IResponseModelBase<any>> {
    // return this.http.get<IResponseModelBase<any>>("api/banking");
    const response = {
      message: "Banking options fetched successfully",
      data: BANKING_OPTIONS
    } as IResponseModelBase<any>;
    return of(response);
  }

  getBusinessIndustries() : Observable<IResponseModelBase<any>> {
    // return this.http.get<IResponseModelBase<any>>("api/business-industry");
    const response = {
      message: "Business industries fetched successfully",
      data: INDUSTRY
    } as IResponseModelBase<any>;
    return of(response);
  }
}

export const BANKING_OPTIONS = [
  {
    id: 1,
    name: "Absa Bank Ltd"
  },
  {
    id: 2,
    name: "African Bank Ltd"
  },
  {
    id: 3,
    name: "Albaraka Bank Limited"
  },
  {
    id: 4,
    name: "Bidvest Bank Limited"   
  },
  {
    id: 5,
    name: "BoE Private Clients"   
  },
  {
    id: 6,
    name: "Capitec Bank Ltd"   
  },
  {
    id: 7,
    name: "FirstRand Bank Ltd"   
  },
  {
    id: 9,
    name: "Grindrod Bank"   
  },
  {
    id: 10,
    name: "Habib Overseas Bank Limited"   
  },
  {
    id: 11,
    name: "HBZ Bank Limited"   
  },
  {
    id: 12,
    name: "Investec Bank Ltd"   
  },
  {
    id: 13,
    name: "Mercantile Bank Limited"   
  },
  {
    id: 14,
    name: "Nedbank Group Limited"   
  },
  {
    id: 15,
    name: "Rand Merchant Bank"   
  },
  {
    id: 16,
    name: "RMB Private Bank "   
  },
  {
    id: 17,
    name: "Sasfin Bank Ltd"   
  },
  {
    id: 19,
    name: "South African Bank of Athens Limited"   
  },
  {
    id: 20,
    name: "Standard Bank of SA Ltd"   
  },
  {
    id: 21,
    name: "Wesbank"   
  }
];

export const INDUSTRY = [
  {
    id: 1,
    name: "Advertising/Media management"
  },
  {
    id: 2,
    name: "Attorneys"
  },
  {
    id: 3,
    name: "Audio Visual/ Event"  
  },
  {
    id: 4,
    name: "Branding"  
  },
  {
    id: 5,
    name: "Cleaning Services"  
  },
  {
    id: 6,
    name: "Construction"  
  },
  {
    id: 7,
    name: "Debt Collection"  
  },
  {
    id: 8,
    name: "Diesel"  
  },
  {
    id: 9,
    name: "Electrical Contractor"  
  },
  {
    id: 10,
    name: "Electrical Equipment Manufacturers / Generator/UPS"  
  },
  {
    id: 11,
    name: "Electronic Security Sytems"  
  },
  {
    id: 12,
    name: "Event Management"  
  },
  {
    id: 13,
    name: "Geyser Manufacturers"  
  },
  {
    id: 14,
    name: "IT Services"  
  },
  {
    id: 15,
    name: "Panelbeaters"  
  },
  {
    id: 16,
    name: "Plumbing"  
  },
  {
    id: 17,
    name: "Signage Manufacture/Printing"  
  },
  {
    id: 18,
    name: "Towing & Roadside Assist"  
  },
  {
    id: 19,
    name: "Transports services"  
  },
  {
    id: 20,
    name: "Valuation services"  
  }
];
