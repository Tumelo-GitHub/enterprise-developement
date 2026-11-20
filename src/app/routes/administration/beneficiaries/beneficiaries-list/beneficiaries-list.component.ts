import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SmmeComponent } from '../smme/smme.component';

@Component({
  selector: 'app-beneficiaries-list',
  templateUrl: './beneficiaries-list.component.html',
  styleUrls: ['./beneficiaries-list.component.scss']
})
export class BeneficiariesListComponent implements OnInit {
  @ViewChild(SmmeComponent) smmeComponent!: SmmeComponent;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Component will be initialized when route is activated
    // SmmeComponent will load data automatically in its ngOnInit
  }

  onShowEmployees(company: any): void {
    this.router.navigate(['/administration/beneficiaries', company.id, 'employees']);
  }

  onShowCompliance(company: any): void {
    this.router.navigate(['/administration/beneficiaries', company.id, 'compliance']);
  }

  onShowForm(): void {
    this.router.navigate(['/administration/beneficiaries/new']);
  }

  onEditForm(company: any): void {
    this.router.navigate(['/administration/beneficiaries', company.id]);
  }

  switchToPersons(): void {
    this.router.navigate(['/administration/beneficiaries/persons']);
  }
}
