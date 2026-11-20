import * as XLSX from "xlsx";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'

const getFileName = (name: string) => {
  let timeSpan = new Date().toISOString();
  let sheetName = name || "ExportResult";
  let fileName = `${sheetName}-${timeSpan}`;
  return {
    sheetName,
    fileName
  };
};
export class TableUtil {
    /**
     * Function to export Mat Table to Excel
     * @param tableId table element id to export
     * @param name your excel sheet name
     */
  static exportTableToExcel(tableId: string, name: string) {
    let { sheetName, fileName } = getFileName(name);
    let targetTableElm = document.getElementById(tableId);
    
    if (!targetTableElm) {
      console.error('Table element not found:', tableId);
      return;
    }
    
    // Clone the table to modify it without affecting the original
    const clonedTable = targetTableElm.cloneNode(true) as HTMLElement;
    
    // Remove all mat-icon elements to prevent icon names from appearing in Excel
    const matIcons = clonedTable.querySelectorAll('mat-icon');
    matIcons.forEach(icon => icon.remove());
    
    // Remove all other icon elements
    const allIcons = clonedTable.querySelectorAll('[class*="icon"], i, .material-icons');
    allIcons.forEach(icon => icon.remove());
    
    // Remove action columns from both header and body
    const headerCells = clonedTable.querySelectorAll('th');
    const actionColumnIndices: number[] = [];
    
    headerCells.forEach((cell, index) => {
      const cellText = cell.textContent?.toLowerCase() || '';
      if (cellText.includes('action')) {
        actionColumnIndices.push(index);
      }
    });
    
    // Remove action column headers
    actionColumnIndices.reverse().forEach(index => {
      const headers = clonedTable.querySelectorAll('th');
      if (headers[index]) {
        headers[index].remove();
      }
    });
    
    // Remove action column cells from all rows
    const rows = clonedTable.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      actionColumnIndices.reverse().forEach(index => {
        if (cells[index]) {
          cells[index].remove();
        }
      });
    });
    
    let wb = XLSX.utils.table_to_book(clonedTable, <XLSX.Table2SheetOpts>{
      sheet: sheetName
    });
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportArrayToExcel(arr: any[], name: string) {
    let { sheetName, fileName } = getFileName(name);

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.xlsx`);
  }

  static exportArrayToCSV(arr: any[], name: string) {
    let { sheetName, fileName } = getFileName(name);

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(arr);
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}.csv`, { bookType: 'csv' });
  }

  static exportArrayToPDF(headers: string[], rows: any[][], name: string, title: string): void {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text(title, 14, 16);
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 24,
      theme: 'striped',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [45, 82, 120] }
    });
    doc.save(`${name}-${new Date().toISOString()}.pdf`);
  }

  /**
   * Function to export HTML table to PDF
   * @param tableId html table id
   * @param fileName optional filename
   * @param title optional document title
   * @param orientation document  orientation
   */
  static exportTableToPDF(tableId: string, fileName: string, title: string = 'Report', orientation?: "landscape" | "l" | "p" | "portrait"): void {
    const doc = new jsPDF(orientation);
    var textCollection = document.getElementById('event-info')?.children;
    var finalY = (doc as any).lastAutoTable.finalY || 10;
    // doc.text("Overflow 'ellipsize' with one column with long content", 10, 10);
    var totalPagesExp = '{total_pages_count_string}';
    var base64Img = "data:image/jpeg;base64,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"
    
    doc.text(title, 14, finalY + 10);
    
    if (textCollection && textCollection.length >= 4) {
      autoTable(doc, {
        startY: finalY + 20,
        theme: 'plain',
        body: [
          ['Programme:', textCollection[0]?.textContent || 'N/A'],
          ['Course:', textCollection[1]?.textContent || 'N/A'],
          ['Service Provider:', textCollection[2]?.textContent || 'N/A'],
          ['Event Date: ', textCollection[3]?.textContent || 'N/A']
        ],
        tableWidth: 'wrap'
      });
    }

    // Clone table and remove action columns for PDF export
    const sourceTable = document.getElementById(tableId);
    if (!sourceTable) {
      console.error('Table element not found:', tableId);
      return;
    }
    
    const clonedTable = sourceTable.cloneNode(true) as HTMLElement;
    
    // Remove all mat-icon elements to prevent icon names from appearing in PDF
    const matIcons = clonedTable.querySelectorAll('mat-icon');
    matIcons.forEach(icon => icon.remove());
    
    // Remove all other icon elements
    const allIcons = clonedTable.querySelectorAll('[class*="icon"], i, .material-icons');
    allIcons.forEach(icon => icon.remove());
    
    // Find and remove action columns
    const headerCells = clonedTable.querySelectorAll('th');
    const actionColumnIndices: number[] = [];
    
    headerCells.forEach((cell, index) => {
      const cellText = cell.textContent?.toLowerCase() || '';
      if (cellText.includes('action')) {
        actionColumnIndices.push(index);
      }
    });
    
    // Remove action column headers
    actionColumnIndices.reverse().forEach(index => {
      const headers = clonedTable.querySelectorAll('th');
      if (headers[index]) {
        headers[index].remove();
      }
    });
    
    // Remove action column cells from all rows
    const rows = clonedTable.querySelectorAll('tr');
    rows.forEach(row => {
      const cells = row.querySelectorAll('td, th');
      actionColumnIndices.forEach(index => {
        if (cells[index]) {
          cells[index].remove();
        }
      });
    });
    
    // Temporarily add cloned table to DOM for jsPDF autoTable
    clonedTable.style.display = 'none';
    clonedTable.id = tableId + '_clone_for_pdf';
    document.body.appendChild(clonedTable);

    // finalY = (doc as any).lastAutoTable.finalY;
    autoTable(doc, {
      html: '#'+tableId + '_clone_for_pdf',
      theme: 'striped',
      showHead: 'everyPage',
      showFoot: 'everyPage',
      willDrawPage: function (data) {
        // Header
        // doc.setFontSize(18)
        // doc.setTextColor(40)
        if (base64Img) {
          doc.addImage(base64Img, 'JPEG', data.settings.margin.left + 255, 15, 15, 12)
        }
      },
      didDrawPage: function (data) {
        var str = 'Page ' + (doc.internal.pages.length - 1);

        if (typeof doc.putTotalPages === 'function') {
          str = str + ' of ' + totalPagesExp
        }
        doc.setFontSize(10);

        var pageSize = doc.internal.pageSize
        var pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
        doc.text(str, data.settings.margin.left, pageHeight - 10)
      },
      margin: {top: 30}
    });

    if (typeof doc.putTotalPages === 'function') {
      doc.putTotalPages(totalPagesExp)
    }
    
    // Remove the cloned table from DOM
    const clonedTableElement = document.getElementById(tableId + '_clone_for_pdf');
    if (clonedTableElement) {
      clonedTableElement.remove();
    }

    var out = doc.output();

    // TODO: set file name
    var url = "data:application/pdf;base64," + btoa(out);

    var iframe = "<iframe width='100%' height='100%' src='" + url +"'></iframe>";
    var x = window.open(undefined, '_blank');
    x?.document.open();
    x?.document.write(iframe);
    x?.document.close();
    // doc.save(fileName + '.pdf');
  }
}
