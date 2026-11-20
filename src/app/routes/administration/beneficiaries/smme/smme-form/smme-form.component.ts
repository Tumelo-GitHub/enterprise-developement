import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BUSINESS_TYPE, TURNOVER_RANGE } from 'src/app/shared/common/smme.constants';
import { SmmeService } from '../../../services/smme.service';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
    selector: 'app-smme-form',
    templateUrl: './smme-form.component.html',
    styleUrls: ['./smme-form.component.scss']
})
export class SmmeFormComponent implements OnInit {
    @Input() companyData: any = null;
    @Output() formSubmitted = new EventEmitter<any>();
    @Output() formCancelled = new EventEmitter<void>();

    isEditMode = false;
    isSubmitting = false;
    businessTypeOptions = BUSINESS_TYPE;
    turnoverRangeOptions = TURNOVER_RANGE;
    business_industries: string[] = [];
    banking_options: string[] = [];
    form = this.fb.group({
        smme_name: [null, Validators.required],
        trading_name: [null],
        business_type: [null, Validators.required],
        products: [null],
        description: [null],
        registration_number: [null],
        tax_number: [null],
        vat_number: [null],
        vendor_number: [null],
        bbbee: [null, Validators.required],
        black_owned: [null],
        woman_owned: [null],
        youth_owned: [null],
        disabled_owned: [null],
        industry: [null],
        business_years: [null],
        programme: [null, Validators.required],
        contact_origin: [null],
        registered: ['No', Validators.required],
        is_primary_bank: [null],
        primary_bank_name: [null],
        contacts: this.fb.array([this.createContact()]),
        annual_turnovers: this.fb.array([]),
        emp_stats: this.fb.array([]),
        address: this.fb.group({
            street_address_1: [null, Validators.required],
            street_address_2: [null],
            city: [null, Validators.required],
            province: [null, Validators.required],
            code: [null],
            country: ['South Africa', Validators.required],
            address_note: [null],
            location_type: [null, Validators.required],
            postal_address: [null],
            web_address: [null]
        })
    });
    get contacts(): FormArray { return this.form.get('contacts') as FormArray; }
    get annual_turnovers(): FormArray { return this.form.get('annual_turnovers') as FormArray; }
    get emp_stats(): FormArray { return this.form.get('emp_stats') as FormArray; }
    get address(): FormGroup { return this.form.get('address') as FormGroup; }
    get contactFormGroups(): FormGroup[] {
        return (this.form.get('contacts') as FormArray).controls as FormGroup[];
    }

    constructor(
        private fb: FormBuilder,
        private smmeService: SmmeService,
        private toast: ToastService,
        private notification: NotificationUtil
    ) {}

    ngOnInit(): void {
        this.getBusinessIndustries();
        this.getBankingOptions();
        
        const sourceData = this.companyData;
        if (sourceData) {
            this.isEditMode = true;
            // populate form with existing data
            this.form.patchValue(sourceData);
            
            // get contacts and add them to the form
            if (sourceData.contacts && Array.isArray(sourceData.contacts)) {
                let contacts = sourceData.contacts as any[];
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
            }

            // get annual turnovers and add them to the form
            if (sourceData.annual_turnovers && Array.isArray(sourceData.annual_turnovers)) {
                let annual_turnovers = sourceData.annual_turnovers as any[];
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
            }

            // get employee stats and add them to the form
            if (sourceData.emp_stats && Array.isArray(sourceData.emp_stats)) {
                let emp_stats = sourceData.emp_stats as any[];
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
            }
        }
        // console any form erros
        console.log('Form errors:', this.form.errors);
        console.log('Form initialized with data:', sourceData);
    }

    getBusinessIndustries(): void {
        this.smmeService.getOptions('business-industry').subscribe({
            next: (data) => this.business_industries = data.data,
            error: () => this.notification.showError('Could not load industries')
        });
    }

    getBankingOptions(): void {
        this.smmeService.getOptions('banking').subscribe({
            next: (data) => this.banking_options = data.data,
            error: () => this.notification.showError('Could not load banks')
        });
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
        items.removeAt(index);
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
        items.removeAt(index);
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.isSubmitting = true;
            
            const sourceData = this.companyData;
            
            if (sourceData) {
                // update existing record
                this.smmeService.update(sourceData.id, this.form.value).subscribe({
                    next: (val: any) => {
                        this.notification.showSuccess(val.message);
                        this.isSubmitting = false;
                        
                        this.formSubmitted.emit(val);
                    },
                    error: (err: any) => {
                        this.notification.showError(err.message);
                        this.isSubmitting = false;
                        console.error(err);
                    }
                })
            } else {
                // add new record
                this.smmeService.create(this.form.value).subscribe({
                    next: (val: any) => {
                        this.notification.showSuccess(val.message);
                        this.isSubmitting = false;
                        
                        this.formSubmitted.emit(val);
                    },
                    error: (err: any) => {
                        this.notification.showError(err.message);
                        this.isSubmitting = false;
                        console.error(err);
                    }
                })
            }
        }
    }

    onCancel(): void {
        this.formCancelled.emit();
    }

    onReset(): void {
        this.form.reset();
        // Reset form arrays to initial state
        const contacts = this.form.get('contacts') as FormArray;
        contacts.clear();
        this.addContact();
        
        const turnovers = this.form.get('annual_turnovers') as FormArray;
        turnovers.clear();
        this.addAnnualTurnover();
        
        const empStats = this.form.get('emp_stats') as FormArray;
        empStats.clear();
    }

}
