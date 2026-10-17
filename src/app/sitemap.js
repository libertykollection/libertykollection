import prisma from './util/prisma';

export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://store2u.ca';

    try {
        // 1. Fetch Products
        const products = await prisma.product.findMany({
            select: { slug: true, updatedAt: true },
        });

        const productEntries = products.map((product) => ({
            url: `${baseUrl}/customer/pages/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly',
            priority: 0.8,
        }));

        // 2. Fetch Categories
        const categories = await prisma.category.findMany({
            select: { slug: true, updatedAt: true },
        });

        const categoryEntries = categories.map((category) => ({
            url: `${baseUrl}/customer/pages/category/${category.slug}`,
            lastModified: category.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.7,
        }));

        // 3. Fetch Blogs
        const blogs = await prisma.blog.findMany({
            select: { id: true, updatedAt: true },
        });

        const blogEntries = blogs.map((blog) => ({
            url: `${baseUrl}/customer/pages/blog/${blog.id}`,
            lastModified: blog.updatedAt,
            changeFrequency: 'monthly',
            priority: 0.5,
        }));

        // 4. Static Pages
        const staticPages = [
            { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
            { url: `${baseUrl}/customer/pages/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
            { url: `${baseUrl}/customer/pages/aboutus`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
            { url: `${baseUrl}/customer/pages/contactus`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
            { url: `${baseUrl}/customer/pages/privacypolicy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/customer/pages/termsandconditions`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/customer/pages/shippingpolicy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/customer/pages/returnandexchangepolicy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
            { url: `${baseUrl}/customer/pages/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
        ];

        return [
            ...staticPages,
            ...productEntries,
            ...categoryEntries,
            ...blogEntries,
        ];
    } finally {
        // Disconnect to release the connection back to the pool immediately in tight connection environments
        await prisma.$disconnect();
    }
}
