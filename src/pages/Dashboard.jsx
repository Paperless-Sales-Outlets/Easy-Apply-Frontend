import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';
import ResumeDraftBanner from '../components/ResumeDraftBanner';

export default function Dashboard() {
  return (
    <>
      <ResumeDraftBanner />
      <ProductCatalogPage />
    </>
  );
}
