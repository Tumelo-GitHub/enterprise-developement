import { Component, Inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject } from 'rxjs';

export interface LogoutWarningData {
  timeUntilLogout: number; // in seconds
  onRenew: () => void;
}

@Component({
  selector: 'app-logout-warning-dialog',
  templateUrl: './logout-warning-dialog.component.html',
  styleUrls: ['./logout-warning-dialog.component.scss']
})
export class LogoutWarningDialogComponent implements OnInit, OnDestroy {
  remainingSeconds = 0;

  private destroy$ = new Subject<void>();
  private countdownInterval: any;

  constructor(
    public dialogRef: MatDialogRef<LogoutWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LogoutWarningData,
    private cdr: ChangeDetectorRef
  ) {
    this.remainingSeconds = data.timeUntilLogout;
  }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeDialog(): void {
    this.stopCountdown();
    this.dialogRef.close();
  }

  renewToken(): void {
    this.stopCountdown();
    this.data.onRenew();
    this.dialogRef.close();
  }

  logout(): void {
    this.stopCountdown();
    this.dialogRef.close({ action: 'logout' });
  }

  get minutesRemaining(): number {
    return Math.floor(this.remainingSeconds / 60);
  }

  get secondsRemaining(): number {
    return this.remainingSeconds % 60;
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  private startCountdown(): void {
    this.countdownInterval = setInterval(() => {
      this.remainingSeconds--;
      this.cdr.markForCheck();

      if (this.remainingSeconds <= 0) {
        this.stopCountdown();
        this.dialogRef.close({ action: 'logout' });
      }
    }, 1000);
  }

  private stopCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }
}
