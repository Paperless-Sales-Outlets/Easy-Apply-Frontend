
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, addToCart } from '../services/productService';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import Toast from '../components/common/Toast';

// Identify LTE / FTTH products that use the external package portal
const isLteOrFtthProduct = (prod = {}) => {
  const productText = `
    ${prod.category || ''}
    ${prod.name || ''}
    ${prod.productName || ''}
  `.toLowerCase();

  return /\blte\b|\b4g\b|\bftth\b|\bfibre\b|\bfiber\b/.test(
    productText
  );
};

export default function ProductDetailPage() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch product details
  useEffect(() => {
    let cancelled = false;

    const fetchProduct = async () => {
      setLoading(true);
      setProduct(null);

      try {
        const res = await getProductById(id);

        if (cancelled) return;

        const loadedProduct =
          res.data || res.product || res;

        // LTE and FTTH products are handled by the
        // SLT external package selection portal.
        if (isLteOrFtthProduct(loadedProduct)) {
          window.location.replace(
            import.meta.env.VITE_PACKAGE_SELECTION_PORTAL_URL ||
              'https://dpdlab1.slt.lk:703'
          );
          return;
        }

        setProduct(loadedProduct);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching product:', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Display notification toast
  const showToast = (message, type = 'success') => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Add product to shopping cart
  const handleAddToCart = async (prod, qty = 1) => {
    try {
      await addToCart(prod._id || prod.id, qty);

      showToast(
        `${prod.name || prod.productName || 'Product'} added to cart!`,
        'success'
      );
    } catch (err) {
      console.error('Error adding product to cart:', err);

      showToast(
        'Could not add the product to your cart. Please try again.',
        'error'
      );
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--page-bg)',
        minHeight: '100vh',
        padding: '2rem 0',
      }}
    >
      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />

      <div
        className="page-container"
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* Breadcrumb Navigation */}
        <nav
          style={{
            fontSize: '0.85rem',
            color: '#64748b',
            marginBottom: '1.5rem',
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
          }}
        >
          <Link
            to="/"
            style={{
              color: '#64748b',
              textDecoration: 'none',
            }}
          >
            Home
          </Link>

          <span>›</span>

          <Link
            to="/new-connection/products"
            style={{
              color: '#64748b',
              textDecoration: 'none',
            }}
          >
            Product Catalogue
          </Link>

          <span>›</span>

          <span
            style={{
              color: '#0056b3',
              fontWeight: 600,
            }}
          >
            {product?.name ||
              product?.productName ||
              'Product Details'}
          </span>
        </nav>

        {/* Product Content */}
        {loading ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            Loading product details...
          </div>
        ) : !product ? (
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              color: '#991b1b',
            }}
          >
            Product not found.{' '}
            <Link to="/new-connection/products">
              Back to catalogue
            </Link>
          </div>
        ) : (
          <ProductDetailsPanel
            product={product}
            isFavorite={isFavorite}
            onToggleFavorite={() =>
              setIsFavorite((prev) => !prev)
            }
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}
