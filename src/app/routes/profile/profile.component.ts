import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  profileForm!: FormGroup;
  passwordForm!: FormGroup;
  isEditingProfile = false;
  isChangingPassword = false;
  isLoading = true;
  selectedTab = 0;

  // Profile image
  profileImageUrl: string = '../../../assets/images/profile.jpg';
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toast: ToastService,
    private notificationUtil: NotificationUtil
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.authService.user().subscribe({
      next: (user) => {
        this.user = user;
        this.populateProfileForm();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user profile:', err);
        this.notificationUtil.showError('Failed to load profile');
        this.isLoading = false;
      }
    });
  }

  initializeForms(): void {
    this.profileForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: [''],
      job_title: [''],
      department: [''],
      bio: ['', Validators.maxLength(500)]
    });

    this.passwordForm = this.fb.group({
      current_password: ['', Validators.required],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    this.profileForm.disable();
  }

  populateProfileForm(): void {
    this.profileForm.patchValue({
      first_name: this.user.first_name || '',
      last_name: this.user.last_name || '',
      email: this.user.email || '',
      phone_number: this.user.phone_number || '',
      job_title: this.user.job_title || '',
      department: this.user.department || '',
      bio: this.user.bio || ''
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('new_password')?.value;
    const confirmPassword = group.get('confirm_password')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.isEditingProfile) {
      this.profileForm.enable();
      this.profileForm.get('email')?.disable(); // Email shouldn't be editable
    } else {
      this.profileForm.disable();
      this.populateProfileForm(); // Reset form
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.notificationUtil.showError('Please fill in all required fields correctly');
      return;
    }

    this.isLoading = true;
    const formData = this.profileForm.getRawValue();

    // Call the API to update profile
    this.authService.updateProfile(this.user.id, formData).subscribe({
      next: (response) => {
        this.user = { ...this.user, ...formData };
        this.isLoading = false;
        this.isEditingProfile = false;
        this.profileForm.disable();
        this.notificationUtil.showSuccess(response.message || 'Profile updated successfully');
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Failed to update profile. Please try again.';
        this.notificationUtil.showError(errorMessage);
      }
    });
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    if (!this.isChangingPassword) {
      this.passwordForm.reset();
    }
  }

  changePassword(): void {
    if (this.passwordForm.invalid) {
      if (this.passwordForm.hasError('passwordMismatch')) {
        this.notificationUtil.showError('Passwords do not match');
      } else {
        this.notificationUtil.showError('Please fill in all fields correctly');
      }
      return;
    }

    this.isLoading = true;
    const { current_password, new_password } = this.passwordForm.value;

    // Call the API to change password
    this.authService.changePassword(current_password, new_password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isChangingPassword = false;
        this.passwordForm.reset();
        this.notificationUtil.showSuccess(response.message || 'Password changed successfully');
      },
      error: (error) => {
        this.isLoading = false;
        const errorMessage = error.error?.message || 'Failed to change password. Please try again.';
        this.notificationUtil.showError(errorMessage);
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        this.notificationUtil.showError('File size should not exceed 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        this.notificationUtil.showError('Please select an image file');
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profileImageUrl = e.target.result;
      };
      reader.readAsDataURL(file);

      // TODO: Upload image to server
      this.notificationUtil.showSuccess('Profile picture updated');
    }
  }

  getInitials(): string {
    const firstName = this.user.first_name || '';
    const lastName = this.user.last_name || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getMemberSince(): string {
    if (this.user.created_at) {
      return new Date(this.user.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
    }
    return 'N/A';
  }
}
