import api from '../utils/api';

/**
 * Creates a payment session by sending appointment/service details to the backend API.
 * Triggers POST /api/payment/create
 *
 * @param {Object} paymentData Information about the service or appointment being paid for.
 * @returns {Promise<Object>} Object containing merchant_id, order_id, amount, currency, hash, and optional customer fields.
 */
export const createPayment = async (paymentData = {}) => {
  const response = await api.post('/payment/create', paymentData);
  return response.data;
};

export default {
  createPayment,
};
