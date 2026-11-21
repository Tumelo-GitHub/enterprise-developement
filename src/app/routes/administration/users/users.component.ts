import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { TokenService } from 'src/app/core';
import { IAdminUser } from 'src/app/shared';
import { ToastService } from 'src/app/shared/services/toast.service';
import { NotificationUtil } from 'src/app/shared/utils/notificationUtil';
import { UserAdminService } from '../services/user-admin.service';

type StatusFilter = 'pending' | 'active' | 'deactivated' | 'all';

/**
 * Admin page to approve new sign-ups, activate/deactivate accounts and change roles.
 * Route is protected by AdminGuard; the API by the backend 'admin' filter.
 */
@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, OnDestroy {
  readonly filters: { key: StatusFilter, label: string }[] = [
    { key: 'pending', label: 'Waiting for approval' },
    { key: 'active', label: 'Active' },
    { key: 'deactivated', label: 'Deactivated' },
    { key: 'all', label: 'All' }
  ];

  users: IAdminUser[] = [];
  roles: string[] = [];
  filter: StatusFilter = 'pending';
  search = '';
  loading = true;
  loadError = false;
  /** Users with a save in flight, so their controls can be disabled. */
  saving = new Set<number>();
  readonly myId: number | null;

  private destroy$ = new Subject<void>();

  constructor(
    private service: UserAdminService,
    private toast: ToastService,
    private notify: NotificationUtil,
    token: TokenService
  ) {
    const me = token.getUser();
    this.myId = me?.id != null ? Number(me.id) : null;
  }

  ngOnInit(): void {
    this.load(true);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  load(initial = false): void {
    this.loading = true;
    this.loadError = false;
    this.service.getUsers().pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.users = resp.data.users;
        this.roles = resp.data.roles;
        // Open on the pending list only when someone is actually waiting
        if (initial && !this.count('pending')) this.filter = 'active';
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.loadError = true;
      }
    });
  }

  count(status: StatusFilter): number {
    return status === 'all' ? this.users.length : this.users.filter(u => u.status === status).length;
  }

  get visible(): IAdminUser[] {
    const term = this.search.trim().toLowerCase();
    return this.users.filter(u =>
      (this.filter === 'all' || u.status === this.filter) &&
      (!term || `${u.first_name} ${u.last_name} ${u.email} ${u.phone_number ?? ''}`.toLowerCase().includes(term)));
  }

  isMe(user: IAdminUser): boolean {
    return user.id === this.myId;
  }

  name(user: IAdminUser): string {
    return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() || user.email;
  }

  initials(user: IAdminUser): string {
    return this.name(user).split(/\s+/).map(p => p[0]).join('').slice(0, 2).toUpperCase();
  }

  approve(user: IAdminUser): void {
    this.save(user, { active: 1 }, `${this.name(user)} approved`);
  }

  reactivate(user: IAdminUser): void {
    this.save(user, { active: 1 }, `${this.name(user)} reactivated`);
  }

  deactivate(user: IAdminUser): void {
    this.toast.openConfirmBox('warning', 'Deactivate account',
      `${this.name(user)} will be signed out and won't be able to log in until reactivated.`
    ).subscribe(resp => {
      if (resp.success) this.save(user, { active: 0 }, `${this.name(user)} deactivated`);
    });
  }

  /** Declining removes the sign-up (only allowed for accounts that never logged in). */
  decline(user: IAdminUser): void {
    this.toast.openConfirmBox('danger', 'Decline sign-up',
      `Remove the sign-up for ${this.name(user)} (${user.email})? They can sign up again later.`
    ).subscribe(resp => {
      if (!resp.success) return;
      this.saving.add(user.id);
      this.service.decline(user.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.saving.delete(user.id);
          this.users = this.users.filter(u => u.id !== user.id);
          this.notify.showSuccess(`Sign-up for ${this.name(user)} declined`);
        },
        error: err => {
          this.saving.delete(user.id);
          this.toast.toastNotification('danger', 'Error', err?.error?.message || 'Could not decline the sign-up.');
        }
      });
    });
  }

  changeRole(user: IAdminUser, role: string): void {
    if (role === user.role) return;
    this.save(user, { role }, `${this.name(user)} is now ${role}`);
  }

  private save(user: IAdminUser, changes: { active?: 0 | 1, role?: string }, success: string): void {
    this.saving.add(user.id);
    this.service.update(user.id, changes).pipe(takeUntil(this.destroy$)).subscribe({
      next: resp => {
        this.saving.delete(user.id);
        const { emailed, ...updated } = resp.data;
        this.users = this.users.map(u => u.id === user.id ? updated : u);
        this.notify.showSuccess(emailed === false ? `${success}, but the email to them couldn't be sent` : success);
      },
      error: err => {
        this.saving.delete(user.id);
        // Replace the row with a copy so a role select that changed visually snaps back
        this.users = this.users.map(u => u.id === user.id ? { ...u } : u);
        this.toast.toastNotification('danger', 'Error', err?.error?.message || 'Could not update the user.');
      }
    });
  }

  trackById(_: number, user: IAdminUser): number {
    return user.id;
  }
}
