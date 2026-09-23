// src/utils/productHubAdapter.js

export function mapHubTemplateToProductCard(entry, parentCategory = null) {
  const t = entry.template || entry || {};
  const fieldValues = t.fieldValues || t.effectiveFieldValues || {};
  const fields = entry.fields || [];
  const path = t.path || [];

  // 1. Resolve Image URL (checking both uppercase "Image" and lowercase "image")
  const imgObj = fieldValues.Image || fieldValues.image;
  let bannerUrl = imgObj?.url || t.image || '';

  // 2. Resolve Category from path hierarchy or parent context
  const rootCategory = path[0]?.name || parentCategory || t.category || '';
  let normalizedCategory = 'Fibre Broadband';

  const contextStr = `${rootCategory} ${t.name || ''}`.toLowerCase();
  if (contextStr.includes('peo') || contextStr.includes('tv')) {
    normalizedCategory = 'PEO TV';
  } else if (contextStr.includes('megaline') || contextStr.includes('voice') || contextStr.includes('phone')) {
    normalizedCategory = 'Voice';
  } else if (contextStr.includes('lte') || contextStr.includes('4g')) {
    normalizedCategory = 'LTE Home';
  } else if (contextStr.includes('broad band') || contextStr.includes('broadband') || contextStr.includes('fibre') || contextStr.includes('fiber')) {
    normalizedCategory = 'Fibre Broadband';
  } else if (rootCategory) {
    normalizedCategory = rootCategory;
  }

  // Set default category image fallback if missing
  if (!bannerUrl) {
    if (normalizedCategory === 'PEO TV') bannerUrl = 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=80';
    else if (normalizedCategory === 'Voice') bannerUrl = 'https://images.unsplash.com/photo-1534536281715-e28d76689b4d?w=800&auto=format&fit=crop&q=80';
    else bannerUrl = 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80';
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

  if (t.description && t.description.trim()) {
    features.push(t.description.trim());
  }

  // Fallback if no specific features were set
  if (features.length === 0) {
    if (normalizedCategory === 'PEO TV') {
      features.push('Live HD Channels', '7-Day Catch-up TV', 'Rewind & Pause Live TV');
    } else if (normalizedCategory === 'Voice') {
      features.push('Unlimited SLT Calls', 'Crystal Clear Audio', 'Caller ID Included');
    } else {
      features.push('High-speed Fibre Connectivity', 'Unlimited Anytime Data', '24/7 SLT Support');
    }
  }

  // 4. Resolve Price & Speed
  const price = Number(t.price) || Number(fieldValues['Monthly Rental']) || Number(fieldValues['Package Monthly Rental']) || 0;
  const speed = fieldValues['Bandwidth (Download/Upload)'] || (t.name?.match(/\d+mbps/i) ? t.name.match(/\d+mbps/i)[0] : (normalizedCategory === 'PEO TV' ? 'HD TV' : normalizedCategory === 'Voice' ? 'Voice' : 'Standard'));

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
    popular: Boolean(t.name?.toLowerCase().includes('unlimited') || t.name?.toLowerCase().includes('gold') || price > 3500),
    features: [...new Set(features)].slice(0, 4), // Top 4 bullet points for the card layout
    bannerUrl: bannerUrl,
    rawTemplate: t,
  };
}

/**
 * Recursively flattens hierarchical tree structures into a flat list of product cards.
 */
export function flattenHubHierarchyToProducts(nodes, parentCategory = null) {
  if (!Array.isArray(nodes) || nodes.length === 0) return [];
  const results = [];

  for (const node of nodes) {
    const nodeName = node.name || 'SLT Package';
    const currentCategory = parentCategory || nodeName;
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const hasValidPrice = node.price !== null && node.price !== undefined && node.price !== '' && Number(node.price) > 0;

    if (hasChildren) {
      // Recurse into children
      results.push(...flattenHubHierarchyToProducts(node.children, currentCategory));

      // If parent node also has a standalone price, include it
      if (hasValidPrice) {
        results.push(mapHubTemplateToProductCard(node, currentCategory));
      }
    } else {
      // Leaf product node
      results.push(mapHubTemplateToProductCard(node, currentCategory));
    }
  }

  return results;
}

/**
 * Normalizes live Product Info Hub Single Product Details API payload
 * (from /public-api/v1/integration/products/{productId})
 */
export function normalizeProductDetail(data) {
  if (!data) return null;
  const p = data.product || data;
  const tables = data.tables || [];

  const fixedFields = Array.isArray(p.fixedFields) ? p.fixedFields : [];
  const features = typeof p.features === 'object' && p.features !== null ? p.features : {};

  // Extract key terms
  const commitment = fixedFields.find(f => f.name?.toLowerCase().includes('commitment'))?.value || '1 Year';
  const taxRate = fixedFields.find(f => f.name?.toLowerCase().includes('tax'))?.value || '42.02%';
  const terminationFee = fixedFields.find(f => f.name?.toLowerCase().includes('termination'))?.value || '2500';
  const downgradeFee = fixedFields.find(f => f.name?.toLowerCase().includes('downgrade'))?.value || '500';

  return {
    id: p.id,
    productName: p.productName || p.name || 'SLT Connection Package',
    category: p.category || 'Broadband',
    categoryPath: p.categoryPath || [p.category || 'Broadband'],
    description: p.description || '',
    price: p.price ?? p.monthlyPrice ?? 0,
    monthlyPrice: p.monthlyPrice ?? p.price ?? 0,
    installationFee: p.installationFee ?? (p.price > 5000 ? 0 : 2500),
    fixedFields: fixedFields,
    features: features,
    image: p.image || '',
    productStatus: p.productStatus || 'Active',
    version: p.version || '1.0',
    lastUpdate: p.lastUpdate || new Date().toISOString(),
    tables: tables,
    terms: {
      commitment,
      taxRate,
      terminationFee,
      downgradeFee,
    },
  };
}

