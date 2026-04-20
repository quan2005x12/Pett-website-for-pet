import { useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useCart } from '../context/cartContext'

const navItems = [
  { label: 'Cửa hàng', to: '/shop' },
  { label: 'Blog', to: '/blog' },
  { label: 'Gói định kỳ', to: '/goi-dinh-ky' },
]

import { useAuth } from '../context/authContext'

function AppHeader() {
  const { getTotalItems } = useCart()
  const cartCount = getTotalItems()
  const { user } = useAuth()

  const scrollToTop = () => {
    window.scrollTo(0, 0)
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-[#fbfaee] shadow-sm shadow-stone-200/20">
      <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
        <NavLink
          to="/"
          onClick={scrollToTop}
          className="text-4xl font-black tracking-tighter text-teal-700 font-headline uppercase hover:opacity-90 transition-opacity"
        >
          PETT
        </NavLink>
        
        <div className="hidden md:flex items-center gap-10 font-headline font-bold text-stone-600">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={scrollToTop}
              className={({ isActive }) =>
                `text-sm tracking-tight transition-colors duration-200 ${
                  isActive
                    ? 'text-teal-500'
                    : 'hover:text-teal-500'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <NavLink
            to="/cart"
            onClick={scrollToTop}
            className="p-2 text-teal-700 hover:bg-stone-100/50 rounded-full transition-all active:scale-90 relative"
            aria-label="Giỏ hàng"
          >
            <span className="material-symbols-outlined text-[24px] font-medium">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-secondary-container text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                {cartCount}
              </span>
            )}
          </NavLink>
          
          <NavLink
            to={user ? "/profile" : "/login"}
            onClick={scrollToTop}
            className="p-2 text-stone-600 hover:bg-stone-100/50 rounded-full transition-all active:scale-90"
            aria-label="Tài khoản"
          >
            <span className="material-symbols-outlined text-[24px] font-medium">person</span>
          </NavLink>
        </div>
      </nav>
    </header>
  )
}

function AppFooter() {
  const scrollToTop = () => {
    window.scrollTo(0, 0)
  }

  return (
    <footer className="bg-white w-full py-12">
      <div className="max-w-7xl mx-auto px-12 flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <p className="text-sm font-light leading-relaxed text-stone-500">© 2024 PETT.</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm font-light leading-relaxed">
          <Link className="text-stone-500 hover:text-teal-500 transition-colors" to="/privacy-policy" onClick={scrollToTop}>Chính sách bảo mật</Link>
          <Link className="text-stone-500 hover:text-teal-500 transition-colors" to="/terms-of-service" onClick={scrollToTop}>Điều khoản dịch vụ</Link>
        </div>

        <div className="flex gap-4">
          <a href="mailto:mahoangvuhy2k5@gmail.com" className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center cursor-pointer hover:bg-teal-500 hover:text-white transition-all">
            <span className="material-symbols-outlined text-xl">mail</span>
          </a>
        </div>
      </div>
    </footer>
  )
}

export default function Layout({ children }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const isStitchScreen =
    pathname === '/' || pathname === '/shop' || pathname.startsWith('/product/')
    || pathname === '/goi-dinh-ky' || pathname === '/blog' || pathname.startsWith('/blog/')
    || pathname === '/cart' || pathname === '/checkout' || pathname.startsWith('/checkout/')
    || pathname === '/order-tracking' || pathname === '/login' || pathname === '/register'

  if (isStitchScreen) {
    return <div className="min-h-screen bg-background">{children}</div>
  }

  return (
    <div className="min-h-screen bg-surface pt-20">
      <AppHeader />
      <main>{children}</main>
      <AppFooter />
    </div>
  )
}


