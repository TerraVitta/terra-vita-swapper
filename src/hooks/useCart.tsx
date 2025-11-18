import { useCartContext } from '@/contexts/CartContext';
import type { CartItem } from '@/types/cart';

export type { CartItem };

export function useCart() {
  return useCartContext();
}
