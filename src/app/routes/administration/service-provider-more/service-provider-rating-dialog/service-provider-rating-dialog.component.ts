import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IMoreServiceProvider, IServiceProviderRating } from 'src/app/shared';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { ServiceProviderRatingService } from '../../services/service-provider-rating.service';

export interface IServiceProviderRatingDialogData {
  provider: IMoreServiceProvider;
}

@Component({
  selector: 'app-service-provider-rating-dialog',
  templateUrl: './service-provider-rating-dialog.component.html',
  styleUrls: ['./service-provider-rating-dialog.component.scss']
})
export class ServiceProviderRatingDialogComponent implements OnInit {
  readonly focusAreas = [
    'Accommodation',
    'Training Venue',
    'Catering',
    'Communication',
    'Professionalism',
    'Value for Money',
    'Other'
  ];
  readonly stars = [1, 2, 3, 4, 5];

  ratings: IServiceProviderRating[] = [];
  averageRating: number | null = null;
  ratingCount = 0;
  loading = false;
  submitting = false;
  editingId: number | null = null;

  form = this.fb.group({
    focus_area: [null, Validators.required],
    rating: [null, Validators.required],
    rated_by: [null],
    comment: [null]
  });

  constructor(
    private fb: FormBuilder,
    private service: ServiceProviderRatingService,
    private notificationUtil: NotificationUtil,
    private dialogRef: MatDialogRef<ServiceProviderRatingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IServiceProviderRatingDialogData
  ) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  loadRatings(): void {
    this.loading = true;
    this.service.getByProviderId(this.data.provider.id).subscribe({
      next: (response) => {
        this.ratings = response.data || [];
        this.averageRating = response.summary?.average_rating ?? null;
        this.ratingCount = response.summary?.rating_count ?? 0;
        this.loading = false;
      },
      error: () => {
        this.notificationUtil.showError('Failed to load feedback');
        this.loading = false;
      }
    });
  }

  selectRating(value: number): void {
    this.form.get('rating')?.setValue(value as any);
  }

  editRating(rating: IServiceProviderRating): void {
    this.editingId = rating.id;
    this.form.patchValue({
      focus_area: rating.focus_area as any,
      rating: rating.rating as any,
      rated_by: rating.rated_by as any,
      comment: rating.comment as any
    });
  }

  cancelEdit(): void {
    this.editingId = null;
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.submitting = true;

    const request = this.editingId
      ? this.service.update(this.editingId, value as any)
      : this.service.add({ ...(value as any), service_provider_id: this.data.provider.id });

    request.subscribe({
      next: () => {
        this.notificationUtil.showSuccess(`Feedback ${this.editingId ? 'updated' : 'added'} successfully`);
        this.submitting = false;
        this.cancelEdit();
        this.loadRatings();
      },
      error: () => {
        this.notificationUtil.showError(`Failed to ${this.editingId ? 'update' : 'add'} feedback`);
        this.submitting = false;
      }
    });
  }

  deleteRating(rating: IServiceProviderRating): void {
    const confirmed = confirm('Delete this feedback entry?');
    if (!confirmed) {
      return;
    }

    this.service.delete(rating.id).subscribe({
      next: () => {
        this.notificationUtil.showSuccess('Feedback deleted successfully');
        this.loadRatings();
      },
      error: () => {
        this.notificationUtil.showError('Failed to delete feedback');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }
}
