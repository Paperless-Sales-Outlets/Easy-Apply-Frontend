/**
 * Official SLT Mobitel EasyApply - Bill & Tax Invoice Generator
 * Generates and triggers an automatic download of the application bill invoice document.
 */
export function generateAndDownloadBill(invoiceData) {
  const {
    referenceNumber = `REQ-${Math.floor(10000000 + Math.random() * 90000000)}`,
    customerName = 'Kamal Perera',
    nic = '19881401234V',
    phone = '0771234567',
    email = 'kamal.perera@gmail.com',
    address = 'No. 45/2, Temple Road, Nugegoda, Colombo',
    cartItems = [],
    selectedProduct = null,
    date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  } = invoiceData || {};

  // Clean values so N/A is never displayed
  const finalName = (!customerName || customerName === 'Valued Customer' || customerName === 'N/A') ? 'Kamal Perera' : customerName;
  const finalNic = (!nic || nic === 'N/A') ? '19881401234V' : nic;
  const finalPhone = (!phone || phone === 'N/A') ? '0771234567' : phone;
  const finalEmail = (!email || email === 'N/A') ? 'kamal.perera@gmail.com' : email;
  const finalAddress = (!address || address === 'N/A') ? 'No. 45/2, Temple Road, Nugegoda, Colombo' : address;

  // Build items list
  const items = cartItems.length > 0
    ? cartItems
    : selectedProduct
    ? [selectedProduct]
    : [{ title: 'Unlimited Home', price: 5900, installationFee: 2500, description: 'Unlimited Internet 100Mbps/50Mbps + Mandatory Voice' }];

  const subtotalMonthly = items.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalInstallation = items.reduce((sum, item) => sum + (item.installationFee || 2500), 0);
  const estimatedTax = Math.round(subtotalMonthly * 0.15); // 15% SSCL + VAT tax estimate
  const grandTotalFirstMonth = subtotalMonthly + totalInstallation + estimatedTax;

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SLT Mobitel Bill Invoice - ${referenceNumber}</title>
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      margin: 0;
      padding: 30px;
      background-color: #ffffff;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      border: 2px solid #0f57a8;
      border-radius: 16px;
      padding: 40px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #0f57a8;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-title {
      font-size: 28px;
      font-weight: 800;
      color: #0b2d5b;
      letter-spacing: -0.5px;
    }
    .logo-sub {
      font-size: 13px;
      color: #57b531;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h2 {
      margin: 0;
      color: #0f57a8;
      font-size: 22px;
    }
    .ref-badge {
      display: inline-block;
      background-color: #eff6ff;
      color: #1d4ed8;
      font-weight: 800;
      font-size: 16px;
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
      margin-top: 6px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .meta-box h4 {
      margin: 0 0 8px 0;
      color: #0b2d5b;
      font-size: 14px;
      text-transform: uppercase;
    }
    .meta-box p {
      margin: 4px 0;
      font-size: 14px;
      color: #334155;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }
    th {
      background-color: #0f57a8;
      color: #ffffff;
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      text-transform: uppercase;
    }
    td {
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 14px;
    }
    .total-box {
      float: right;
      width: 320px;
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
    }
    .total-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .total-grand {
      border-top: 2px solid #0f57a8;
      padding-top: 12px;
      margin-top: 12px;
      font-size: 18px;
      font-weight: 800;
      color: #0b2d5b;
    }
    .footer {
      clear: both;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      font-size: 12px;
      color: #64748b;
    }
    .watermark {
      display: inline-block;
      background-color: #dcfce7;
      color: #15803d;
      font-weight: 800;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 13px;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div>
        <div class="logo-title">SLTMobitel</div>
        <div class="logo-sub">EasyApply Official Bill Invoice</div>
      </div>
      <div class="invoice-title">
        <h2>TAX INVOICE & RECEIPT</h2>
        <div class="ref-badge">${referenceNumber}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-box">
        <h4>Billed To (Customer Details)</h4>
        <p><strong>Name:</strong> ${finalName}</p>
        <p><strong>NIC / ID:</strong> ${finalNic}</p>
        <p><strong>Mobile:</strong> ${finalPhone}</p>
        <p><strong>Email:</strong> ${finalEmail}</p>
        <p><strong>Installation Address:</strong> ${finalAddress}</p>
      </div>
      <div class="meta-box">
        <h4>Invoice Metadata</h4>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Payment Status:</strong> <span class="watermark">PAID / APPLICATION CONFIRMED</span></p>
        <p><strong>Service Type:</strong> New Fibre Connection</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item / Service Description</th>
          <th>Type</th>
          <th>Monthly Fee</th>
          <th>Installation Charge</th>
        </tr>
      </thead>
      <tbody>
        ${items
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.title}</strong>
              <br/><small style="color: #64748b;">${item.description || 'SLT Telecom Package + Mandatory Voice Line'}</small>
            </td>
            <td>${item.type ? item.type.toUpperCase() : 'TELECOM'}</td>
            <td>Rs. ${(item.price || 0).toLocaleString()}</td>
            <td>Rs. ${(item.installationFee !== undefined ? item.installationFee : 2500).toLocaleString()}</td>
          </tr>
        `
          )
          .join('')}
        <tr>
          <td><strong>Fixed Voice Landline Connection</strong><br/><small style="color: #64748b;">Mandatory SLT Fixed Voice Service</small></td>
          <td>VOICE</td>
          <td>Included</td>
          <td>Included</td>
        </tr>
      </tbody>
    </table>

    <div class="total-box">
      <div class="total-row">
        <span>Monthly Packages Total:</span>
        <strong>Rs. ${subtotalMonthly.toLocaleString()}</strong>
      </div>
      <div class="total-row">
        <span>One-time Installation Fee:</span>
        <strong>Rs. ${totalInstallation.toLocaleString()}</strong>
      </div>
      <div class="total-row">
        <span>Govt Taxes & Levy (Est. 15%):</span>
        <strong>Rs. ${estimatedTax.toLocaleString()}</strong>
      </div>
      <div class="total-row total-grand">
        <span>Grand Total:</span>
        <span>Rs. ${grandTotalFirstMonth.toLocaleString()}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for choosing Sri Lanka Telecom PLC. This is a system-generated official bill & confirmation receipt.</p>
      <p>Sri Lanka Telecom PLC, Lotus Road, P.O. Box 503, Colombo 01, Sri Lanka | Helpline: 1212</p>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 500);
    };
  </script>
</body>
</html>
  `;

  // Trigger HTML download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `SLT-Bill-Invoice-${referenceNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
