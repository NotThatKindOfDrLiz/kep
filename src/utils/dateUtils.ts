/**
 * Get the ISO week number for a given date
 * @param {Date} date - The date to get the ISO week for
 * @returns {string} - ISO week number in format YYYY-WW
 */
export function getISOWeek(date) {
  // Create a copy of the date to avoid modifying the original
  const targetDate = new Date(date);
  
  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = targetDate.getDay();
  
  // Set to nearest Thursday (ISO weeks start on Monday, and the week containing Thursday belongs to that ISO week)
  targetDate.setDate(targetDate.getDate() + (4 - (dayOfWeek === 0 ? 7 : dayOfWeek)));
  
  // Get the year of the nearest Thursday
  const year = targetDate.getFullYear();
  
  // Get the first Thursday of the year
  const firstThursday = new Date(year, 0, 1);
  if (firstThursday.getDay() !== 4) {
    firstThursday.setMonth(0, 1 + ((4 - firstThursday.getDay()) + 7) % 7);
  }
  
  // Calculate the ISO week number
  const weekNumber = Math.ceil((((targetDate - firstThursday) / 86400000) + 1) / 7);
  
  // Return in format YYYY-WW (e.g. "2023-42")
  return `${year}-${weekNumber.toString().padStart(2, '0')}`;
}

/**
 * Parse an ISO week string back to a Date representing the start of that week
 * @param {string} isoWeek - ISO week in format YYYY-WW
 * @returns {Date} - Date representing the start (Monday) of the specified week
 */
export function getDateFromISOWeek(isoWeek) {
  const [year, week] = isoWeek.split('-').map(Number);
  
  const januaryFirst = new Date(year, 0, 1);
  const corrections = [januaryFirst.getDay() || 7] - 1;
  
  // Calculate the date for the Monday of week 1
  const dayOfWeek1 = new Date(januaryFirst);
  dayOfWeek1.setDate(januaryFirst.getDate() - corrections);
  
  // Calculate the date for the Monday of the requested week
  const dayOfRequestedWeek = new Date(dayOfWeek1);
  dayOfRequestedWeek.setDate(dayOfWeek1.getDate() + (week - 1) * 7);
  
  return dayOfRequestedWeek;
}

/**
 * Format an ISO week string in a human-readable format
 * @param {string} isoWeek - ISO week in format YYYY-WW
 * @returns {string} - Formatted date range (e.g., "Jan 3 - Jan 9, 2023")
 */
export function formatISOWeek(isoWeek) {
  const weekStart = getDateFromISOWeek(isoWeek);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  
  const options = { month: 'short', day: 'numeric' };
  
  return `${weekStart.toLocaleDateString(undefined, options)} - ${weekEnd.toLocaleDateString(undefined, {
    ...options,
    year: 'numeric',
  })}`;
}