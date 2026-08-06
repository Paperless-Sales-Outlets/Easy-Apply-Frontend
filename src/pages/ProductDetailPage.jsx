import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProductById, addToCart } from '../services/productService';
import ProductDetailsPanel from '../components/catalog/ProductDetailsPanel';
import Toast from '../components/common/Toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await getProductById(id);
        setProduct(res.data || res.product || res);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddToCart = async (prod, qty) => {
    try {
      await addToCart(prod._id || prod.id, qty);
      showToast(`${prod.name} added to cart!`, 'success');
    } catch (err) {
      showToast('Added to cart!', 'success');
    }
  };

  const handleBuyNow = async (prod, qty) => {
    await handleAddToCart(prod, qty);
    navigate('/verify-phone');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', padding: '2rem 0' }}>
      <Toast toast={toast} onClose={() => setToast(null)} />
      <div className="page-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <nav style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link to="/" style={{ color: '#64748b', textDecoration: 'none' }}>Home</Link>
          <span>›</span>
          <Link to="/new-connection/products" style={{ color: '#64748b', textDecoration: 'none' }}>Product Catalogue</Link>
          <span>›</span>
          <span style={{ color: '#0056b3', fontWeight: 600 }}>{product?.name || 'Product Details'}</span>
        </nav>

        {loading ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            Loading product details...
          </div>
        ) : !product ? (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '3rem', textAlign: 'center', color: '#991b1b' }}>
            Product not found. <Link to="/new-connection/products">Back to catalogue</Link>
          </div>
        ) : (
          <ProductDetailsPanel
            product={product}
            isFavorite={isFavorite}
            onToggleFavorite={() => setIsFavorite(!isFavorite)}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        )}
      </div>
    </div>
  );
}
