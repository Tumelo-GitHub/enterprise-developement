import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-beneficiaries-persons',
  templateUrl: './beneficiaries-persons.component.html',
  styleUrls: ['./beneficiaries-persons.component.scss']
})
export class BeneficiariesPersonsComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  switchToCompanies(): void {
    this.router.navigate(['/administration/beneficiaries']);
  }
}
