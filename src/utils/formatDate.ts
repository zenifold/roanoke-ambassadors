import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp | null): string {
  if (!date) return 'No date set';
  
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  
  // Adjust for timezone offset
  const tzOffset = dateObj.getTimezoneOffset() * 60000; // offset in milliseconds
  const adjustedDate = new Date(dateObj.getTime() + tzOffset);
  
  return adjustedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC' // Use UTC to prevent double timezone adjustment
  });
} 