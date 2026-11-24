import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { ITimesheet } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import {
  IDisbursementItem, Invoice, buildInvoice, displayDate, invoiceFileName, money, renderInvoicePdf,
} from './invoice-pdf';

export interface TimesheetInvoiceData {
  timesheet: ITimesheet[];
  disbursmentItems: IDisbursementItem[];
  employee_name: string;
  startDate: string;
  endDate: string;
}

interface InvoiceProjectOption {
  id: string;
  name: string;
  hours: number;
}

@Component({
  selector: 'app-timesheet-invoice',
  templateUrl: './timesheet-invoice.component.html',
  styleUrls: ['./timesheet-invoice.component.scss']
})
export class TimesheetInvoiceComponent implements OnDestroy {
  form: FormGroup;
  /** Only projects with time in the loaded period, so every choice produces an invoice. */
  projects: InvoiceProjectOption[];
  preview: Invoice | null = null;
  generating = false;

  readonly money = money;
  readonly period: string;
  readonly disbursementCount: number;
  readonly disbursementTotal: number;

  private destroy$ = new Subject<void>();

  constructor(
    private toast: ToastService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TimesheetInvoiceComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TimesheetInvoiceData
  ) {
    this.projects = this.projectsWithTime(data.timesheet ?? []);
    this.period = `${displayDate(data.startDate)} – ${displayDate(data.endDate)}`;

    const disbursements = data.disbursmentItems ?? [];
    this.disbursementCount = disbursements.length;
    this.disbursementTotal = disbursements.reduce((s, d) => s + Number(d.units || 0) * Number(d.price_per_unit || 0), 0);

    this.form = this.fb.group({
      project_id: [this.projects.length === 1 ? this.projects[0].id : null, Validators.required],
      rate: [null, [Validators.required, Validators.min(0.01)]],
      include_disbursements: [true],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updatePreview());
    this.updatePreview();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateInvoice(): void {
    this.updatePreview();
    if (this.form.invalid || !this.preview) {
      this.form.markAllAsTouched();
      this.toast.toastNotification('danger', 'Error', 'Select a project and enter an hourly rate to generate the invoice.');
      return;
    }

    this.generating = true;
    try {
      renderInvoicePdf(this.preview).save(invoiceFileName(this.preview));
      this.dialogRef.close(true);
    } catch (err) {
      console.error('Invoice generation failed:', err);
      this.toast.toastNotification('danger', 'Error', 'Could not generate the invoice. Please try again.');
    } finally {
      this.generating = false;
    }
  }

  private updatePreview(): void {
    const { project_id, rate, include_disbursements } = this.form.getRawValue();
    if (!project_id || !(Number(rate) > 0)) {
      this.preview = null;
      return;
    }

    this.preview = buildInvoice({
      entries: this.data.timesheet ?? [],
      disbursements: this.data.disbursmentItems ?? [],
      projectId: project_id,
      rate: Number(rate),
      includeDisbursements: this.disbursementCount > 0 && !!include_disbursements,
      employee: this.data.employee_name,
      periodStart: this.data.startDate,
      periodEnd: this.data.endDate,
    });
  }

  private projectsWithTime(entries: ITimesheet[]): InvoiceProjectOption[] {
    const byId = new Map<string, InvoiceProjectOption>();
    for (const e of entries) {
      const id = String(e.project_id);
      const option = byId.get(id) ?? { id, name: e.project_name, hours: 0 };
      const h = moment.duration(e.duration).asHours();
      option.hours += Number.isFinite(h) ? h : 0;
      byId.set(id, option);
    }
    return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
  }
}
