import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  
  // Dashboard statistics
  statistics = [
    {
      title: 'Total Beneficiaries',
      value: 1247,
      change: '+12%',
      changeType: 'positive',
      icon: 'people',
      color: '#667eea'
    },
    {
      title: 'Active Programs',
      value: 23,
      change: '+3',
      changeType: 'positive',
      icon: 'school',
      color: '#10b981'
    },
    {
      title: 'Completion Rate',
      value: 87.5,
      unit: '%',
      change: '+5.2%',
      changeType: 'positive',
      icon: 'trending_up',
      color: '#f59e0b'
    },
    {
      title: 'Monthly Budget',
      value: 125000,
      unit: 'R',
      change: '-2.1%',
      changeType: 'negative',
      icon: 'account_balance_wallet',
      color: '#ef4444'
    }
  ];

  // Recent activities
  recentActivities = [
    {
      action: 'New beneficiary registered',
      user: 'Thabo Mthembu',
      time: '2 hours ago',
      type: 'registration',
      icon: 'person_add'
    },
    {
      action: 'Training program completed',
      user: 'Sarah Johnson',
      time: '4 hours ago',
      type: 'completion',
      icon: 'school'
    },
    {
      action: 'Compliance document uploaded',
      user: 'ABC Company Ltd',
      time: '6 hours ago',
      type: 'document',
      icon: 'upload_file'
    },
    {
      action: 'Monthly report generated',
      user: 'System',
      time: '1 day ago',
      type: 'system',
      icon: 'assessment'
    }
  ];

  // Quick actions
  quickActions = [
    {
      title: 'Add Beneficiary',
      description: 'Register new individual or company',
      icon: 'add_circle',
      color: '#667eea',
      route: '/administration/beneficiaries'
    },
    {
      title: 'Generate Report',
      description: 'Create monthly progress report',
      icon: 'assessment',
      color: '#10b981',
      route: '/reports'
    },
    {
      title: 'Manage Programs',
      description: 'View and edit training programs',
      icon: 'school',
      color: '#f59e0b',
      route: '/administration/course'
    },
    {
      title: 'Review Compliance',
      description: 'Check compliance status',
      icon: 'verified_user',
      color: '#8b5cf6',
      route: '/administration/beneficiaries'
    }
  ];

  // Chart data for program progress
  programProgress = [
    { name: 'Business Development', completed: 85, total: 100, color: '#667eea' },
    { name: 'Technical Skills', completed: 72, total: 90, color: '#10b981' },
    { name: 'Leadership Training', completed: 64, total: 80, color: '#f59e0b' },
    { name: 'Financial Literacy', completed: 91, total: 110, color: '#ef4444' }
  ];

  /** Based on the screen size, switch from standard to one column per row */
  cards = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
    map(({ matches }) => {
      if (matches) {
        return [
          { title: 'Statistics', cols: 1, rows: 2, type: 'stats' },
          { title: 'Recent Activities', cols: 1, rows: 2, type: 'activities' },
          { title: 'Quick Actions', cols: 1, rows: 1, type: 'actions' },
          { title: 'Program Progress', cols: 1, rows: 2, type: 'progress' }
        ];
      }

      return [
        { title: 'Statistics', cols: 2, rows: 1, type: 'stats' },
        { title: 'Program Progress', cols: 1, rows: 2, type: 'progress' },
        { title: 'Recent Activities', cols: 1, rows: 2, type: 'activities' },
        { title: 'Quick Actions', cols: 2, rows: 1, type: 'actions' }
      ];
    })
  );

  constructor(private breakpointObserver: BreakpointObserver, public router: Router) {}

  // Navigation method
  navigateToAction(action: any): void {
    if (action.route) {
      this.router.navigate([action.route]);
    }
  }

  // Helper methods
  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  getProgressPercentage(completed: number, total: number): number {
    return Math.round((completed / total) * 100);
  }

  getActivityTypeClass(type: string): string {
    const typeClasses: {[key: string]: string} = {
      'registration': 'activity-registration',
      'completion': 'activity-completion',
      'document': 'activity-document',
      'system': 'activity-system'
    };
    return typeClasses[type] || 'activity-default';
  }
}
