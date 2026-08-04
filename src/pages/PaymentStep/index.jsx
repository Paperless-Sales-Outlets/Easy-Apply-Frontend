import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon';
import PayHereButton from '../../components/PayHereButton';

export default function PaymentStep({
  isActive = true,
  verifiedPhone = '',
  amount = 1000,
  serviceName = 'Reconnection Fee',
  hasPaymentReceipt = false,
  onSuccess,
}) {
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState('card');
  const [statusState, setStatusState] = useState({
    type: null,
    message: '',
  });


  const formattedAmount = amount
    ? Number(amount).toLocaleString('en-LK', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '1,000.00';



  const handlePaymentSuccess = (orderId) => {

    // If receipt already uploaded, skip online payment
    if (hasPaymentReceipt) {
      if (onSuccess) {
        onSuccess();
      }

      navigate('/thank-you', {
        state: {
          amount: formattedAmount,
          serviceName,
        },
      });

      return;
    }


    setStatusState({
      type: 'success',
      message: `Payment successful! Reference Order ID: ${orderId}`,
    });


    setTimeout(() => {

      if (onSuccess) {
        onSuccess(orderId);
      }


      navigate('/thank-you', {
        state: {
          orderId,
          amount: formattedAmount,
          serviceName,
        },
      });

    }, 1000);
  };



  const handlePaymentCancel = () => {
    setStatusState({
      type: 'warning',
      message:
        'Payment process was cancelled. You can try again whenever you are ready.',
    });
  };



  const handlePaymentError = (error) => {

    const detail =
      typeof error === 'string'
        ? error
        : error?.message ||
          'Payment processing encountered an error.';


    setStatusState({
      type: 'error',
      message: `Payment error: ${detail}`,
    });
  };



  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>


      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>

        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface-color, #eff6ff)',
            color: 'var(--slt-blue, #0056b3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            border: '1px solid #bfdbfe',
          }}
        >
          <Icon name="lock" size={28} />
        </div>


        <h3
          style={{
            color: 'var(--slt-blue)',
            marginBottom: '0.5rem',
            fontSize: '1.4rem',
          }}
        >
          PayHere Sandbox Gateway
        </h3>


        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.92rem',
            lineHeight: '1.5',
          }}
        >
          You will be redirected to PayHere Sandbox encrypted Payment Gateway
          to process your payment securely. No credit card or sensitive
          credentials are stored on EasyApply servers.
        </p>

      </div>



      {statusState.type && (

        <div
          style={{
            padding: '1rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 500,

            backgroundColor:
              statusState.type === 'success'
                ? '#f0fdf4'
                : statusState.type === 'warning'
                ? '#fffbeb'
                : '#fef2f2',

            border:
              statusState.type === 'success'
                ? '1px solid #bbf7d0'
                : statusState.type === 'warning'
                ? '1px solid #fef08a'
                : '1px solid #fecaca',

            color:
              statusState.type === 'success'
                ? '#166534'
                : statusState.type === 'warning'
                ? '#92400e'
                : '#991b1b',
          }}
        >

          <Icon
            name={
              statusState.type === 'success'
                ? 'check-circle'
                : statusState.type === 'warning'
                ? 'alert-triangle'
                : 'alert-circle'
            }
            size={20}
          />

          <div>{statusState.message}</div>

        </div>

      )}



      <div
        style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
        }}
      >

        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span>Service Type:</span>
          <strong>{serviceName}</strong>
        </div>


        <div style={{ display:'flex', justifyContent:'space-between', marginTop:'10px' }}>
          <span>Verified Mobile:</span>
          <strong>
            {verifiedPhone ? `+94 ${verifiedPhone}` : 'N/A'}
          </strong>
        </div>


        <div
          style={{
            borderTop:'1px dashed #cbd5e1',
            marginTop:'12px',
            paddingTop:'12px',
            display:'flex',
            justifyContent:'space-between',
          }}
        >

          <strong>Total Amount Payable:</strong>

          <strong style={{color:'var(--slt-green, #16a34a)'}}>
            LKR {formattedAmount}
          </strong>

        </div>

      </div>




      {hasPaymentReceipt ? (

        <div
          style={{
            textAlign:'center',
            padding:'1.25rem',
            marginBottom:'1.5rem',
            backgroundColor:'#ecfdf5',
            border:'1px solid #10b981',
            borderRadius:'10px',
            color:'#065f46',
          }}
        >

          <Icon name="check-circle" size={32}/>

          <div style={{fontWeight:600}}>
            Payment Receipt Attached
          </div>

          <div>
            No further online payment is required.
          </div>

        </div>

      ) : (

        <div>
          <label className="form-label">
            Select Payment Gateway Method
          </label>


          <div
            style={{
              display:'grid',
              gridTemplateColumns:'1fr 1fr',
              gap:'1rem',
            }}
          >

            <button
              onClick={() => setSelectedMethod('card')}
              style={{
                padding:'1rem',
                borderRadius:'10px',
                border:
                  selectedMethod === 'card'
                    ? '2px solid #0056b3'
                    : '2px solid #e2e8f0',
              }}
            >
              <Icon name="credit-card"/>
              PayHere Card / IPG
            </button>



            <button
              onClick={() => setSelectedMethod('wallet')}
              style={{
                padding:'1rem',
                borderRadius:'10px',
                border:
                  selectedMethod === 'wallet'
                    ? '2px solid #0056b3'
                    : '2px solid #e2e8f0',
              }}
            >
              <Icon name="smartphone"/>
              PayHere Wallet
            </button>

          </div>

        </div>

      )}





      {hasPaymentReceipt ? (

        <button
          type="button"
          onClick={() => handlePaymentSuccess(null)}
          className="btn btn-success"
          disabled={!isActive}
          style={{
            width:'100%',
            padding:'0.85rem',
          }}
        >
          Submit Application
          <Icon name="check" size={18}/>
        </button>


      ) : (


        <PayHereButton

          amount={amount || 1000}
          currency="LKR"
          itemTitle={serviceName}

          customerDetails={{
            phone: verifiedPhone
              ? `0${verifiedPhone.replace(/^\+?94/, '')}`
              : '',
          }}

          buttonText="Pay Now with PayHere"

          disabled={!isActive}

          sandbox={true}

          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
          onError={handlePaymentError}

        />

      )}




      <div
        style={{
          marginTop:'1.5rem',
          textAlign:'center',
          fontSize:'0.78rem',
          color:'var(--text-secondary)',
        }}
      >

        <Icon name="shield-check" size={16}/>

        PayHere 256-bit SSL Encrypted & PCI-DSS Compliant Gateway

      </div>


    </div>
  );
}