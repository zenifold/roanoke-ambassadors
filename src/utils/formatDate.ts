import { Timestamp } from 'firebase/firestore';

export function formatDate(date: Date | Timestamp | null): string {
  if (!date) return 'No date set';
  
  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
} 