import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SLTLoader from '../components/SLTLoader';
import api, { clearSessionCart } from '../utils/api';

/**
 * PayHere redirects the user back to this page after a successful payment.
 * URL: /payment/success?order_id=ORD-xxx&payment_id=xxx&status_code=2
 *
 * We look up the application by order_id and then navigate to /completion.
 */
export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const orderId = searchParams.get('order_id');

    const finish = async (referenceNumber) => {
      // Cart is no longer needed — clear it from the backend and localStorage
      // so the user starts fresh if they come back to the product catalogue.
      await clearSessionCart();

      navigate('/completion', {
        replace: true,
        state: {
          referenceNumber: referenceNumber || orderId || 'PAYHERE-SUCCESS',
          messageKey: 'completion.successMessages.newConnection',
          paymentConfirmed: true,
        },
      });
    };

    if (!orderId) {
      finish(null);
      return;
    }

    // Look up the real reference number from the backend using the order_id
    api
      .get(`/payment/order/${orderId}`)
      .then((res) => {
        finish(res.data?.referenceNumber || orderId);
      })
      .catch(() => {
        // Backend offline or order not found — use orderId as fallback
        finish(orderId);
      });
  }, [navigate, searchParams]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        color: 'var(--slt-blue)',
      }}
    >
      <SLTLoader size={48} />
      <p style={{ fontWeight: 700, fontSize: '1.1rem' }}>
        Payment confirmed — loading your receipt…
      </p>
    </div>
  );
}
