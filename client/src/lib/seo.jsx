import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useSite } from '../context/SiteContext.jsx';

function upsertMeta(attr, key, content) {
  if (content == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Per-page SEO: title, description, canonical, Open Graph and Twitter tags. */
export function Seo({ title, description, image, type = 'website', noindex = false }) {
  const { settings } = useSite();
  const { pathname } = useLocation();

  useEffect(() => {
    const siteTitle = settings?.siteTitle || 'Muhammad Hamza';
    const fullTitle = title ? `${title} · Muhammad Hamza` : siteTitle;
    const desc = description || settings?.seoDescription || '';
    const origin = window.location.origin;
    const img = image || settings?.ogImage || '/og-image.jpg';
    const absImg = img.startsWith('http') ? img : origin + img;
    const url = origin + pathname;

    document.title = fullTitle;
    upsertMeta('name', 'description', desc);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', desc);
    upsertMeta('property', 'og:type', type);
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:image', absImg);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', desc);
    upsertMeta('name', 'twitter:image', absImg);
    upsertLink('canonical', url);
  }, [title, description, image, type, noindex, settings, pathname]);

  return null;
}
