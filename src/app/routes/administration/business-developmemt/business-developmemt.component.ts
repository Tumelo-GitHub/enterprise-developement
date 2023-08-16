import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-business-developmemt',
  templateUrl: './business-developmemt.component.html',
  styleUrls: ['./business-developmemt.component.scss']
})
export class BusinessDevelopmemtComponent implements OnInit {
  company = '';
  company_id = 0;

  constructor() { }

  ngOnInit(): void {
  }

  selectedCompany(company: any) {
    this.company = company.smme_name;
    this.company_id = company.id;
  }
}
