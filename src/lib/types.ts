/** Shared domain types for the Mana storefront. */

import type { PaymentMethod } from "./payment";

export type CategorySlug =
  | "home"
  | "music"
  | "phone"
  | "storage"
  | "other"
  | string;

export interface Category {
  slug: string;
  name: string;
  label: string;
  icon: string;
  sort_order: number;
}

export interface Product {
  id?: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  /** Human readable category name, used for the badge on a product card. */
  category_name: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  reviews_count: number;
  image_url: string;
  stock: number;
  is_new: boolean;
  is_best_seller: boolean;
  sort_index?: number;
  created_at: string;
}

/** Collections exposed by the left hand rail of the shop page. */
export type Collection = "all" | "new" | "best" | "discount";

export type SortKey =
  | "recommended"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "rating";

export interface ProductQuery {
  q?: string;
  category?: string;
  collection?: Collection;
  sort?: SortKey;
  page?: number;
  perPage?: number;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageCount: number;
  perPage: number;
  /** Where the rows came from - handy while the Supabase project is empty. */
  source: "supabase" | "catalog";
}

export interface CartLine {
  slug: string;
  name: string;
  price: number;
  image_url: string;
  quantity: number;
  stock: number;
}

export interface CheckoutCustomer {
  email: string;
  full_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
  notes?: string;
}

export interface CheckoutPayload {
  customer: CheckoutCustomer;
  lines: Array<{ slug: string; quantity: number }>;
  payment_method: PaymentMethod;
  shipping_method: "standard" | "express";
}

export interface OrderItem {
  id?: string;
  product_slug: string;
  product_name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface Order {
  id?: string;
  order_number: string;
  user_id?: string | null;
  email: string;
  full_name: string;
  phone: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string | null;
  postal_code: string;
  country: string;
  subtotal: number;
  shipping_fee: number;
  tax_total: number;
  discount_total: number;
  total: number;
  status: OrderStatus;
  payment_method: string;
  shipping_method: string;
  notes: string | null;
  created_at?: string;
  order_items?: OrderItem[];
}

export interface Pricing {
  subtotal: number;
  shipping_fee: number;
  tax_total: number;
  discount_total: number;
  total: number;
}

export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}
