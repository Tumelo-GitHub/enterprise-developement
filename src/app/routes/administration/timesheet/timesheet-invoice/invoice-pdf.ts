import jsPDF from 'jspdf';
import autoTable, { CellInput, RowInput } from 'jspdf-autotable';
import * as moment from 'moment';
import { ITimesheet } from 'src/app/shared';

/** A captured disbursement as returned with the timesheet. */
export interface IDisbursementItem {
  item_name: string;
  units: number | string;
  price_per_unit: number | string;
  date?: string;
}

export interface InvoiceLine {
  company: string;
  hours: number;
  amount: number;
}

export interface InvoiceGroup {
  workType: string;
  lines: InvoiceLine[];
  hours: number;
  amount: number;
}

export interface InvoiceDisbursement {
  date: string | null;
  item: string;
  units: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  project: string;
  employee: string;
  periodStart: string;
  periodEnd: string;
  issued: Date;
  rate: number;
  groups: InvoiceGroup[];
  includeDisbursements: boolean;
  disbursements: InvoiceDisbursement[];
  totalHours: number;
  timeAmount: number;
  disbursementAmount: number;
  total: number;
}

export interface InvoiceInput {
  entries: ITimesheet[];
  disbursements: IDisbursementItem[];
  projectId: number | string;
  rate: number;
  includeDisbursements: boolean;
  employee: string;
  periodStart: string;
  periodEnd: string;
}

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
const num = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/**
 * Works out the invoice figures. Hours are rounded to 2 decimals per line before pricing,
 * so every amount on the invoice equals the hours shown times the rate, and totals add up.
 */
export function buildInvoice(input: InvoiceInput): Invoice {
  const entries = input.entries.filter(e => String(e.project_id) === String(input.projectId));
  const rate = round2(num(input.rate));

  // work type -> company -> hours
  const byType = new Map<string, Map<string, number>>();
  for (const e of entries) {
    const hours = moment.duration(e.duration).asHours();
    const type = (e.work_type || 'Other').trim() || 'Other';
    const company = (e.company_name || 'Unknown company').trim();
    const companies = byType.get(type) ?? new Map<string, number>();
    companies.set(company, (companies.get(company) ?? 0) + (Number.isFinite(hours) ? hours : 0));
    byType.set(type, companies);
  }

  const byName = (a: string, b: string) => a.localeCompare(b, undefined, { sensitivity: 'base' });
  const groups: InvoiceGroup[] = [...byType.keys()].sort(byName).map(workType => {
    const companies = byType.get(workType)!;
    const lines = [...companies.keys()].sort(byName).map(company => {
      const hours = round2(companies.get(company)!);
      return { company, hours, amount: round2(hours * rate) };
    });
    return {
      workType,
      lines,
      hours: round2(lines.reduce((s, l) => s + l.hours, 0)),
      amount: round2(lines.reduce((s, l) => s + l.amount, 0)),
    };
  });

  const disbursements: InvoiceDisbursement[] = input.includeDisbursements
    ? input.disbursements
        .map(d => {
          const units = num(d.units);
          const unitPrice = round2(num(d.price_per_unit));
          return { date: d.date || null, item: d.item_name || 'Item', units, unitPrice, amount: round2(units * unitPrice) };
        })
        .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    : [];

  const totalHours = round2(groups.reduce((s, g) => s + g.hours, 0));
  const timeAmount = round2(groups.reduce((s, g) => s + g.amount, 0));
  const disbursementAmount = round2(disbursements.reduce((s, d) => s + d.amount, 0));

  return {
    project: entries[0]?.project_name ?? '',
    employee: input.employee,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    issued: new Date(),
    rate,
    groups,
    includeDisbursements: input.includeDisbursements,
    disbursements,
    totalHours,
    timeAmount,
    disbursementAmount,
    total: round2(timeAmount + disbursementAmount),
  };
}

export function money(n: number): string {
  return 'R ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function hours(n: number): string {
  return n.toFixed(2);
}

export function displayDate(d: string | Date | null | undefined): string {
  if (!d) return '';
  const m = moment(d);
  return m.isValid() ? m.format('D MMM YYYY') : String(d);
}

export function invoiceFileName(inv: Invoice): string {
  const slug = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'invoice';
  const start = moment(inv.periodStart).isValid() ? moment(inv.periodStart).format('YYYY-MM-DD') : '';
  const end = moment(inv.periodEnd).isValid() ? moment(inv.periodEnd).format('YYYY-MM-DD') : '';
  return ['Invoice', slug(inv.project), slug(inv.employee), start, end].filter(Boolean).join('_') + '.pdf';
}

// ---------------------------------------------------------------------------------------------
// PDF layout (A4, millimetres)
// ---------------------------------------------------------------------------------------------

type RGB = [number, number, number];

const C: { [K in 'accent' | 'accentDark' | 'ink' | 'text' | 'muted' | 'border' | 'tint' | 'headFill' | 'white']: RGB } = {
  accent: [102, 126, 234],     // app accent #667eea
  accentDark: [76, 81, 191],
  ink: [31, 41, 55],
  text: [55, 65, 81],
  muted: [107, 114, 128],
  border: [229, 231, 235],
  tint: [238, 242, 255],
  headFill: [243, 244, 246],
  white: [255, 255, 255],
};

const M = 16;            // page margin
const FOOTER_SPACE = 22; // kept free at the bottom of each page for the footer

export function renderInvoicePdf(inv: Invoice): jsPDF {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const contentW = W - 2 * M;

  const font = (size: number, style: 'normal' | 'bold', color: RGB) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const label = (text: string, x: number, y: number, align: 'left' | 'right' = 'left') => {
    font(7.5, 'bold', C.muted);
    doc.text(text.toUpperCase(), x, y, { align, charSpace: 0.3 });
  };
  /** Starts a new page when fewer than `needed` mm are left above the footer. */
  const ensureSpace = (y: number, needed: number) => {
    if (y + needed <= H - FOOTER_SPACE) return y;
    doc.addPage();
    return 20;
  };
  const lastY = () => (doc as any).lastAutoTable.finalY as number;

  // ----- Header -----
  doc.setFillColor(...C.accent);
  doc.rect(0, 0, W, 3, 'F');

  font(26, 'bold', C.ink);
  doc.text('INVOICE', M, 22);
  font(9.5, 'normal', C.muted);
  doc.text('Professional services: time and disbursements', M, 28.5);

  const period = `${displayDate(inv.periodStart)} – ${displayDate(inv.periodEnd)}`;
  const meta: [string, string][] = [
    ['Invoice date', displayDate(inv.issued)],
    ['Billing period', period],
    ['Hourly rate', money(inv.rate)],
  ];
  meta.forEach(([k, v], i) => {
    const y = 15 + i * 6;
    font(8.5, 'normal', C.muted);
    doc.text(k, W - M - 82, y);
    font(9.5, 'bold', C.ink);
    doc.text(v, W - M, y, { align: 'right' });
  });

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, 36, W - M, 36);

  // ----- Parties -----
  let y = 45;
  const colW = contentW / 2;
  const parties: [string, string][] = [['Consultant', inv.employee || '-'], ['Project', inv.project || '-']];
  let partiesBottom = y;
  parties.forEach(([k, v], i) => {
    const x = M + i * colW;
    label(k, x, y);
    font(12, 'bold', C.ink);
    const lines = doc.splitTextToSize(v, colW - 8);
    doc.text(lines, x, y + 6.5);
    partiesBottom = Math.max(partiesBottom, y + 6.5 + (lines.length - 1) * 5.2);
  });

  // ----- Summary band -----
  y = partiesBottom + 9;
  const bandH = 20;
  const cellW = contentW / 4;
  doc.setFillColor(...C.tint);
  doc.roundedRect(M, y, contentW, bandH, 2.5, 2.5, 'F');
  doc.setFillColor(...C.accent);
  doc.roundedRect(M + 3 * cellW, y, cellW, bandH, 2.5, 2.5, 'F');

  const summary: [string, string][] = [
    ['Total hours', hours(inv.totalHours)],
    ['Time', money(inv.timeAmount)],
    ['Disbursements', inv.includeDisbursements ? money(inv.disbursementAmount) : 'Not included'],
    ['Amount due', money(inv.total)],
  ];
  summary.forEach(([k, v], i) => {
    const x = M + i * cellW + 5;
    const onAccent = i === 3;
    font(7.5, 'bold', onAccent ? C.white : C.muted);
    doc.text(k.toUpperCase(), x, y + 7.5, { charSpace: 0.3 });
    font(v === 'Not included' ? 10 : 13, 'bold', onAccent ? C.white : C.ink);
    doc.text(v, x, y + 15);
  });

  // ----- Shared table look -----
  const tableBase = {
    theme: 'plain' as const,
    margin: { left: M, right: M, top: 20, bottom: FOOTER_SPACE },
    styles: {
      font: 'helvetica',
      fontSize: 9.5,
      textColor: C.text,
      cellPadding: { top: 2.6, bottom: 2.6, left: 3, right: 3 },
      lineColor: C.border,
      lineWidth: { bottom: 0.2 },
    },
    headStyles: { fillColor: C.headFill, textColor: C.muted, fontStyle: 'bold' as const, fontSize: 8, lineWidth: 0 },
    footStyles: { fillColor: false as const, textColor: C.ink, fontStyle: 'bold' as const, fontSize: 10, lineWidth: 0 },
    showFoot: 'lastPage' as const,
    // One continuous rule above the totals row (per-cell borders leave gaps between columns)
    didDrawCell: (data: any) => {
      if (data.section === 'foot' && data.column.index === 0) {
        doc.setDrawColor(...C.ink);
        doc.setLineWidth(0.4);
        doc.line(M, data.cell.y, W - M, data.cell.y);
      }
    },
  };
  const sectionTitle = (title: string, subtitle: string, at: number) => {
    font(12, 'bold', C.ink);
    doc.text(title, M, at);
    font(8.5, 'normal', C.muted);
    doc.text(subtitle, W - M, at, { align: 'right' });
  };
  const rightFrom = (first: number) => (data: any) => {
    if (data.column.index >= first) data.cell.styles.halign = 'right';
  };

  // ----- Time -----
  y = ensureSpace(y + bandH + 14, 30);
  sectionTitle('Time', 'Hours by work type and company', y);

  const timeBody: RowInput[] = [];
  const showSubtotals = inv.groups.length > 1;
  for (const g of inv.groups) {
    timeBody.push([{
      content: g.workType,
      colSpan: 4,
      styles: { fontStyle: 'bold', fontSize: 9, textColor: C.accentDark, fillColor: C.tint, lineWidth: 0 },
    } as CellInput]);
    for (const l of g.lines) {
      timeBody.push([l.company, hours(l.hours), money(inv.rate), money(l.amount)]);
    }
    if (showSubtotals) {
      const bold = { fontStyle: 'bold' as const, textColor: C.ink };
      timeBody.push([
        { content: `Subtotal: ${g.workType}`, styles: { ...bold, fontSize: 9 } },
        { content: hours(g.hours), styles: bold },
        '',
        { content: money(g.amount), styles: bold },
      ]);
    }
  }

  autoTable(doc, {
    ...tableBase,
    startY: y + 4,
    head: [['Company', 'Hours', 'Rate', 'Amount']],
    body: timeBody,
    foot: [['Total time', hours(inv.totalHours), '', money(inv.timeAmount)]],
    columnStyles: { 1: { cellWidth: 24 }, 2: { cellWidth: 30 }, 3: { cellWidth: 34 } },
    didParseCell: rightFrom(1),
  });

  // ----- Disbursements -----
  if (inv.includeDisbursements) {
    y = ensureSpace(lastY() + 14, 30);
    sectionTitle('Disbursements', 'Expenses claimed for the period', y);

    if (inv.disbursements.length) {
      autoTable(doc, {
        ...tableBase,
        startY: y + 4,
        head: [['Date', 'Item', 'Units', 'Unit price', 'Amount']],
        body: inv.disbursements.map(d => [
          displayDate(d.date), d.item, String(d.units), money(d.unitPrice), money(d.amount),
        ]),
        foot: [['', 'Total disbursements', '', '', money(inv.disbursementAmount)]],
        columnStyles: { 0: { cellWidth: 28 }, 2: { cellWidth: 18 }, 3: { cellWidth: 30 }, 4: { cellWidth: 34 } },
        didParseCell: rightFrom(2),
      });
      y = lastY();
    } else {
      font(9.5, 'normal', C.muted);
      doc.text('No disbursements were captured for this period.', M, y + 10);
      y += 12;
    }
  } else {
    y = lastY();
  }

  // ----- Totals -----
  y = ensureSpace(y + 12, 40);
  const boxW = 92;
  const boxX = W - M - boxW;
  const totalRow = (k: string, v: string) => {
    font(9.5, 'normal', C.text);
    doc.text(k, boxX, y);
    font(9.5, 'bold', C.ink);
    doc.text(v, W - M, y, { align: 'right' });
    y += 7;
  };
  totalRow(`Time (${hours(inv.totalHours)} h × ${money(inv.rate)})`, money(inv.timeAmount));
  if (inv.includeDisbursements) totalRow('Disbursements', money(inv.disbursementAmount));

  doc.setFillColor(...C.accent);
  doc.roundedRect(boxX - 4, y - 3, boxW + 4, 13, 2, 2, 'F');
  font(10.5, 'bold', C.white);
  doc.text('Amount due', boxX, y + 5.2);
  font(13, 'bold', C.white);
  doc.text(money(inv.total), W - M - 3, y + 5.4, { align: 'right' });

  // ----- Footer on every page -----
  const pages = doc.getNumberOfPages();
  const generated = `Generated by DevWizard on ${moment(inv.issued).format('D MMM YYYY, HH:mm')}`;
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, H - 14, W - M, H - 14);
    font(8, 'normal', C.muted);
    doc.text(generated, M, H - 9);
    doc.text(`Page ${p} of ${pages}`, W - M, H - 9, { align: 'right' });
  }

  return doc;
}
