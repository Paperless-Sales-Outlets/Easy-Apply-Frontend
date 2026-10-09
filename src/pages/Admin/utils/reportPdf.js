// SLTMobitel EasyApply Publication-Grade Corporate PDF Generator
// Standard Office Report Layout with Executive User Performance Cards & Spacious Application Data Table.
// Eliminates header text collisions, removes redundant tables, and fixes all overlap bugs.

import { SLT_LOGO_WIDTH, SLT_LOGO_HEIGHT, SLT_LOGO_HEX } from './sltLogoImage';

const PAGE = { width: 841.89, height: 595.28 }; // A4 landscape in points
const MARGIN = 32;
const CONTENT_W = PAGE.width - MARGIN * 2;
const FOOTER_RESERVE = 44;

// Corporate masthead: one full-bleed tinted band that carries the whole
// document header - SLT logo, divider, title stack, and the report meta as
// labelled cells flush to the right margin - closed by a bold accent rule.
// The same band repeats on every page so a multi-page report reads as one
// document with a consistent document-control header.
const BAND_H = 66;
const ACCENT_H = 3;
const CONTENT_TOP = BAND_H + ACCENT_H + 14; // 83

// In-band header geometry (offsets are measured down from the page top).
const TITLE_BASELINE = 30; // document title
const SUB_BASELINE = 46; // document subtitle
const META_LABEL_BASELINE = 26; // small caps meta label
const META_VALUE_BASELINE = 42; // meta value
const META_CELL_GAP = 28; // gap between the two meta cells
const META_DIVIDER_PAD = 17; // vertical hairline half-extent from band centre

// Meta labels (upper case, brand coloured) shown above their values.
const META_DATE_LABEL = 'GENERATED DATE';
const META_PERIOD_LABEL = 'REPORT PERIOD';

// Brand palette (0-1 RGB) - blue and green sampled directly from slt-logo.png
// so every accent in the document matches the SLT/Mobitel identity.
const NAVY = [0.059, 0.090, 0.165]; // #0f172a - text / values
const SLT_BLUE = [0.000, 0.329, 0.659]; // #0054a8 - SLT corporate blue
const SLT_GREEN = [0.329, 0.706, 0.282]; // #54b448 - Mobitel green
const SLATE = [0.278, 0.333, 0.412];
const MUTED = [0.392, 0.455, 0.549];
const LINE = [0.855, 0.890, 0.930];
const BAND_BG = [0.960, 0.972, 0.988];
const CARD_BG = [0.972, 0.980, 0.992];
const ZEBRA_BG = [0.961, 0.973, 0.988];

// Status colours: SLT green/blue for the happy path, semantic hues otherwise.
const STATUS_COLORS = {
  approved: SLT_GREEN,
  confirmed: SLT_BLUE,
  rejected: [0.827, 0.192, 0.243],
  flagged: [0.760, 0.467, 0.024],
  open: [0.278, 0.333, 0.412],
};

// Executive summary panel geometry - the layout pass and drawPage both read
// these so page 1 pagination can never drift from what is actually drawn.
const KPI_HEAD_H = 18; // blue header strip
const KPI_ROW_H = 54; // four KPI cells
const KPI_STATUS_H = 26; // status breakdown row (only when data exists)
const KPI_GAP = 14; // space under the panel before the first section

// The real SLT Mobitel logo, sized to sit clearly inside the masthead band
// without crowding the accent rule or the document titles.
const LOGO_H = 36;
const LOGO_W = (SLT_LOGO_WIDTH / SLT_LOGO_HEIGHT) * LOGO_H;
const LOGO_X = MARGIN;
const LOGO_Y = PAGE.height - BAND_H / 2 - LOGO_H / 2;

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

// Helvetica glyph widths in 1/1000 em, indexed from ASCII 32..126.
// Used to measure text exactly so right-aligned labels land on the true margin
// instead of drifting with character-count estimates.
const HELV_REG_W = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HELV_BOLD_W = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

const textWidth = (value, size, bold = false) => {
  const table = bold ? HELV_BOLD_W : HELV_REG_W;
  let units = 0;
  for (const ch of String(value ?? '')) {
    const code = ch.charCodeAt(0);
    units += code >= 32 && code <= 126 ? table[code - 32] : size * 0.6;
  }
  return (units / 1000) * size;
};

const formatRole = (role) => {
  if (!role) return 'Staff';
  const r = String(role).trim();
  if (r === 'admin' || r === 'Admin') return 'Administrator';
  if (r === 'manage' || r === 'Manage' || r === 'manager' || r === 'Manager') return 'Manager';
  if (r === 'superadmin' || r === 'Superadmin' || r === 'super_admin') return 'Super Administrator';
  if (r === 'staff' || r === 'Staff') return 'Staff';
  // Clean up brackets if any
  return r.replace(/^\[|\]$/g, '').replace(/\[.*?\]/g, '').trim();
};

// Draw rectangle with solid fill
const fillRect = (r, g, b, x, y, width, height) =>
  `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`;

// Draw rectangle border line
const strokeRect = (r, g, b, strokeW, x, y, width, height) =>
  `${strokeW} w ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} RG ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`;

// Draw a filled rectangle with its own border (card / chip chrome).
// Returns an array of ops: callers push with spread, so a joined string here
// would be spread character-by-character and shred the content stream.
const boxedRect = (fill, border, strokeW, x, y, width, height) => [
  fillRect(fill[0], fill[1], fill[2], x, y, width, height),
  strokeRect(border[0], border[1], border[2], strokeW, x, y, width, height),
];

// Filled circle (status dots) built from four cubic Bezier arcs.
const fillCircle = (r, g, b, cx, cy, radius) => {
  const k = 0.5523 * radius;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ` +
    `${(cx - radius).toFixed(2)} ${cy.toFixed(2)} m ` +
    `${(cx - radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx - k).toFixed(2)} ${(cy - radius).toFixed(2)} ${cx.toFixed(2)} ${(cy - radius).toFixed(2)} c ` +
    `${(cx + k).toFixed(2)} ${(cy - radius).toFixed(2)} ${(cx + radius).toFixed(2)} ${(cy - k).toFixed(2)} ${(cx + radius).toFixed(2)} ${cy.toFixed(2)} c ` +
    `${(cx + radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx + k).toFixed(2)} ${(cy + radius).toFixed(2)} ${cx.toFixed(2)} ${(cy + radius).toFixed(2)} c ` +
    `${(cx - k).toFixed(2)} ${(cy + radius).toFixed(2)} ${(cx - radius).toFixed(2)} ${(cy + k).toFixed(2)} ${(cx - radius).toFixed(2)} ${cy.toFixed(2)} c f`;
};

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

  // Page 1 carries the masthead plus the executive summary panel, so its
  // content starts lower. Continuation pages only need the masthead.
  // The panel height is derived from the same constants drawPage uses, so the
  // two never drift apart when the status breakdown is missing.
  const hasStatusBreakdown = Array.isArray(executiveSummary?.statusBreakdown) && executiveSummary.statusBreakdown.length > 0;
  const KPI_BLOCK_H = KPI_HEAD_H + KPI_ROW_H + (hasStatusBreakdown ? KPI_STATUS_H : 0) + KPI_GAP;
  const PAGE_1_CONTENT_TOP = CONTENT_TOP + 6 + KPI_BLOCK_H;
  const CONT_CONTENT_TOP = CONTENT_TOP + 6;

  let currentTop = PAGE_1_CONTENT_TOP;

  // Each branch below advances currentTop by exactly the same amount drawPage
  // advances top when rendering the same items. Any drift here lets rows pass
  // the pagination guard and then render underneath the footer band.
  const TITLE_H = 22; // section_title -> drawPage does top += 22
  const EMPTY_ROW_H = 20; // empty_row -> drawPage does top += 20

  preparedSections.forEach((sec) => {
    const isUserSection = sec.title && sec.title.includes('User Progress');

    let maxHeaderLines = 1;
    sec.layout.forEach((col) => {
      const lines = wrapText(col.label, col.width, 9.5, 'F2');
      if (lines.length > maxHeaderLines) maxHeaderLines = lines.length;
    });
    const headerHeight = Math.max(22, maxHeaderLines * 12 + 6);

    // drawPage spends TITLE_H + headerHeight (tables only) + EMPTY_ROW_H here.
    const emptySectionHeight = TITLE_H + (isUserSection ? 0 : headerHeight) + EMPTY_ROW_H;

    if (!sec.rows.length) {
      if (currentTop + emptySectionHeight > PAGE.height - FOOTER_RESERVE) {
        startNewPage();
        currentTop = CONT_CONTENT_TOP;
      }
      currentPage.items.push({ type: 'section_title', section: sec });
      if (!isUserSection) {
        currentPage.items.push({ type: 'table_header', section: sec, headerHeight, maxHeaderLines });
      }
      currentPage.items.push({ type: 'empty_row', section: sec });
      currentTop += emptySectionHeight;
      return;
    }

    const sectionEntryHeight = TITLE_H + (isUserSection ? 0 : headerHeight);

    if (currentTop + sectionEntryHeight > PAGE.height - FOOTER_RESERVE) {
      startNewPage();
      currentTop = CONT_CONTENT_TOP;
    }

    currentPage.items.push({ type: 'section_title', section: sec });
    currentTop += TITLE_H;

    if (isUserSection) {
      // For Section 1 (User Progress Summary), render User Performance Cards
      sec.rows.forEach((row) => {
        const cardTotalHeight = 118; // 102pt card + 16pt margin

        if (currentTop + cardTotalHeight > PAGE.height - FOOTER_RESERVE) {
          startNewPage();
          currentTop = CONT_CONTENT_TOP;
          currentPage.items.push({ type: 'section_title', section: sec, continued: true });
          currentTop += TITLE_H;
        }

        currentPage.items.push({ type: 'user_card', section: sec, row });
        currentTop += cardTotalHeight;
      });
    } else {
      // For Section 2 (Data Table), the header height was derived above.
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
          currentTop = CONT_CONTENT_TOP;
          currentPage.items.push({ type: 'section_title', section: sec, continued: true });
          currentTop += TITLE_H;
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
    const rightX = PAGE.width - MARGIN;

    // 1. Corporate masthead - light full-bleed band with the real SLT logo and
    // a vertical divider on the left, the title stack beside it, and the
    // document meta rendered as two labelled cells flush to the right margin.
    // A bold accent rule closes the band.
    ops.push(fillRect(BAND_BG[0], BAND_BG[1], BAND_BG[2], 0, PAGE.height - BAND_H, PAGE.width, BAND_H));
    ops.push(`q ${LOGO_W.toFixed(2)} 0 0 ${LOGO_H.toFixed(2)} ${LOGO_X.toFixed(2)} ${LOGO_Y.toFixed(2)} cm /I1 Do Q`);

    const mainTitle = title || 'SLTMobitel EasyApply Portal';
    const subTitle = subtitle || 'Operations & Analytics Report';

    const bandCenterY = PAGE.height - BAND_H / 2;

    // Hairline separating the logo lockup from the document titles.
    const logoDividerX = LOGO_X + LOGO_W + 13;
    ops.push(fillRect(LINE[0], LINE[1], LINE[2], logoDividerX, bandCenterY - META_DIVIDER_PAD, 0.7, META_DIVIDER_PAD * 2));

    // Right-hand meta cells: small caps label above its value, each cell
    // right-aligned to its own edge so the report period sits in the corner.
    const metaLabelSize = 7;
    const metaValueSize = 9.5;

    const periodValueW = textWidth(periodStr, metaValueSize, true);
    const periodCellW = Math.max(periodValueW, textWidth(META_PERIOD_LABEL, metaLabelSize, true));
    const periodRightX = rightX;

    const dateValueW = textWidth(genDateStr, metaValueSize, true);
    const dateCellW = Math.max(dateValueW, textWidth(META_DATE_LABEL, metaLabelSize, true));
    const dateRightX = rightX - periodCellW - META_CELL_GAP;

    ops.push(fillRect(LINE[0], LINE[1], LINE[2], dateRightX + META_CELL_GAP / 2, bandCenterY - META_DIVIDER_PAD, 0.7, META_DIVIDER_PAD * 2));

    ops.push(`BT /F2 ${metaLabelSize} Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(dateRightX - dateCellW).toFixed(2)} ${(PAGE.height - META_LABEL_BASELINE).toFixed(2)} Tm (${escapeText(META_DATE_LABEL)}) Tj ET`);
    ops.push(`BT /F2 ${metaValueSize} Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${(dateRightX - dateValueW).toFixed(2)} ${(PAGE.height - META_VALUE_BASELINE).toFixed(2)} Tm (${escapeText(genDateStr)}) Tj ET`);

    ops.push(`BT /F2 ${metaLabelSize} Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(periodRightX - periodCellW).toFixed(2)} ${(PAGE.height - META_LABEL_BASELINE).toFixed(2)} Tm (${escapeText(META_PERIOD_LABEL)}) Tj ET`);
    ops.push(`BT /F2 ${metaValueSize} Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${(periodRightX - periodValueW).toFixed(2)} ${(PAGE.height - META_VALUE_BASELINE).toFixed(2)} Tm (${escapeText(periodStr)}) Tj ET`);

    // Title stack, left aligned beside the logo. Sizes step down only if a
    // long title would otherwise run into the meta cells.
    const titleStartX = logoDividerX + 14;
    const titleMaxW = dateRightX - dateCellW - titleStartX - 24;
    let titleSize = 16;
    while (titleSize > 11 && textWidth(mainTitle, titleSize, true) > titleMaxW) titleSize -= 0.5;
    let subSize = 9.5;
    while (subSize > 7.5 && textWidth(subTitle, subSize, false) > titleMaxW) subSize -= 0.5;

    ops.push(`BT /F2 ${titleSize} Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${titleStartX.toFixed(2)} ${(PAGE.height - TITLE_BASELINE).toFixed(2)} Tm (${escapeText(mainTitle)}) Tj ET`);
    ops.push(`BT /F1 ${subSize} Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${titleStartX.toFixed(2)} ${(PAGE.height - SUB_BASELINE).toFixed(2)} Tm (${escapeText(subTitle)}) Tj ET`);

    ops.push(fillRect(SLT_BLUE[0], SLT_BLUE[1], SLT_BLUE[2], 0, PAGE.height - BAND_H - ACCENT_H, PAGE.width, ACCENT_H));

    let top = CONTENT_TOP + 6;

    // 3. Executive summary - one SLT-branded panel: blue header strip, four
    // divided KPI cells, and the status breakdown as a footer row in the card.
    if (page.isFirst) {
      const kpis = [
        { label: 'TOTAL APPLICATIONS', value: Number(executiveSummary?.totalApplications ?? 0).toLocaleString('en-LK') },
        { label: 'TOTAL STAFF / USERS', value: Number(executiveSummary?.totalUsers ?? 0).toLocaleString('en-LK') },
        { label: 'TASKS HANDLED', value: Number(executiveSummary?.totalTasks ?? 0).toLocaleString('en-LK') },
        {
          label: 'TOTAL COLLECTED',
          value: `Rs. ${Number(executiveSummary?.totalCollected ?? 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`,
        },
      ];

      const cardH = KPI_HEAD_H + KPI_ROW_H + (hasStatusBreakdown ? KPI_STATUS_H : 0);
      const cardY = PAGE.height - top - cardH;

      ops.push(...boxedRect([1, 1, 1], LINE, 0.9, MARGIN, cardY, CONTENT_W, cardH));

      // Header strip in the SLT brand blue
      ops.push(fillRect(SLT_BLUE[0], SLT_BLUE[1], SLT_BLUE[2], MARGIN, cardY + cardH - KPI_HEAD_H, CONTENT_W, KPI_HEAD_H));
      ops.push(`BT /F2 8.5 Tf 1 1 1 rg 1 0 0 1 ${(MARGIN + 16).toFixed(2)} ${(cardY + cardH - 12.5).toFixed(2)} Tm (EXECUTIVE SUMMARY) Tj ET`);

      // KPI cells: label above value, separated by hairlines
      const cellW = CONTENT_W / kpis.length;
      const cellY = PAGE.height - (top + KPI_HEAD_H) - KPI_ROW_H;
      kpis.forEach((kpi, i) => {
        const cellX = MARGIN + i * cellW;
        if (i > 0) ops.push(fillRect(LINE[0], LINE[1], LINE[2], cellX, cellY, 0.7, KPI_ROW_H));
        ops.push(`BT /F2 7.5 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(cellX + 16).toFixed(2)} ${(cellY + KPI_ROW_H - 16).toFixed(2)} Tm (${escapeText(kpi.label)}) Tj ET`);
        ops.push(`BT /F2 17 Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${(cellX + 16).toFixed(2)} ${(cellY + 14).toFixed(2)} Tm (${escapeText(kpi.value)}) Tj ET`);
      });

      // Status breakdown footer row: brand-coloured dots + name + bold count
      if (hasStatusBreakdown) {
        const rowY = cardY;
        ops.push(fillRect(LINE[0], LINE[1], LINE[2], MARGIN, rowY + KPI_STATUS_H, CONTENT_W, 0.8));

        const rowLabel = 'STATUS BREAKDOWN';
        ops.push(`BT /F2 7.5 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(MARGIN + 16).toFixed(2)} ${(rowY + 16).toFixed(2)} Tm (${rowLabel}) Tj ET`);

        let itemX = MARGIN + 16 + textWidth(rowLabel, 7.5, true) + 28;
        const dotCY = rowY + KPI_STATUS_H / 2;
        executiveSummary.statusBreakdown.forEach((s) => {
          const name = String(s.status);
          const count = Number(s.count).toLocaleString('en-LK');
          const color = STATUS_COLORS[name.toLowerCase()] || SLT_BLUE;

          ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${itemX.toFixed(2)} ${(dotCY + 3.0).toFixed(2)} Tm (${escapeText(name)}) Tj ET`);
          const nameW = textWidth(name, 8.5, false);
          ops.push(`BT /F2 9.5 Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${(itemX + nameW + 6).toFixed(2)} ${(dotCY + 3.0).toFixed(2)} Tm (${escapeText(count)}) Tj ET`);

          itemX += nameW + 6 + textWidth(count, 9.5, true) + 26;
        });
      }

      top += cardH + KPI_GAP;
    }

    // 3. Render Items (User Cards or Table Rows)
    page.items.forEach((item) => {
      if (item.type === 'section_title') {
        const titleLabel = item.continued ? `${item.section.title} (continued)` : item.section.title;
        if (titleLabel) {
          // Split the "Section N - " prefix so it carries the brand colour and
          // the topic name stays in navy. A full-width brand rule underlines
          // the heading (the old left-hand bar is gone).
          const split = titleLabel.match(/^(Section\s*[^-]*-\s*)([\s\S]*)$/i);
          const prefix = split ? split[1] : '';
          const rest = split ? split[2] : titleLabel;
          let cursor = MARGIN;
          if (prefix) {
            ops.push(`BT /F2 11.5 Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${cursor.toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(prefix)}) Tj ET`);
            cursor += textWidth(prefix, 11.5, true);
          }
          ops.push(`BT /F2 11.5 Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${cursor.toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (${escapeText(rest)}) Tj ET`);
          ops.push(fillRect(SLT_BLUE[0], SLT_BLUE[1], SLT_BLUE[2], MARGIN, PAGE.height - top - 13, CONTENT_W, 2));
        }
        if (item.section.note) {
          const noteLabel = escapeText(item.section.note);
          ops.push(`BT /F1 9 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(rightX - textWidth(noteLabel, 9)).toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (${noteLabel}) Tj ET`);
        }
        top += 22;
      } else if (item.type === 'user_card') {
        const row = item.row;
        const cardHeight = 102;
        const cardX = MARGIN;
        const cardWidth = CONTENT_W;

        // Outer Card Fill & Border
        ops.push(...boxedRect(CARD_BG, LINE, 0.9, cardX, PAGE.height - top - cardHeight, cardWidth, cardHeight));

        // User Header Bar (Corporate SLT Blue)
        const headerHeight = 24;
        ops.push(fillRect(SLT_BLUE[0], SLT_BLUE[1], SLT_BLUE[2], cardX, PAGE.height - top - headerHeight, cardWidth, headerHeight));

        // User Name, Role & Contact Info
        const userName = row.name || 'System User';
        const userRole = row.role || 'Staff';
        const userContact = [row.email, row.phone].filter(Boolean).join('   |   ') || 'No contact on file';

        ops.push(`BT /F2 10.5 Tf 1 1 1 rg 1 0 0 1 ${(cardX + 12).toFixed(2)} ${(PAGE.height - top - 16).toFixed(2)} Tm (${escapeText(userName)}) Tj ET`);

        // Role Badge - sized to the label instead of a fixed x offset
        const roleLabel = formatRole(userRole);
        const roleW = textWidth(roleLabel, 8.5, true) + 14;
        const roleX = cardX + 220;
        ops.push(fillRect(0.220, 0.740, 0.970, roleX, PAGE.height - top - 20, roleW, 14));
        ops.push(`BT /F2 8.5 Tf ${NAVY[0]} ${NAVY[1]} ${NAVY[2]} rg 1 0 0 1 ${(roleX + 7).toFixed(2)} ${(PAGE.height - top - 15).toFixed(2)} Tm (${escapeText(roleLabel)}) Tj ET`);

        // Contact Info Right Aligned
        ops.push(`BT /F1 9 Tf 0.900 0.940 0.980 rg 1 0 0 1 ${(rightX - 12 - textWidth(userContact, 9)).toFixed(2)} ${(PAGE.height - top - 16).toFixed(2)} Tm (${escapeText(userContact)}) Tj ET`);

        // Card Sub-Grid Metrics
        const bodyTop = top + headerHeight + 14;
        const c1X = cardX + 12;
        const c2X = cardX + 410;

        // Column 1: Task Outcomes
        ops.push(`BT /F2 9.5 Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop).toFixed(2)} Tm (Task Summary Details) Tj ET`);
        ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 16).toFixed(2)} Tm (Approved Tasks: ${row.approved || 0}       Confirmed Tasks: ${row.confirmed || 0}) Tj ET`);
        ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 30).toFixed(2)} Tm (Rejected Tasks: ${row.rejected || 0}       Flagged Tasks: ${row.flagged || 0}       Open / Pending: ${row.open || 0}) Tj ET`);

        // Column 2: Performance & Activity
        ops.push(`BT /F2 9.5 Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop).toFixed(2)} Tm (Activity & Performance) Tj ET`);
        ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop - 16).toFixed(2)} Tm (Completion Rate: ${row.completionRate || 0}%       Avg Handle Time: ${row.avgHandleHours != null ? `${row.avgHandleHours} hrs` : '-'}) Tj ET`);
        ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${c2X} ${(PAGE.height - bodyTop - 30).toFixed(2)} Tm (Last Actioned: ${row.lastActionedAt ? formatDateTime(row.lastActionedAt) : 'No activity'}) Tj ET`);

        // Services Handled Line
        const serviceStr = Array.isArray(row.services) && row.services.length
          ? row.services.map((s) => `${s.service} (${s.count})`).join(', ')
          : 'No specific services actioned in this period';

        ops.push(`BT /F2 8.5 Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${c1X} ${(PAGE.height - bodyTop - 48).toFixed(2)} Tm (Services Handled:) Tj ET`);
        ops.push(`BT /F1 8.5 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${(c1X + 95).toFixed(2)} ${(PAGE.height - bodyTop - 48).toFixed(2)} Tm (${escapeText(serviceStr.slice(0, 110))}) Tj ET`);

        top += cardHeight + 16;
      } else if (item.type === 'table_header') {
        const hHeight = item.headerHeight || 22;
        // Table Header Fill (Corporate SLT Blue) with a darker cap strip
        ops.push(fillRect(SLT_BLUE[0], SLT_BLUE[1], SLT_BLUE[2], MARGIN, PAGE.height - top - hHeight, CONTENT_W, hHeight));
        ops.push(fillRect(NAVY[0], NAVY[1], NAVY[2], MARGIN, PAGE.height - top - hHeight, CONTENT_W, 2));

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
        ops.push(`BT /F1 9 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${(MARGIN + 6).toFixed(2)} ${(PAGE.height - top).toFixed(2)} Tm (No records found for selected filters.) Tj ET`);
        top += 20;
      } else if (item.type === 'row') {
        const rHeight = item.rowHeight || 24;

        // Alternating row background: Even rows soft gray/blue tint
        if (item.rowIndex % 2 === 1) {
          ops.push(fillRect(ZEBRA_BG[0], ZEBRA_BG[1], ZEBRA_BG[2], MARGIN, PAGE.height - top - rHeight, CONTENT_W, rHeight));
        }

        // Row bottom divider line
        ops.push(strokeRect(LINE[0], LINE[1], LINE[2], 0.5, MARGIN, PAGE.height - top - rHeight, CONTENT_W, 0.5));

        let cursorX = MARGIN;
        item.section.layout.forEach((col, colIdx) => {
          const [, read] = item.section.columns[colIdx];
          const rawVal = read(item.row);
          const lines = wrapText(rawVal, col.width, 9, 'F1');

          lines.forEach((lineText, lineIdx) => {
            const lineY = top + 14 + (lineIdx * 12);
            ops.push(`BT /F1 9 Tf ${SLATE[0]} ${SLATE[1]} ${SLATE[2]} rg 1 0 0 1 ${(cursorX + 6).toFixed(2)} ${(PAGE.height - lineY).toFixed(2)} Tm (${escapeText(lineText)}) Tj ET`);
          });

          cursorX += col.width;
        });
        top += rHeight;
      }
    });

    // 4. Official SLTMobitel Footer
    const footerY1 = 26;
    const footerY2 = 14;

    ops.push(fillRect(LINE[0], LINE[1], LINE[2], MARGIN, 38, CONTENT_W, 0.8));
    ops.push(`BT /F1 8.5 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${MARGIN} ${footerY1} Tm (Generated by SLTMobitel EasyApply Portal) Tj ET`);
    ops.push(`BT /F1 8.5 Tf ${MUTED[0]} ${MUTED[1]} ${MUTED[2]} rg 1 0 0 1 ${MARGIN} ${footerY2} Tm (Confidential - Internal Use Only) Tj ET`);

    const pageStr = `Page ${pageIndex + 1} of ${pages.length}`;
    ops.push(`BT /F2 8.5 Tf ${SLT_BLUE[0]} ${SLT_BLUE[1]} ${SLT_BLUE[2]} rg 1 0 0 1 ${(rightX - textWidth(pageStr, 8.5, true)).toFixed(2)} ${footerY1} Tm (${escapeText(pageStr)}) Tj ET`);

    return ops.join('\n');
  };

  const streams = pages.map(drawPage);

  const pageCount = streams.length;
  const fontRegularId = 1;
  const fontBoldId = 2;
  const contentIdFor = (i) => 4 + i;
  const pageIdFor = (i) => 4 + pageCount + i;
  const catalogId = 4 + pageCount * 2;
  const pagesId = 5 + pageCount * 2;

  const objects = [];
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  // Real SLT Mobitel logo. SLT_LOGO_HEX is raw RGB (flattened onto white by
  // scripts/buildSltLogoPdfImage.cjs) that was zlib-deflated at build time, so
  // the stream needs ASCIIHexDecode to restore bytes and FlateDecode to inflate
  // them. Passing a whole PNG container here instead renders the logo as a
  // black box, because PDF image XObjects expect decoded samples, not chunks.
  const logoHex = SLT_LOGO_HEX;
  objects.push(
    `<< /Type /XObject /Subtype /Image /Width ${SLT_LOGO_WIDTH} /Height ${SLT_LOGO_HEIGHT} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /FlateDecode] ` +
      `/Length ${logoHex.length} >>\nstream\n${logoHex}\nendstream`
  );

  streams.forEach((stream) => {
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  });

  streams.forEach((_, i) => {
    objects.push(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE.width.toFixed(2)} ${PAGE.height.toFixed(2)}] ` +
        `/Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> /XObject << /I1 3 0 R >> >> /Contents ${contentIdFor(i)} 0 R >>`
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