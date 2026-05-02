// lib/cart.ts
// localStorage cart utility — no server required, no login needed
// Dispatches custom events so any component can react to cart changes

import type { CartItem, Product } from '@/types/shop';

const CART_KEY = 'th_coin_cart';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/** Read the current cart from localStorage. */
export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/** Persist the cart and broadcast a change event. */
function saveCart(items: CartItem[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { items } }));
}

/** Total number of items (summing quantities). */
export function getCartCount(): number {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
}

/** Add a product or increment its quantity. */
export function addToCart(product: Product, quantity = 1): CartItem[] {
  const items = getCart();
  const existing = items.find((i) => i.product.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ product, quantity });
  }

  saveCart(items);
  return items;
}

/** Set an item's quantity. quantity <= 0 removes the item. */
export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  let items = getCart();
  if (quantity <= 0) {
    items = items.filter((i) => i.product.id !== productId);
  } else {
    const item = items.find((i) => i.product.id === productId);
    if (item) item.quantity = quantity;
  }
  saveCart(items);
  return items;
}

/** Remove an item entirely. */
export function removeFromCart(productId: string): CartItem[] {
  const items = getCart().filter((i) => i.product.id !== productId);
  saveCart(items);
  return items;
}

/** Clear everything. */
export function clearCart(): void {
  saveCart([]);
}

/** Subtotal in dollars. */
export function getCartSubtotal(items?: CartItem[]): number {
  return (items ?? getCart()).reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/** Shipping cost: free over $200, otherwise $9.99 for physical, $0 for digital. */
export function getShippingCost(items?: CartItem[]): number {
  const cart = items ?? getCart();
  const allDigital = cart.every((i) => i.product.isDigital);
  if (allDigital) return 0;
  const subtotal = getCartSubtotal(cart);
  return subtotal >= 200 ? 0 : 9.99;
}

/** Order total = subtotal + shipping. */
export function getCartTotal(items?: CartItem[]): number {
  const cart = items ?? getCart();
  return getCartSubtotal(cart) + getShippingCost(cart);
}

/** Build a Stripe line_items-compatible payload from the cart. */
export function cartToStripeItems(items?: CartItem[]) {
  return (items ?? getCart()).map((item) => ({
    price_data: {
      currency: 'usd',
      unit_amount: Math.round(item.product.price * 100),
      product_data: {
        name: item.product.title,
        description: `${item.product.metal ?? ''} ${item.product.weight ?? ''} ${item.product.purity ?? ''}`.trim() || item.product.description.slice(0, 120),
        images: item.product.images[0]?.src
          ? [`https://timelesshadith.com${item.product.images[0].src}`]
          : [],
        metadata: { productId: item.product.id, sku: item.product.sku },
      },
    },
    quantity: item.quantity,
  }));
}
