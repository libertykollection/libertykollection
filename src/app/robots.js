export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://libertykollection.com';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/customer/pages/cart',
                '/customer/pages/checkout',
                '/customer/pages/profile',
                '/customer/pages/reset-password',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
