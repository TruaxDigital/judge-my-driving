import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const isIframe = window.self !== window.top;

export function isInIframe() {
  return window.self !== window.top;
}

// Syncs the 'dark' class on <html> with the system color-scheme preference.
// Call once at app startup (e.g. in main.jsx or App.jsx).
export function initThemeSync() {
  const apply = (e) => {
    document.documentElement.classList.toggle('dark', e.matches);
  };
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  apply(mq);
  mq.addEventListener('change', apply);
}