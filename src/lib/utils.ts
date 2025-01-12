import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return '';
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  return format(dateObj, 'PPP');
}
