/**
 * Utility to provide a safe image URL.
 * Prevents prepending the base URL if the path is already an absolute URL or a data URI (base64).
 * 
 * @param {string} url - The image path or URL
 * @returns {string} - The sanitized image URL
 */
export const getSafeImageUrl = (url) => {
    if (!url) return '';
    if (typeof url === 'string' && (url.startsWith('http') || url.startsWith('data:'))) {
        return url;
    }
    const baseUrl = process.env.NEXT_PUBLIC_UPLOADED_IMAGE_URL || '';
    // Avoid double slashes if baseUrl ends with / or url starts with /
    const separator = baseUrl.endsWith('/') || url.startsWith('/') ? '' : '/';
    return `${baseUrl}${separator}${url}`;
};
