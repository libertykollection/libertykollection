const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const cosmeticsCatalog = [
  // --- Skincare: Serums ---
  {
    name: 'Gloria 24K Botanical Glow Serum',
    slug: 'gloria-24k-botanical-glow-serum',
    sku: 'GLR-SRM-01',
    price: 5850,
    discount: 15,
    stock: 85,
    isTopRated: true,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/serum.jpg',
    description: '<p>Infused with stabilized 15% Vitamin C, pure squalane, and active gold micro-pearls. Penetrates deeply to brighten dark spots and impart glass-skin illumination.</p>'
  },
  {
    name: 'Cellular Youth Peptide Rejuvenating Serum',
    slug: 'cellular-youth-peptide-rejuvenating-serum',
    sku: 'GLR-SRM-02',
    price: 6400,
    discount: 10,
    stock: 60,
    isTopRated: true,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/serum.jpg',
    description: '<p>Advanced hexapeptide complex combined with copper tripeptide-1 to visibly firm sagging skin and soften fine smile lines.</p>'
  },
  {
    name: 'Niacinamide 10% + Zinc Pore Refining Serum',
    slug: 'niacinamide-10-zinc-pore-refining-serum',
    sku: 'GLR-SRM-03',
    price: 3200,
    discount: 0,
    stock: 120,
    isTopRated: false,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/toner.jpg',
    description: '<p>Clinical strength niacinamide serum that tightens enlarged pores, balances excess sebum, and fades post-blemish redness.</p>'
  },
  {
    name: 'Multi-Molecular Hyaluronic Dew Drops',
    slug: 'multi-molecular-hyaluronic-dew-drops',
    sku: 'GLR-SRM-04',
    price: 4100,
    discount: 10,
    stock: 90,
    isTopRated: true,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/serum.jpg',
    description: '<p>Five molecular weights of hyaluronic acid flood thirsty skin cells with non-sticky, long-lasting 48-hour moisture.</p>'
  },

  // --- Skincare: Moisturizers ---
  {
    name: 'Hydra-Plump Ceramide Night Elixir Cream',
    slug: 'hydra-plump-ceramide-night-cream',
    sku: 'GLR-CRM-05',
    price: 4600,
    discount: 10,
    stock: 80,
    isTopRated: true,
    subcategorySlug: 'hydrating-moisturizers',
    image: '/products/cream.jpg',
    description: '<p>A velvety night cream packed with triple ceramides, multi-weight hyaluronic acid, and shea butter. Repairs environmental barrier damage while you sleep.</p>'
  },
  {
    name: 'Rose Damascena Whipped Day Soufflé',
    slug: 'rose-damascena-whipped-day-souffle',
    sku: 'GLR-CRM-06',
    price: 3900,
    discount: 0,
    stock: 95,
    isTopRated: false,
    subcategorySlug: 'hydrating-moisturizers',
    image: '/products/cream.jpg',
    description: '<p>Featherlight whipped gel-cream with Damascus rose water and squalane. Creates a velvety, shine-free moisture barrier ideal under makeup.</p>'
  },
  {
    name: 'Cica Calming Relief Barrier Balm',
    slug: 'cica-calming-relief-barrier-balm',
    sku: 'GLR-CRM-07',
    price: 3450,
    discount: 15,
    stock: 70,
    isTopRated: false,
    subcategorySlug: 'hydrating-moisturizers',
    image: '/products/cream.jpg',
    description: '<p>Centella Asiatica and madecassoside ointment that rapidly soothes redness, sensitivity, irritation, and post-peel dryness.</p>'
  },
  {
    name: 'Gold Caviar Firming Neck & Décolleté Cream',
    slug: 'gold-caviar-firming-neck-cream',
    sku: 'GLR-CRM-08',
    price: 7200,
    discount: 20,
    stock: 45,
    isTopRated: true,
    subcategorySlug: 'hydrating-moisturizers',
    image: '/products/cream.jpg',
    description: '<p>Ultra-rich sculpting treatment enriched with sustainable caviar extract and marine collagen to lift and tighten delicate neck contours.</p>'
  },

  // --- Skincare: Cleansers & Toners ---
  {
    name: 'Green Tea & Aloe Purifying Mousse Cleanser',
    slug: 'green-tea-aloe-purifying-cleanser',
    sku: 'GLR-CLN-09',
    price: 2800,
    discount: 0,
    stock: 130,
    isTopRated: false,
    subcategorySlug: 'gentle-cleansers',
    image: '/products/cleanser.jpg',
    description: '<p>pH-balanced botanical foam formulated with organic matcha green tea and cold-pressed aloe vera. Sweeps away impurities without stripping moisture.</p>'
  },
  {
    name: 'Camellia Blossom Nourishing Cleansing Oil',
    slug: 'camellia-blossom-nourishing-cleansing-oil',
    sku: 'GLR-CLN-10',
    price: 3600,
    discount: 10,
    stock: 85,
    isTopRated: true,
    subcategorySlug: 'gentle-cleansers',
    image: '/products/cleanser.jpg',
    description: '<p>Silky botanical cleansing oil that melts waterproof mascara and stubborn sunscreen effortlessly, rinsing cleanly into a milky emulsion.</p>'
  },
  {
    name: 'Rosewater & Niacinamide Balancing Mist Toner',
    slug: 'rosewater-niacinamide-balancing-toner',
    sku: 'GLR-TNR-11',
    price: 2750,
    discount: 10,
    stock: 110,
    isTopRated: false,
    subcategorySlug: 'gentle-cleansers',
    image: '/products/toner.jpg',
    description: '<p>Revitalizing facial mist distilled from Damask rose petals and fortified with 5% Niacinamide. Tightens visible pores and balances sebum.</p>'
  },
  {
    name: 'Clarifying Glycolic 7% Exfoliating Toner',
    slug: 'clarifying-glycolic-7-exfoliating-toner',
    sku: 'GLR-TNR-12',
    price: 3100,
    discount: 0,
    stock: 75,
    isTopRated: false,
    subcategorySlug: 'gentle-cleansers',
    image: '/products/toner.jpg',
    description: '<p>A gentle resurfacing AHA toner with glycolic acid and Tasmanian pepperberry to exfoliate dead skin cells and reveal smoother texture.</p>'
  },

  // --- Skincare: Masks & Eye Care ---
  {
    name: 'Bio-Cellulose Overnight Collagen Infusion Mask',
    slug: 'bio-cellulose-overnight-collagen-mask',
    sku: 'GLR-MSK-13',
    price: 3400,
    discount: 15,
    stock: 65,
    isTopRated: false,
    subcategorySlug: 'recovery-masks',
    image: '/products/mask.jpg',
    description: '<p>Intensive hydration treatment sheet mask infused with marine collagen and centella asiatica. Adheres like a second skin to restore depleted complexions.</p>'
  },
  {
    name: 'Pink Clay Pore Detox Clarifying Mask',
    slug: 'pink-clay-pore-detox-clarifying-mask',
    sku: 'GLR-MSK-14',
    price: 2950,
    discount: 10,
    stock: 90,
    isTopRated: false,
    subcategorySlug: 'recovery-masks',
    image: '/products/mask.jpg',
    description: '<p>Purifying Australian pink clay mask with kelp and witch hazel that absorbs excess oil and tightens pores in just 10 relaxing minutes.</p>'
  },
  {
    name: 'Caffeine & Peptides Brightening Eye Treatment',
    slug: 'caffeine-peptides-brightening-eye-treatment',
    sku: 'GLR-EYE-15',
    price: 4100,
    discount: 10,
    stock: 75,
    isTopRated: true,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/eyecream.jpg',
    description: '<p>Fast-absorbing cooling eye contour fluid with concentrated caffeine, matrixyl peptides, and licorice root to deflate puffiness and fade dark circles.</p>'
  },
  {
    name: 'Retinol 0.2% Restorative Eye Contour Balm',
    slug: 'retinol-restorative-eye-contour-balm',
    sku: 'GLR-EYE-16',
    price: 4400,
    discount: 15,
    stock: 55,
    isTopRated: false,
    subcategorySlug: 'anti-aging-serums',
    image: '/products/eyecream.jpg',
    description: '<p>Encapsulated gentle micro-retinol formulated specifically for the fragile orbital area to diminish crow’s feet without irritation.</p>'
  },

  // --- Makeup: Foundations & Base ---
  {
    name: 'Silk Radiance Luminous Fluid Foundation SPF 30',
    slug: 'silk-radiance-luminous-fluid-foundation',
    sku: 'GLR-FND-17',
    price: 5400,
    discount: 0,
    stock: 75,
    isTopRated: true,
    subcategorySlug: 'luminous-foundations',
    image: '/products/foundation.jpg',
    description: '<p>Breathable, medium-to-full buildable coverage foundation infused with light-refracting micro-pigments and broad-spectrum mineral SPF 30.</p>'
  },
  {
    name: 'Invisible Velvet Matte Longwear Foundation',
    slug: 'invisible-velvet-matte-longwear-foundation',
    sku: 'GLR-FND-18',
    price: 5200,
    discount: 10,
    stock: 80,
    isTopRated: true,
    subcategorySlug: 'luminous-foundations',
    image: '/products/foundation.jpg',
    description: '<p>24-hour waterproof matte foundation that controls oil and resists humidity without settling into pores or looking flat.</p>'
  },
  {
    name: 'Hydro-Tint Luminous BB Cream SPF 40',
    slug: 'hydro-tint-luminous-bb-cream',
    sku: 'GLR-FND-19',
    price: 3600,
    discount: 0,
    stock: 105,
    isTopRated: false,
    subcategorySlug: 'luminous-foundations',
    image: '/products/foundation.jpg',
    description: '<p>Fresh, dewy skin tint with hyaluronic acid, niacinamide, and physical mineral SPF 40. Blurs minor imperfections for effortless daytime beauty.</p>'
  },
  {
    name: 'Flawless Full-Coverage Concealer Wand',
    slug: 'flawless-full-coverage-concealer-wand',
    sku: 'GLR-FND-20',
    price: 2400,
    discount: 0,
    stock: 115,
    isTopRated: false,
    subcategorySlug: 'luminous-foundations',
    image: '/products/foundation.jpg',
    description: '<p>High-coverage cream concealer with soft-focus microspheres that hides dark circles and blemishes seamlessly without caking or creasing.</p>'
  },

  // --- Makeup: Powders ---
  {
    name: 'Lumiere Airbrush Translucent Finishing Powder',
    slug: 'lumiere-airbrush-translucent-powder',
    sku: 'GLR-PWD-21',
    price: 3800,
    discount: 0,
    stock: 90,
    isTopRated: false,
    subcategorySlug: 'setting-powders',
    image: '/products/powder.jpg',
    description: '<p>Micro-milled optical blurring powder that sets foundation, controls excess shine without cakiness, and leaves skin looking flawlessly retouched.</p>'
  },
  {
    name: 'Velvet Matte Pressed Mineral Compact Powder',
    slug: 'velvet-matte-pressed-mineral-compact',
    sku: 'GLR-PWD-22',
    price: 3400,
    discount: 10,
    stock: 70,
    isTopRated: false,
    subcategorySlug: 'setting-powders',
    image: '/products/powder.jpg',
    description: '<p>Silky pressed powder compact with mirror and sponge. Delivers touch-up perfection, oil absorption, and soft natural coverage on the go.</p>'
  },
  {
    name: 'Golden Radiance Luminous Setting Spray',
    slug: 'golden-radiance-luminous-setting-spray',
    sku: 'GLR-PWD-23',
    price: 2900,
    discount: 15,
    stock: 110,
    isTopRated: true,
    subcategorySlug: 'setting-powders',
    image: '/products/powder.jpg',
    description: '<p>Ultra-fine mist infused with micro-gold pearlescence and aloe extract that locks makeup in place for 16 hours with a radiant, dewy finish.</p>'
  },

  // --- Makeup: Cheeks & Blush ---
  {
    name: 'Petal Touch Marbleized Baked Mineral Blush',
    slug: 'petal-touch-baked-mineral-blush',
    sku: 'GLR-BLS-24',
    price: 2950,
    discount: 10,
    stock: 70,
    isTopRated: false,
    subcategorySlug: 'blush-highlighters',
    image: '/products/blush.jpg',
    description: '<p>Handcrafted Italian baked mineral blush blending soft rose pigments with pearlescent highlighter ribbons for a natural lit-from-within flush.</p>'
  },
  {
    name: 'Sun-Drenched Terracotta Bronzing Powder',
    slug: 'sun-drenched-terracotta-bronzing-powder',
    sku: 'GLR-BLS-25',
    price: 3300,
    discount: 0,
    stock: 65,
    isTopRated: false,
    subcategorySlug: 'blush-highlighters',
    image: '/products/blush.jpg',
    description: '<p>Warm golden-bronze satin powder that sculpts cheekbones and adds an authentic sun-kissed warmth to all complexions.</p>'
  },
  {
    name: 'Celestial Dew Liquid Highlighter Drops',
    slug: 'celestial-dew-liquid-highlighter-drops',
    sku: 'GLR-BLS-26',
    price: 3200,
    discount: 10,
    stock: 85,
    isTopRated: true,
    subcategorySlug: 'blush-highlighters',
    image: '/products/blush.jpg',
    description: '<p>Weightless liquid illuminator loaded with champagne and rose-gold pearls. Dab on cheekbones or mix into foundation for an all-over glow.</p>'
  },
  {
    name: 'Cheek & Lip Velvet Cream Tint - Rosewood',
    slug: 'cheek-lip-velvet-cream-tint-rosewood',
    sku: 'GLR-BLS-27',
    price: 2600,
    discount: 0,
    stock: 95,
    isTopRated: false,
    subcategorySlug: 'blush-highlighters',
    image: '/products/blush.jpg',
    description: '<p>Multi-use blendable cream pot that melts seamlessly onto cheeks and lips for a fresh, monochromatic wash of flattering warm rose.</p>'
  },

  // --- Makeup: Lipsticks ---
  {
    name: 'Velvet Satin Weightless Matte Lipstick - Nude Velvet',
    slug: 'velvet-satin-weightless-matte-lipstick-nude-velvet',
    sku: 'GLR-LIP-28',
    price: 2450,
    discount: 10,
    stock: 95,
    isTopRated: true,
    subcategorySlug: 'matte-satin-lipsticks',
    image: '/products/lipstick.jpg',
    description: '<p>Ultra-pigmented cushion-matte lipstick in iconic neutral nude. Enriched with vitamin E and jojoba butter for 12 hours of comfort.</p>'
  },
  {
    name: 'Velvet Satin Matte Lipstick - Royal Ruby Red',
    slug: 'velvet-satin-matte-lipstick-royal-ruby',
    sku: 'GLR-LIP-29',
    price: 2450,
    discount: 10,
    stock: 85,
    isTopRated: true,
    subcategorySlug: 'matte-satin-lipsticks',
    image: '/products/lipstick.jpg',
    description: '<p>A showstopping true crimson red with blue undertones that makes teeth look instantly whiter. Long-wear, transfer-resistant finish.</p>'
  },
  {
    name: 'Velvet Satin Matte Lipstick - Spiced Mocha',
    slug: 'velvet-satin-matte-lipstick-spiced-mocha',
    sku: 'GLR-LIP-30',
    price: 2450,
    discount: 0,
    stock: 75,
    isTopRated: false,
    subcategorySlug: 'matte-satin-lipsticks',
    image: '/products/lipstick.jpg',
    description: '<p>Warm 90s-inspired terracotta brown lipstick with luxurious velvety payoff that flatters medium and deep warm undertones.</p>'
  },
  {
    name: 'Silk Sheer Butter Lipstick - Coral Sunset',
    slug: 'silk-sheer-butter-lipstick-coral-sunset',
    sku: 'GLR-LIP-31',
    price: 2250,
    discount: 10,
    stock: 65,
    isTopRated: false,
    subcategorySlug: 'matte-satin-lipsticks',
    image: '/products/lipstick.jpg',
    description: '<p>Nourishing glossy butter lipstick packed with mango seed oil and SPF 15 for juicy, hydrated color on sunny days.</p>'
  },

  // --- Makeup: Lip Glazes & Glosses ---
  {
    name: 'Glass Glaze Hydrating Peptide Lip Plumper - Rose Crystal',
    slug: 'glass-glaze-peptide-lip-plumper',
    sku: 'GLR-GLZ-32',
    price: 2200,
    discount: 0,
    stock: 105,
    isTopRated: false,
    subcategorySlug: 'lip-gloss-plumpers',
    image: '/products/lipgloss.jpg',
    description: '<p>Non-sticky high-lacquer lip gloss powered by Maxi-Lip peptides and hyaluronic spheres for visible volume and mirror shine.</p>'
  },
  {
    name: 'Honey Infused Nourishing Golden Lip Oil',
    slug: 'honey-infused-nourishing-golden-lip-oil',
    sku: 'GLR-GLZ-33',
    price: 2600,
    discount: 10,
    stock: 120,
    isTopRated: true,
    subcategorySlug: 'lip-gloss-plumpers',
    image: '/products/lipgloss.jpg',
    description: '<p>Enriched with pure Mirsalehi honey and botanical oils to deeply condition dry chapped lips with a glassy golden glow.</p>'
  },
  {
    name: 'Vinyl High-Pigment Liquid Lacquer - Bordeaux',
    slug: 'vinyl-high-pigment-liquid-lacquer-bordeaux',
    sku: 'GLR-GLZ-34',
    price: 2500,
    discount: 15,
    stock: 70,
    isTopRated: false,
    subcategorySlug: 'lip-gloss-plumpers',
    image: '/products/lipgloss.jpg',
    description: '<p>Full-coverage deep berry liquid lacquer that stays glossy and vibrant without bleeding or feathering into fine lines.</p>'
  },

  // --- Makeup: Eyeshadows ---
  {
    name: 'Sunset Mirage 16-Pan Eyeshadow Artistry Palette',
    slug: 'sunset-mirage-16-pan-eyeshadow-palette',
    sku: 'GLR-EYE-35',
    price: 6200,
    discount: 20,
    stock: 50,
    isTopRated: true,
    subcategorySlug: 'eyeshadow-palettes',
    image: '/products/eyeshadow.jpg',
    description: '<p>A curated color story of warm terracotta mattes, molten gold metallics, and champagne duochromes with buttery, zero-fallout texture.</p>'
  },
  {
    name: 'Nude Nocturne 9-Pan Everyday Neutral Palette',
    slug: 'nude-nocturne-9-pan-neutral-palette',
    sku: 'GLR-EYE-36',
    price: 4500,
    discount: 10,
    stock: 80,
    isTopRated: false,
    subcategorySlug: 'eyeshadow-palettes',
    image: '/products/eyeshadow.jpg',
    description: '<p>Essential daily eye palette featuring taupe, cream, chocolate, and soft bronze satin textures for effortless office-to-dinner wear.</p>'
  },
  {
    name: 'Emerald & Gold Royal Jewel Palette',
    slug: 'emerald-gold-royal-jewel-palette',
    sku: 'GLR-EYE-37',
    price: 5600,
    discount: 15,
    stock: 40,
    isTopRated: true,
    subcategorySlug: 'eyeshadow-palettes',
    image: '/products/eyeshadow.jpg',
    description: '<p>Lush forest emeralds, antique bronzes, and metallic 24K foils designed for dramatic festive bridal and gala makeup artistry.</p>'
  },
  {
    name: 'Liquid Foil Chromatic Eyeshadow - Starlight Gold',
    slug: 'liquid-foil-chromatic-eyeshadow-starlight',
    sku: 'GLR-EYE-38',
    price: 2350,
    discount: 0,
    stock: 90,
    isTopRated: false,
    subcategorySlug: 'eyeshadow-palettes',
    image: '/products/eyeshadow.jpg',
    description: '<p>High-sparkle liquid eye shadow that glides across lids and dries in 10 seconds for transfer-proof, high-impact foil radiance.</p>'
  },

  // --- Makeup: Mascaras & Brows ---
  {
    name: 'Panoramic Lift & Volumizing Carbon Mascara',
    slug: 'panoramic-lift-volumizing-mascara',
    sku: 'GLR-MSC-39',
    price: 2600,
    discount: 0,
    stock: 110,
    isTopRated: false,
    subcategorySlug: 'precision-mascaras',
    image: '/products/mascara.jpg',
    description: '<p>Tubing formula with curved hourglass wand that grips every lash. Delivers dramatic 360-degree lift, buildable volume, and flake-free wear.</p>'
  },
  {
    name: 'Waterproof Extreme Lash Extension Fiber Mascara',
    slug: 'waterproof-extreme-lash-extension-mascara',
    sku: 'GLR-MSC-40',
    price: 2900,
    discount: 10,
    stock: 85,
    isTopRated: true,
    subcategorySlug: 'precision-mascaras',
    image: '/products/mascara.jpg',
    description: '<p>Micro-fibers build unbelievable length and feathery volume that resists tears, sweat, and heavy rain without budging.</p>'
  },
  {
    name: 'Precision Micro-Blade Brow Definer Pencil',
    slug: 'precision-micro-blade-brow-definer-pencil',
    sku: 'GLR-MSC-41',
    price: 1950,
    discount: 0,
    stock: 130,
    isTopRated: false,
    subcategorySlug: 'precision-mascaras',
    image: '/products/mascara.jpg',
    description: '<p>Ultra-fine 1.5mm retractable brow pencil with spoolie brush. Mimics natural hair strokes for defined, natural-looking arches.</p>'
  },
  {
    name: 'Sculpt & Hold Clear Brow Laminating Gel',
    slug: 'sculpt-hold-clear-brow-laminating-gel',
    sku: 'GLR-MSC-42',
    price: 1850,
    discount: 0,
    stock: 140,
    isTopRated: false,
    subcategorySlug: 'precision-mascaras',
    image: '/products/mascara.jpg',
    description: '<p>Flake-resistant clear brow glue that lifts and locks hairs into a sleek laminated look that stays in place all day long.</p>'
  },

  // --- Fragrance: Haute Parfums ---
  {
    name: 'Midnight Orchid & Cashmere Amber Eau De Parfum (100ml)',
    slug: 'midnight-orchid-cashmere-amber-parfum',
    sku: 'GLR-PRF-43',
    price: 8900,
    discount: 10,
    stock: 45,
    isTopRated: true,
    subcategorySlug: 'eau-de-parfum',
    image: '/products/perfume.jpg',
    description: '<p>An intoxicating haute fragrance opening with pink pepper and night-blooming orchid, unfolding into warm cashmere amber, vanilla, and smoky cedarwood.</p>'
  },
  {
    name: 'Rose De Grasse & Sparkling Bergamot Eau De Parfum',
    slug: 'rose-de-grasse-sparkling-bergamot-parfum',
    sku: 'GLR-PRF-44',
    price: 8400,
    discount: 15,
    stock: 50,
    isTopRated: true,
    subcategorySlug: 'eau-de-parfum',
    image: '/products/perfume.jpg',
    description: '<p>Crisp French bergamot entwined with rare Centifolia rose petals and white musk for an effervescent, royal floral signature.</p>'
  },
  {
    name: 'Santal Oud & Smoked Vanilla Extrait De Parfum',
    slug: 'santal-oud-smoked-vanilla-extrait-parfum',
    sku: 'GLR-PRF-45',
    price: 9800,
    discount: 0,
    stock: 35,
    isTopRated: true,
    subcategorySlug: 'eau-de-parfum',
    image: '/products/perfume.jpg',
    description: '<p>Opulent Oriental masterpiece with Cambodian agarwood, Mysore sandalwood, Bourbon vanilla, and a touch of dark leather.</p>'
  },
  {
    name: 'Solar Neroli & White Jasmine Eau De Parfum',
    slug: 'solar-neroli-white-jasmine-parfum',
    sku: 'GLR-PRF-46',
    price: 7600,
    discount: 10,
    stock: 60,
    isTopRated: false,
    subcategorySlug: 'eau-de-parfum',
    image: '/products/perfume.jpg',
    description: '<p>Sunny Italian citrus, orange blossom neroli, and Sambac jasmine resting on a soft golden amber and driftwood base.</p>'
  },

  // --- Body Radiance: Oils & Scrubs ---
  {
    name: 'Golden Hour Shimmering Botanical Body Oil',
    slug: 'golden-hour-shimmering-body-oil',
    sku: 'GLR-OIL-47',
    price: 4200,
    discount: 15,
    stock: 60,
    isTopRated: false,
    subcategorySlug: 'shimmering-body-oils',
    image: '/products/bodyoil.jpg',
    description: '<p>A dry botanical oil mist laced with ultrafine golden pearls. Nourishes limbs with sweet almond and marula oil with a vanilla orchid scent.</p>'
  },
  {
    name: 'Bronze Goddess Illuminating Dry Body Oil',
    slug: 'bronze-goddess-illuminating-dry-body-oil',
    sku: 'GLR-OIL-48',
    price: 4400,
    discount: 10,
    stock: 75,
    isTopRated: true,
    subcategorySlug: 'shimmering-body-oils',
    image: '/products/bodyoil.jpg',
    description: '<p>Infused with warm bronze shimmer pearls and argan oil to give skin an irresistible holiday tan reflection without stickiness.</p>'
  },
  {
    name: 'Rose Gold Shimmer Hair & Body Mist',
    slug: 'rose-gold-shimmer-hair-body-mist',
    sku: 'GLR-OIL-49',
    price: 3800,
    discount: 0,
    stock: 90,
    isTopRated: false,
    subcategorySlug: 'shimmering-body-oils',
    image: '/products/bodyoil.jpg',
    description: '<p>Fine sparkling fragrance mist that envelops collarbones, arms, and hair strands in romantic rose-gold shimmer and floral fragrance.</p>'
  },
  {
    name: 'Crushed Coconut & Himalayan Pink Salt Polish',
    slug: 'crushed-coconut-himalayan-salt-polish',
    sku: 'GLR-SCR-50',
    price: 3200,
    discount: 0,
    stock: 85,
    isTopRated: false,
    subcategorySlug: 'exfoliating-body-scrubs',
    image: '/products/scrub.jpg',
    description: '<p>Gentle crystal body polish that buffs away dull surface cells while locking in hydration through virgin coconut butter and lavender oils.</p>'
  },
  {
    name: 'Arabica Coffee & Brown Sugar Cellulite Body Scrub',
    slug: 'arabica-coffee-brown-sugar-body-scrub',
    sku: 'GLR-SCR-51',
    price: 3100,
    discount: 10,
    stock: 95,
    isTopRated: false,
    subcategorySlug: 'exfoliating-body-scrubs',
    image: '/products/scrub.jpg',
    description: '<p>Energizing roasted Arabica grounds and raw sugar crystals stimulate lymphatic drainage, firming skin texture and smoothing rough elbows.</p>'
  },
  {
    name: 'Whipped Shea Butter & Vanilla Bean Body Soufflé',
    slug: 'whipped-shea-butter-vanilla-bean-body-souffle',
    sku: 'GLR-SCR-52',
    price: 3500,
    discount: 15,
    stock: 80,
    isTopRated: true,
    subcategorySlug: 'exfoliating-body-scrubs',
    image: '/products/cream.jpg',
    description: '<p>Decadent whipped body cream with unrefined Ghanaian shea butter, cocoa butter, and Madagascar vanilla bean for 72 hours of intense nourishment.</p>'
  }
];

async function main() {
  console.log(`--- Seeding ${cosmeticsCatalog.length} AI Cosmetics Products ---`);

  // Fetch available colors and sizes
  const colors = await prisma.color.findMany();
  const sizes = await prisma.size.findMany();

  // Clear existing products and related items
  await prisma.orderItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({});

  let count = 0;
  for (const item of cosmeticsCatalog) {
    const col1 = colors[count % colors.length];
    const col2 = colors[(count + 1) % colors.length];
    const sz1 = sizes[count % sizes.length];
    const sz2 = sizes[(count + 1) % sizes.length];

    await prisma.product.create({
      data: {
        name: item.name,
        slug: item.slug,
        sku: item.sku,
        price: item.price,
        discount: item.discount,
        stock: item.stock,
        isTopRated: item.isTopRated,
        subcategorySlug: item.subcategorySlug,
        description: item.description,
        meta_title: `${item.name} | Gloria Cosmetics`,
        meta_description: `Shop authentic ${item.name} online at Gloria Cosmetics. Luxury formulations, verified botanical efficacy, and express nationwide delivery.`,
        meta_keywords: 'gloria cosmetics, beauty, makeup, skincare, luxury, pakistan',
        colors: JSON.stringify([
          { value: col1.id, label: col1.name, hex: col1.hex },
          { value: col2.id, label: col2.name, hex: col2.hex }
        ]),
        sizes: JSON.stringify([
          { value: sz1.id, label: sz1.name },
          { value: sz2.id, label: sz2.name }
        ]),
        images: {
          create: [{ url: item.image }]
        }
      }
    });
    count++;
    if (count % 10 === 0 || count === cosmeticsCatalog.length) {
      console.log(`✓ Inserted ${count}/${cosmeticsCatalog.length} products`);
    }
  }

  // Also create some realistic customer reviews across products
  const products = await prisma.product.findMany();
  const reviewers = ['Ayesha M.', 'Fatima Z.', 'Sana T.', 'Maryam K.', 'Zainab S.', 'Hira A.'];
  const comments = [
    'Absolutely obsessed with the formula! Glides so smoothly and lasts all day.',
    'Packaging feels extremely luxury, just like high-end European brands.',
    'Saw visible results within 2 weeks of consistent use. Highly recommend!',
    'My holy grail! Best purchase I have made this season.',
    'Amazing texture and smells incredible without being overpowering.'
  ];

  for (let i = 0; i < 20; i++) {
    const prod = products[i % products.length];
    const reviewer = reviewers[i % reviewers.length];
    const comment = comments[i % comments.length];
    await prisma.review.create({
      data: {
        productId: prod.id,
        reviewer,
        rating: 5,
        comment,
        status: 'approved'
      }
    });
  }
  console.log('✓ Created 20 verified 5-star customer reviews');

  console.log('--- Finished Seeding 52 Cosmetics Products! ---');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
