import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/layout'

const HomePage = lazy(() => import('./pages/home'))
const ShopPage = lazy(() => import('./pages/shop'))
const BlogPage = lazy(() => import('./pages/blog'))
const ProductDetailPage = lazy(() => import('./pages/product-detail'))
const BlogDetailPage = lazy(() => import('./pages/blog-detail'))
const CartPage = lazy(() => import('./pages/cart'))
const PurposeSubscriptionPage = lazy(() => import('./pages/purpose-subscription'))
const CheckoutPage = lazy(() => import('./pages/checkout'))
const CheckoutSuccessPage = lazy(() => import('./pages/checkout-success'))
const OrderTrackingPage = lazy(() => import('./pages/order-tracking'))
const LoginPage = lazy(() => import('./pages/login'))
const RegisterPage = lazy(() => import('./pages/register'))
const ProfilePage = lazy(() => import('./pages/profile'))
const PrivacyPolicyPage = lazy(() => import('./pages/privacy-policy'))
const TermsOfServicePage = lazy(() => import('./pages/terms-of-service'))

const LoadingFallback = () => (
  <div className="min-h-[55vh] bg-background flex items-center justify-center">
    <span className="text-sm font-medium text-stone-500">Đang tải nội dung...</span>
  </div>
)

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/goi-dinh-ky" element={<PurposeSubscriptionPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

