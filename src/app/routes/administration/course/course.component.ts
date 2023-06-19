import { Component, OnInit, ViewChild } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.scss']
})
export class CourseComponent implements OnInit {
  displayedColumns: string[] = ['trainingInstitute', 'courseName', 'courseCode', 'duration', 'nqf_level', 'description', 'exam', 'targetAudience', 'action'];
  columnsToDisplay: string[] = this.displayedColumns;
  dataSource!: MatTableDataSource<any>;

  columns = new FormControl('');
  columnList = [
    [
      'trainingInstitute',
      'Institute Name'
    ],
    [
      'courseName',
      'Course Name',
    ],
    [
      'courseCode',
      'Course Code',
    ],
    [
      'duration',
      'Duration',
    ],
    [
      'nqf_level',
      'NQF Level',
    ],
    [
      'description',
      'Description',
    ],
    [
      'exam',
      'Exam',
    ],
    [
      'targetAudience',
      'Target Audience',
    ],
    [
      'action',
      'Action',
    ]
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
    this.getCourseList();
  }

  getCourseList() {
    const res = [
      {
        trainingInstitute: "Tshwane",
        courseName: 'Human Resourse',
        courseCode: 'NHFG',
        duration: '3 years',
        credits: '120',
        nqf_level: 8,
        description: 'Leaning basics of HR',
        exam: 'Yes',
        targetAudience: 'Small Businesses'
      }
    ];
    this.dataSource = new MatTableDataSource(res);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    // this._genericService.getCompanyList().subscribe({
    //   next: (res) => {
    //     console.log(res)
    //     this.dataSource = new MatTableDataSource(res);
    //     this.dataSource.sort = this.sort;
    //     this.dataSource.paginator = this.paginator;
    //   },
    //   error: (err) => {
    //     console.log(err)
    //   }
    // })
  }

  removeColumn() {
    if (this.columnsToDisplay.length) {
      this.columnsToDisplay.pop();
    }
  }

  selectedColumns(column: any) {
    this.columnsToDisplay = column.value;
  }

  openDialog() {
    
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  deleteCourse(id: number) {
    
  }

  openEditForm(companyData: any) {
    
  }

}
