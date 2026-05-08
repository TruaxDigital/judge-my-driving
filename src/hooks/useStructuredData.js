import { useEffect } from 'react';

/**
 * Injects a JSON-LD structured data script tag into <head>.
 * Removes it on unmount to avoid duplicates between page navigations.
 */
export default function useStructuredData(schema) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'structured-data-' + (schema['@type'] || 'schema');
    script.textContent = JSON.stringify(schema);
    // Remove any previous instance
    const existing = document.getElementById(script.id);
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById(script.id);
      if (el) el.remove();
    };
  }, []);
}