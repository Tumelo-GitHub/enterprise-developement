import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-table-action-bar',
  templateUrl: './table-action-bar.component.html',
  styleUrls: ['./table-action-bar.component.scss']
})
export class TableActionBarComponent {
  @Input() columnsList: string[][] = [];
  @Input() columns: FormControl = new FormControl('');
  @Input() columnsToDisplay: string[] = [];
  @Input() isLoading: boolean = false;
  @Input() filterLabel: string = 'Filter';
  @Input() filterPlaceholder: string = 'Search...';
  @Input() columnLabel: string = 'Display Columns';
  @Input() addButtonText: string = 'Add';
  @Input() addButtonIcon: string = 'add';
  @Input() addButtonTooltip: string = '';
  @Output() selectedToppings = new EventEmitter<any>();
  @Output() exportTable = new EventEmitter<void>();
  @Output() exportTableToPDF = new EventEmitter<void>();
  @Output() openDialog = new EventEmitter<void>();
  @Output() applyFilter = new EventEmitter<Event>();
  
  // Auto-detect if column selector should be shown based on columnsList
  get showColumnSelector(): boolean {
    return this.columnsList && this.columnsList.length > 0;
  }
  
  // Auto-detect if export to Excel button should be shown
  get showExportExcel(): boolean {
    return this.exportTable.observers.length > 0;
  }
  
  // Auto-detect if export to PDF button should be shown
  get showExportPDF(): boolean {
    return this.exportTableToPDF.observers.length > 0;
  }
}
