import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** '2026-03-10' → '2026.03.10' */
export function formatDate(iso: string) {
  return iso.replaceAll('-', '.');
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}
