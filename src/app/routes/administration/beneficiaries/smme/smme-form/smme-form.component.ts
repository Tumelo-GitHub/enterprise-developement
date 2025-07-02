import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BUSINESS_TYPE, TURNOVER_RANGE } from 'src/app/shared/common/smme.constants';
import { SmmeService } from '../../../services/smme.service';
import { ToastService } from 'src/app/shared/services/toast.service';

@Component({
    selector: 'app-smme-form',
    templateUrl: './smme-form.component.html',
    styleUrls: ['./smme-form.component.scss']
})
export class SmmeFormComponent implements OnInit {
    businessTypeOptions = BUSINESS_TYPE;
    turnoverRangeOptions = TURNOVER_RANGE;
    business_industries: any[] = [];
    banking_options: any[] = [];
    form = this.fb.group({
        smme_name: [null, Validators.required],
        trading_name: [null],
        business_type: [null, Validators.required],
        products: [null],
        description: [null],
        postal_address: [null],
        registration_number: [null],
        web_address: [null],
        tax_number: [null],
        vat_number: [null],
        vendor_number: [null],
        bbbee: ["1", Validators.required],
        black_owned: ["Y"],
        woman_owned: ["Y"],
        youth_owned: ["Y"],
        disabled_owned: ["Y"],
        industry: ["Branding"],
        business_years: [5],
        programme: ["Risk Management Seminar", Validators.required],
        contact_origin: [null],
        registered: ['No', Validators.required],
        is_primary_bank: [null],
        primary_bank_name: [null],
        contacts: this.fb.array([this.createContact()]),
        annual_turnovers: this.fb.array([this.createAnnualTurnOver()]),
        emp_stats: this.fb.array([this.createEmpStats()]),
        address: this.fb.group({
            street_address_1: ["45 Postal street", Validators.required],
            street_address_2: ["Manhattan"],
            city: ["Mew York", Validators.required],
            province: ["Calafonia", Validators.required],
            code: [1499],
            country: ["South Africa", Validators.required],
            address_note: [null],
            location_type: [null, Validators.required],
        })
    });
    get contacts(): FormArray { return this.form.get('contacts') as FormArray; }
    get annual_turnovers(): FormArray { return this.form.get('annual_turnovers') as FormArray; }
    get emp_stats(): FormArray { return this.form.get('emp_stats') as FormArray; }
    get address(): FormGroup { return this.form.get('address') as FormGroup; }

    constructor(
        private fb: FormBuilder,
        public dialog: MatDialog,
        private smmeService: SmmeService,
        private toast: ToastService,
        private dialogRef: MatDialogRef<SmmeFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    }

    ngOnInit(): void {
        this.getBusinessIndustries();
        this.getBankingOptions();
        if (this.data) {
            // populate form with existing data
            this.form.patchValue(this.data);
            // get contacts and add them to the form
            let contacts = this.data.contacts as any[];
            const items = this.form.get('contacts') as FormArray;
            items.clear();
            contacts.forEach(contact => {
                items.push(this.fb.group({
                    id: contact.id,
                    smme_id: contact.smme_id,
                    full_names: contact.full_names,
                    tell_number: contact.tell_number,
                    cell_number: contact.cell_number,
                    position: contact.position,
                    email: contact.email
                }));
            });

            // get annual turnovers and add them to the form
            let annual_turnovers = this.data.annual_turnovers as any[];
            const turnovers = this.form.get('annual_turnovers') as FormArray;
            turnovers.clear();
            annual_turnovers.forEach(turnover => {
                turnovers.push(this.fb.group({
                    id: turnover.id,
                    smme_id: turnover.smme_id,
                    turnover: turnover.turnover,
                    year: turnover.year
                }));
            });

            // get employee stats and add them to the form
            let emp_stats = this.data.emp_stats as any[];
            const stats = this.form.get('emp_stats') as FormArray;
            stats.clear();
            emp_stats.forEach(stat => {
                stats.push(this.fb.group({
                    id: stat.id,
                    smme_id: stat.smme_id,
                    full_time: stat.full_time,
                    part_time: stat.part_time,
                    casual: stat.casual,
                    updated_date: stat.updated_date
                }));
            });
            // this.data.contacts.forEach((contact: any, index: number) => {
            //     if (index < this.data.contacts.length - 1) {
            //         this.addContact();
            //     }
            // });

            // this.data.annual_turnovers.forEach((turnover: any, index: number) => {
            //     if (index < this.data.annual_turnovers.length - 1) {
            //         this.addAnnualTurnover();
            //     }
            // });

            if (this.data.emp_stats.length == 0) {
                this.addEmpStats();
            }
            // this.data.emp_stats.forEach((stat: any, index: number) => {
            //     if (index < this.data.emp_stats.length - 1) {
            //         this.addEmpStats();
            //     }
            // });
        }
        console.log(this.data);
    }

    getBusinessIndustries(): void {
        this.smmeService.getBusinessIndustries().subscribe({
            next: (val: any) => {
                this.business_industries = val.data;
            },
            error: (err: any) => {
                console.error(err);
            }
        })
    }

    getBankingOptions(): void {
        this.smmeService.getBankingOptions().subscribe({
            next: (val: any) => {
                this.banking_options = val.data;
            },
            error: (err: any) => {
                console.error(err);
            }
        })
    }

    // TODO: refactor this functions to be more generic
    createContact(): FormGroup {
        return this.fb.group({
            id: [null],
            full_names: ['', Validators.required],
            position: [null],
            tell_number: [null],
            cell_number: ['', Validators.required],
            email: ['']
        });
    }

    addContact(): void {
        const items = this.form.get('contacts') as FormArray;
        items.push(this.createContact());
    }

    removeContact(index: number): void {
        const items = this.form.get('contacts') as FormArray;
        if (items.length > 1) {
            items.removeAt(index);
        }
    }

    createAnnualTurnOver(): FormGroup {
        return this.fb.group({
            id: [null],
            turnover: [null],
            year: [null]
        });
    }

    addAnnualTurnover(): void {
        const items = this.form.get('annual_turnovers') as FormArray;
        items.push(this.createAnnualTurnOver());
    }

    removeAnnualTurnover(index: number): void {
        const items = this.form.get('annual_turnovers') as FormArray;
        if (items.length > 1) {
            items.removeAt(index);
        }
    }

    createEmpStats(): FormGroup {
        return this.fb.group({
            id: [null],
            full_time: [null],
            part_time: [null],
            casual: [null],
            updated_date: ['']
        });
    }

    addEmpStats(): void {
        const items = this.form.get('emp_stats') as FormArray;
        items.push(this.createEmpStats());
    }

    removeEmpStats(index: number): void {
        const items = this.form.get('emp_stats') as FormArray;
        if (items.length > 1) {
            items.removeAt(index);
        }
    }

    onSubmit(): void {
        console.log(this.form.value);
        if (this.form.valid) {
            if (this.data) {
                // update existing record
                this.smmeService.update(this.data.id, this.form.value).subscribe({
                    next: (val: any) => {
                        this.toast.toastNotification('success', 'Success', val.message);
                        this.dialogRef.close(true);
                    },
                    error: (err: any) => {
                        this.toast.toastNotification('danger', 'Failed', err.message);
                        console.error(err)
                    }
                })
            } else {
                // add new record
                this.smmeService.create(this.form.value).subscribe({
                    next: (val: any) => {
                        this.toast.toastNotification('success', 'Success', val.message);
                        this.dialogRef.close(true);
                    },
                    error: (err: any) => {
                        this.toast.toastNotification('danger', 'Failed', err.message);
                        console.error(err)
                    }
                })
            }
        }
    }

}
