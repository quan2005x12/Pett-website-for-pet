import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext'

const STORAGE_KEYS = {
  CART: 'pett_stitch_cart_v2',
  ORDER: 'pett_stitch_order_v1',
}

const BRAND_COLORS = {
  PRIMARY: '#14b8a6',
  BACKGROUND: '#fbfaee',
}

const normalizeString = (value) => 
  value
    ?.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim() || ''

export default function StitchScreenFrame({ html, title, fitContent = true }) {
  const iframeRef = useRef(null)
  const { loginWithGoogle } = useAuth()

  const formatVnd = (value) => `${Math.max(0, Math.round(value)).toLocaleString('vi-VN')}đ`

  const loadStitchCartItems = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
      if (!Array.isArray(parsed)) return []
      return parsed.filter((item) => item && item.source === 'shop-stitch')
    } catch {
      return []
    }
  }

  const clearStitchCartItems = () => {
    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify([]))
      return true
    } catch {
      return false
    }
  }

  const makeOrderCode = () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const d = String(now.getDate()).padStart(2, '0')
    const tail = String(now.getTime()).slice(-4)
    return `PETT-${y}${m}${d}-${tail}`
  }

  const buildOrderSnapshot = (checkoutDoc) => {
    const items = loadStitchCartItems()
      .map((item) => {
        const quantity = Number(item.quantity) > 0 ? Number(item.quantity) : 1
        const unitPrice = Number(item.price) > 0 ? Number(item.price) : 0
        return {
          id: item.id,
          name: item.name || 'Sản phẩm',
          description: item.description || '',
          image: item.image || '/images/pett-bag.webp',
          quantity,
          unitPrice,
          lineTotal: unitPrice * quantity,
        }
      })
      .filter((item) => item.quantity > 0)

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0)
    const shipping = subtotal >= 500000 || subtotal === 0 ? 0 : 30000
    const discount = 0
    const total = subtotal + shipping - discount

    const getValueById = (id) => {
      const value = checkoutDoc?.getElementById(id)?.value
      return typeof value === 'string' ? value.trim() : ''
    }

    const getSelectedLabelById = (id) => {
      const field = checkoutDoc?.getElementById(id)
      const index = field?.selectedIndex
      if (typeof index !== 'number' || index < 0) return ''
      return field?.options?.[index]?.text?.trim() || ''
    }

    const deliveryName = getValueById('checkout-contact-name')
    const deliveryPhone = getValueById('checkout-contact-phone')
    const addressLine = getValueById('checkout-address-line')
    const districtLabel = getSelectedLabelById('checkout-address-district')
    const cityLabel = getSelectedLabelById('checkout-address-city')
    const deliveryAddress = [addressLine, districtLabel, cityLabel].filter(Boolean).join(', ')

    const cardOption = checkoutDoc?.getElementById('checkout-payment-card')
    const paymentLabel = cardOption?.checked
      ? 'Thanh toán qua thẻ (Visa/Mastercard/JCB)'
      : 'Thanh toán khi nhận hàng (COD)'

    return {
      orderCode: makeOrderCode(),
      createdAt: new Date().toISOString(),
      paymentLabel,
      deliveryName,
      deliveryPhone,
      deliveryAddress,
      shippingLabel: shipping === 0 ? 'Miễn phí' : formatVnd(shipping),
      subtotal,
      shipping,
      discount,
      total,
      items,
    }
  }

  const persistOrderSnapshot = (checkoutDoc) => {
    try {
      const snapshot = buildOrderSnapshot(checkoutDoc)
      localStorage.setItem(STORAGE_KEYS.ORDER, JSON.stringify(snapshot))
      return snapshot
    } catch {
      return null
    }
  }

  const getOrderSnapshot = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDER) || 'null')
      if (!parsed || !Array.isArray(parsed.items)) return null
      return parsed
    } catch {
      return null
    }
  }

  const ensureOrderSnapshot = () => getOrderSnapshot() || persistOrderSnapshot()

  const findTextNode = (doc, selector, text) => {
    const target = normalizeString(text)
    return Array.from(doc.querySelectorAll(selector)).find((node) => normalizeString(node.textContent || '') === target)
  }

  const applySuccessOrderData = (doc, order) => {
    if (!order || !Array.isArray(order.items)) return

    const orderCodeText = doc.querySelector('span.font-bold.text-on-surface')
    if (orderCodeText && /PETT-\d{8}-\d{4}|PETT-\d{6}-\d{4}|PETT-/i.test(orderCodeText.textContent || '')) {
      orderCodeText.textContent = order.orderCode
    }

    const productsHeading = findTextNode(doc, 'h2,h3', 'Sản phẩm')
    const productsCard = productsHeading?.closest('div')
    const productsList = productsCard?.querySelector('.flex.flex-col.gap-4')
    if (productsList) {
      productsList.innerHTML = order.items.map((item) => `
        <div class="flex items-center gap-4 bg-surface-container-low p-4 rounded-lg">
          ${(() => {
            const isSubscription = item.category === 'subscription'
              || (typeof item.id === 'string' && item.id.startsWith('plan-'))
              || (typeof item.name === 'string' && item.name.startsWith('Gói'))
            if (isSubscription || !item.image) return ''
            return `<img alt="${item.name}" class="w-20 h-20 object-cover rounded-md" src="${item.image}"/>`
          })()}
          <div class="grow">
            <h3 class="font-headline font-bold text-on-surface">${item.name}</h3>
            <p class="text-sm text-on-surface-variant">${item.description || ''}</p>
            <div class="mt-1 text-sm">SL: <span class="font-medium">${item.quantity}</span></div>
          </div>
          <div class="font-bold text-on-surface whitespace-nowrap">${formatVnd(item.lineTotal)}</div>
        </div>
      `).join('')
    }

    const paymentHeading = findTextNode(doc, 'h2,h3', 'Chi tiết thanh toán')
    const paymentCard = paymentHeading?.closest('div')
      if (paymentCard) {
      const setAmountByLabel = (labelText, value) => {
        const labelNode = Array.from(paymentCard.querySelectorAll('span')).find((span) => normalizeString(span.textContent || '') === normalizeString(labelText))
        const row = labelNode?.closest('.flex.justify-between')
        const valueNode = row?.querySelector('span:last-child')
        if (valueNode) valueNode.textContent = value
      }

      setAmountByLabel('Tạm tính', formatVnd(order.subtotal))
      setAmountByLabel('Phí giao hàng', order.shipping === 0 ? 'Miễn phí' : formatVnd(order.shipping))
      setAmountByLabel('Giảm giá', `-${formatVnd(order.discount)}`)

      const totalLabel = Array.from(paymentCard.querySelectorAll('span')).find((span) => normalizeString(span.textContent || '') === normalizeString('Tổng cộng'))
      const totalRow = totalLabel?.closest('.flex.justify-between.items-center')
      const totalValue = totalRow?.querySelector('span:last-child')
      if (totalValue) totalValue.textContent = formatVnd(order.total)

      const paymentInfo = Array.from(paymentCard.querySelectorAll('div')).find((div) => normalizeString(div.textContent || '').includes(normalizeString('thanh toan qua the')) || normalizeString(div.textContent || '').includes(normalizeString('thanh toan khi nhan hang')))
      if (paymentInfo) {
        const icon = paymentInfo.querySelector('.material-symbols-outlined')
        paymentInfo.textContent = ` ${order.paymentLabel}`
        if (icon) {
          paymentInfo.prepend(icon)
          icon.classList.add('text-sm')
        }
      }
    }

    const deliveryNameNode = doc.getElementById('success-delivery-name')
    if (deliveryNameNode && order.deliveryName) {
      deliveryNameNode.textContent = order.deliveryName
    }

    const deliveryPhoneNode = doc.getElementById('success-delivery-phone')
    if (deliveryPhoneNode && order.deliveryPhone) {
      deliveryPhoneNode.textContent = order.deliveryPhone
    }

    const deliveryAddressNode = doc.getElementById('success-delivery-address')
    if (deliveryAddressNode && order.deliveryAddress) {
      deliveryAddressNode.textContent = order.deliveryAddress
    }
  }

  const applyTrackingOrderData = (doc, order) => {
    if (!order || !Array.isArray(order.items)) return

    const orderCodeNode = Array.from(doc.querySelectorAll('span.font-bold.text-on-surface')).find((span) => /#?PETT-/i.test(span.textContent || ''))
    if (orderCodeNode) {
      orderCodeNode.textContent = `#${order.orderCode}`
    }

    const productsHeading = findTextNode(doc, 'h2,h3', 'Sản phẩm trong đơn')
    const productsCard = productsHeading?.closest('div')
    const productsList = productsCard?.querySelector('.flex.flex-col.gap-4')
    if (productsList) {
      productsList.innerHTML = order.items.map((item) => `
        <div class="flex items-center gap-4 bg-surface-container-lowest p-3 rounded-2xl">
          ${(() => {
            const isSubscription = item.category === 'subscription'
              || (typeof item.id === 'string' && item.id.startsWith('plan-'))
              || (typeof item.name === 'string' && item.name.startsWith('Gói'))
            if (isSubscription || !item.image) return ''
            return `<div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-container shrink-0"><img alt="${item.name}" class="w-full h-full object-cover" src="${item.image}"/></div>`
          })()}
          <div class="flex-1">
            <h4 class="font-headline font-bold text-on-surface line-clamp-1">${item.name}</h4>
            <p class="text-sm text-on-surface-variant mt-1">${item.description || ''}</p>
            <p class="font-bold text-primary mt-2">x${item.quantity}</p>
          </div>
          <div class="font-bold text-on-surface whitespace-nowrap">${formatVnd(item.lineTotal)}</div>
        </div>
      `).join('')
    }
  }

  const hydrateOrderViews = (doc) => {
    const order = ensureOrderSnapshot()
    if (!order) return

    const pageTitle = normalizeString(doc.title || '')
    if (pageTitle.includes('thanh toan thanh cong')) {
      applySuccessOrderData(doc, order)
      return
    }
    if (pageTitle.includes('theo doi don hang')) {
      applyTrackingOrderData(doc, order)
    }
  }

  const getStoredCartCount = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
      if (!Array.isArray(parsed)) return 0
      return parsed
        .filter((item) => item && item.source === 'shop-stitch')
        .reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
    } catch {
      return 0
    }
  }

  const paintCartBadge = (doc) => {
    if (!doc) return
    const count = getStoredCartCount()
    const cartButtons = Array.from(doc.querySelectorAll('button, a')).filter((node) => {
      const text = normalizeString(node.textContent || '')
      const route = node.getAttribute('data-route') || node.getAttribute('href') || ''
      const isCartLink = route.startsWith('/cart')
      return isCartLink || text.includes('shopping_bag') || (text.includes('shopping_cart') && !text.includes('add_shopping_cart'))
    })

    cartButtons.forEach((button) => {
      button.style.position = button.style.position || 'relative'

      let badge = button.querySelector('[data-cart-badge]')
      if (!badge) {
        badge = doc.createElement('span')
        badge.setAttribute('data-cart-badge', 'true')
        badge.style.position = 'absolute'
        badge.style.top = '-4px'
        badge.style.right = '-4px'
        badge.style.minWidth = '18px'
        badge.style.height = '18px'
        badge.style.padding = '0 5px'
        badge.style.borderRadius = '9999px'
        badge.style.display = 'none'
        badge.style.alignItems = 'center'
        badge.style.justifyContent = 'center'
        badge.style.background = '#14b8a6'
        badge.style.color = '#ffffff'
        badge.style.fontSize = '11px'
        badge.style.fontWeight = '700'
        badge.style.lineHeight = '1'
        button.appendChild(badge)
      }

      if (count > 0) {
        badge.textContent = count > 99 ? '99+' : String(count)
        badge.style.display = 'inline-flex'
      } else {
        badge.style.display = 'none'
      }
    })
  }

  const optimizeEmbeddedMedia = (doc) => {
    if (!doc) return

    const viewportHeight = Math.max(window.innerHeight || 0, 1)
    const images = Array.from(doc.querySelectorAll('img'))

    images.forEach((img, index) => {
      if (!img.getAttribute('decoding')) img.setAttribute('decoding', 'async')

      const rect = img.getBoundingClientRect()
      const isEarlyImage = index < 2
      const isNearViewport = rect.top < viewportHeight * 1.2
      if (isEarlyImage || isNearViewport) return

      if (!img.getAttribute('loading')) img.setAttribute('loading', 'lazy')
      if (!img.getAttribute('fetchpriority')) img.setAttribute('fetchpriority', 'low')
    })

    const videos = Array.from(doc.querySelectorAll('video'))
    videos.forEach((video) => {
      if (!video.hasAttribute('preload')) {
        video.setAttribute('preload', video.hasAttribute('autoplay') ? 'auto' : 'metadata')
      }
      if (!video.hasAttribute('playsinline')) video.setAttribute('playsinline', '')
    })
  }

  const getViewportHeight = () => {
    if (typeof window === 'undefined') return 900
    return Math.max(window.innerHeight || document.documentElement?.clientHeight || 0, 1)
  }

  const [height, setHeight] = useState(getViewportHeight)
  const navigate = useNavigate()

  useEffect(() => {
    // Reset scroll positions whenever the stitched HTML changes.
    window.scrollTo(0, 0)
    // Also reset the iframe's internal scroll when it's ready
    const iframe = iframeRef.current
    if (iframe) {
      try {
        iframe.contentWindow?.scrollTo(0, 0)
        if (iframe.contentDocument?.body) {
          iframe.contentDocument.body.scrollTop = 0
          iframe.contentDocument.documentElement.scrollTop = 0
        }
      } catch {
        // cross-origin guard
      }
    }
  }, [html])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return
    let resizeObserver = null

    const syncParentViewport = (doc) => {
      const parentViewportHeight = Math.max(window.innerHeight || 0, 1)
      doc.documentElement.style.setProperty('--pett-parent-vh', `${Math.round(parentViewportHeight)}px`)
    }

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument
        if (!doc) return
        syncParentViewport(doc)

        // In viewport mode, keep iframe locked to the parent viewport height
        // so sticky/fixed elements inside stitched HTML stay pinned to the top.
        if (!fitContent) {
          setHeight(getViewportHeight())
          return
        }

        const measuredHeight = Math.max(
          doc.body?.scrollHeight || 0,
          doc.body?.offsetHeight || 0,
          doc.documentElement?.scrollHeight || 0,
          doc.documentElement?.offsetHeight || 0,
        )
        if (measuredHeight <= 0) return
        if (measuredHeight > 0) setHeight(measuredHeight)
      } catch {
        // Ignore sizing errors; fallback height is used.
      }
    }

    const onLoad = () => {
      // Scroll iframe internals to top on every fresh load
      try {
        iframe.contentWindow?.scrollTo(0, 0)
        if (iframe.contentDocument?.body) {
          iframe.contentDocument.body.scrollTop = 0
          iframe.contentDocument.documentElement.scrollTop = 0
        }
      } catch {
        // cross-origin guard
      }
      updateHeight()
      requestAnimationFrame(updateHeight)
      setTimeout(updateHeight, 200)
      setTimeout(updateHeight, 800)

      try {
        const doc = iframe.contentDocument
        if (!doc) return
        optimizeEmbeddedMedia(doc)
        paintCartBadge(doc)

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(updateHeight)
          resizeObserver.observe(doc.documentElement)
          if (doc.body) resizeObserver.observe(doc.body)
        }

        const inferRouteFromText = (label) => {
          const text = normalizeString(label || '')
          if (!text) return null

          if (
            text.includes('thanh toan ngay') ||
            text.includes('tien hanh thanh toan') ||
            text.includes('den trang thanh toan')
          ) return '/checkout'

          if (text.includes('dat hang ngay')) return '/checkout/success'
          if (text.includes('quay lai gio hang')) return '/cart'
          if (text.includes('theo doi don hang')) return '/order-tracking'
          if (text.includes('mua lai don nay')) return '/shop'

          if (
            text.includes('shopping_cart') ||
            text.includes('shopping_bag') ||
            text.includes('gio hang') ||
            text.includes('cart')
          ) return '/cart'

          if (
            text.includes('xem tat ca') ||
            text.includes('mua bo suu tap') ||
            text.includes('kham pha tat ca san pham') ||
            text.includes('mua toan bo san pham') ||
            text.includes('xem nhanh') ||
            text.includes('san pham') ||
            text.includes('cua hang')
          ) return '/shop'

          if (
            text.includes('goi dinh ky') ||
            text.includes('dang ky ngay') ||
            text.includes('chon goi') ||
            text.includes('tuy chinh hop') ||
            text.includes('bat dau ngay') ||
            text.includes('tim hieu them')
          ) return '/goi-dinh-ky'

          if (
            text.includes('doc them') ||
            text.includes('doc tiep') ||
            text.includes('doc moi') ||
            text.includes('blog')
          ) return '/blog'

          if (text.includes('chinh sach bao mat')) return '/privacy-policy'
          if (text.includes('dieu khoan dich vu')) return '/terms-of-service'

          return null
        }

        const parseProductPrice = (label) => {
          const text = (label || '').trim().toLowerCase()
          const digits = text.replace(/[^\d.]/g, '')
          if (!digits) return 0
          
          let value = 0
          if (text.includes('$')) {
            const usd = Number.parseFloat(digits)
            value = Number.isFinite(usd) ? Math.round(usd * 1000) : 0
          } else {
            value = Number.parseInt(digits.replace(/\./g, ''), 10)
          }

          // Handle 'k' notation (e.g., 499k -> 499000)
          if (text.includes('k') && value < 10000) {
            value *= 1000
          }
          
          return Number.isFinite(value) ? value : 0
        }

        const persistStitchCartItem = (item) => {
          try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
            const next = Array.isArray(current)
              ? current.filter((entry) => entry && entry.source === 'shop-stitch')
              : []

            const existing = next.find((entry) => entry.id === item.id)
            if (existing) {
              existing.quantity += item.quantity
            } else {
              next.push({ ...item, source: 'shop-stitch' })
            }
            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(next))
            localStorage.removeItem('pett_cart_subscription')
            paintCartBadge(doc)
          } catch {
            // Ignore storage errors
          }
        }

        const persistSubscriptionPlanItem = (buttonNode) => {
          if (!buttonNode) return

          const id = buttonNode.getAttribute('data-subscription-id')?.trim()
          const name = buttonNode.getAttribute('data-subscription-name')?.trim() || 'Gói định kỳ PETT'
          const description = buttonNode.getAttribute('data-subscription-description')?.trim() || 'Gói chăm sóc theo tháng'
          const image = buttonNode.getAttribute('data-subscription-image')?.trim() || '/images/pett-bag.webp'
          const rawPrice = buttonNode.getAttribute('data-subscription-price') || '0'
          const price = parseInt(rawPrice.replace(/[^\d]/g, ''), 10)

          if (!id || !Number.isFinite(price) || price <= 0) return

          try {
            const current = JSON.parse(localStorage.getItem(STORAGE_KEYS.CART) || '[]')
            const valid = Array.isArray(current)
              ? current.filter((entry) => entry && entry.source === 'shop-stitch')
              : []

            const next = valid.filter((entry) => entry.category !== 'subscription')
            next.push({
              id,
              name,
              description,
              price,
              priceLabel: formatVnd(price),
              image,
              quantity: 1,
              category: 'subscription',
              source: 'shop-stitch',
            })

            localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(next))
            paintCartBadge(doc)
          } catch {
            // Ignore storage errors
          }
        }

        const isElementNode = (node) => Boolean(node && node.nodeType === 1 && typeof node.closest === 'function')

        const getEventElement = (event) => {
          const target = event?.target
          if (isElementNode(target)) return target
          if (target?.nodeType === 3 && isElementNode(target.parentElement)) return target.parentElement
          if (typeof event?.composedPath === 'function') {
            const firstElementInPath = event.composedPath().find((node) => isElementNode(node))
            if (firstElementInPath) return firstElementInPath
          }
          return null
        }

        const closestFromEvent = (event, selector) => {
          const element = getEventElement(event)
          return element ? element.closest(selector) : null
        }

        const normalizeInternalRoute = (rawRoute) => {
          if (!rawRoute) return null
          const route = rawRoute.trim()
          if (!route || route.startsWith('#')) return null

          const isExternalProtocol = /^(mailto:|tel:|javascript:)/i.test(route)
          if (isExternalProtocol) return null

          if (route.startsWith('/')) return route

          if (/^https?:\/\//i.test(route)) {
            try {
              const parsed = new URL(route, window.location.origin)
              if (parsed.origin !== window.location.origin) return null
              return `${parsed.pathname}${parsed.search}${parsed.hash}`
            } catch {
              return null
            }
          }

          return null
        }

        const navigateInternal = (event, route) => {
          if (!route || !route.startsWith('/')) return false
          event.preventDefault()
          event.stopPropagation()
          navigate(route)
          window.scrollTo(0, 0)
          return true
        }

        // --- EVENT HANDLERS ---
        const handleAuthAction = async (actionNode) => {
          const action = actionNode.getAttribute('data-action')
          if (action === 'google-login') {
            try {
              await loginWithGoogle()
              navigate('/')
            } catch (err) {
              console.error('Login failed', err)
            }
            return true
          }
          return false
        }

        const handleNavigation = (event, routedNode) => {
          if (routedNode.hasAttribute('data-subscription-id')) {
            persistSubscriptionPlanItem(routedNode)
          }

          const rawRoute = routedNode.getAttribute('data-route')
          const route = normalizeInternalRoute(rawRoute)
          
          if (route) {
            if (route === '/checkout/success') {
              const validateCheckout = doc?.defaultView?.__pettValidateCheckout
              if (typeof validateCheckout === 'function' && !validateCheckout()) return true
              
              if (persistOrderSnapshot(doc)) {
                clearStitchCartItems()
                paintCartBadge(doc)
              }
            }
            return navigateInternal(event, route)
          }
          return false
        }

        const handleCartAction = (button) => {
          const buttonText = normalizeString(button.textContent)
          if (buttonText.includes('add_shopping_cart') || button.hasAttribute('data-add-to-cart')) {
            const card = button.closest('[data-product-card]')
            if (card) {
              const name = card.querySelector('h3')?.textContent?.trim() || 'Sản phẩm mới'
              const description = card.querySelector('p')?.textContent?.trim() || ''
              const priceEl = card.querySelector('.text-xl.font-extrabold') || card.querySelector('.text-4xl.font-black')
              const priceLabel = priceEl?.textContent?.trim() || '0₫'
              const image = card.querySelector('img')?.getAttribute('src') || ''
              const category = card.getAttribute('data-category') || 'shop'
              const id = `${normalizeString(name).replace(/\s+/g, '-')}-${category}`

              persistStitchCartItem({
                id,
                name,
                description,
                price: parseProductPrice(priceLabel),
                priceLabel: priceLabel.includes('₫') ? priceLabel : `${priceLabel.replace(/k/i, '.000')}₫`,
                image,
                quantity: 1,
                category,
              })

              if (category === 'subscription' || button.hasAttribute('data-buy-now')) navigate('/checkout')
            }
            return true
          }
          return false
        }

        const onClick = async (event) => {
          const actionNode = closestFromEvent(event, '[data-action]')
          if (actionNode && await handleAuthAction(actionNode)) return

          const routedNode = closestFromEvent(event, '[data-route]')
          if (routedNode && handleNavigation(event, routedNode)) return

          const anchor = closestFromEvent(event, 'a[href]')
          if (anchor) {
            const href = anchor.getAttribute('href')
            if (href && (/^https?:\/\//i.test(href) || href.startsWith('mailto:') || href.startsWith('tel:'))) return

            const routeFromAnchor = normalizeInternalRoute(anchor.getAttribute('data-route') || href)
            if (routeFromAnchor && navigateInternal(event, routeFromAnchor)) return

            const fallbackRoute = inferRouteFromText(anchor.textContent)
            if ((!href || href.startsWith('#')) && fallbackRoute && navigateInternal(event, fallbackRoute)) return
          }

          const button = closestFromEvent(event, 'button')
          if (button) {
            if (handleCartAction(button)) {
              event.preventDefault()
              return
            }

            const isLocalFilterControl =
              button.hasAttribute('data-filter') ||
              button.hasAttribute('data-pet-filter') ||
              button.hasAttribute('data-sort') ||
              button.hasAttribute('data-category') ||
              button.id === 'clear-search' ||
              button.classList.contains('category-filter') ||
              button.classList.contains('pet-filter-btn') ||
              button.classList.contains('sort-chip')

            if (isLocalFilterControl) return

            const fallbackRoute = inferRouteFromText(button.textContent)
            if (fallbackRoute) navigateInternal(event, fallbackRoute)
          }
        }

        if (doc.__pettNavHandler) {
          doc.removeEventListener('click', doc.__pettNavHandler, true)
        }
        doc.__pettNavHandler = onClick
        // Capture phase ensures internal links are intercepted before any default iframe navigation.
        doc.addEventListener('click', onClick, true)

        hydrateOrderViews(doc)
      } catch {
        // Ignore cross-document access errors.
      }
    }

    iframe.addEventListener('load', onLoad)
    window.addEventListener('resize', updateHeight)

    return () => {
      iframe.removeEventListener('load', onLoad)
      window.removeEventListener('resize', updateHeight)
      if (resizeObserver) resizeObserver.disconnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fitContent, html, navigate, loginWithGoogle])

  return (
    <section className="w-full bg-background" style={{ backgroundColor: '#fbfaee' }}>
      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={html}
        className="w-full border-0"
        style={{ height: `${height}px` }}
      />
    </section>
  )
}
