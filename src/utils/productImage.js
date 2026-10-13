// Single place that decides which picture represents a product, so the
// catalogue, cart and any other list show the same image.
const PEO_TV_IMAGE =
  'https://res.cloudinary.com/zipy7m0d/image/upload/v1789621770/product-info-hub/images/fields/peo_qpdary.jpg';

export function isPeoTv(product = {}) {
  const text = `${product.category || ''} ${product.name || product.productName || ''}`.toLowerCase();
  return text.includes('peo') || /\btv\b/.test(text);
}

export function resolveProductImage(product = {}) {
  return product.bannerUrl || product.image || (isPeoTv(product) ? PEO_TV_IMAGE : null);
}

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();

/** Find the live catalogue entry for a cart line (by id, product code, then name). */
export function matchCatalogProduct(item, catalog = []) {
  if (!item || !catalog.length) return null;
  const ids = [item.productId, item._id, item.id].filter(Boolean).map(String);
  const byId = catalog.find((p) => [p._id, p.id, p.productId, p.productCode].filter(Boolean).map(String).some((k) => ids.includes(k)));
  if (byId) return byId;
  const name = norm(item.productName || item.name);
  return name ? catalog.find((p) => norm(p.name || p.productName) === name) || null : null;
}
