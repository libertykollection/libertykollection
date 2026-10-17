/**
 * Clean and Seed Database Script
 * 
 * 1. Cleans target tables:
 *    - OrderItem & Order
 *    - Review & Image
 *    - Product
 *    - Subcategory & Category
 *    - Slider
 *    - Faq
 *    - Customers (User with role !== 'ADMIN') -> KEEPS ADMIN USERS!
 * 
 * 2. Seeds records via REST API (http://localhost:3000/api/...):
 *    - Customers
 *    - Categories (Cosmetics related)
 *    - Subcategories (Cosmetics related)
 *    - Products (Cosmetics related with rich details, images, sizes, colors)
 *    - 10 FAQs (Cosmetics and store policies)
 *    - Sliders (1920x720 panoramic luxury cosmetics banners)
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const API_BASE = 'http://localhost:3000/api';

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`POST ${url} failed with status ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function cleanDatabase() {
  console.log('--- STEP 1: CLEANING DATABASE RECORDS ---');

  // 1. Delete OrderItems
  const deletedOrderItems = await prisma.orderItem.deleteMany({});
  console.log(`✓ Deleted ${deletedOrderItems.count} OrderItem records`);

  // 2. Delete Orders
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✓ Deleted ${deletedOrders.count} Order records`);

  // 3. Delete Reviews
  const deletedReviews = await prisma.review.deleteMany({});
  console.log(`✓ Deleted ${deletedReviews.count} Review records`);

  // 4. Delete Images
  const deletedImages = await prisma.image.deleteMany({});
  console.log(`✓ Deleted ${deletedImages.count} Product Image records`);

  // 5. Delete Products
  const deletedProducts = await prisma.product.deleteMany({});
  console.log(`✓ Deleted ${deletedProducts.count} Product records`);

  // 6. Delete Subcategories
  const deletedSubcategories = await prisma.subcategory.deleteMany({});
  console.log(`✓ Deleted ${deletedSubcategories.count} Subcategory records`);

  // 7. Delete Categories
  const deletedCategories = await prisma.category.deleteMany({});
  console.log(`✓ Deleted ${deletedCategories.count} Category records`);

  // 8. Delete Sliders
  const deletedSliders = await prisma.slider.deleteMany({});
  console.log(`✓ Deleted ${deletedSliders.count} Slider records`);

  // 9. Delete FAQs
  const deletedFaqs = await prisma.faq.deleteMany({});
  console.log(`✓ Deleted ${deletedFaqs.count} FAQ records`);

  // 10. Delete Customers (keep ADMIN users)
  const nonAdminUsers = await prisma.user.findMany({
    where: {
      NOT: {
        role: 'ADMIN',
      },
    },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log(`Found ${nonAdminUsers.length} customer/non-admin users to delete.`);

  const deletedUsers = await prisma.user.deleteMany({
    where: {
      NOT: {
        role: 'ADMIN',
      },
    },
  });
  console.log(`✓ Deleted ${deletedUsers.count} customer accounts (Preserved all ADMIN users)`);

  const remainingUsers = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true },
  });
  console.log('Active preserved staff/admin users:', remainingUsers);
}

async function seedData() {
  console.log('\n--- STEP 2: POPULATING RECORDS VIA API ---');

  // --- A. CUSTOMERS ---
  console.log('\n[1/5] Seeding Customers via /api/users...');
  const customers = [
    {
      name: 'Sophia Bennett',
      email: 'sophia.bennett@example.com',
      password: 'Password123!',
      phoneno: '+1 (416) 555-0143',
      city: 'Toronto',
      role: 'CUSTOMER',
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Emma Richardson',
      email: 'emma.richardson@example.com',
      password: 'Password123!',
      phoneno: '+1 (604) 555-0188',
      city: 'Vancouver',
      role: 'CUSTOMER',
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Liam Montgomery',
      email: 'liam.montgomery@example.com',
      password: 'Password123!',
      phoneno: '+1 (514) 555-0192',
      city: 'Montreal',
      role: 'CUSTOMER',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      name: 'Isabella Vance',
      email: 'isabella.vance@example.com',
      password: 'Password123!',
      phoneno: '+1 (403) 555-0115',
      city: 'Calgary',
      role: 'CUSTOMER',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    },
  ];

  for (const cust of customers) {
    try {
      const res = await postJson(`${API_BASE}/users`, cust);
      console.log(`  ✓ Created Customer: ${cust.name} (${cust.email})`);
    } catch (e) {
      console.error(`  ✗ Error creating customer ${cust.email}:`, e.message);
    }
  }

  // Ensure created customers have emailVerified set to true for seamless login
  await prisma.user.updateMany({
    where: { role: 'CUSTOMER' },
    data: { emailVerified: true },
  });

  // --- B. CATEGORIES & SUBCATEGORIES ---
  console.log('\n[2/5] Seeding Cosmetics Categories & Subcategories via API...');
  const categoryDefinitions = [
    {
      name: 'Skincare & Serums',
      slug: 'skincare-serums',
      imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      meta_title: 'Luxury Skincare & Active Serums',
      meta_description: 'Nourish and rejuvenate your complexion with dermatologist-tested botanical serums and moisturizers.',
      meta_keywords: 'skincare, serums, hydration, anti-aging, clean beauty',
      subcategories: [
        {
          name: 'Face Serums',
          imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Targeted Face Serums',
          meta_description: 'Potent vitamin C, hyaluronic acid, and niacinamide treatments.',
          meta_keywords: 'serums, vitamin c, hyaluronic',
        },
        {
          name: 'Moisturizers & Creams',
          imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Hydrating Face Creams',
          meta_description: 'Deep moisture replenishment for day and night restorative care.',
          meta_keywords: 'moisturizer, night cream, barrier repair',
        },
        {
          name: 'Cleansers & Toners',
          imageUrl: 'https://images.unsplash.com/photo-1556228722-d0b5037d6e49?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Gentle Cleansers & Refreshing Toners',
          meta_description: 'Pure botanical cleansers that purify without stripping natural moisture.',
          meta_keywords: 'facial cleanser, micellar, toner',
        },
      ],
    },
    {
      name: 'Makeup & Complexion',
      slug: 'makeup-complexion',
      imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      meta_title: 'Prestige Makeup & Color Cosmetics',
      meta_description: 'Elevate your aesthetic with velvet lipsticks, luminous foundations, and radiant palettes.',
      meta_keywords: 'makeup, lipstick, foundation, palette, glam',
      subcategories: [
        {
          name: 'Lipsticks & Tints',
          imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Velvet Lipsticks & High-Shine Glosses',
          meta_description: 'Rich pigment lipsticks and nourishing lip oils.',
          meta_keywords: 'lipstick, matte lipstick, lip gloss, lip tint',
        },
        {
          name: 'Foundations & Concealers',
          imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Flawless Finish Foundations',
          meta_description: 'Buildable coverage and weightless liquid foundations.',
          meta_keywords: 'foundation, concealer, liquid makeup',
        },
        {
          name: 'Eye Palettes & Mascara',
          imageUrl: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Artisan Eyeshadow Palettes & Volumizing Mascara',
          meta_description: 'High-impact pigment shades and lengthening mascaras.',
          meta_keywords: 'eyeshadow palette, mascara, eyeliner',
        },
      ],
    },
    {
      name: 'Bath & Body Care',
      slug: 'bath-body-care',
      imageUrl: 'https://images.unsplash.com/photo-1608248597359-009187ec9c23?auto=format&fit=crop&w=800&q=80',
      meta_title: 'Spa-Grade Bath & Body Rituals',
      meta_description: 'Indulge in nourishing body lotions, shimmer oils, and revitalizing sugar scrubs.',
      meta_keywords: 'body lotion, body scrub, bath salts, shimmer oil',
      subcategories: [
        {
          name: 'Body Lotions & Oils',
          imageUrl: 'https://images.unsplash.com/photo-1608248597359-009187ec9c23?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Botanical Body Lotions & Shimmer Oils',
          meta_description: 'Silky moisturizing lotions and radiant golden glow oils.',
          meta_keywords: 'body oil, shimmer, body lotion',
        },
        {
          name: 'Exfoliators & Scrubs',
          imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Nourishing Body Scrubs & Polish',
          meta_description: 'Gentle sugar and sea salt polishes for velvet-smooth skin.',
          meta_keywords: 'body scrub, exfoliator, sea salt polish',
        },
      ],
    },
    {
      name: 'Luxury Fragrances',
      slug: 'luxury-fragrances',
      imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      meta_title: 'Prestige Fragrances & Artisanal Parfums',
      meta_description: 'Captivating Eau de Parfum bouquets crafted by master perfumers.',
      meta_keywords: 'perfume, eau de parfum, fragrance, floral scent',
      subcategories: [
        {
          name: 'Eau de Parfum',
          imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
          meta_title: 'Concentrated Eau de Parfum Sprays',
          meta_description: 'Long-wearing floral, woody, and amber fragrance harmonies.',
          meta_keywords: 'eau de parfum, perfume spray, floral perfume',
        },
      ],
    },
  ];

  const subcategoryMap = {}; // name -> created subcat object with slug

  for (const catDef of categoryDefinitions) {
    const { subcategories, ...catData } = catDef;
    const catResult = await postJson(`${API_BASE}/categories`, catData);
    console.log(`  ✓ Created Category: ${catResult.name} (ID: ${catResult.id})`);

    for (const subDef of subcategories) {
      const subResult = await postJson(`${API_BASE}/subcategories`, {
        ...subDef,
        categoryId: catResult.id,
      });
      const createdSub = subResult.data;
      subcategoryMap[subDef.name] = createdSub;
      console.log(`    ↳ Created Subcategory: ${createdSub.name} (slug: ${createdSub.slug})`);
    }
  }

  // --- C. PRODUCTS ---
  console.log('\n[3/5] Seeding Cosmetics Products via /api/products...');
  const products = [
    {
      name: 'Luminous Vitamin C & Botanical Glow Serum',
      slug: 'luminous-vitamin-c-glow-serum',
      description: 'A transformative antioxidant elixir formulated with 15% pure ethyl ascorbic acid, multi-molecular hyaluronic acid, and cold-pressed rosehip seed extract. Brightens hyperpigmentation, shields against environmental stressors, and imparts an ethereal morning radiance.',
      price: 44.0,
      stock: 65,
      subcategorySlug: subcategoryMap['Face Serums'].slug,
      colors: ['Golden Radiance', 'Crystal Dew'],
      sizes: ['30ml / 1.0 fl oz', '50ml / 1.7 fl oz'],
      discount: 10,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1608248597359-009187ec9c23?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Luminous Vitamin C Glow Serum | Store2u Beauty',
      meta_description: 'Award-winning brightening serum for luminous, glass-smooth skin.',
      meta_keywords: 'vitamin c serum, brightening, hyaluronic acid, radiant glow',
      sku: 'SKIN-SRM-001',
      productType: 'tangible',
    },
    {
      name: 'Hydra-Plump Ceramide Night Cream',
      slug: 'hydra-plump-ceramide-night-cream',
      description: 'An ultra-cushioning nocturnal barrier cream powered by 5 essential ceramides, squalane, and fermented centella asiatica. Envelops skin in a replenishing veil to lock in lasting hydration while you sleep.',
      price: 52.0,
      stock: 45,
      subcategorySlug: subcategoryMap['Moisturizers & Creams'].slug,
      colors: ['Rose Velvet', 'Unscented Pure'],
      sizes: ['50ml / 1.7 fl oz', '100ml / 3.4 fl oz'],
      discount: 15,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Hydra-Plump Ceramide Night Cream | Store2u Beauty',
      meta_description: 'Deep overnight moisture lock and skin barrier restoration cream.',
      meta_keywords: 'night cream, ceramide moisturizer, barrier repair',
      sku: 'SKIN-CRM-002',
      productType: 'tangible',
    },
    {
      name: 'Clarifying Green Tea & Aloe Foaming Cleanser',
      slug: 'clarifying-green-tea-foaming-cleanser',
      description: 'A gentle, pH-balanced amino acid cleanser infused with organic ceremonial matcha, aloe vera leaf juice, and willow bark extract. Gently sweeps away makeup and daily impurities without disturbing moisture balance.',
      price: 28.0,
      stock: 80,
      subcategorySlug: subcategoryMap['Cleansers & Toners'].slug,
      colors: ['Matcha Fresh'],
      sizes: ['150ml / 5.1 fl oz'],
      discount: 0,
      isTopRated: false,
      images: [
        'https://images.unsplash.com/photo-1556228722-d0b5037d6e49?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Clarifying Green Tea Foaming Cleanser | Store2u Beauty',
      meta_description: 'Gentle pH-balanced facial wash for radiant, refreshed clarity.',
      meta_keywords: 'facial cleanser, green tea cleanser, gentle cleanser',
      sku: 'SKIN-CLN-003',
      productType: 'tangible',
    },
    {
      name: 'Velvet Satin Weightless Matte Lipstick',
      slug: 'velvet-satin-matte-lipstick',
      description: 'A high-pigment, velvety lipstick infused with camellia oil and hyaluronic microspheres. Delivers comfortable, feather-light matte color with up to 12 hours of transfer-resistant wear.',
      price: 26.0,
      stock: 90,
      subcategorySlug: subcategoryMap['Lipsticks & Tints'].slug,
      colors: ['Crimson Royale', 'Petal Nude', 'Vintage Rose', 'Spiced Berry'],
      sizes: ['3.8g / 0.13 oz'],
      discount: 10,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Velvet Satin Weightless Matte Lipstick | Store2u Beauty',
      meta_description: 'Couture matte lipstick offering plush comfort and rich color payoff.',
      meta_keywords: 'matte lipstick, velvet lipstick, long-wearing lip color',
      sku: 'MKUP-LIP-001',
      productType: 'tangible',
    },
    {
      name: 'Silk Radiance Luminous Liquid Foundation SPF 25',
      slug: 'silk-radiance-luminous-foundation',
      description: 'A featherweight serum foundation blending skincare benefits with second-skin medium buildable coverage. Formulated with light-diffusing optical pearls and broad spectrum mineral sun defense.',
      price: 46.0,
      stock: 55,
      subcategorySlug: subcategoryMap['Foundations & Concealers'].slug,
      colors: ['01 Porcelain Ivory', '02 Warm Beige', '03 Golden Amber', '04 Rich Espresso'],
      sizes: ['30ml / 1.0 fl oz'],
      discount: 15,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Silk Radiance Luminous Liquid Foundation | Store2u Beauty',
      meta_description: 'Breathable, glowing finish foundation with skincare benefits.',
      meta_keywords: 'liquid foundation, glow foundation, mineral sunscreen',
      sku: 'MKUP-FND-002',
      productType: 'tangible',
    },
    {
      name: 'Sunset Mirage 14-Pan Eyeshadow Palette',
      slug: 'sunset-mirage-eyeshadow-palette',
      description: 'A curated spectrum of 14 buttery-smooth matte, metallic, and duo-chrome shadows inspired by golden hour skies. Highly pigmented and effortlessly blendable for day-to-night glamour.',
      price: 48.0,
      stock: 40,
      subcategorySlug: subcategoryMap['Eye Palettes & Mascara'].slug,
      colors: ['Warm Sunset Spectrum'],
      sizes: ['Full Size (14 Pans)'],
      discount: 20,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Sunset Mirage 14-Pan Eyeshadow Palette | Store2u Beauty',
      meta_description: 'Ultra-pigmented eyeshadow palette with warm neutrals and jewel duochromes.',
      meta_keywords: 'eyeshadow palette, warm tones, shimmer shadow',
      sku: 'MKUP-EYE-003',
      productType: 'tangible',
    },
    {
      name: 'Golden Hour Shimmering Botanical Body Oil',
      slug: 'golden-hour-shimmering-body-oil',
      description: 'A luxurious dry body oil infused with cold-pressed jojoba, sweet almond, and ultra-fine ethically sourced mineral mica pearls. Sinks in instantly leaving a sun-kissed veil of luminescence and intoxicating jasmine nectar fragrance.',
      price: 36.0,
      stock: 70,
      subcategorySlug: subcategoryMap['Body Lotions & Oils'].slug,
      colors: ['Sunlit Champagne', 'Bronze Radiance'],
      sizes: ['100ml / 3.4 fl oz'],
      discount: 0,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1608248597359-009187ec9c23?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Golden Hour Shimmering Body Oil | Store2u Beauty',
      meta_description: 'Dry body oil with sparkling mineral pearls for a luminous summer glow.',
      meta_keywords: 'shimmer body oil, dry oil, glowing skin',
      sku: 'BODY-OIL-001',
      productType: 'tangible',
    },
    {
      name: 'Crushed Coconut & Sea Salt Body Polish',
      slug: 'crushed-coconut-sea-salt-body-polish',
      description: 'An exfoliating ritual combining Pacific sea salts, virgin coconut oil, and crushed vanilla beans. Buffs away dull skin cells to reveal extraordinarily soft, supple, and glowing skin.',
      price: 32.0,
      stock: 50,
      subcategorySlug: subcategoryMap['Exfoliators & Scrubs'].slug,
      colors: ['Island Coconut'],
      sizes: ['250g / 8.8 oz'],
      discount: 10,
      isTopRated: false,
      images: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Crushed Coconut & Sea Salt Body Polish | Store2u Beauty',
      meta_description: 'Nourishing coconut and sea salt body exfoliator.',
      meta_keywords: 'body scrub, sea salt polish, exfoliating scrub',
      sku: 'BODY-SCR-002',
      productType: 'tangible',
    },
    {
      name: 'Midnight Orchid & Cashmere Amber Eau De Parfum',
      slug: 'midnight-orchid-eau-de-parfum',
      description: 'An alluring oriental floral fragrance opening with luminous pink peppercorn and blackcurrant, blooming into black orchid and night-blooming jasmine, anchored by rich sandalwood, cashmere wood, and golden amber.',
      price: 88.0,
      stock: 35,
      subcategorySlug: subcategoryMap['Eau de Parfum'].slug,
      colors: ['Signature Bottle'],
      sizes: ['50ml / 1.7 fl oz', '100ml / 3.4 fl oz'],
      discount: 10,
      isTopRated: true,
      images: [
        'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
      ],
      meta_title: 'Midnight Orchid Eau De Parfum | Store2u Beauty',
      meta_description: 'Sensual floral amber luxury perfume with exceptional longevity.',
      meta_keywords: 'eau de parfum, perfume, floral amber, luxury fragrance',
      sku: 'FRAG-EDP-001',
      productType: 'tangible',
    },
  ];

  for (const prod of products) {
    try {
      const res = await postJson(`${API_BASE}/products`, prod);
      console.log(`  ✓ Created Product: ${prod.name} (SKU: ${prod.sku})`);
    } catch (e) {
      console.error(`  ✗ Error creating product ${prod.name}:`, e.message);
    }
  }

  // --- D. 10 FAQS ---
  console.log('\n[4/5] Seeding 10 Cosmetics FAQs via /api/faq...');
  const faqs = [
    {
      question: 'Are Store2u cosmetics certified cruelty-free and vegan?',
      answer: 'Yes! We are passionately committed to ethical beauty. 100% of our cosmetic formulas and skincare products are certified cruelty-free, and we never test on animals at any stage of development. Most of our range is also 100% vegan.',
    },
    {
      question: 'How do I choose the right foundation shade for my skin undertone?',
      answer: 'Each of our foundation product pages features a comprehensive shade and undertone breakdown (Cool, Warm, Neutral). If you are between two shades, our beauty concierge is available via live chat to assist with personalized recommendations.',
    },
    {
      question: 'Are your skincare products suitable for sensitive or acne-prone skin?',
      answer: 'All of our skincare formulas are dermatologist-tested, hypoallergenic, and non-comedogenic. We omit harsh sulfates, parabens, synthetic dyes, and artificial fragrances to ensure high tolerance across sensitive skin profiles.',
    },
    {
      question: 'What is the shelf life of your cosmetic and skincare products after opening?',
      answer: 'Most cosmetics and serums maintain optimal efficacy for 12 to 24 months after opening. Look for the Period After Opening (PAO) jar icon on product packaging for exact item specifications.',
    },
    {
      question: 'How do I track my beauty order and delivery status?',
      answer: 'As soon as your package ships from our fulfillment center, you will receive an email confirmation containing an active carrier tracking link and delivery estimate. You can also view updates inside your Account dashboard.',
    },
    {
      question: 'What is your return and satisfaction policy?',
      answer: 'We provide a 30-day satisfaction guarantee. If an item does not meet your expectations, unopened and gently tried cosmetic products can be returned for a full refund or exchange within 30 days of receipt.',
    },
    {
      question: 'Do you offer free shipping on cosmetic orders?',
      answer: 'Yes, we offer complimentary standard shipping on all orders over $50 across Canada and the continental United States. Express shipping options are also available during checkout.',
    },
    {
      question: 'How should active serums (Vitamin C, Retinoids) be properly stored?',
      answer: 'Store your serums and active treatments in a cool, dry place away from direct sunlight and humidity. Ensure caps are tightly fastened after each use to prevent oxidation and preserve active potency.',
    },
    {
      question: 'What makes your luxury fragrances and Eau de Parfum long-lasting?',
      answer: 'Our Eau de Parfum formulations contain a high 18% to 22% fragrance oil concentration. They are crafted with natural essential oils and fijian sandalwood base fixatives that linger elegantly for 8 to 12 hours.',
    },
    {
      question: 'Can I modify or cancel my order after placing it online?',
      answer: 'Because our distribution team processes orders quickly to ensure rapid dispatch, please contact our support team at info@store2u.ca within 1 hour of placing your order if you need to update addresses or order items.',
    },
  ];

  for (let i = 0; i < faqs.length; i++) {
    try {
      const res = await postJson(`${API_BASE}/faq`, faqs[i]);
      console.log(`  ✓ FAQ #${i + 1}: ${faqs[i].question.substring(0, 45)}...`);
    } catch (e) {
      console.error(`  ✗ Error creating FAQ #${i + 1}:`, e.message);
    }
  }

  // --- E. SLIDERS (Hero Banners) ---
  console.log('\n[5/5] Seeding Sliders (Hero Banners) via /api/slider...');
  // Carousel and HeroShowcase display widescreen banners (1920x720 / 16:9 ratio)
  const sliders = [
    {
      imgurl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1920&h=720&q=85',
      link: '/customer/pages/allproducts',
    },
    {
      imgurl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1920&h=720&q=85',
      link: '/customer/pages/allproducts',
    },
    {
      imgurl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1920&h=720&q=85',
      link: '/customer/pages/allproducts',
    },
  ];

  for (let i = 0; i < sliders.length; i++) {
    try {
      const res = await postJson(`${API_BASE}/slider`, sliders[i]);
      console.log(`  ✓ Slider #${i + 1} created: ${sliders[i].imgurl.substring(0, 60)}...`);
    } catch (e) {
      console.error(`  ✗ Error creating Slider #${i + 1}:`, e.message);
    }
  }

  console.log('\n=============================================');
  console.log('🎉 ALL OPERATIONS COMPLETED SUCCESSFULLY! 🎉');
  console.log('=============================================');
}

async function run() {
  try {
    await cleanDatabase();
    await seedData();
  } catch (err) {
    console.error('Fatal error during clean-and-seed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

run();
