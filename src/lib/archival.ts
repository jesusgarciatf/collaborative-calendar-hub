import { startOfMonth, subMonths, isAfter, addDays } from 'date-fns';

/**
 * Business Rule:
 * Data from the previous month is automatically archived 3 days after the first day 
 * of the new month and remains accessible only to admins.
 */
export function isArchived(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  
  const firstDayOfCurrentMonth = startOfMonth(today);
  const archiveCutoff = addDays(firstDayOfCurrentMonth, 3);
  
  const previousMonthStart = startOfMonth(subMonths(today, 1));
  const currentMonthStart = startOfMonth(today);
  
  // If the date is before the current month and we are past the 3rd of the new month
  if (isAfter(today, archiveCutoff) && date < currentMonthStart) {
    return true;
  }
  
  return false;
}

export function canAccess(dateStr: string, role: string): boolean {
  if (role === 'admin') return true;
  return !isArchived(dateStr);
}
