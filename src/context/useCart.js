import { createContext, useContext } from 'react';

/**
 * The cart context and its hook live here, separate from CartProvider.
 *
 * React Fast Refresh only preserves state for modules that export components
 * exclusively — a module exporting both `CartProvider` and `useCart` gets
 * invalidated on every edit, forcing a full page reload during development.
 */
export const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
