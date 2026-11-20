import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TimesheetService } from '../../services/timesheet.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ITimesheet } from 'src/app/shared';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as moment from 'moment';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TimesheetComponent } from '../timesheet.component';

@Component({
  selector: 'app-timesheet-invoice',
  templateUrl: './timesheet-invoice.component.html',
  styleUrls: ['./timesheet-invoice.component.scss']
})
export class TimesheetInvoiceComponent implements OnInit {
  form!: FormGroup;
  projects: any[] = [];
  timesheet: ITimesheet[] = [];

  constructor(
    private _timesheetService: TimesheetService,
    private toast: ToastService,
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TimesheetComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { timesheet: ITimesheet[], disbursmentItems: any, employee_name: string, startDate: string, endDate: string }
  ) {
    console.log(data);
    this.timesheet = data.timesheet;
    this.form = this.fb.group({
      project_id: [null, Validators.required],
      rate: [null, Validators.required],
    });
  }

  ngOnInit(): void {
    this.getProjects();
  }

  getProjects() {
    this._timesheetService.getProjects().subscribe({
      next: resp => {
        this.projects = resp.data;
      },
      error: console.log
    });
  }

  getTotalDuration(timesheet: ITimesheet[]) {
    const totalSeconds = timesheet.reduce((sum, entry) => {
      const durationSeconds = moment.duration(entry.duration).asSeconds();
      return Number.isFinite(durationSeconds) ? sum + durationSeconds : sum;
    }, 0);

    return this.formatElapsedDuration(totalSeconds);
  }

  private formatElapsedDuration(totalSeconds: number): string {
    const safeSeconds = Math.max(0, Math.round(totalSeconds));
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);
    const seconds = safeSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  generateInvoice(): void {
    // check if form is valid
    if (this.form.valid) {
      const hourlyRate = this.form.get('rate')?.value as number;
      const selectedProjectId = this.form.get('project_id')?.value;

      const filteredTimesheet = this.timesheet.filter(entry => entry.project_id === selectedProjectId);
      const groupedData = this.groupTimesheetData(filteredTimesheet, hourlyRate);

      const doc = new jsPDF();
      doc.text(`Project: ${filteredTimesheet[0].project_name}`, 14, 15); // Write project name at the top
      doc.text(`Employee: ${this.data.employee_name}`, 14, 25); // Write employee name
      doc.text(`Date Range: ${this.data.startDate} - ${this.data.endDate}`, 14, 35); // Write date ranges

      let totalHours = 0;
      let totalCost = 0;

      groupedData.forEach(group => {
        const columns = ["Company Name", "Total Hours", "Total Cost"];
        const rows = group.entries.map(entry => [
          entry.company_name,
          entry.totalHours.toFixed(2),
          `R${entry.totalCost.toFixed(2)}`
        ]);

        // Calculate total hours and total cost for the group
        const totalGroupHours = group.entries.reduce((sum, entry) => sum + entry.totalHours, 0);
        const totalGroupCost = group.entries.reduce((sum, entry) => sum + entry.totalCost, 0);

        // Add total row
        rows.push([
          "Total",
          totalGroupHours.toFixed(2),
          `R${totalGroupCost.toFixed(2)}`
        ]);

        // Accumulate total hours and total cost
        totalHours += totalGroupHours;
        totalCost += totalGroupCost;

        doc.text(`Work Type: ${group.work_type}`, 14, (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 45);
        autoTable(doc, { head: [columns], body: rows, startY: (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 20 : 50 });
        // const finalY = (doc as any).lastAutoTable.finalY;
      });

      // Claim Disbursement table
      const columns = ["Item", "units", "Price per Unit", "Total"];
      const disbursementRows = this.data.disbursmentItems.map((item: { item_name: string; units: number; price_per_unit: number; }) => [
        item.item_name,
        item.units,
        `R${Number(item.price_per_unit ?? 0).toFixed(2)}`,
        `R${(item.units * Number(item.price_per_unit)).toFixed(2)}`
      ]);

      // Calculate total cost for disbursement items
      const totalDisbursementCost = this.data.disbursmentItems.reduce((sum: number, item: { units: number; price_per_unit: number; }) => sum + (item.units * Number(item.price_per_unit)), 0);

      // Add total row for disbursement items
      disbursementRows.push([
        "Total",
        "",
        "",
        `R${totalDisbursementCost.toFixed(2)}`
      ]);

      doc.text(`Disbursements`, 14, (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : 45);
      autoTable(doc, { head: [columns], body: disbursementRows, startY: (doc as any).lastAutoTable.finalY + 20 });

      // document footer total hours, hourly rate and total cost
      const finalY = (doc as any).lastAutoTable.finalY;
      doc.text(`Total Hours: ${totalHours.toFixed(2)}`, 14, finalY + 20);
      doc.text(`Hourly Rate: R${hourlyRate.toFixed(2)}`, 14, finalY + 30);
      doc.text(`Total Cost: R${(totalCost + totalDisbursementCost).toFixed(2)}`, 14, finalY + 40);
      doc.save("invoice.pdf");
      this.dialogRef.close();
    } else {
      this.toast.toastNotification('danger', 'Error', 'Please select a project and hourly rate to generate the invoice.');
    }
  }

  private groupTimesheetData(timesheet: ITimesheet[], hourlyRate: number) {
    const groupedData: { work_type: string, entries: { company_name: string, totalHours: number, totalCost: number }[] }[] = [];

    timesheet.forEach(entry => {
      let group = groupedData.find(g => g.work_type === entry.work_type);
      if (!group) {
        group = { work_type: entry.work_type, entries: [] };
        groupedData.push(group);
      }

      const existingEntry = group.entries.find(e => e.company_name === entry.company_name);
      const duration = moment.duration(entry.duration).asHours();
      const safeDuration = Number.isFinite(duration) ? duration : 0;

      if (existingEntry) {
        existingEntry.totalHours += safeDuration;
        existingEntry.totalCost += safeDuration * hourlyRate;
      } else {
        group.entries.push({
          company_name: entry.company_name,
          totalHours: safeDuration,
          totalCost: safeDuration * hourlyRate
        });
      }
    });

    return groupedData;
  }
}
