import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ICourse, IPerson } from 'src/app/shared';
import { PersonService } from '../../services/person.service';
import { MatDialog } from '@angular/material/dialog';
import { ToastService } from 'src/app/shared/services/toast.service';
import { PersonFormComponent } from './person-form/person-form.component';

@Component({
  selector: 'app-person',
  templateUrl: './person.component.html',
  styleUrls: ['./person.component.scss']
})
export class PersonComponent implements OnInit {
  displayedColumns: string[] = ['name', 'id_number', 'gender', 'race', 'age', 'occupation', 'cell_number', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;
  personList: IPerson[] = [];

  columns = new FormControl('');
  columnList = [
    [
      'name',
      'Name'
    ],
    [
      'gender',
      'Gender'
    ],
    [
      'race',
      'Race'
    ],
    [
      'age',
      'Age'
    ],
    [
      'occupation',
      'Occupation'
    ],
    [
      'cell_number',
      'Cell Number'
    ],
    [
      'action',
      'Action'
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog, private toast: ToastService, private personService: PersonService) { }

  ngOnInit(): void {
  }

  getPersonList(): void {
    this.personService.getPersonList().subscribe((res: any) => {
      this.personList = res.data;
    });
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column.value;
  }

  openDialog(data: any = {}) {
    const index = this.personList.indexOf(data);

    const dialogRef = this.dialog.open(PersonFormComponent, {
      data,
      panelClass: 'form-dialog'
    });
    dialogRef.afterClosed().subscribe((result: IPerson) => {
      if (result) {
        console.log(result, index);
        if (index >= 0) {
          this.personList[index] = result;
        } else {
          this.personList.push(result);
        }
        this.updateTable();
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deletePerson(id: number) {
    const index = this.personList.findIndex(course => course.id === id);

    this.toast.openConfirmBox('danger', 'Delete', 'Are you sure you want to delete this course?').subscribe(
      resp => {
        if (resp.success) {
          this.personService.delete(id).subscribe({
            next: resp => {
              this.toast.toastNotification('success', resp.message, '');
              this.personList.splice(index, 1);
              this.updateTable();
            },
            error: console.log
          })
        }
      }
    )
  }

  updateTable() : void {
    this.dataSource = new MatTableDataSource(this.personList);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
}
