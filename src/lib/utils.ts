import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn's class merge helper: conditional classes via clsx, then conflict
 * resolution via tailwind-merge so a later class reliably beats an earlier
 * one in the same Tailwind group.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
