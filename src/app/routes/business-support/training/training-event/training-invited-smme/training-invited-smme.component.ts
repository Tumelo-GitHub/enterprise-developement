import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastService } from 'src/app/shared/services/toast.service';
import { TrainingEventService } from '../../../services/training-event.service';

@Component({
  selector: 'app-training-invited-smme',
  templateUrl: './training-invited-smme.component.html',
  styleUrls: ['./training-invited-smme.component.scss']
})
export class TrainingInvitedSmmeComponent implements OnInit {
  displayedColumns: string[] = ['smme_name', 'created_date', 'action'];
  dataSource!: MatTableDataSource<any>;
  smme: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    public dialog: MatDialog,
    private toast: ToastService,
    private trainingEventService: TrainingEventService
  ) { }

  ngOnInit(): void {
  }

  applyFilter($event: KeyboardEvent) {
    throw new Error('Method not implemented.');
  }
  
  openDialog(_t46: any = {}) {
  throw new Error('Method not implemented.');
  }

  deleteEmp(_t46: any) {
  throw new Error('Method not implemented.');
  }

}
