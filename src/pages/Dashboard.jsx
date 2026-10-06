import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';
import ExistingCustomerHome from './ExistingCustomerHome';
import { getSession } from '../utils/authSession';

// Customers who already hold an SLT product land on their account home;
// newly registered users still see the catalogue.
export default function Dashboard() {
  return getSession().customerExists ? <ExistingCustomerHome /> : <ProductCatalogPage />;
}
