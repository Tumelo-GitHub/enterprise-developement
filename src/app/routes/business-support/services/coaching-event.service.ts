import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { IResponseModelBase, ICoachingEvent, ICoach, IProgramme, ISmme } from '../../../shared/interfaces';
import { COACHING_EVENT_STATUS, COACHING_EVENT_STATUS_NAMES, COACHING_AREAS, COACHING_SPECIALIZATIONS } from '../../../shared/common/coaching.constants';

@Injectable({
  providedIn: 'root'
})
export class CoachingEventService {

  private apiUrl = 'api/coaching-events'; // This would be the actual API endpoint

  // Mock data for testing
  private mockCoaches: ICoach[] = [
    {
      id: 1,
      name: 'Sarah',
      surname: 'Johnson',
      email: 'sarah.johnson@coaching.com',
      tel_number: '011-234-5678',
      cell_number: '082-345-6789',
      qualification: 'MBA, Certified Executive Coach',
      specialization: 'Business Strategy',
      coaching_areas: ['Business Strategy', 'Leadership Development', 'Growth Strategy']
    },
    {
      id: 2,
      name: 'Michael',
      surname: 'Chen',
      email: 'michael.chen@coaching.com',
      tel_number: '011-345-6789',
      cell_number: '083-456-7890',
      qualification: 'CA(SA), Business Coach Certification',
      specialization: 'Financial Management',
      coaching_areas: ['Financial Management', 'Compliance & Legal', 'Financial Planning']
    },
    {
      id: 3,
      name: 'Thandi',
      surname: 'Mthembu',
      email: 'thandi.mthembu@coaching.com',
      tel_number: '012-456-7890',
      cell_number: '084-567-8901',
      qualification: 'BCom Marketing, Digital Marketing Certification',
      specialization: 'Marketing & Sales',
      coaching_areas: ['Marketing & Sales', 'Digital Transformation', 'Product Development']
    },
    {
      id: 4,
      name: 'David',
      surname: 'Williams',
      email: 'david.williams@coaching.com',
      tel_number: '021-567-8901',
      cell_number: '085-678-9012',
      qualification: 'BSc Engineering, Lean Six Sigma Black Belt',
      specialization: 'Operations Management',
      coaching_areas: ['Operations Management', 'Operational Excellence', 'Innovation & Technology']
    }
  ];

  private mockProgrammes: IProgramme[] = [
    {
      id: 1,
      programme_name: 'SMME Development Programme',
      description: 'Comprehensive business development for small enterprises',
      programme_type: 1,
      generic_company_id: 1,
      start_date: '2024-01-15',
      end_date: '2024-12-15',
      sponsor_name: 'John',
      sponsor_surname: 'Sponsor',
      sponsor_cell: '082-123-4567',
      sponsor_alt_cell: '',
      sponsor_email: 'john.sponsor@company.com'
    },
    {
      id: 2,
      programme_name: 'Digital Transformation Initiative',
      description: 'Helping businesses adopt digital technologies',
      programme_type: 2,
      generic_company_id: 1,
      start_date: '2024-02-01',
      end_date: '2024-11-30',
      sponsor_name: 'Jane',
      sponsor_surname: 'Digital',
      sponsor_cell: '083-234-5678',
      sponsor_alt_cell: '',
      sponsor_email: 'jane.digital@company.com'
    },
    {
      id: 3,
      programme_name: 'Export Development Programme',
      description: 'Supporting businesses to enter international markets',
      programme_type: 3,
      generic_company_id: 1,
      start_date: '2024-03-01',
      end_date: '2025-02-28',
      sponsor_name: 'Robert',
      sponsor_surname: 'Export',
      sponsor_cell: '084-345-6789',
      sponsor_alt_cell: '',
      sponsor_email: 'robert.export@company.com'
    }
  ];

  private mockSmmes: ISmme[] = [
    {
      id: 1,
      smme_name: 'TechStart Solutions',
      trading_name: null,
      business_type: 1,
      products: 'Software Development, IT Consulting',
      description: 'Innovative technology solutions for small businesses',
      postal_address: 'P.O. Box 12345, Johannesburg, 2000',
      registration_number: '2020/123456/07',
      web_address: 'www.techstartsolutions.co.za',
      tax_number: 'TAX123456789',
      vat_number: 'VAT987654321',
      vendor_number: 'VEN001',
      bbbee: 4,
      black_owned: 'Yes',
      woman_owned: 'No',
      youth_owned: 'Yes',
      disabled_owned: 'No',
      industry: 1,
      business_years: 3,
      programme: 'SMME Development',
      contact_origin: 'Referral',
      registered: 'Yes',
      is_primary_bank: 'Yes',
      primary_bank_name: 'Standard Bank',
      updated_at: null,
      created_at: '2024-01-15T10:00:00Z',
      address: {
        smme_id: '1',
        street_address_1: '123 Business Park',
        street_address_2: 'Sandton',
        city: 'Johannesburg',
        province: 'Gauteng',
        code: '2196',
        country: 'South Africa',
        address_note: 'Office Block A, 3rd Floor',
        location_type: 'Commercial'
      },
      contacts: [{
        id: '1',
        smme_id: '1',
        full_names: 'Sipho Ndaba',
        tell_number: '011-234-5678',
        cell_number: '082-345-6789',
        position: 'CEO',
        email: 'sipho@techstartsolutions.co.za'
      }],
      annual_turnovers: [{
        id: '1',
        smme_id: '1',
        turnover: 'Between R500K and R1m',
        year: '2023'
      }],
      emp_stats: []
    },
    {
      id: 2,
      smme_name: 'Green Agriculture Co',
      trading_name: null,
      business_type: 2,
      products: 'Organic Farming, Agricultural Consulting',
      description: 'Sustainable agriculture solutions',
      postal_address: 'P.O. Box 54321, Pretoria, 0001',
      registration_number: '2019/654321/07',
      web_address: 'www.greenagriculture.co.za',
      tax_number: 'TAX987654321',
      vat_number: 'VAT123456789',
      vendor_number: 'VEN002',
      bbbee: 3,
      black_owned: 'Yes',
      woman_owned: 'Yes',
      youth_owned: 'No',
      disabled_owned: 'No',
      industry: 2,
      business_years: 5,
      programme: 'Export Development',
      contact_origin: 'Direct',
      registered: 'Yes',
      is_primary_bank: 'Yes',
      primary_bank_name: 'FNB',
      updated_at: null,
      created_at: '2024-02-20T14:30:00Z',
      address: {
        smme_id: '2',
        street_address_1: '456 Farm Road',
        street_address_2: 'Centurion',
        city: 'Pretoria',
        province: 'Gauteng',
        code: '0157',
        country: 'South Africa',
        address_note: 'Farm 123',
        location_type: 'Agricultural'
      },
      contacts: [{
        id: '2',
        smme_id: '2',
        full_names: 'Nomsa Mthembu',
        tell_number: '012-345-6789',
        cell_number: '083-456-7890',
        position: 'Managing Director',
        email: 'nomsa@greenagriculture.co.za'
      }],
      annual_turnovers: [{
        id: '2',
        smme_id: '2',
        turnover: 'Between R1m and R5m',
        year: '2023'
      }],
      emp_stats: []
    },
    {
      id: 3,
      smme_name: 'Creative Marketing Hub',
      trading_name: null,
      business_type: 1,
      products: 'Digital Marketing, Graphic Design, Branding',
      description: 'Creative marketing solutions for modern businesses',
      postal_address: 'P.O. Box 98765, Cape Town, 8000',
      registration_number: '2021/987654/07',
      web_address: 'www.creativemarketinghub.co.za',
      tax_number: 'TAX456789123',
      vat_number: 'VAT654321987',
      vendor_number: 'VEN003',
      bbbee: 4,
      black_owned: 'No',
      woman_owned: 'Yes',
      youth_owned: 'Yes',
      disabled_owned: 'No',
      industry: 3,
      business_years: 2,
      programme: 'Digital Transformation',
      contact_origin: 'Online',
      registered: 'Yes',
      is_primary_bank: 'Yes',
      primary_bank_name: 'ABSA',
      updated_at: null,
      created_at: '2024-03-10T09:15:00Z',
      address: {
        smme_id: '3',
        street_address_1: '789 Creative Street',
        street_address_2: 'Woodstock',
        city: 'Cape Town',
        province: 'Western Cape',
        code: '7925',
        country: 'South Africa',
        address_note: 'Creative Hub Building, 2nd Floor',
        location_type: 'Commercial'
      },
      contacts: [{
        id: '3',
        smme_id: '3',
        full_names: 'Chloe van der Merwe',
        tell_number: '021-456-7890',
        cell_number: '084-567-8901',
        position: 'Creative Director',
        email: 'chloe@creativemarketinghub.co.za'
      }],
      annual_turnovers: [{
        id: '3',
        smme_id: '3',
        turnover: 'Less than R500K',
        year: '2023'
      }],
      emp_stats: []
    }
  ];

  private mockCoachingEvents: ICoachingEvent[] = [
    {
      id: 1,
      programme_id: 1,
      coach_id: 1,
      address: 'Innovation Hub, Pretoria',
      event_date: '2024-12-15',
      event_time: '09:00',
      status: COACHING_EVENT_STATUS.SCHEDULED,
      smme: [1, 2],
      programme_name: 'SMME Development Programme',
      coach_name: 'Sarah',
      coach_surname: 'Johnson',
      status_name: COACHING_EVENT_STATUS_NAMES[COACHING_EVENT_STATUS.SCHEDULED]
    },
    {
      id: 2,
      programme_id: 2,
      coach_id: 2,
      address: 'Business Centre, Sandton',
      event_date: '2024-12-18',
      event_time: '14:00',
      status: COACHING_EVENT_STATUS.IN_PROGRESS,
      smme: [1, 3],
      programme_name: 'Digital Transformation Initiative',
      coach_name: 'Michael',
      coach_surname: 'Chen',
      status_name: COACHING_EVENT_STATUS_NAMES[COACHING_EVENT_STATUS.IN_PROGRESS]
    },
    {
      id: 3,
      programme_id: 3,
      coach_id: 3,
      address: 'Export Development Centre, Cape Town',
      event_date: '2024-12-20',
      event_time: '10:30',
      status: COACHING_EVENT_STATUS.COMPLETED,
      smme: [2],
      programme_name: 'Export Development Programme',
      coach_name: 'Thandi',
      coach_surname: 'Mthembu',
      status_name: COACHING_EVENT_STATUS_NAMES[COACHING_EVENT_STATUS.COMPLETED]
    },
    {
      id: 4,
      programme_id: 1,
      coach_id: 4,
      address: 'Technology Park, Durban',
      event_date: '2024-12-22',
      event_time: '11:00',
      status: COACHING_EVENT_STATUS.SCHEDULED,
      smme: [3],
      programme_name: 'SMME Development Programme',
      coach_name: 'David',
      coach_surname: 'Williams',
      status_name: COACHING_EVENT_STATUS_NAMES[COACHING_EVENT_STATUS.SCHEDULED]
    }
  ];

  constructor(private http: HttpClient) { }

  // Get all coaching events
  getAllCoachingEvents(): Observable<IResponseModelBase<ICoachingEvent[]>> {
    // Simulate API call with delay
    return of({
      message: 'Coaching events retrieved successfully',
      data: this.mockCoachingEvents.map(event => ({
        ...event,
        programme_name: this.mockProgrammes.find(p => p.id === event.programme_id)?.programme_name || 'Unknown Programme',
        coach_name: this.mockCoaches.find(c => c.id === event.coach_id)?.name || 'Unknown',
        coach_surname: this.mockCoaches.find(c => c.id === event.coach_id)?.surname || 'Coach',
        status_name: COACHING_EVENT_STATUS_NAMES[event.status] || 'Unknown Status'
      }))
    }).pipe(delay(500));
  }

  // Get coaching event by ID
  getCoachingEventById(id: number): Observable<IResponseModelBase<ICoachingEvent>> {
    const event = this.mockCoachingEvents.find(e => e.id === id);
    if (event) {
      const enrichedEvent = {
        ...event,
        programme_name: this.mockProgrammes.find(p => p.id === event.programme_id)?.programme_name || 'Unknown Programme',
        coach_name: this.mockCoaches.find(c => c.id === event.coach_id)?.name || 'Unknown',
        coach_surname: this.mockCoaches.find(c => c.id === event.coach_id)?.surname || 'Coach',
        status_name: COACHING_EVENT_STATUS_NAMES[event.status] || 'Unknown Status'
      };
      
      return of({
        message: 'Coaching event retrieved successfully',
        data: enrichedEvent
      }).pipe(delay(300));
    }
    
    return of({
      message: 'Coaching event not found',
      data: {} as ICoachingEvent
    }).pipe(delay(300));
  }

  // Create new coaching event
  create(coachingEvent: Partial<ICoachingEvent>): Observable<IResponseModelBase<ICoachingEvent>> {
    const newId = Math.max(...this.mockCoachingEvents.map(e => e.id)) + 1;
    const newEvent: ICoachingEvent = {
      id: newId,
      programme_id: coachingEvent.programme_id!,
      coach_id: coachingEvent.coach_id!,
      address: coachingEvent.address!,
      event_date: coachingEvent.event_date!,
      event_time: coachingEvent.event_time!,
      status: coachingEvent.status || COACHING_EVENT_STATUS.SCHEDULED,
      smme: coachingEvent.smme || [],
      programme_name: this.mockProgrammes.find(p => p.id === coachingEvent.programme_id)?.programme_name || 'Unknown Programme',
      coach_name: this.mockCoaches.find(c => c.id === coachingEvent.coach_id)?.name || 'Unknown',
      coach_surname: this.mockCoaches.find(c => c.id === coachingEvent.coach_id)?.surname || 'Coach',
      status_name: COACHING_EVENT_STATUS_NAMES[coachingEvent.status || COACHING_EVENT_STATUS.SCHEDULED]
    };

    this.mockCoachingEvents.push(newEvent);

    return of({
      message: 'Coaching event created successfully',
      data: newEvent
    }).pipe(delay(800));
  }

  // Update coaching event
  update(id: number, coachingEvent: Partial<ICoachingEvent>): Observable<IResponseModelBase<ICoachingEvent>> {
    const index = this.mockCoachingEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      const updatedEvent: ICoachingEvent = {
        ...this.mockCoachingEvents[index],
        ...coachingEvent,
        id: id, // Ensure ID doesn't change
        programme_name: this.mockProgrammes.find(p => p.id === coachingEvent.programme_id)?.programme_name || this.mockCoachingEvents[index].programme_name,
        coach_name: this.mockCoaches.find(c => c.id === coachingEvent.coach_id)?.name || this.mockCoachingEvents[index].coach_name,
        coach_surname: this.mockCoaches.find(c => c.id === coachingEvent.coach_id)?.surname || this.mockCoachingEvents[index].coach_surname,
        status_name: COACHING_EVENT_STATUS_NAMES[coachingEvent.status || this.mockCoachingEvents[index].status]
      };

      this.mockCoachingEvents[index] = updatedEvent;

      return of({
        message: 'Coaching event updated successfully',
        data: updatedEvent
      }).pipe(delay(600));
    }

    return of({
      message: 'Coaching event not found',
      data: {} as ICoachingEvent
    }).pipe(delay(300));
  }

  // Delete coaching event
  delete(id: number): Observable<IResponseModelBase<boolean>> {
    const index = this.mockCoachingEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockCoachingEvents.splice(index, 1);
      return of({
        message: 'Coaching event deleted successfully',
        data: true
      }).pipe(delay(400));
    }

    return of({
      message: 'Coaching event not found',
      data: false
    }).pipe(delay(300));
  }

  // Get all coaches
  getAllCoaches(): Observable<IResponseModelBase<ICoach[]>> {
    return of({
      message: 'Coaches retrieved successfully',
      data: this.mockCoaches
    }).pipe(delay(300));
  }

  // Get all programmes
  getAllProgrammes(): Observable<IResponseModelBase<IProgramme[]>> {
    return of({
      message: 'Programmes retrieved successfully',
      data: this.mockProgrammes
    }).pipe(delay(300));
  }

  // Get all SMMEs
  getAllSmmes(): Observable<IResponseModelBase<ISmme[]>> {
    return of({
      message: 'SMMEs retrieved successfully',
      data: this.mockSmmes
    }).pipe(delay(300));
  }

  // Get coaching event status options
  getStatusOptions(): { value: number, label: string }[] {
    return Object.keys(COACHING_EVENT_STATUS_NAMES).map(key => ({
      value: parseInt(key),
      label: COACHING_EVENT_STATUS_NAMES[parseInt(key)]
    }));
  }
}