import api from '../utils/api';

// The catalogue shown to customers doesn't share ids with whatever's actually
// seeded in the real database, so a mock/curated-catalogue id (e.g. 'prod-1')
// can never resolve there — posting one to the backend is guaranteed to fail.
// Skip the network call for those instead of firing a request that's certain
// to error, and go straight to the mock/local fallback.
const isRealObjectId = (id) => typeof id === 'string' && /^[a-f0-9]{24}$/i.test(id);

// Mock data for testing without backend
const mockProducts = [
  {
    productId: '1',
    productCode: 'PRD001',
    productName: 'Fibre Broadband 50Mbps',
    description: 'High-speed fibre internet connection with 50 Mbps download speed',
    category: 'Internet',
    price: 2500,
    availableQuantity: 50,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    status: 'active'
  },
  {
    productId: '2',
    productCode: 'PRD002',
    productName: 'Fibre Broadband 100Mbps',
    description: 'High-speed fibre internet connection with 100 Mbps download speed',
    category: 'Internet',
    price: 4000,
    availableQuantity: 30,
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop',
    status: 'active'
  },
  {
    productId: '3',
    productCode: 'PRD003',
    productName: 'PEO TV Basic Package',
    description: 'Basic TV package with 50+ channels',
    category: 'TV',
    price: 1500,
    availableQuantity: 100,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=300&fit=crop',
    status: 'active'
  },
  {
    productId: '4',
    productCode: 'PRD004',
    productName: 'PEO TV Premium Package',
    description: 'Premium TV package with 100+ channels including HD',
    category: 'TV',
    price: 3000,
    availableQuantity: 75,
    image: 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&h=300&fit=crop',
    status: 'active'
  },
  {
    productId: '5',
    productCode: 'PRD005',
    productName: 'Landline Connection',
    description: 'Fixed landline telephone connection',
    category: 'Voice',
    price: 500,
    availableQuantity: 200,
    image: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=400&h=300&fit=crop',
    status: 'active'
  },
  {
    productId: '6',
    productCode: 'PRD006',
    productName: '4G LTE Router',
    description: 'Wireless router for 4G LTE connection',
    category: 'Equipment',
    price: 8000,
    availableQuantity: 20,
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop',
    status: 'active'
  },
];

// Mock cart storage
let mockCart = {
  items: [],
  totalAmount: 0,
};

export const getProducts = async (params = {}) => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    // Return mock data if backend is unavailable
    console.log('Using mock products data');
    return {
      success: true,
      data: mockProducts,
    };
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    const product = mockProducts.find(p => p.productId === id);
    return {
      success: true,
      data: product || null,
    };
  }
};

export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    console.log('Using mock cart data');
    return {
      success: true,
      data: mockCart,
    };
  }
};

const addToMockCart = (data) => {
  const product = mockProducts.find(p => p.productId === data.productId);
  if (product) {
    const existingItem = mockCart.items.find(item => item.productId === data.productId);
    if (existingItem) {
      existingItem.quantity += data.quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      mockCart.items.push({
        _id: 'item-' + Date.now(),
        productId: product.productId,
        productName: product.productName,
        price: product.price,
        quantity: data.quantity,
        subtotal: product.price * data.quantity,
        availableQuantity: product.availableQuantity,
      });
    }
    mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + item.subtotal, 0);
  } else if (data.customPackage) {
    // Handle custom package from wizard
    const existingItem = mockCart.items.find(item => item.productId === data.productId);
    if (existingItem) {
      existingItem.quantity += data.quantity;
      existingItem.subtotal = existingItem.quantity * existingItem.price;
    } else {
      mockCart.items.push({
        _id: 'item-' + Date.now(),
        productId: data.productId,
        productName: data.customPackage.name,
        price: data.customPackage.price,
        quantity: data.quantity,
        subtotal: data.customPackage.price * data.quantity,
        availableQuantity: 999,
      });
    }
    mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }
  return {
    success: true,
    message: 'Product added to cart successfully',
    data: mockCart,
  };
};

export const addToCart = async (data) => {
  // Curated-catalogue ids never exist in the real DB — go straight to the
  // mock/local cart instead of firing a request that's certain to 500.
  if (!isRealObjectId(data.productId)) {
    return addToMockCart(data);
  }
  try {
    const response = await api.post('/cart/add', data);
    return response.data;
  } catch (error) {
    return addToMockCart(data);
  }
};

const updateMockCartItem = (data) => {
  const item = mockCart.items.find(i => i.productId === data.productId);
  if (item) {
    item.quantity = data.quantity;
    item.subtotal = item.quantity * item.price;
    mockCart.totalAmount = mockCart.items.reduce((sum, i) => sum + i.subtotal, 0);
  }
  return {
    success: true,
    message: 'Cart updated successfully',
    data: mockCart,
  };
};

export const updateCartItem = async (data) => {
  if (!isRealObjectId(data.productId)) {
    return updateMockCartItem(data);
  }
  try {
    const response = await api.put('/cart/update', data);
    return response.data;
  } catch (error) {
    return updateMockCartItem(data);
  }
};

const removeMockCartItem = (itemId) => {
  mockCart.items = mockCart.items.filter(item => item._id !== itemId);
  mockCart.totalAmount = mockCart.items.reduce((sum, item) => sum + item.subtotal, 0);
  return {
    success: true,
    message: 'Item removed from cart',
    data: mockCart,
  };
};

export const removeCartItem = async (itemId) => {
  if (!isRealObjectId(itemId)) {
    return removeMockCartItem(itemId);
  }
  try {
    const response = await api.delete(`/cart/remove/${itemId}`);
    return response.data;
  } catch (error) {
    return removeMockCartItem(itemId);
  }
};

export const clearCart = async () => {
  try {
    const response = await api.delete('/cart/clear');
    return response.data;
  } catch (error) {
    console.log('Using mock clear cart');
    mockCart = {
      items: [],
      totalAmount: 0,
    };
    return {
      success: true,
      message: 'Cart cleared successfully',
      data: mockCart,
    };
  }
};
