import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/**
 * Utility service for displaying notifications using MatSnackBar
 * Provides consistent styling and behavior across the application
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationUtil {

  constructor(private snackBar: MatSnackBar) { }

  /**
   * Shows a success notification
   * @param message The message to display
   * @param action Optional action text (defaults to 'Close')
   * @param duration Duration in milliseconds (defaults to 3000)
   */
  showSuccess(message: string, action: string = 'Close', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: 'snack-bar-success'
    });
  }

  /**
   * Shows an error notification
   * @param message The message to display
   * @param action Optional action text (defaults to 'Close')
   * @param duration Duration in milliseconds (defaults to 4000)
   */
  showError(message: string, action: string = 'Close', duration: number = 4000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: 'snack-bar-error'
    });
  }

  /**
   * Shows a warning notification
   * @param message The message to display
   * @param action Optional action text (defaults to 'Close')
   * @param duration Duration in milliseconds (defaults to 3500)
   */
  showWarning(message: string, action: string = 'Close', duration: number = 3500): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: 'snack-bar-warning'
    });
  }

  /**
   * Shows an info notification
   * @param message The message to display
   * @param action Optional action text (defaults to 'Close')
   * @param duration Duration in milliseconds (defaults to 3000)
   */
  showInfo(message: string, action: string = 'Close', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: 'snack-bar-info'
    });
  }

  /**
   * Shows a generic notification with custom styling
   * @param message The message to display
   * @param type The notification type
   * @param action Optional action text (defaults to 'Close')
   * @param duration Duration in milliseconds (defaults to 3000)
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info', action: string = 'Close', duration: number = 3000): void {
    this.snackBar.open(message, action, {
      duration,
      panelClass: `snack-bar-${type}`
    });
  }

  /**
   * Dismisses all currently displayed notifications
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}