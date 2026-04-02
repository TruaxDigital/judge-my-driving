import { useEffect } from 'react';

/**
 * Sets page-level SEO metadata: title, description, robots, canonical, and Open Graph tags.
 * Call this at the top of any page component.
 */
const DEFAULT_OG_IMAGE = 'https://media.base44.com/images/public/69b8646a9cc3aed112928d77/436972a44_judge-my-driving-profile.jpg';

export default function useSEO({ title, description, canonical, robots = 'index, follow', image }) {
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

    const setTwitter = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('name', name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    const ogImage = image || DEFAULT_OG_IMAGE;

    setMeta('meta[name="description"]', description);
    setMeta('meta[name="robots"]', robots);
    if (canonical) setLink('canonical', canonical);

    // Open Graph
    setOG('og:type', 'website');
    setOG('og:site_name', 'Judge My Driving');
    if (canonical) setOG('og:url', canonical);
    setOG('og:title', title);
    setOG('og:description', description);
    setOG('og:image', ogImage);
    setOG('og:image:width', '1200');
    setOG('og:image:height', '630');

    // Twitter/X card
    setTwitter('twitter:card', 'summary_large_image');
    setTwitter('twitter:title', title);
    setTwitter('twitter:description', description);
    setTwitter('twitter:image', ogImage);
  }, [title, description, canonical, robots, image]);
}