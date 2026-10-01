// Minimal, dependency-free PDF table writer.
//
// The Reports page previously downloaded CSV only. Pulling in a full PDF
// library to render a static table would add a large dependency for one screen,
// so this emits the smallest thing a conforming reader accepts: a Helvetica
// (base-14, never embedded) table across A4 landscape pages.
//
// Everything written into a content stream is forced to 7-bit ASCII, which is
// also what keeps `/Length` honest — the declared stream length is a byte
// count, and a JS string length would diverge as soon as a non-ASCII
// character (a currency symbol, a typographic dash) appeared in a cell.

const PAGE = { width: 841.89, height: 595.28 }; // A4 landscape, in points
const MARGIN = 28;
const ROW_HEIGHT = 16;
const HEADER_TOP = 52;

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

// Page furniture is filled with 0-1 colour components.
const fillRect = (r, g, b, x, y, width, height) =>
  `${r} ${g} ${b} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`;

const defaultWidthFor = (label, columnCount, available) => {
  const widths = {
    'Selected Product': 108,
    'Customer Name': 98,
    'NIC Number': 78,
    'Mobile Number': 76,
    'Paid Amount': 68,
    'Apply Date': 84,
    'Reference Number': 90,
    'Top Services': 120,
    'Tasks Handled': 56,
    Approved: 48,
    Confirmed: 50,
    Rejected: 46,
    Flagged: 40,
    Open: 36,
    'Completion Rate %': 62,
    'Avg Handle Hours': 60,
    'Last Activity': 80,
    Role: 44,
    Email: 104,
    Phone: 76,
    Name: 88,
    'Service Type': 96,
    'Application Status': 74,
    'Payment Status': 62,
  };
  if (widths[label] !== undefined) return widths[label];
  return Math.round(available / Math.max(columnCount, 1));
};

/**
 * @param {string} title        Report title shown in the header band.
 * @param {Array<[string, Function]>} columns Column labels and cell readers.
 * @param {Array<object>} rows  Row objects the readers are applied to.
 * @param {Array<string>} meta   Extra right-aligned header lines.
 * @returns {string} A complete PDF as a latin-1 safe string.
 */
export function buildTablePdf(title, columns, rows, meta = []) {
  const available = PAGE.width - MARGIN * 2;

  const layout = columns.map(([label]) => ({
    label,
    width: defaultWidthFor(label, columns.length, available),
  }));

  // Scale the whole table down if the requested widths overflow the page.
  const requested = layout.reduce((sum, col) => sum + col.width, 0);
  if (requested > available) {
    const scale = available / requested;
    layout.forEach(col => {
      col.width = Math.floor(col.width * scale);
    });
  }

  const contentTop = HEADER_TOP + 10;
  const rowsPerPage = Math.max(
    1,
    Math.floor((PAGE.height - contentTop - MARGIN - 18) / ROW_HEIGHT)
  );

  const pages = [];
  for (let start = 0; start < rows.length; start += rowsPerPage) {
    pages.push(rows.slice(start, start + rowsPerPage));
  }
  if (!pages.length) pages.push([]);

  const drawTable = (pageRows, pageIndex) => {
    const ops = [];
    const text = (x, y, value, size, font, rgb) =>
      ops.push(
        `BT /${font} ${size} Tf ${rgb} rg 1 0 0 1 ${x.toFixed(2)} ${(PAGE.height - y).toFixed(2)} Tm (${escapeText(value)}) Tj ET`
      );

    // Header band with the report title, range and summary lines.
    ops.push(fillRect(0.07, 0.17, 0.35, 0, PAGE.height - HEADER_TOP, PAGE.width, HEADER_TOP));
    text(MARGIN, 26, title, 15, 'F2', '1 1 1');
    meta.forEach((line, i) => {
      text(PAGE.width - MARGIN, 26 + i * 11, line, 8.5, 'F1', '0.85 0.9 0.97');
    });

    // Column headers.
    ops.push(fillRect(0.9, 0.93, 0.96, 0, PAGE.height - contentTop, PAGE.width, 14));
    let cursorX = MARGIN;
    layout.forEach(col => {
      text(cursorX + 4, contentTop - 3, col.label, 7.5, 'F2', '0.11 0.24 0.42');
      cursorX += col.width;
    });

    pageRows.forEach((row, rowIndex) => {
      const y = contentTop + rowIndex * ROW_HEIGHT;
      if (rowIndex % 2 === 1) {
        ops.push(fillRect(0.91, 0.945, 0.99, 0, PAGE.height - y, PAGE.width, ROW_HEIGHT));
      }
      let x = MARGIN;
      layout.forEach((col, colIndex) => {
        const [, read] = columns[colIndex];
        let value = read(row);
        // Truncate rather than let a long product name spill past its column.
        const maxChars = Math.max(4, Math.floor(col.width / 4.4));
        const textValue = String(value);
        if (textValue.length > maxChars) value = `${textValue.slice(0, maxChars - 1)}…`;
        text(x + 4, y, value, 7.5, 'F1', '0.2 0.24 0.3');
        x += col.width;
      });
    });

    // Footer with pagination and the total row count.
    const footer = `Page ${pageIndex + 1} of ${pages.length}  ·  Rows: ${rows.length}  ·  SLT Easy Apply`;
    text(MARGIN, PAGE.height - 14, footer, 7.5, 'F1', '0.45 0.5 0.6');

    return ops.join('\n');
  };

  const streams = pages.map((pageRows, i) => drawTable(pageRows, i));

  // Object layout: 1 = font, then a content stream + page object per page,
  // then the catalog and the page tree.
  const pageCount = streams.length;
  const fontId = 1;
  const contentIdFor = i => 2 + i;
  const pageIdFor = i => 2 + pageCount + i;
  const catalogId = 2 + pageCount * 2;
  const pagesId = 3 + pageCount * 2;

  const objects = [];
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  streams.forEach(stream => {
    // The stream is ASCII-only, so the string length is the byte length.
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  streams.forEach((_, i) => {
    objects.push(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width.toFixed(2)} ${PAGE.height.toFixed(2)}] ` +
      `/Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontId} 0 R >> >> /Contents ${contentIdFor(i)} 0 R >>`
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
  offsets.forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return pdf;
}

export default buildTablePdf;