'use client';

import { useEffect, useState } from 'react';
import { getSafeImageUrl } from '../../../util/imageUtils';

// ---------------------------------------------------------------------------
// Request cache: multiple homepage widgets read the same endpoints
// (/api/products, /api/categories ...). Sharing one in-flight promise per URL
// avoids hammering the API on first paint.
// ---------------------------------------------------------------------------
const inFlight = new Map();

export const fetchJSON = (url) => {
  if (!inFlight.has(url)) {
    const p = fetch(url, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`${url} ${r.status}`))))
      .finally(() => {
        // Clean up immediately after request settles so next fetch always gets fresh data
        setTimeout(() => inFlight.delete(url), 500);
      });
    inFlight.set(url, p);
  }
  return inFlight.get(url);
};

// Normalises the different response shapes used across the API routes.
export const toArray = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return [];
};

export const useApi = (url) => {
  const [state, setState] = useState({ data: [], loading: true, error: null });

  useEffect(() => {
    let alive = true;
    fetchJSON(url)
      .then((res) => alive && setState({ data: toArray(res), loading: false, error: null }))
      .catch((error) => alive && setState({ data: [], loading: false, error }));
    return () => {
      alive = false;
    };
  }, [url]);

  return state;
};

export const parseImages = (product) => {
  if (!product) return [];
  let imgs = product.images;
  if (typeof imgs === 'string') {
    try {
      imgs = JSON.parse(imgs);
    } catch {
      imgs = [];
    }
  }
  if (!Array.isArray(imgs)) imgs = imgs ? [imgs] : [];
  if (imgs.length === 0 && product.image) imgs = [product.image];
  return imgs
    .map((img) => (typeof img === 'string' ? img : img?.url))
    .filter(Boolean)
    .map(getSafeImageUrl);
};

export const formatPrice = (price) =>
  price ? Math.round(Number(price)).toLocaleString('en-PK') : '0';

export const getOriginalPrice = (product) => {
  const d = Number(product?.discount);
  const p = Number(product?.price);
  if (!d || d <= 0 || d >= 100 || !p) return null;
  return p / (1 - d / 100);
};

export const productHref = (product) => `/customer/pages/products/${product.slug || product.id}`;

export const stripHtml = (html = '') =>
  html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
