import { useEffect } from 'react';

/**
 * Sets page-level SEO metadata: title, description, robots, canonical, and Open Graph tags.
 * Call this at the top of any page component.
 */
export default function useSEO({ title, description, canonical, robots = 'index, follow' }) {
  useEffect(() => {
    // Title
    document.title = title;

    const setMeta = (selector, content) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attr, val] = selector.replace('meta[', '').replace(']', '').split('=');
        el.setAttribute(attr.trim(), val.replace(/"/g, '').trim());
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', rel);
        document.head.appendChild(el);
      }
      el.setAttribute('href', href);
    };

    const setOG = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', robots);
    if (canonical) setLink('canonical', canonical);

    // Open Graph
    setOG('og:type', 'website');
    setOG('og:site_name', 'Judge My Driving');
    if (canonical) setOG('og:url', canonical);
    setOG('og:title', title);
    setOG('og:description', description);
  }, [title, description, canonical, robots]);
}