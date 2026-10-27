import api from '../utils/api';
import QRCode from 'qrcode';

/**
 * ── Sales Officer QR Code Tracking Service ────────────────────────────────
 * Service layer coordinating with backend endpoints for Sales Officer
 * management, QR tracking generation/download, attribution, and statistics.
 */

// ── Admin Endpoints ────────────────────────────────────────────────────────

/**
 * GET /api/admin/sales-officers
 * Lists all registered sales officers with QR code status and summary counts.
 */
export const getSalesOfficers = async (params = {}) => {
  try {
    const response = await api.get('/admin/sales-officers', { params });
    return response.data;
  } catch (err) {
    // Graceful fallback to /admin/users if dedicated endpoint returns 404
    if (err.response?.status === 404) {
      const usersRes = await api.get('/admin/users');
      const allUsers = usersRes.data?.users || [];
      const officers = allUsers.filter(
        (u) => u.role && /^sales\s*officer$/i.test(u.role.trim())
      );
      return {
        success: true,
        count: officers.length,
        salesOfficers: officers.map((o) => ({
          ...o,
          qr: { hasQr: false },
        })),
        fallback: true,
      };
    }
    throw err;
  }
};

/**
 * POST /api/admin/sales-officers
 * Creates a Sales Officer profile: { employeeNumber (6 digits), name, email, password }.
 */
export const createSalesOfficer = async (data) => {
  const response = await api.post('/admin/sales-officers', data);
  return response.data;
};

/**
 * GET /api/admin/sales-officers/:employeeId
 * Retrieves detailed info for an officer by Employee Number (e.g. '095756').
 */
export const getSalesOfficerByEmployeeId = async (employeeId) => {
  const response = await api.get(`/admin/sales-officers/${encodeURIComponent(employeeId)}`);
  return response.data;
};

/**
 * POST /api/admin/sales-officers/:employeeId/qr
 * Generates or regenerates a unique QR tracking code for a sales officer.
 * Duplicate records are prevented by the backend.
 */
export const createOrGetOfficerQr = async (employeeId, { regenerate = false } = {}) => {
  const response = await api.post(
    `/admin/sales-officers/${encodeURIComponent(employeeId)}/qr`,
    { regenerate }
  );
  return response.data;
};

/**
 * GET /api/admin/sales-officers/:employeeId/qr
 * Retrieves an existing QR tracking record and metadata.
 */
export const getOfficerQr = async (employeeId) => {
  const response = await api.get(`/admin/sales-officers/${encodeURIComponent(employeeId)}/qr`);
  return response.data;
};

/**
 * GET /api/admin/sales-officers/:employeeId/statistics
 * Retrieves real application and completed-sale statistics for an officer.
 */
export const getOfficerStatistics = async (employeeId, params = {}) => {
  const response = await api.get(
    `/admin/sales-officers/${encodeURIComponent(employeeId)}/statistics`,
    { params }
  );
  return response.data;
};

/**
 * GET /api/admin/sales-officers/:employeeId/applications
 * Retrieves applications attributed to a specific sales officer.
 */
export const getOfficerApplications = async (employeeId, params = {}) => {
  const response = await api.get(
    `/admin/sales-officers/${encodeURIComponent(employeeId)}/applications`,
    { params }
  );
  return response.data;
};

// ── Authenticated Sales Officer Endpoints ─────────────────────────────────

/**
 * GET /api/sales-officer/me/statistics
 * Retrieves statistics for the authenticated Sales Officer.
 * Enforced on the backend using the authenticated session.
 */
export const getMyStatistics = async (params = {}) => {
  const response = await api.get('/sales-officer/me/statistics', { params });
  return response.data;
};

/**
 * GET /api/sales-officer/me/applications
 * Retrieves attributed applications for the authenticated Sales Officer.
 * One officer cannot view another officer's private records.
 */
export const getMyApplications = async (params = {}) => {
  const response = await api.get('/sales-officer/me/applications', { params });
  return response.data;
};

/**
 * GET /api/sales-officer/me/qr
 * Retrieves authenticated officer's own QR tracking record and URL.
 */
export const getMyQr = async () => {
  const response = await api.get('/sales-officer/me/qr');
  return response.data;
};

// ── Public Tracking Endpoint ──────────────────────────────────────────────

/**
 * GET /api/sales-tracking/:token
 * Validates a sales tracking token and updates scan telemetry.
 */
export const resolveTrackingToken = async (token) => {
  const response = await api.get(`/sales-tracking/${encodeURIComponent(token)}`);
  return response.data;
};

// ── QR Code Utilities ─────────────────────────────────────────────────────

/**
 * Render QR code to a canvas element.
 */
export const renderQrToCanvas = async (canvas, text, options = {}) => {
  if (!canvas || !text) return;
  const mergedOptions = {
    width: 260,
    margin: 2,
    color: {
      dark: '#0b2d5b', // SLT brand navy
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
    ...options,
  };
  return QRCode.toCanvas(canvas, text, mergedOptions);
};

/**
 * Generate a PNG Data URL for a given tracking URL.
 */
export const generateQrDataUrl = async (text, options = {}) => {
  if (!text) return '';
  return QRCode.toDataURL(text, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0b2d5b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
    ...options,
  });
};

/**
 * Generates and triggers download of a high-resolution branded PNG QR card.
 * Includes SLTMobitel header, Officer name, Employee ID, sharp QR code,
 * and direct scan instructions.
 */
export const downloadBrandedQrPng = async ({
  trackingUrl,
  employeeNumber,
  officerName,
}) => {
  const cleanEmpId = employeeNumber || 'Officer';
  const cleanName = officerName || 'Sales Officer';
  const width = 800;
  const height = 1050;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Top decorative brand banner
  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, '#0b4a91'); // SLT Blue
  gradient.addColorStop(0.5, '#00543c'); // SLT Deep Green
  gradient.addColorStop(1, '#3a9636'); // SLT Bright Green
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, 18);

  // Card Header / Brand Box
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(40, 45, width - 80, 150);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 45, width - 80, 150);

  // Header Title
  ctx.fillStyle = '#0b2d5b';
  ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SLTMobitel Easy Apply', width / 2, 100);

  ctx.fillStyle = '#00543c';
  ctx.font = '600 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Authorized Sales Officer QR Code', width / 2, 135);

  ctx.fillStyle = '#64748b';
  ctx.font = '15px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Customer New Connection Portal Referral', width / 2, 165);

  // Officer Info Pill
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 1.5;
  const pillY = 220;
  ctx.beginPath();
  ctx.roundRect(70, pillY, width - 140, 105, 16);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0f57a8';
  ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(cleanName, width / 2, pillY + 45);

  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, monospace';
  ctx.fillText(`Employee ID: ${cleanEmpId}`, width / 2, pillY + 80);

  // Render QR Code onto temp canvas
  const qrCanvas = document.createElement('canvas');
  await QRCode.toCanvas(qrCanvas, trackingUrl, {
    width: 480,
    margin: 1,
    color: {
      dark: '#0b2d5b',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  // QR Container Box with shadow border
  const qrBoxY = 350;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect((width - 500) / 2, qrBoxY, 500, 500, 20);
  ctx.fill();
  ctx.stroke();

  // Draw QR code centered inside box
  ctx.drawImage(qrCanvas, (width - 460) / 2, qrBoxY + 20, 460, 460);

  // Footer Instructions
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText('Scan with Camera to Apply Online', width / 2, 885);

  ctx.fillStyle = '#64748b';
  ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.fillText(
    'Direct access to SLT Fiber, Broadband & New Connection Services',
    width / 2,
    915
  );

  // Verification watermark
  ctx.fillStyle = '#94a3b8';
  ctx.font = '13px monospace';
  const urlDisplay =
    trackingUrl.length > 55 ? `${trackingUrl.slice(0, 52)}...` : trackingUrl;
  ctx.fillText(urlDisplay, width / 2, 955);

  // Bottom brand strip
  ctx.fillStyle = '#0b4a91';
  ctx.fillRect(0, height - 14, width, 14);

  // Trigger download
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = `SLT_Sales_Officer_QR_${cleanEmpId}.png`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
