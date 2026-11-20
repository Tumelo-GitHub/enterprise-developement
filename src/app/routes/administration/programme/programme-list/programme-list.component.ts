import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IProgramme } from 'src/app/shared';
import { ProgrammeTableComponent } from '../programme-table/programme-table.component';

@Component({
  selector: 'app-programme-list',
  templateUrl: './programme-list.component.html',
  styleUrls: ['./programme-list.component.scss']
})
export class ProgrammeListComponent implements OnInit {
  @ViewChild(ProgrammeTableComponent) programmeTableComponent!: ProgrammeTableComponent;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  showProgrammeCourses(programme: IProgramme): void {
    this.router.navigate(['/administration/programme', programme.id, 'courses']);
  }

  showProgrammeBeneficiaries(programme: IProgramme): void {
    this.router.navigate(['/administration/programme', programme.id, 'beneficiaries']);
  }

  showProgrammeBdsp(programme: IProgramme): void {
    this.router.navigate(['/administration/programme', programme.id, 'bdsp']);
  }

  showProgrammeDocuments(programme: IProgramme): void {
    this.router.navigate(['/administration/programme', programme.id, 'documents']);
  }
}
