// User types
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  default_shipping_address?: Address
  default_billing_address?: Address
  created_at: string
}

export interface Address {
  first_name: string
  last_name: string
  address: string
  address2?: string
  city: string
  state: string
  zip: string
  country: string
  phone?: string
}

// Product types
export interface Product {
  id: number
  name: string
  slug: string
  description: string
  short_description?: string
  price: number
  compare_price?: number
  discount_percentage: number
  sku: string
  stock: number
  in_stock: boolean
  low_stock: boolean
  images: string[]
  primary_image?: string
  attributes?: Record<string, unknown>
  featured: boolean
  category?: Category
  rating: {
    average: number
    count: number
  }
  reviews?: Review[]
  created_at: string
}

export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  image?: string
  parent_id?: number
  sort_order: number
  product_count?: number
  children?: Category[]
  parent?: Category
}

// Cart types
export interface CartItem {
  id: number
  product_id: number
  quantity: number
  options?: Record<string, unknown>
  subtotal: number
  is_available: boolean
  product: Product
  created_at: string
  updated_at: string
}

export interface CartSummary {
  item_count: number
  subtotal: number
  tax: number
  shipping: number
  total: number
  free_shipping_threshold: number
  amount_to_free_shipping: number
}

export interface Cart {
  items: CartItem[]
  summary: CartSummary
}

// Order types
export interface Order {
  id: number
  order_number: string
  status: OrderStatus
  status_label: string
  status_color: string
  subtotal: number
  discount: number
  tax: number
  shipping: number
  total: number
  coupon_code?: string
  shipping_address: Address
  billing_address: Address
  notes?: string
  tracking_number?: string
  item_count: number
  items: OrderItem[]
  can_cancel: boolean
  shipped_at?: string
  delivered_at?: string
  created_at: string
  updated_at: string
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'

export interface OrderItem {
  id: number
  product_id: number
  product_name: string
  product_sku: string
  price: number
  quantity: number
  total: number
  options?: Record<string, unknown>
  product?: Product
}

// Review types
export interface Review {
  id: number
  rating: number
  title?: string
  comment: string
  verified_purchase: boolean
  approved: boolean
  user: {
    id: number
    name: string
  }
  product?: Product
  created_at: string
}

export interface ReviewSummary {
  average_rating: number
  total_reviews: number
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
}

// Coupon types
export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discount: number
  description?: string
}

// API Response types
export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
    from?: number
    to?: number
  }
  links?: {
    first: string
    last: string
    prev?: string
    next?: string
  }
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
  remember?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
  message: string
}

// Checkout types
export interface CheckoutData {
  shipping_address: Address
  billing_address: Address
  billing_same_as_shipping: boolean
  coupon_code?: string
  notes?: string
}

export interface PaymentIntentResponse {
  client_secret: string
  order_id: number
  order_number: string
  totals: {
    subtotal: number
    discount: number
    tax: number
    shipping: number
    total: number
  }
}
