import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import Icon from '../components/Icon';
import api from '../utils/api';

export default function CheckStatusPage() {
  const { t } = useTranslation();
  const [reference, setReference] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheck = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);
    
    try {
      const response = await api.get(
        `/applications/check-status?ref=${encodeURIComponent(reference)}`
      );
      setResult({
        status: response.data.status, // 'pending', 'approved', 'rejected', 'flagged'
        message: t('checkStatusPage.statusDescription'),
      });
    } catch (error) {
      setResult({
        status: 'not-found',
        message: error.response?.data?.message || 'No application found with this reference number.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wizard-container" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '2rem' }}>
      <div className="wizard-header">
        <h1 className="wizard-title">{t('checkStatusPage.title')}</h1>
      </div>

      <div className="wizard-content">
        <form onSubmit={handleCheck} className="space-y-6">
          <div className="field">
            <label className="field-label" htmlFor="reference">{t('checkStatusPage.referenceNumber')}</label>
            <input
              id="reference"
              type="text"
              className="form-control"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder={t('checkStatusPage.referencePlaceholder')}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? '...' : t('checkStatusPage.check')}
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg border ${
              result.status === 'not-found' ? 'bg-red-50 border-red-200 text-red-800' : 
              result.status === 'approved' ? 'bg-green-50 border-green-200 text-green-800' :
              'bg-blue-50 border-blue-200 text-blue-800'
            }`}
            style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '8px', border: '1px solid', backgroundColor: result.status === 'not-found' ? '#fef2f2' : '#eff6ff', borderColor: result.status === 'not-found' ? '#fecaca' : '#bfdbfe', color: result.status === 'not-found' ? '#991b1b' : '#1e3a8a' }}
          >
            <h3 style={{ fontWeight: '600', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Icon name={result.status === 'not-found' ? 'alert-circle' : result.status === 'approved' ? 'check-circle' : 'clock'} size={20} />
              {result.status === 'not-found' ? t('checkStatusPage.status') : t(`checkStatusPage.status${result.status.charAt(0).toUpperCase() + result.status.slice(1)}`)}
            </h3>
            <p style={{ margin: 0 }}>{result.message}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
