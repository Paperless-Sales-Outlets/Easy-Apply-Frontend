import React, { useState } from 'react';
import { loadPayHereSdk } from '../utils/loadPayHereSdk';
import { createPayment } from '../services/paymentService';
import Icon from './Icon';

/**
 * Reusable PayHere Sandbox Payment Button Component
 *
 * @param {Object} props
 * @param {number|string} props.amount - Amount payable
 * @param {string} [props.currency='LKR'] - Currency code
 * @param {string} [props.orderId] - Custom order identifier
 * @param {string} [props.itemTitle='Service Payment'] - Item/service description
 * @param {Object} [props.customerDetails] - Customer contact information
 * @param {Function} [props.onSuccess] - Callback when payment is completed
 * @param {Function} [props.onCancel] - Callback when payment is dismissed/cancelled
 * @param {Function} [props.onError] - Callback on payment or API failure
 * @param {string} [props.buttonText='Pay Now'] - Button text
 * @param {boolean} [props.disabled=false] - Button disabled state
 * @param {boolean} [props.sandbox=true] - Whether to run in PayHere Sandbox mode
 * @param {Object} [props.style] - Custom inline styles
 * @param {string} [props.className] - Custom CSS class names
 */
export default function PayHereButton({
  amount,
  currency = 'LKR',
  orderId,
  itemTitle = 'Service Payment',
  customerDetails = {},
  onSuccess,
  onCancel,
  onError,
  buttonText = 'Pay Now',
  disabled = false,
  sandbox = true,
  style = {},
  className = 'btn btn-primary',
}) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePay = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      // 1. Ensure PayHere SDK is loaded
      await loadPayHereSdk();

      // 2. Fetch payment credentials & hash from backend API (POST /api/payment/create)
      const payload = {
        amount,
        currency,
        orderId,
        itemTitle,
        customerDetails,
      };

      const res = await createPayment(payload);
      // Support responses where backend returns payment parameters directly or nested inside res.data
      const paymentParams = res?.data || res;

      if (!paymentParams || !paymentParams.merchant_id || !paymentParams.hash) {
        throw new Error('Invalid payment parameters received from server.');
      }

      // 3. Attach PayHere SDK Handlers
      window.payhere.onCompleted = function (completedOrderId) {
        setLoading(false);
        if (onSuccess) {
          onSuccess(completedOrderId || paymentParams.order_id);
        }
      };

      window.payhere.onDismissed = function () {
        setLoading(false);
        if (onCancel) {
          onCancel();
        }
      };

      window.payhere.onError = function (error) {
        setLoading(false);
        const errDetail = typeof error === 'string' ? error : JSON.stringify(error);
        setErrorMessage(`Payment Error: ${errDetail}`);
        if (onError) {
          onError(error);
        }
      };

      // 4. Construct PayHere Payment Payload
      const payment = {
        sandbox: sandbox, // Sandbox flag
        merchant_id: paymentParams.merchant_id,
        return_url: paymentParams.return_url || window.location.href,
        cancel_url: paymentParams.cancel_url || window.location.href,
        notify_url: paymentParams.notify_url || '',
        order_id: paymentParams.order_id,
        items: paymentParams.items || itemTitle,
        amount: paymentParams.amount || amount,
        currency: paymentParams.currency || currency,
        hash: paymentParams.hash,
        first_name: paymentParams.first_name || customerDetails?.firstName || 'Customer',
        last_name: paymentParams.last_name || customerDetails?.lastName || '',
        email: paymentParams.email || customerDetails?.email || 'customer@example.com',
        phone: paymentParams.phone || customerDetails?.phone || '',
        address: paymentParams.address || customerDetails?.address || 'N/A',
        city: paymentParams.city || customerDetails?.city || 'Colombo',
        country: paymentParams.country || customerDetails?.country || 'Sri Lanka',
        delivery_address: paymentParams.delivery_address || '',
        delivery_city: paymentParams.delivery_city || '',
        delivery_country: paymentParams.delivery_country || '',
        custom_1: paymentParams.custom_1 || '',
        custom_2: paymentParams.custom_2 || '',
      };

      // 5. Trigger PayHere Sandbox Popup
      window.payhere.startPayment(payment);
    } catch (err) {
      setLoading(false);
      const msg = err.response?.data?.message || err.message || 'Failed to initialize payment gateway.';
      setErrorMessage(msg);
      if (onError) {
        onError(err);
      }
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {errorMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            borderRadius: '8px',
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Icon name="alert-circle" size={18} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      <button
        type="button"
        className={className}
        onClick={handlePay}
        disabled={disabled || loading}
        style={{
          width: '100%',
          padding: '0.85rem',
          fontSize: '1.05rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 86, 179, 0.25)',
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          ...style,
        }}
      >
        {loading ? (
          <>
            <span
              className="spinner"
              style={{
                width: '18px',
                height: '18px',
                border: '2px solid #ffffff',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                display: 'inline-block',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span>Initializing Payment...</span>
          </>
        ) : (
          <>
            <span>{buttonText}</span>
            <Icon name="arrow-right" size={18} />
          </>
        )}
      </button>
    </div>
  );
}
