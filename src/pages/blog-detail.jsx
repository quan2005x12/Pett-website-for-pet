import StitchScreenFrame from '../components/stitch-screen-frame'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import blogDetailStitchHtml from '../stitch-html/blog-detail-modern-playful.html?raw'

const defaultArticle = {
  slug: 'huong-dan-toan-dien-cham-soc-thu-cung',
  pageTitle: 'C�ch ch?n th?c an cho ch� | PETT Blog',
  heroTitle: 'C�ch ch?n th?c an cho ch� ??',
  author: 'Dr. Linh',
  dateText: '2 ng�y tru?c',
  readTime: '5 ph�t d?c',
  heroImage: '/images/products/chicken-meal-2.webp',
  bodyImage: '/images/products/chicken-meal-1.webp',
  bodyAlt: 'Th?c an dinh du?ng cho ch� v?i th�nh ph?n gi�u d?m t? th?t g�',
  section1Title: '1. Hi?u d�ng nhu c?u c?a c�n theo t?ng giai do?n',
  section1Text:
    'Nhu c?u dinh du?ng c?a ch� con, ch� tru?ng th�nh v� ch� l?n tu?i kh�c nhau r� r?t. Khi d?c nh�n s?n ph?m, h�y uu ti�n protein d?ng v?t d?ng d?u b?ng th�nh ph?n, d?ng th?i c�n b?ng ch?t b�o t?t v� ch?t xo d? h? tr? ti�u h�a.',
  section2Title: '2. Ch?n lo?i th?c an ph� h?p l?i s?ng',
  section3Title: '3. �?c nh�n th�ng minh tru?c khi mua',
}

const articleBySlug = {
  'huong-dan-toan-dien-cham-soc-thu-cung': defaultArticle,
  'giai-ma-ngon-ngu-co-the-cua-meo': {
    ...defaultArticle,
    pageTitle: 'Gi?i m� ng�n ng? co th? c?a m�o | PETT Blog',
    heroTitle: 'Gi?i m� ng�n ng? co th? ?n c?a m�o ??',
    dateText: '12 Th�ng 5, 2024',
    readTime: '5 ph�t d?c',
    heroImage: '/images/shutterstock/testimonial-luna.webp',
    bodyImage: '/images/products/feather-wand-1.webp',
    bodyAlt: '�? choi tuong t�c gi�p m�o ph?n x? t?t v� gi?m cang th?ng',
    section1Title: '1. Quan s�t tai, du�i v� �nh m?t d? hi?u c?m x�c',
    section1Text:
      'M�o giao ti?p b?ng t�n hi?u co th? r?t tinh t?: tai c?p thu?ng di k�m lo l?ng, du�i d?ng cao th? hi?n t? tin, c�n ch?p m?t ch?m l� d?u hi?u tin tu?ng. Hi?u d�ng c�c t�n hi?u n�y gi�p b?n ph?n h?i d�ng l�c v� gi?m stress cho b�.',
    section2Title: '2. Khi n�o m�o c?n kh�ng gian ri�ng',
    section3Title: '3. C�ch x�y d?ng th�i quen tuong t�c t�ch c?c',
  },
  'sieu-thuc-pham-cho-cho': {
    ...defaultArticle,
    pageTitle: 'Si�u th?c ph?m cho ch� | PETT Blog',
    heroTitle: 'Si�u th?c ph?m cho b?a an c?a ch� ??',
    dateText: '10 Th�ng 5, 2024',
    readTime: '4 ph�t d?c',
    heroImage: '/images/products/chicken-meal-2.webp',
    bodyImage: '/images/products/chicken-meal-1.webp',
    bodyAlt: 'Kh?u ph?n gi�u d?m gi�p ch� duy tr� nang lu?ng v� co b?p kh?e m?nh',
    section1Title: '1. Superfood l� g� v� c� th?c s? c?n thi?t?',
    section1Text:
      'M?t s? th?c ph?m gi�u vi ch?t nhu b� d?, vi?t qu?t, c� h?i c� th? h? tr? mi?n d?ch v� ti�u h�a n?u d�ng d�ng t? l?. �i?u quan tr?ng l� kh�ng thay th? ho�n to�n kh?u ph?n ch�nh m� d�ng nhu ph?n b? tr? c� ki?m so�t.',
    section2Title: '2. Danh s�ch superfood an to�n cho ch�',
    section3Title: '3. T?n su?t b? sung d? tr�nh m?t c�n b?ng',
  },
  '5-tro-choi-tuong-tac-cho-thu-cung': {
    ...defaultArticle,
    pageTitle: '5 tr� choi tuong t�c cho th� cung | PETT Blog',
    heroTitle: '5 tr� choi tuong t�c cho th� cung ??',
    dateText: '08 Th�ng 5, 2024',
    readTime: '6 ph�t d?c',
    heroImage: '/images/products/tug-rope-2.webp',
    bodyImage: '/images/products/feather-wand-1.webp',
    bodyAlt: '�? choi tuong t�c cho th� cung d�ng trong ho?t d?ng t?i nh�',
    section1Title: '1. V� sao tr� choi tuong t�c quan tr?ng?',
    section1Text:
      'Tuong t�c m?i ng�y gi�p th� cung gi?i ph�ng nang lu?ng, gi?m h�nh vi ph� ph�ch v� tang k?t n?i v?i ch? nu�i. Ch? c?n 15-20 ph�t v?i ho?t d?ng ph� h?p l� d� c?i thi?n d�ng k? tinh th?n c?a b�.',
    section2Title: '2. 5 tr� choi d? l�m ngay t?i nh�',
    section3Title: '3. L?ch choi theo d? tu?i v� th? l?c',
  },
  'cham-soc-long-tai-nha-khong-cang-thang': {
    ...defaultArticle,
    pageTitle: 'Cham s�c l�ng t?i nh� kh�ng cang th?ng | PETT Blog',
    heroTitle: 'Cham s�c l�ng t?i nh� kh�ng cang th?ng ??',
    dateText: '05 Th�ng 5, 2024',
    readTime: '10 ph�t d?c',
    heroImage: '/images/products/bow-collar-2.webp',
    bodyImage: '/images/products/bow-collar-1.webp',
    bodyAlt: 'Ph? ki?n cham s�c v� gi? v? sinh gi�p th� cung tho?i m�i hon',
    section1Title: '1. Chu?n b? tru?c khi t?m v� ch?i l�ng',
    section1Text:
      'M?t bu?i grooming d? ch?u b?t d?u t? vi?c chu?n b? d�ng d?ng c? v� l�m quen t? t?. Khi th� cung du?c vu?t ve, thu?ng snack v� nghe gi?ng n�i b�nh tinh, b� s? h?p t�c hon r?t nhi?u.',
    section2Title: '2. K? thu?t ch?i theo t?ng lo?i l�ng',
    section3Title: '3. D?u hi?u c?n g?p groomer chuy�n nghi?p',
  },
  'thiet-lap-khong-gian-cho-meo-con': {
    ...defaultArticle,
    pageTitle: 'Thi?t l?p kh�ng gian cho m�o con | PETT Blog',
    heroTitle: 'Thi?t l?p kh�ng gian ho�n h?o cho m�o con ??',
    dateText: '01 Th�ng 5, 2024',
    readTime: '7 ph�t d?c',
    heroImage: '/images/shutterstock/testimonial-luna.webp',
    bodyImage: '/images/products/cat-litter-2.webp',
    bodyAlt: 'M�o con trong kh�ng gian an u?ng an to�n v� quen thu?c',
    section1Title: '1. V? tr� an to�n cho khu v?c ng? v� an',
    section1Text:
      'M�o con c?n m?t g�c y�n tinh, �t ngu?i qua l?i d? nhanh th�ch nghi nh� m?i. �?t khay c�t c�ch xa ch? an u?ng v� th�m di?m ?n n?p s? gi�p b� c?m th?y an to�n ngay t? ng�y d?u.',
    section2Title: '2. Checklist v?t d?ng b?t bu?c trong tu?n d?u',
    section3Title: '3. Th�i quen sinh ho?t gi�p m�o con t? tin hon',
  },
  'huan-luyen-tich-cuc-vi-sao-hieu-qua': {
    ...defaultArticle,
    pageTitle: 'Hu?n luy?n t�ch c?c cho th� cung | PETT Blog',
    heroTitle: 'Hu?n luy?n t�ch c?c: V� sao hi?u qu?? ??',
    dateText: '28 Th�ng 4, 2024',
    readTime: '9 ph�t d?c',
    heroImage: '/images/products/tug-rope-1.webp',
    bodyImage: '/images/products/tug-rope-2.webp',
    bodyAlt: 'D?ng c? choi k�o co h? tr? hu?n luy?n t�ch c?c cho ch�',
    section1Title: '1. C?t l�i c?a hu?n luy?n t�ch c?c',
    section1Text:
      'Hu?n luy?n t�ch c?c d?a tr�n co ch? thu?ng d�ng th?i di?m d? c?ng c? h�nh vi mong mu?n. C�ch n�y gi�p th� cung h?c nhanh, gi?m lo l?ng v� x�y d?ng m?i quan h? tin tu?ng v?i ch? nu�i.',
    section2Title: '2. Sai l?m thu?ng g?p khi thu?ng v� ph?t',
    section3Title: '3. L? tr�nh 14 ng�y d? t?o th�i quen t?t',
  },
}

function buildArticleHtml(baseHtml, article) {
  return baseHtml
    .replace(defaultArticle.pageTitle, article.pageTitle)
    .replace(defaultArticle.heroTitle, article.heroTitle)
    // Always replace current hero/background and body image regardless of prior source URL.
    .replace(
      /background-image:url\('[^']*'\)/,
      `background-image:url('${article.heroImage}')`,
    )
    .replace(
      /(<img class="w-full rounded-xl mb-8" src=")[^"]+(" alt=")/,
      `$1${article.bodyImage}$2`,
    )
    .replace(
      /(<img class="w-full rounded-xl mb-8" src="[^"]+" alt=")[^"]+("\/?>)/,
      `$1${article.bodyAlt}$2`,
    )
    .replace('>Dr. Linh</span>', `>${article.author}</span>`)
    .replace('>2 ng�y tru?c</span>', `>${article.dateText}</span>`)
    .replace('>5 ph�t d?c</span>', `>${article.readTime}</span>`)
    .replace(defaultArticle.section1Title, article.section1Title)
    .replace(defaultArticle.section1Text, article.section1Text)
    .replace(defaultArticle.section2Title, article.section2Title)
    .replace(defaultArticle.section3Title, article.section3Title)
}

export default function BlogDetailPage() {
  const { id } = useParams()

  const article = articleBySlug[id] || defaultArticle

  const html = useMemo(
    () => buildArticleHtml(blogDetailStitchHtml, article),
    [article],
  )

  return <StitchScreenFrame html={html} title={article.pageTitle} fitContent={false} />
}


