import React from 'react';
import ProductCatalogPage from './ProductCatalogPage';
import ResumeDraftBanner from '../components/ResumeDraftBanner';

/** Signed-in customer home. */
export default function Dashboard() {
  return (
    <>
      <ResumeDraftBanner />
      <ProductCatalogPage />
    </>
  );
}
