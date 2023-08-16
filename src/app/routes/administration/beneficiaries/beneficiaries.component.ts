import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-beneficiaries',
  templateUrl: './beneficiaries.component.html',
  styleUrls: ['./beneficiaries.component.scss']
})
export class BeneficiariesComponent implements OnInit {
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
