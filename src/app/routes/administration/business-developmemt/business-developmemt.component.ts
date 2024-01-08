import { Component, OnInit } from '@angular/core';
import { IBDSP } from 'src/app/shared';

@Component({
  selector: 'app-business-developmemt',
  templateUrl: './business-developmemt.component.html',
  styleUrls: ['./business-developmemt.component.scss']
})
export class BusinessDevelopmemtComponent implements OnInit {
  company!: IBDSP;
  id = 0;

  constructor() { }

  ngOnInit(): void {
  }

  selectedCompany(company: IBDSP) {
    this.id = company.id;
    this.company = company;
  }
}
