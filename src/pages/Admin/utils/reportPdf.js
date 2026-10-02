// SLTMobitel EasyApply Publication-Grade Corporate PDF Generator
// Standard Office Report Layout with Executive User Performance Cards & Spacious Application Data Table.
// Eliminates header text collisions, removes redundant tables, and fixes all overlap bugs.

const PAGE = { width: 841.89, height: 595.28 }; // A4 landscape in points
const MARGIN = 32;
const HEADER_LINE_Y = 56;
const FOOTER_RESERVE = 42;

const escapeText = (value) =>
  String(value ?? '')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/ /g, ' ')
    .replace(/[^\x20-\x7E]/g, '')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

const formatDateTime = (value) => {
  if (!value) return 'No activity';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'No activity';
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Draw rectangle with solid fill
const fillRect = (r, g, b, x, y, width, height) =>
  `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`;

// Draw rectangle border line
const strokeRect = (r, g, b, strokeW, x, y, width, height) =>
  `${strokeW} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`;

/**
 * Text wrapper that splits text into multiple lines to fit colWidth without any truncation.
 */
const wrapText = (text, colWidth, fontSize = 9, fontType = 'F1') => {
  const str = String(text ?? '');
  if (!str) return [''];

  const charWidth = fontType === 'F2' ? (fontSize * 0.56) : (fontSize * 0.50);
  const maxCharsPerLine = Math.max(1, Math.floor((colWidth - 8) / charWidth));

  if (str.length <= maxCharsPerLine) return [str];

  const words = str.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    if (!currentLine) {
      currentLine = word;
    } else if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines.length ? lines : [str];
};

const defaultWidthFor = (label, columnCount, available) => {
  const widths = {
    'Selected Product': 110,
    'Customer Name': 110,
    'NIC Number': 80,
    'Mobile Number': 80,
    'Paid Amount': 62,
    'Apply Date': 72,
    'Reference Number': 95,
    'Top Services': 95,
    'Tasks Handled': 54,
    Approved: 52,
    Confirmed: 52,
    Rejected: 48,
    Flagged: 45,
    Open: 42,
    'Completion Rate %': 68,
    'Avg Handle Hours': 60,
    'Last Activity': 75,
    Role: 55,
    Email: 105,
    Phone: 78,
    Name: 95,
    'Service Type': 92,
    'Application Status': 72,
    'Payment Status': 60,
  };
  if (widths[label] !== undefined) return widths[label];
  return Math.round(available / Math.max(columnCount, 1));
};

const layoutColumns = (columns) => {
  const available = PAGE.width - MARGIN * 2;
  const layout = columns.map(([label]) => ({
    label,
    width: defaultWidthFor(label, columns.length, available),
  }));

  const requested = layout.reduce((sum, col) => sum + col.width, 0);
  if (requested > available) {
    const scale = available / requested;
    layout.forEach((col) => {
      col.width = Math.floor(col.width * scale);
    });
  }
  return layout;
};

/**
 * Builds an SLTMobitel publication-grade PDF document matching corporate standards.
 */
export function buildReportPdf({
  title = 'SLTMobitel EasyApply Portal',
  subtitle = 'Operations & Analytics Report',
  generatedDate,
  reportPeriod,
  executiveSummary,
  meta = [],
  sections = [],
}) {
  const usable = sections.filter((s) => s && s.columns && s.columns.length);

  const genDateStr = generatedDate || meta.find((m) => m.startsWith('Generated:'))?.replace('Generated:', '').trim() || new Date().toLocaleDateString('en-GB');
  const periodStr = reportPeriod || meta[0] || 'Operational Period';

  const preparedSections = usable.map((sec) => ({
    ...sec,
    layout: layoutColumns(sec.columns),
    rows: sec.rows || [],
  }));

  const pages = [];
  let currentPage = null;

  const startNewPage = (isFirst = false) => {
    currentPage = {
      isFirst,
      items: [],
    };
    pages.push(currentPage);
  };

  startNewPage(true);

  let currentTop = 168; // Starting top offset after Header & Exec Summary Card

  preparedSections.forEach((sec) => {
    const isUserSection = sec.title && sec.title.includes('User Progress');

    if (!sec.rows.length) {
      if (currentTop + 45 > PAGE.height - FOOTER_RESERVE) {
        startNewPage();
        currentTop = 74;
      }
      currentPage.items.push({ type: 'section_title', section: sec });
      if (!isUserSection) {
        currentPage.items.push({ type: 'table_header', section: sec });
      }
      currentPage.items.push({ type: 'empty_row', section: sec });
      currentTop += 50;
      return;
    }

    if (currentTop + 45 > PAGE.height - FOOTER_RESERVE) {
      startNewPage();
      currentTop = 74;
    }

    currentPage.items.push({ type: 'section_title', section: sec });
    currentTop += 22;

    if (isUserSection) {
      // For Section 1 (User Progress Summary), render User Performance Cards
      sec.rows.forEach((row) => {
        const cardTotalHeight = 118; // 102pt card + 16pt margin

        if (currentTop + cardTotalHeight > PAGE.height - FOOTER_RESERVE) {
          startNewPage();
          currentTop = 74;
          currentPage.items.push({ type: 'section_title', section: sec, continued: true });
          currentTop += 22;
        }

        currentPage.items.push({ type: 'user_card', section: sec, row });
        currentTop += cardTotalHeight;
      });
    } else {
      // For Section 2 (Data Table), calculate header row height dynamically
      let maxHeaderLines = 1;
      sec.layout.forEach((col) => {
        const lines = wrapText(col.label, col.width, 9.5, 'F2');
        if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
      });
      const headerHeight = Math.max(22, maxHeaderLines * 12 + 6);

      currentPage.items.push({ type: 'table_header', section: sec, headerHeight, maxHeaderLines });
      currentTop += headerHeight;

      sec.rows.forEach((row, rIdx) => {
        let maxCellLines = 1;
        sec.layout.forEach((col, colIdx) => {
          const [, read] = sec.columns[colIdx];
          const val = read(row);
          const lines = wrapText(val, col.width, 9, 'F1');
          if (lines.length > maxCellLines) maxCellLines = lines.length;
        });
        const rowHeight = Math.max(24, maxCellLines * 12 + 8);

        if (currentTop + rowHeight > PAGE.height - FOOTER_RESERVE) {
          startNewPage();
          currentTop = 74;
          currentPage.items.push({ type: 'section_title', section: sec, continued: true });
          currentPage.items.push({ type: 'table_header', section: sec, headerHeight, maxHeaderLines });
          currentTop += headerHeight;
        }

        currentPage.items.push({ type: 'row', section: sec, row, rowIndex: rIdx, rowHeight, maxCellLines });
        currentTop += rowHeight;
      });
    }

    currentTop += 16;
  });

  if (!pages.length) {
    startNewPage(true);
  }

  const drawPage = (page, pageIndex) => {
    const ops = [];

    // 1. Corporate Header
    // SLTMobitel Symbol (3 Diagonal Slashes)
    ops.push(`3 w 0.230 0.514 0.960 RG ${MARGIN} ${(PAGE.height - 38).toFixed(2)} m ${(MARGIN + 5)} ${(PAGE.height - 24).toFixed(2)} l S`);
    ops.push(`3 w 0.341 0.710 0.192 RG ${(MARGIN + 6)} ${(PAGE.height - 40).toFixed(2)} m ${(MARGIN + 11)} ${(PAGE.height - 22).toFixed(2)} l S`);
    ops.push(`3 w 0.059 0.341 0.659 RG ${(MARGIN + 12)} ${(PAGE.height - 42).toFixed(2)} m ${(MARGIN + 17)} ${(PAGE.height - 20).toFixed(2)} l S`);

    // Brand Text: SLT MOBITEL
    const logoTextX = MARGIN + 26;
    ops.push(`BT /F2 14 Tf 0.341 0.710 0.192 rg 1 0 0 1 ${logoTextX.toFixed(2)} ${(PAGE.height - 32).toFixed(2)} Tm (SLT) Tj ET`);
    ops.push(`BT /F2 14 Tf 0.059 0.341 0.659 rg 1 0 0 1 ${(logoTextX + 30).toFixed(2)} ${(PAGE.height - 32).toFixed(2)} Tm (MOBITEL) Tj ET`);
    ops.push(`BT /F1 8 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${logoTextX.toFixed(2)} ${(PAGE.height - 44).toFixed(2)} Tm (The Connection) Tj ET`);

    // Right-aligned Corporate Document Titles
    const mainTitle = title || 'SLTMobitel EasyApply Portal';
    const subTitle = subtitle || 'Operations & Analytics Report';

    const titleX = Math.max(MARGIN + 320, PAGE.width - MARGIN - (mainTitle.length * 7.0));
    const subX = Math.max(MARGIN + 320, PAGE.width - MARGIN - (subTitle.length * 4.8));

    ops.push(`BT /F2 13 Tf 0.059 0.090 0.165 rg 1 0 0 1 ${titleX.toFixed(2)} ${(PAGE.height - 31).toFixed(2)} Tm (${escapeText(mainTitle)}) Tj ET`);
    ops.push(`BT /F1 9.5 Tf 0.278 0.333 0.412 rg 1 0 0 1 ${subX.toFixed(2)} ${(PAGE.height - 44).toFixed(2)} Tm (${escapeText(subTitle)}) Tj ET`);

    // Vibrant Blue Accent Divider Line
    ops.push(fillRect(0.059, 0.341, 0.659, MARGIN, PAGE.height - HEADER_LINE_Y, PAGE.width - MARGIN * 2, 3));

    let top = 70;

    // 2. Page 1 Executive Summary Overview Card
    if (page.isFirst) {
      // Date & Period Labels
      ops.push(`BT /F2 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${MARGIN} ${(PAGE.height - top).toFixed(2)} Tm (Generated Date:) Tj ET`);
      ops.push(`BT /F1 9 Tf 0.278 0.333 0.412 rg 1 0 0 1 ${(MARGIN + 82)} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(genDateStr)}) Tj ET`);

      const periodX = MARGIN + 280;
      ops.push(`BT /F2 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${periodX} ${(PAGE.height - top).toFixed(2)} Tm (Report Period:) Tj ET`);
      ops.push(`BT /F1 9 Tf 0.278 0.333 0.412 rg 1 0 0 1 ${(periodX + 75)} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(periodStr)}) Tj ET`);

      top += 16;

      // Executive Summary Card Box
      const cardHeight = 66;
      ops.push(fillRect(0.972, 0.980, 0.992, MARGIN, PAGE.height - top - cardHeight, PAGE.width - MARGIN * 2, cardHeight));
      ops.push(strokeRect(0.800, 0.840, 0.880, 0.9, MARGIN, PAGE.height - top - cardHeight, PAGE.width - MARGIN * 2, cardHeight));

      ops.push(`BT /F2 10.5 Tf 0.059 0.090 0.165 rg 1 0 0 1 ${(MARGIN + 14)} ${(PAGE.height - top - 18).toFixed(2)} Tm (Executive Summary Overview) Tj ET`);

      const c1X = MARGIN + 14;
      const c2X = MARGIN + 260;
      const c3X = MARGIN + 520;

      const totalApps = executiveSummary?.totalApplications ?? 0;
      const totalUsers = executiveSummary?.totalUsers ?? 0;
      const totalTasks = executiveSummary?.totalTasks ?? 0;
      const totalCollected = executiveSummary?.totalCollected ?? 0;

      ops.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c1X} ${(PAGE.height - top - 36).toFixed(2)} Tm (Total Applications: ${totalApps}) Tj ET`);
      ops.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c1X} ${(PAGE.height - top - 52).toFixed(2)} Tm (Total Staff / Users: ${totalUsers}) Tj ET`);

      ops.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c2X} ${(PAGE.height - top - 36).toFixed(2)} Tm (Tasks Handled: ${totalTasks}) Tj ET`);
      if (totalCollected > 0) {
        ops.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c2X} ${(PAGE.height - top - 52).toFixed(2)} Tm (Total Collected: Rs. ${Number(totalCollected).toLocaleString('en-LK', { minimumFractionDigits: 2 })}) Tj ET`);
      }

      if (Array.isArray(executiveSummary?.statusBreakdown) && executiveSummary.statusBreakdown.length) {
        const statusSummary = executiveSummary.statusBreakdown.map((s) => `${s.status}: ${s.count}`).join('   ');
        ops.push(`BT /F1 8.5 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${c3X} ${(PAGE.height - top - 36).toFixed(2)} Tm (Status Summary:) Tj ET`);
        ops.push(`BT /F2 8.5 Tf 0.059 0.341 0.659 rg 1 0 0 1 ${c3X} ${(PAGE.height - top - 52).toFixed(2)} Tm (${escapeText(statusSummary.slice(0, 50))}) Tj ET`);
      }

      top += cardHeight + 16;
    } else {
      top = 72;
    }

    // 3. Render Items (User Cards or Table Rows)
    page.items.forEach((item) => {
      if (item.type === 'section_title') {
        const titleLabel = item.continued ? `${item.section.title} (continued)` : item.section.title;
        if (titleLabel) {
          ops.push(`BT /F2 11.5 Tf 0.059 0.090 0.165 rg 1 0 0 1 ${MARGIN} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(titleLabel)}) Tj ET`);
        }
        if (item.section.note) {
          const noteX = PAGE.width - MARGIN - (item.section.note.length * 4.8);
          ops.push(`BT /F1 9 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${noteX.toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(item.section.note)}) Tj ET`);
        }
        top += 22;
      } else if (item.type === 'user_card') {
        const row = item.row;
        const cardHeight = 102;
        const cardX = MARGIN;
        const cardWidth = PAGE.width - MARGIN * 2;

        // Outer Card Fill & Border
        ops.push(fillRect(0.972, 0.980, 0.992, cardX, PAGE.height - top - cardHeight, cardWidth, cardHeight));
        ops.push(strokeRect(0.800, 0.840, 0.880, 0.9, cardX, PAGE.height - top - cardHeight, cardWidth, cardHeight));

        // User Header Bar (Dark Corporate Navy #0f57a8)
        const headerHeight = 24;
        ops.push(fillRect(0.059, 0.341, 0.659, cardX, PAGE.height - top - headerHeight, cardWidth, headerHeight));

        // User Name, Role & Contact Info
        const userName = row.name || 'System User';
        const userRole = row.role || 'Staff';
        const userContact = [row.email, row.phone].filter(Boolean).join('   |   ') || 'No contact on file';

        ops.push(`BT /F2 10.5 Tf 1 1 1 rg 1 0 0 1 ${(cardX + 12).toFixed(2)} ${(PAGE.height - top - 16).toFixed(2)} Tm (${escapeText(userName)}) Tj ET`);

        // Role Badge
        ops.push(`BT /F2 8.5 Tf 0.220 0.740 0.970 rg 1 0 0 1 ${(cardX + 220).toFixed(2)} ${(PAGE.height - top - 15).toFixed(2)} Tm ([${escapeText(userRole)}]) Tj ET`);

        // Contact Info Right Aligned
        const contactX = Math.max(cardX + 350, PAGE.width - MARGIN - 12 - (userContact.length * 5.0));
        ops.push(`BT /F1 9 Tf 0.900 0.940 0.980 rg 1 0 0 1 ${contactX.toFixed(2)} ${(PAGE.height - top - 16).toFixed(2)} Tm (${escapeText(userContact)}) Tj ET`);

        // Card Sub-Grid Metrics
        const bodyTop = top + headerHeight + 14;
        const c1X = cardX + 12;
        const c2X = cardX + 410;

        // Column 1: Task Outcomes
        ops.push(`BT /F2 9.5 Tf 0.059 0.090 0.165 rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop).toFixed(2)} Tm (Task Summary Details) Tj ET`);
        ops.push(`BT /F1 8.5 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 16).toFixed(2)} Tm (Approved Tasks: ${row.approved || 0}       Confirmed Tasks: ${row.confirmed || 0}) Tj ET`);
        ops.push(`BT /F1 8.5 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 30).toFixed(2)} Tm (Rejected Tasks: ${row.rejected || 0}       Flagged Tasks: ${row.flagged || 0}       Open / Pending: ${row.open || 0}) Tj ET`);

        // Column 2: Performance & Activity
        ops.push(`BT /F2 9.5 Tf 0.059 0.090 0.165 rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop).toFixed(2)} Tm (Activity & Performance) Tj ET`);
        ops.push(`BT /F1 8.5 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop - 16).toFixed(2)} Tm (Completion Rate: ${row.completionRate || 0}%       Avg Handle Time: ${row.avgHandleHours != null ? `${row.avgHandleHours} hrs` : '-'}) Tj ET`);
        ops.push(`BT /F1 8.5 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop - 30).toFixed(2)} Tm (Last Actioned: ${row.lastActionedAt ? formatDateTime(row.lastActionedAt) : 'No activity'}) Tj ET`);

        // Services Handled Line
        const serviceStr = Array.isArray(row.services) && row.services.length
          ? row.services.map((s) => `${s.service} (${s.count})`).join(', ')
          : 'No specific services actioned in this period';

        ops.push(`BT /F2 8.5 Tf 0.059 0.341 0.659 rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 48).toFixed(2)} Tm (Services Handled:) Tj ET`);
        ops.push(`BT /F1 8.5 Tf 0.150 0.200 0.300 rg 1 0 0 1 ${(c1X + 95).toFixed(2)} ${(PAGE.height - bodyTop - 48).toFixed(2)} Tm (${escapeText(serviceStr.slice(0, 110))}) Tj ET`);

        top += cardHeight + 16;
      } else if (item.type === 'table_header') {
        const hHeight = item.headerHeight || 22;
        // Table Header Fill (Corporate SLT Blue #0f57a8)
        ops.push(fillRect(0.059, 0.341, 0.659, MARGIN, PAGE.height - top - hHeight, PAGE.width - MARGIN * 2, hHeight));

        let cursorX = MARGIN;
        item.section.layout.forEach((col) => {
          const lines = wrapText(col.label, col.width, 9.5, 'F2');
          lines.forEach((lineText, lineIdx) => {
            const lineY = top + 12 + (lineIdx * 12);
            ops.push(`BT /F2 9.5 Tf 1 1 1 rg 1 0 0 1 ${(cursorX + 6).toFixed(2)} ${(PAGE.height - lineY).toFixed(2)} Tm (${escapeText(lineText)}) Tj ET`);
          });
          cursorX += col.width;
        });
        top += hHeight;
      } else if (item.type === 'empty_row') {
        ops.push(`BT /F1 9 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${(MARGIN + 6).toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (No records found for selected filters.) Tj ET`);
        top += 20;
      } else if (item.type === 'row') {
        const rHeight = item.rowHeight || ROW_HEIGHT;

        // Alternating row background: Even rows soft gray/blue tint #f8fafc
        if (item.rowIndex % 2 === 1) {
          ops.push(fillRect(0.972, 0.980, 0.992, MARGIN, PAGE.height - top - rHeight, PAGE.width - MARGIN * 2, rHeight));
        }

        // Row bottom divider line
        ops.push(strokeRect(0.886, 0.910, 0.941, 0.5, MARGIN, PAGE.height - top - rHeight, PAGE.width - MARGIN * 2, 0.5));

        let cursorX = MARGIN;
        item.section.layout.forEach((col, colIdx) => {
          const [, read] = item.section.columns[colIdx];
          const rawVal = read(item.row);
          const lines = wrapText(rawVal, col.width, 9, 'F1');

          lines.forEach((lineText, lineIdx) => {
            const lineY = top + 14 + (lineIdx * 12);
            ops.push(`BT /F1 9 Tf 0.118 0.161 0.231 rg 1 0 0 1 ${(cursorX + 6).toFixed(2)} ${(PAGE.height - lineY).toFixed(2)} Tm (${escapeText(lineText)}) Tj ET`);
          });

          cursorX += col.width;
        });
        top += rHeight;
      }
    });

    // 4. Official SLTMobitel Footer
    const footerY1 = 26;
    const footerY2 = 14;

    ops.push(`BT /F1 8.5 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${MARGIN} ${footerY1} Tm (Generated by SLTMobitel EasyApply Portal) Tj ET`);
    ops.push(`BT /F1 8.5 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${MARGIN} ${footerY2} Tm (Confidential - Internal Use Only) Tj ET`);

    const pageStr = `Page ${pageIndex + 1} of ${pages.length}`;
    const pageX = PAGE.width - MARGIN - (pageStr.length * 5.0);
    ops.push(`BT /F1 8.5 Tf 0.392 0.455 0.549 rg 1 0 0 1 ${pageX.toFixed(2)} ${footerY1} Tm (${escapeText(pageStr)}) Tj ET`);

    return ops.join('\n');
  };

  const streams = pages.map(drawPage);

  const pageCount = streams.length;
  const fontRegularId = 1;
  const fontBoldId = 2;
  const contentIdFor = (i) => 3 + i;
  const pageIdFor = (i) => 3 + pageCount + i;
  const catalogId = 3 + pageCount * 2;
  const pagesId = 4 + pageCount * 2;

  const objects = [];
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  streams.forEach((stream) => {
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  streams.forEach((_, i) => {
    objects.push(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width.toFixed(2)} ${PAGE.height.toFixed(2)}] ` +
        `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentIdFor(i)} 0 R >>`
    );
  });

  objects.push(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  objects.push(
    `<< /Type /Pages /Kids [${streams.map((_, i) => `${pageIdFor(i)} 0 R`).join(' ')}] /Count ${pageCount} >>`
  );

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export function buildTablePdf(title, columns, rows, meta = []) {
  return buildReportPdf({
    title,
    meta,
    sections: [{ title: '', note: '', columns, rows: rows || [] }],
  });
}

export default buildReportPdf;