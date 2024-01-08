import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { ProgrammeService } from '../../../services/programme.service';
import { GenericCompanyService } from '../../../services/generic-company.service';

@Component({
  selector: 'app-programme-form',
  templateUrl: './programme-form.component.html',
  styleUrls: ['./programme-form.component.scss']
})
export class ProgrammeFormComponent implements OnInit {
  companyList: any[] =[];
  types: any[] = [];
  programmeForm = this.fb.group({
    programme_name: [null, Validators.required],
    programme_type: [null, Validators.required],
    description: [null, Validators.required],
    generic_company_id: [null, Validators.required],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    sponsor_name: [null, Validators.required],
    sponsor_surname: [null, Validators.required],
    sponsor_cell: [null, Validators.required],
    sponsor_alt_cell: [""],
    sponsor_email: [null, Validators.email]
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog,
    private toast: ToastService,
    private service: ProgrammeService,
    private companyService: GenericCompanyService,
    private dialogRef: MatDialogRef<ProgrammeFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.programmeForm.patchValue(this.data);
    this.getGenericCompanyList();
    this.getProgrammeTypes();
  }

  getGenericCompanyList() {
    this.companyService.getCompanyList().subscribe({
      next: response => {
        this.companyList = response.data;
      },
      error: console.log
    })
  }

  getProgrammeTypes() {
    this.service.getProgrammeTypes().subscribe({
      next: reponse => {
        this.types = reponse.data;
      },
      error: console.log
    });
  }

  onSubmit(): void {
    if(this.data.id) {
      // update
      this.service.update(this.data.id, this.programmeForm.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', '',response.message);
          this.dialogRef.close(response.data);
        },
        error: console.log
      });
    } else {
      // add new
      this.service.create(this.programmeForm.value).subscribe({
        next: response => {
          this.toast.toastNotification('success', '',response.message);
          this.dialogRef.close(response.data);
        },
        error: err => console.log(err)
      })
    }
  }

}
