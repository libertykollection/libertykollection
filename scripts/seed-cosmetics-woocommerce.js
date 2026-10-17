const { PrismaClient, OrderStatus } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Cosmetics WooCommerce AI Seeder ---');

  // 1. Company Details
  await prisma.companyDetails.deleteMany({});
  await prisma.companyDetails.create({
    data: {
      name: 'Gloria Cosmetics',
      description: 'Haute botanical beauty, clinical skincare, and luxury cosmetics crafted with royal radiance.',
      headerImage: '/gloria_logo.png',
      favIcon: '/gloria_logo.png'
    }
  });
  console.log('✓ CompanyDetails updated for Gloria Cosmetics');

  // 2. Admins & Customers
  const adminHash = await bcrypt.hash('GloriaAdmin2026!', 10);
  const custHash = await bcrypt.hash('Customer123!', 10);

  // Clear existing users
  await prisma.user.deleteMany({});

  const admin1 = await prisma.user.create({
    data: {
      name: 'Gloria Executive',
      email: 'admin@gloriacosmetics.shop',
      password: adminHash,
      role: 'ADMIN',
      city: 'Lahore',
      phoneno: '+923000000001',
      emailVerified: true
    }
  });

  const admin2 = await prisma.user.create({
    data: {
      name: 'Store Administrator',
      email: 'admin@store2u.ca',
      password: await bcrypt.hash('DildilPakistan786@store2u', 10),
      role: 'ADMIN',
      city: 'Lahore',
      phoneno: '+923000000002',
      emailVerified: true
    }
  });

  const customersData = [
    { name: 'Ayesha Malik', email: 'ayesha.malik@gmail.com', city: 'Lahore', phoneno: '+92 321 8847120', address: 'House 42-B, Phase 5, DHA' },
    { name: 'Fatima Zahra', email: 'fatima.zahra@outlook.com', city: 'Karachi', phoneno: '+92 333 4918234', address: 'Apartment 702, Ocean Vista, Clifton Block 4' },
    { name: 'Sana Tariq', email: 'sana.tariq@yahoo.com', city: 'Islamabad', phoneno: '+92 301 5567891', address: 'Street 19, Sector F-7/2' },
    { name: 'Maryam Khan', email: 'maryam.khan@gmail.com', city: 'Rawalpindi', phoneno: '+92 345 9928172', address: 'Villa 14, Bahria Town Phase 7' },
    { name: 'Zainab Sheikh', email: 'zainab.sheikh@hotmail.com', city: 'Faisalabad', phoneno: '+92 300 7861234', address: 'Canal Road, Officers Colony' },
    { name: 'Hira Ahmed', email: 'hira.ahmed@gmail.com', city: 'Multan', phoneno: '+92 312 4433221', address: 'Bosan Road, Gulgasht Colony' }
  ];

  const createdCustomers = [];
  for (const c of customersData) {
    const cust = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        password: custHash,
        role: 'CUSTOMER',
        city: c.city,
        phoneno: c.phoneno,
        emailVerified: true
      }
    });
    createdCustomers.push({ ...c, id: cust.id });
  }
  console.log(`✓ Created 2 Admins and ${createdCustomers.length} verified Customers`);

  // 3. Colors & Sizes
  await prisma.color.deleteMany({});
  const colorsData = [
    { name: 'Pure Gold', hex: '#B98C2D' },
    { name: 'Nude Velvet', hex: '#D29B78' },
    { name: 'Deep Crimson', hex: '#9E1B32' },
    { name: 'Rose Petal', hex: '#D87093' },
    { name: 'Champagne Shimmer', hex: '#F7E7CE' },
    { name: 'Warm Honey', hex: '#E6AE55' },
    { name: 'Soft Peach', hex: '#FFCBA4' }
  ];

  const createdColors = [];
  for (const col of colorsData) {
    const createdCol = await prisma.color.create({ data: col });
    createdColors.push(createdCol);
  }

  await prisma.size.deleteMany({});
  const sizesData = [
    { name: '30 ml' },
    { name: '50 ml' },
    { name: '100 ml' },
    { name: 'Full Size 15g' },
    { name: 'Travel Size 5g' }
  ];

  const createdSizes = [];
  for (const sz of sizesData) {
    const createdSz = await prisma.size.create({ data: sz });
    createdSizes.push(createdSz);
  }
  console.log(`✓ Created ${createdColors.length} Colors and ${createdSizes.length} Sizes`);

  // 4. Categories & Subcategories
  // First clear product related records
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.subcategory.deleteMany({});
  await prisma.category.deleteMany({});

  const categoriesDef = [
    {
      name: 'Skincare & Clinical Treatments',
      slug: 'skincare-serums',
      imageUrl: '/products/serum.jpg',
      subcategories: [
        { name: 'Anti-Aging & Radiance Serums', slug: 'anti-aging-serums' },
        { name: 'Hydrating Creams & Balms', slug: 'hydrating-moisturizers' },
        { name: 'Botanical Cleansers & Toners', slug: 'gentle-cleansers' },
        { name: 'Overnight Recovery Masks', slug: 'recovery-masks' }
      ]
    },
    {
      name: 'Face & Base Makeup',
      slug: 'face-base-makeup',
      imageUrl: '/products/foundation.jpg',
      subcategories: [
        { name: 'Luminous Fluid Foundations', slug: 'luminous-foundations' },
        { name: 'Silk Finishing Powders', slug: 'setting-powders' },
        { name: 'Velvet Cheek & Highlighters', slug: 'blush-highlighters' }
      ]
    },
    {
      name: 'Lips & Eye Artistry',
      slug: 'lips-eye-artistry',
      imageUrl: '/products/lipstick.jpg',
      subcategories: [
        { name: 'Weightless Matte Lipsticks', slug: 'matte-satin-lipsticks' },
        { name: 'High-Shine Glazes & Plumpers', slug: 'lip-gloss-plumpers' },
        { name: 'Couture Eyeshadow Palettes', slug: 'eyeshadow-palettes' },
        { name: 'Defining Lashes & Mascaras', slug: 'precision-mascaras' }
      ]
    },
    {
      name: 'Haute Fragrance & Parfum',
      slug: 'fragrance-parfum',
      imageUrl: '/products/perfume.jpg',
      subcategories: [
        { name: 'Artisanal Eau De Parfum', slug: 'eau-de-parfum' }
      ]
    },
    {
      name: 'Bath & Body Radiance',
      slug: 'bath-body-radiance',
      imageUrl: '/products/bodyoil.jpg',
      subcategories: [
        { name: 'Illuminating Shimmer Oils', slug: 'shimmering-body-oils' },
        { name: 'Crystal Exfoliating Polishes', slug: 'exfoliating-body-scrubs' }
      ]
    }
  ];

  for (const cat of categoriesDef) {
    const createdCat = await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        imageUrl: cat.imageUrl
      }
    });

    for (const sub of cat.subcategories) {
      await prisma.subcategory.create({
        data: {
          name: sub.name,
          slug: sub.slug,
          categoryId: createdCat.id
        }
      });
    }
  }
  console.log('✓ Created 5 Categories and 14 Subcategories');

  // 5. 16 AI Cosmetics Products
  const productsDef = [
    {
      name: 'Gloria 24K Botanical Glow Serum',
      slug: 'gloria-24k-botanical-glow-serum',
      sku: 'GLR-SRM-01',
      price: 5850,
      discount: 15,
      stock: 65,
      isTopRated: true,
      subcategorySlug: 'anti-aging-serums',
      image: '/products/serum.jpg',
      description: '<p>Infused with stabilized 15% Vitamin C, pure squalane, and active gold micro-pearls. Penetrates deeply to brighten dark spots, stimulate natural collagen synthesis, and impart a glass-skin illumination.</p>'
    },
    {
      name: 'Hydra-Plump Ceramide Night Elixir Cream',
      slug: 'hydra-plump-ceramide-night-cream',
      sku: 'GLR-CRM-02',
      price: 4600,
      discount: 10,
      stock: 80,
      isTopRated: true,
      subcategorySlug: 'hydrating-moisturizers',
      image: '/products/cream.jpg',
      description: '<p>A velvety night cream packed with triple ceramides, multi-weight hyaluronic acid, and shea butter. Repairs environmental barrier damage while you sleep for refreshed, plump skin.</p>'
    },
    {
      name: 'Green Tea & Aloe Purifying Mousse Cleanser',
      slug: 'green-tea-aloe-purifying-cleanser',
      sku: 'GLR-CLN-03',
      price: 2800,
      discount: 0,
      stock: 120,
      isTopRated: false,
      subcategorySlug: 'gentle-cleansers',
      image: '/products/cleanser.jpg',
      description: '<p>pH-balanced botanical foam formulated with organic matcha green tea and cold-pressed aloe vera. Sweeps away impurities, sunscreen, and stubborn makeup without stripping essential moisture.</p>'
    },
    {
      name: 'Velvet Satin Weightless Matte Lipstick',
      slug: 'velvet-satin-weightless-matte-lipstick',
      sku: 'GLR-LIP-04',
      price: 2450,
      discount: 10,
      stock: 95,
      isTopRated: true,
      subcategorySlug: 'matte-satin-lipsticks',
      image: '/products/lipstick.jpg',
      description: '<p>Ultra-pigmented, feather-light lip color that glides like silk and dries to a modern cushion-matte finish. Enriched with vitamin E and jojoba butter for 12 hours of comfort.</p>'
    },
    {
      name: 'Silk Radiance Luminous Fluid Foundation SPF 30',
      slug: 'silk-radiance-luminous-fluid-foundation',
      sku: 'GLR-FND-05',
      price: 5400,
      discount: 0,
      stock: 75,
      isTopRated: true,
      subcategorySlug: 'luminous-foundations',
      image: '/products/foundation.jpg',
      description: '<p>Breathable, medium-to-full buildable coverage foundation infused with light-refracting micro-pigments and broad-spectrum mineral SPF 30. Resists humidity and creasing all day.</p>'
    },
    {
      name: 'Sunset Mirage 16-Pan Eyeshadow Artistry Palette',
      slug: 'sunset-mirage-16-pan-eyeshadow-palette',
      sku: 'GLR-EYE-06',
      price: 6200,
      discount: 20,
      stock: 50,
      isTopRated: true,
      subcategorySlug: 'eyeshadow-palettes',
      image: '/products/eyeshadow.jpg',
      description: '<p>A curated color story of warm terracotta mattes, molten gold metallics, and champagne duochromes. Highly blendable, zero fallout, and designed for versatile day-to-night glamour.</p>'
    },
    {
      name: 'Golden Hour Shimmering Botanical Body Oil',
      slug: 'golden-hour-shimmering-body-oil',
      sku: 'GLR-OIL-07',
      price: 4200,
      discount: 15,
      stock: 60,
      isTopRated: false,
      subcategorySlug: 'shimmering-body-oils',
      image: '/products/bodyoil.jpg',
      description: '<p>A dry botanical oil mist laced with ultrafine golden pearls. Nourishes limbs with cold-pressed sweet almond and marula oil, leaving skin radiant with a delicate vanilla orchid scent.</p>'
    },
    {
      name: 'Crushed Coconut & Himalayan Pink Salt Polish',
      slug: 'crushed-coconut-himalayan-salt-polish',
      sku: 'GLR-SCR-08',
      price: 3200,
      discount: 0,
      stock: 85,
      isTopRated: false,
      subcategorySlug: 'exfoliating-body-scrubs',
      image: '/products/scrub.jpg',
      description: '<p>Gentle exfoliating crystal body scrub that buffs away dull surface cells while locking in pure hydration through virgin coconut butter and essential lavender oils.</p>'
    },
    {
      name: 'Midnight Orchid & Cashmere Amber Eau De Parfum',
      slug: 'midnight-orchid-cashmere-amber-parfum',
      sku: 'GLR-PRF-09',
      price: 8900,
      discount: 10,
      stock: 45,
      isTopRated: true,
      subcategorySlug: 'eau-de-parfum',
      image: '/products/perfume.jpg',
      description: '<p>An intoxicating haute fragrance opening with pink pepper and night-blooming orchid, unfolding into warm cashmere amber, Madagascar vanilla, and smoky cedarwood.</p>'
    },
    {
      name: 'Panoramic Lift & Volumizing Carbon Mascara',
      slug: 'panoramic-lift-volumizing-mascara',
      sku: 'GLR-MSC-10',
      price: 2600,
      discount: 0,
      stock: 110,
      isTopRated: false,
      subcategorySlug: 'precision-mascaras',
      image: '/products/mascara.jpg',
      description: '<p>Tubing formula with curved hourglass wand that grips every lash. Delivers dramatic 360-degree lift, buildable carbon-black volume, and flake-free wear for 16 hours.</p>'
    },
    {
      name: 'Petal Touch Marbleized Baked Mineral Blush',
      slug: 'petal-touch-baked-mineral-blush',
      sku: 'GLR-BLS-11',
      price: 2950,
      discount: 10,
      stock: 70,
      isTopRated: false,
      subcategorySlug: 'blush-highlighters',
      image: '/products/blush.jpg',
      description: '<p>Handcrafted Italian baked mineral blush blending soft rose pigments with pearlescent highlighter ribbons for an authentic youthful, lit-from-within flush.</p>'
    },
    {
      name: 'Lumiere Airbrush Translucent Finishing Powder',
      slug: 'lumiere-airbrush-translucent-powder',
      sku: 'GLR-PWD-12',
      price: 3800,
      discount: 0,
      stock: 90,
      isTopRated: false,
      subcategorySlug: 'setting-powders',
      image: '/products/powder.jpg',
      description: '<p>Micro-milled optical blurring powder that sets foundation, controls excess shine without cakiness, and leaves skin looking flawlessly retouched in daylight and flash photography.</p>'
    },
    {
      name: 'Glass Glaze Hydrating Peptide Lip Plumper',
      slug: 'glass-glaze-peptide-lip-plumper',
      sku: 'GLR-GLZ-13',
      price: 2200,
      discount: 0,
      stock: 105,
      isTopRated: false,
      subcategorySlug: 'lip-gloss-plumpers',
      image: '/products/lipgloss.jpg',
      description: '<p>Non-sticky high-lacquer lip gloss powered by Maxi-Lip peptides and hyaluronic spheres. Instantly delivers visible fullness and glass-like mirror shine with cooling mint.</p>'
    },
    {
      name: 'Rosewater & Niacinamide Balancing Mist Toner',
      slug: 'rosewater-niacinamide-balancing-toner',
      sku: 'GLR-TNR-14',
      price: 2750,
      discount: 10,
      stock: 100,
      isTopRated: false,
      subcategorySlug: 'gentle-cleansers',
      image: '/products/toner.jpg',
      description: '<p>Revitalizing facial mist distilled from Damask rose petals and fortified with 5% Niacinamide. Tightens visible pores, balances sebum, and provides an instant moisture pick-me-up.</p>'
    },
    {
      name: 'Bio-Cellulose Overnight Collagen Infusion Mask',
      slug: 'bio-cellulose-overnight-collagen-mask',
      sku: 'GLR-MSK-15',
      price: 3400,
      discount: 15,
      stock: 65,
      isTopRated: false,
      subcategorySlug: 'recovery-masks',
      image: '/products/mask.jpg',
      description: '<p>Intensive hydration treatment sheet mask infused with marine collagen and centella asiatica. Adheres like a second skin to restore depleted, stressed complexions overnight.</p>'
    },
    {
      name: 'Caffeine & Peptides Brightening Eye Treatment',
      slug: 'caffeine-peptides-brightening-eye-treatment',
      sku: 'GLR-EYE-16',
      price: 4100,
      discount: 10,
      stock: 75,
      isTopRated: true,
      subcategorySlug: 'anti-aging-serums',
      image: '/products/eyecream.jpg',
      description: '<p>Fast-absorbing cooling eye contour fluid with concentrated caffeine, matrixyl peptides, and licorice root. Deflates puffiness and dramatically fades persistent dark circles.</p>'
    }
  ];

  const createdProducts = [];
  for (const p of productsDef) {
    const prod = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        discount: p.discount,
        stock: p.stock,
        isTopRated: p.isTopRated,
        subcategorySlug: p.subcategorySlug,
        description: p.description,
        meta_title: `${p.name} | Gloria Cosmetics`,
        meta_description: `Shop ${p.name} online at Gloria Cosmetics. Luxury formulations, verified botanical efficacy and nationwide express delivery.`,
        meta_keywords: 'cosmetics, skincare, beauty, makeup, luxury, pakistan',
        colors: JSON.stringify([
          { value: createdColors[0].id, label: createdColors[0].name, hex: createdColors[0].hex },
          { value: createdColors[1].id, label: createdColors[1].name, hex: createdColors[1].hex }
        ]),
        sizes: JSON.stringify([
          { value: createdSizes[0].id, label: createdSizes[0].name },
          { value: createdSizes[1].id, label: createdSizes[1].name }
        ]),
        images: {
          create: [{ url: p.image }]
        }
      }
    });

    createdProducts.push(prod);
  }
  console.log(`✓ Created ${createdProducts.length} AI Cosmetics Products with variants and images`);

  // 6. 5 Beautiful Sliders
  await prisma.slider.deleteMany({});
  const slidersDef = [
    {
      imgurl: '/sliders/slider1.jpg',
      link: '/customer/pages/collections'
    },
    {
      imgurl: '/sliders/slider2.jpg',
      link: '/customer/pages/allproducts'
    },
    {
      imgurl: '/sliders/slider3.jpg',
      link: '/customer/pages/category/lips-eye-artistry'
    },
    {
      imgurl: '/sliders/slider4.jpg',
      link: '/customer/pages/category/fragrance-parfum'
    },
    {
      imgurl: '/sliders/slider5.jpg',
      link: '/customer/pages/category/skincare-serums'
    }
  ];

  for (const s of slidersDef) {
    await prisma.slider.create({ data: s });
  }
  console.log('✓ Created 5 Luxury Cosmetics Sliders in database');

  // 7. 12 Realistic Orders
  const paymentMethods = [
    'Cash on Delivery (COD)',
    'Online Debit / Credit Card',
    'JazzCash Instant',
    'EasyPaisa Mobile Account'
  ];

  const statuses = [
    OrderStatus.PENDING,
    OrderStatus.CONFIRMED,
    OrderStatus.SHIPPED,
    OrderStatus.COMPLETED,
    OrderStatus.PAID
  ];

  for (let i = 0; i < 12; i++) {
    const cust = createdCustomers[i % createdCustomers.length];
    const status = statuses[i % statuses.length];
    const paymentMethod = paymentMethods[i % paymentMethods.length];

    // Pick 1 to 2 products
    const p1 = createdProducts[i % createdProducts.length];
    const p2 = createdProducts[(i + 4) % createdProducts.length];
    const pCount = (i % 2 === 0) ? 2 : 1;

    const q1 = (i % 3) + 1;
    const price1 = p1.price;
    let subtotal = price1 * q1;

    let itemsToCreate = [
      {
        productId: p1.id,
        quantity: q1,
        price: price1,
        selectedSize: '50 ml',
        selectedColor: 'Pure Gold'
      }
    ];

    if (pCount === 2) {
      const q2 = 1;
      const price2 = p2.price;
      subtotal += price2 * q2;
      itemsToCreate.push({
        productId: p2.id,
        quantity: q2,
        price: price2,
        selectedSize: 'Full Size 15g',
        selectedColor: 'Nude Velvet'
      });
    }

    const discountAmount = i % 3 === 0 ? Math.round(subtotal * 0.1) : 0;
    const deliveryCharge = subtotal > 5000 ? 0 : 250;
    const netTotal = subtotal - discountAmount + deliveryCharge;

    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - (12 - i));

    await prisma.order.create({
      data: {
        userId: cust.id,
        recipientName: cust.name,
        email: cust.email,
        phoneNumber: cust.phoneno,
        streetAddress: cust.address,
        apartmentSuite: `Suite #${100 + i}`,
        city: cust.city,
        state: 'Punjab / Sindh / ICT',
        zip: `540${i}0`,
        country: 'Pakistan',
        paymentMethod: paymentMethod,
        paymentInfo: `Ref: GLR-TXN-${100000 + i}`,
        status: status,
        total: subtotal,
        discount: discountAmount,
        tax: 0,
        deliveryCharge: deliveryCharge,
        netTotal: netTotal,
        shippingMethod: 'Express Courier Dispatch (TCS / Leopards)',
        createdAt: orderDate,
        updatedAt: orderDate,
        orderItems: {
          create: itemsToCreate
        }
      }
    });
  }
  console.log('✓ Created 12 realistic WooCommerce cosmetics Orders with line items');

  // 8. 10 Luxury Cosmetics FAQs
  await prisma.faq.deleteMany({});
  const faqs = [
    {
      question: 'Are Gloria Cosmetics products cruelty-free and dermatologically tested?',
      answer: 'Yes, 100%. All Gloria Cosmetics formulations are certified cruelty-free, paraben-free, and clinically evaluated by certified dermatologists for maximum skin safety and efficacy.'
    },
    {
      question: 'How do I choose the correct foundation shade for my skin tone?',
      answer: 'Our Silk Radiance Foundations are organized by undertone (Cool, Neutral, Warm). You can consult our online shade match guide or reach out to our beauty consultants via WhatsApp.'
    },
    {
      question: 'What is the estimated delivery timeframe across Pakistan?',
      answer: 'Standard metro deliveries in Lahore, Karachi, and Islamabad take 24–48 hours. Regional deliveries typically arrive within 2–4 business days via verified express couriers.'
    },
    {
      question: 'Do you offer Cash on Delivery (COD)?',
      answer: 'Yes, Cash on Delivery is available across all major cities and towns in Pakistan for orders up to PKR 50,000.'
    },
    {
      question: 'Can I return or exchange an item if it arrives damaged?',
      answer: 'We provide an unconditional 7-day return and exchange policy for any product that arrives damaged or unopened in original packaging.'
    },
    {
      question: 'Are Gloria skincare products suitable for sensitive or acne-prone skin?',
      answer: 'Our serums and cleansers feature non-comedogenic botanical ingredients including Centella, Niacinamide, and Aloe Vera formulated without synthetic fragrance.'
    },
    {
      question: 'How should I store my serums and fragrance bottles?',
      answer: 'Keep all beauty products in a cool, dry place away from direct sunlight to preserve active antioxidants, vitamins, and natural fragrance oils.'
    },
    {
      question: 'Is Free Shipping available on orders?',
      answer: 'We offer complimentary express shipping on all orders totaling PKR 5,000 or above nationwide.'
    },
    {
      question: 'How can I track my live order dispatch status?',
      answer: 'Once your order ships, an instant SMS and email with your courier tracking number (TCS / Leopards) is sent to you.'
    },
    {
      question: 'Are Gloria lipsticks long-lasting without drying lips?',
      answer: 'Our Velvet Satin Matte Lipsticks feature micronized moisture spheres and jojoba butter, providing up to 12 hours of pigmented wear without flaking.'
    }
  ];

  for (const f of faqs) {
    await prisma.faq.create({ data: f });
  }
  console.log('✓ Created 10 Cosmetics FAQs');

  console.log('--- Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
