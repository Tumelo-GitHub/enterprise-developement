import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import {MatDialog, MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { GenericCompanyService } from 'src/app/services/generic-company.service';

@Component({
  selector: 'app-generic-company-form',
  templateUrl: './generic-company-form.component.html',
  styleUrls: ['./generic-company-form.component.scss']
})
export class GenericCompanyFormComponent implements OnInit {
  // companyForm = this.fb.group({
  //   companyName: [null, Validators.required],
  //   physicalAddress: [null, Validators.required],
  //   postalAddress: null,
  //   departmentName: [null, Validators.required],
  //   departmentAddress: [null, Validators.required],
  //   contactName: [null, Validators.required],
  //   contactSurname: [null, Validators.required],
  //   contactEmail: [null, Validators.required],
  //   contactCell: [null, Validators.required],
  // });

  companyForm = this.fb.group({
    file:['']
  });

  constructor(
    private fb: FormBuilder, 
    public dialog: MatDialog, 
    private _companyService: GenericCompanyService,
    private dialogRef: MatDialogRef<GenericCompanyFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    // this.companyForm.patchValue(this.data);
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.companyForm.controls.file.setValue(file)
    }
  }

  onSubmit() {
    const formData = new FormData();
    if(this.companyForm.controls.file.value){
      formData.append('file', this.companyForm.controls.file.value);
    }
    formData.append('category', 'company_compliance');
    formData.append('category_id', '25')

    this._companyService.upload(formData).subscribe(
      resp => console.log(resp)
    );
  }

  // onSubmit(): void {
  //   if (this.companyForm.valid) {
  //     if (this.data) {
  //       // update existing record
  //       this._companyService.updateCompany(this.data.id, this.companyForm.value).subscribe({
  //         next: (val : any) => {
  //           alert('company updated sucessfully');
  //           this.dialogRef.close(true);
  //         },
  //         error: (err: any) => {
  //           console.error(err)
  //         }
  //       })
  //     } else {
  //       // add new record
  //       this._companyService.upload(this.companyForm.value).subscribe({
  //         next: (val : any) => {
  //           alert('company added sucessfully');
  //           this.dialogRef.close(true);
  //         },
  //         error: (err: any) => {
  //           console.error(err)
  //         }
  //       })
  //     }
  //   }
  // }

}
