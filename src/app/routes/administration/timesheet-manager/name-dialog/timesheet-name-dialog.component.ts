import { Component, Inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { TimesheetAdminService } from '../../services/timesheet-admin.service';

export interface TimesheetNameDialogData {
  title: string;
  label: string;
  value?: string;
  /** Performs the create/update. The dialog stays open on error so the user can fix the name. */
  save: (name: string) => Observable<{ message: string, data: any }>;
}

/**
 * Small dialog for creating or renaming a project or company.
 * Closes with the saved record on success.
 */
@Component({
  selector: 'app-timesheet-name-dialog',
  templateUrl: './timesheet-name-dialog.component.html'
})
export class TimesheetNameDialogComponent {
  name = new FormControl('', [Validators.required, Validators.maxLength(255)]);
  saving = false;
  serverError = '';

  constructor(
    private dialogRef: MatDialogRef<TimesheetNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TimesheetNameDialogData
  ) {
    this.name.setValue(data.value ?? '');
  }

  submit(): void {
    const value = (this.name.value ?? '').trim();
    this.name.setValue(value);
    if (this.name.invalid || this.saving) {
      this.name.markAsTouched();
      return;
    }

    this.saving = true;
    this.serverError = '';
    this.data.save(value).subscribe({
      next: resp => this.dialogRef.close(resp.data),
      error: err => {
        this.saving = false;
        this.serverError = TimesheetAdminService.errorMessage(err, 'Could not save. Please try again.');
      }
    });
  }
}
