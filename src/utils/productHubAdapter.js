// src/utils/productHubAdapter.js

export function mapHubTemplateToProductCard(entry) {
  const t = entry.template || {};
  const fieldValues = t.fieldValues || t.effectiveFieldValues || {};
  const fields = entry.fields || [];
  const path = t.path || [];

  // 1. Resolve Image URL (checking both uppercase "Image" and lowercase "image")
  const imgObj = fieldValues.Image || fieldValues.image;
  const bannerUrl = imgObj?.url || '';

  // 2. Resolve Category from path hierarchy
  // e.g. path: [{ name: "Megaline" }, { name: "Double Pay" }, ...]
  const rootCategory = path[0]?.name || '';
  let normalizedCategory = 'Fibre Broadband';

  if (rootCategory.toLowerCase().includes('peo') || t.name?.toLowerCase().includes('peo')) {
    normalizedCategory = 'PEO TV';
  } else if (rootCategory.toLowerCase().includes('megaline') || t.name?.toLowerCase().includes('voice')) {
    normalizedCategory = 'Voice';
  } else if (t.name?.toLowerCase().includes('lte') || t.name?.toLowerCase().includes('4g')) {
    normalizedCategory = 'LTE Home';
  } else if (rootCategory.toLowerCase().includes('broad band') || rootCategory.toLowerCase().includes('broadband')) {
    normalizedCategory = 'Fibre Broadband';
  }

  // 3. Extract dynamic specifications for card bullet points
  const features = [];

  // Pull from fieldValues
  if (fieldValues['FUP Limit']) features.push(`FUP: ${fieldValues['FUP Limit']}`);
  if (fieldValues['Bandwidth (Download/Upload)']) features.push(`Speed: ${fieldValues['Bandwidth (Download/Upload)']}`);
  if (fieldValues['Number Of Channels']) features.push(`${fieldValues['Number Of Channels']} TV Channels`);
  if (fieldValues['Voice Offering']) features.push(`Voice: ${fieldValues['Voice Offering']}`);

  // Pull from fixed fields
  fields.forEach((f) => {
    if (f.value && f.value !== 'N/A') {
      if (f.name === 'Commitment Period') features.push(`Contract: ${f.value}`);
      if (f.name === 'FUP Policy' && f.value === 'Yes') features.push('Fair Usage Policy Applies');
      if (f.name === 'TSTV' && f.value === 'Free') features.push('Free Time-Shifted TV');
      if (f.name === 'Support Contact') features.push(`24/7 Support: ${f.value}`);
    }
  });

  // Fallback if no specific features were set
  if (features.length === 0) {
    features.push('Standard SLT Connection', 'High Reliability');
  }

  // 4. Resolve Price & Speed
  const price = Number(t.price) || Number(fieldValues['Monthly Rental']) || Number(fieldValues['Package Monthly Rental']) || 0;
  const speed = fieldValues['Bandwidth (Download/Upload)'] || (t.name?.match(/\d+mbps/i) ? t.name.match(/\d+mbps/i)[0] : 'Standard');

  return {
    id: t._id || t.id,
    _id: t._id || t.id,
    productId: t._id || t.id,
    name: t.name,
    productName: t.name,
    monthlyPrice: price,
    price: price,
    installationFee: 2500, // Standard default for SLT bundles
    speed: speed,
    category: normalizedCategory,
    popular: Boolean(t.name?.toLowerCase().includes('unlimited') || price > 5000),
    features: features.slice(0, 4), // Top 4 bullet points for the card layout
    bannerUrl: bannerUrl,
    rawTemplate: t
  };
}
