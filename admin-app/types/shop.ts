// types/shop.ts
// Timeless Hadith — Premium Coin Shop Type Definitions

export type ProductBadge = 'bestseller' | 'new' | 'limited' | 'sale';

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  currency: string;
  images: ProductImage[];
  category: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  badge?: ProductBadge;
  tags: string[];
  inStock: boolean;
  isDigital: boolean;
  freeShipping: boolean;
  sku: string;
  // Coin-specific fields
  metal?: string;        // 'Silver' | 'Gold' | 'Platinum'
  weight?: string;       // '1 oz' | '1/2 oz' etc.
  purity?: string;       // '.999' | '.9999' | '.9167 (22k)'
  year?: number;
  mintage?: string;      // e.g. '500,000' or 'Unlimited'
  condition?: string;    // 'Brilliant Uncirculated' | 'Proof' | 'Antique Finish'
}

export interface Category {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: ProductImage;
  productCount: number;
  featured: boolean;
  icon?: string;
}

export interface Review {
  id: string;
  authorName: string;
  authorLocation: string;
  authorAvatar?: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  productId?: string;
  productTitle?: string;
}

export interface ShopMeta {
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
  keywords: string[];
}

export type SortOption = 'popular' | 'newest' | 'price-asc' | 'price-desc' | 'rating';

export interface FilterState {
  category: string | null;
  priceMin: number | null;
  priceMax: number | null;
  sort: SortOption;
  search: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface NewsletterPayload {
  email: string;
  firstName?: string;
  interests?: string[];
}

export type ShippingRegion = 'domestic' | 'international' | 'digital';

export interface ShippingInfo {
  region: ShippingRegion;
  estimatedDays: number;
  cost: number;
  freeThreshold?: number;
}
