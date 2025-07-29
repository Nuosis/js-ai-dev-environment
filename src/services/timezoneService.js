/**
 * Timezone Service for consistent date handling across the timecard widget
 * 
 * This service ensures all date operations use the user's local timezone (America/Edmonton)
 * to prevent UTC conversion issues that cause incorrect date filtering.
 */

// User's timezone - can be configured if needed
const USER_TIMEZONE = 'America/Edmonton';

/**
 * Parse a FileMaker datetime string in the user's local timezone
 * @param {string} dateTimeStr - DateTime string in format "M/D/YYYY HH:mm:ss"
 * @returns {Date} Date object in local timezone
 */
export function parseFileMakerDateTime(dateTimeStr) {
  if (!dateTimeStr) return null;
  
  // FileMaker format: "7/14/2025 07:11:00"
  // Parse as local time to avoid UTC conversion
  const date = new Date(dateTimeStr);
  
  // Verify the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${dateTimeStr}`);
    return null;
  }
  
  return date;
}

/**
 * Extract date portion from FileMaker datetime string in local timezone
 * @param {string} dateTimeStr - DateTime string in format "M/D/YYYY HH:mm:ss"
 * @returns {string} Date string in YYYY-MM-DD format
 */
export function getLocalDateFromDateTime(dateTimeStr) {
  const date = parseFileMakerDateTime(dateTimeStr);
  if (!date) return '';
  
  // Use local timezone methods to avoid UTC conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Extract time portion from FileMaker datetime string in local timezone
 * @param {string} dateTimeStr - DateTime string in format "M/D/YYYY HH:mm:ss"
 * @returns {string} Time string in 12-hour format
 */
export function getLocalTimeFromDateTime(dateTimeStr) {
  const date = parseFileMakerDateTime(dateTimeStr);
  if (!date) return '';
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: USER_TIMEZONE
  });
}

/**
 * Calculate hours between two FileMaker datetime strings in local timezone
 * @param {string} dateTimeIn - Start datetime string
 * @param {string} dateTimeOut - End datetime string
 * @returns {number} Hours difference
 */
export function calculateLocalHours(dateTimeIn, dateTimeOut) {
  if (!dateTimeIn || !dateTimeOut) return 0;
  
  const timeIn = parseFileMakerDateTime(dateTimeIn);
  const timeOut = parseFileMakerDateTime(dateTimeOut);
  
  if (!timeIn || !timeOut) return 0;
  
  const diffMs = timeOut - timeIn;
  return diffMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Get week start date (Monday) for a given date in local timezone
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Week start date in YYYY-MM-DD format
 */
export function getLocalWeekStart(dateStr) {
  if (!dateStr) return '';
  
  // Parse the date string as local date
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed
  
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
  
  const monday = new Date(date);
  monday.setDate(diff);
  
  const mondayYear = monday.getFullYear();
  const mondayMonth = String(monday.getMonth() + 1).padStart(2, '0');
  const mondayDay = String(monday.getDate()).padStart(2, '0');
  
  return `${mondayYear}-${mondayMonth}-${mondayDay}`;
}

/**
 * Format a Date object for FileMaker query (YYYY+MM+DD format) in local timezone
 * @param {Date} date - Date object
 * @returns {string} Formatted date string for FileMaker
 */
export function formatDateForFileMaker(date) {
  if (!date || !(date instanceof Date)) return '';
  
  // Use local timezone methods to avoid UTC conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}+${month}+${day}`;
}

/**
 * Format a Date object for display (YYYY-MM-DD format) in local timezone
 * @param {Date} date - Date object
 * @returns {string} Formatted date string for display
 */
export function formatDateForDisplay(date) {
  if (!date || !(date instanceof Date)) return '';
  
  // Use local timezone methods to avoid UTC conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Check if a date falls within a date range (inclusive) in local timezone
 * @param {string} dateStr - Date string to check (YYYY-MM-DD)
 * @param {string} startDate - Range start date (YYYY-MM-DD)
 * @param {string} endDate - Range end date (YYYY-MM-DD)
 * @returns {boolean} True if date is within range
 */
export function isDateInRange(dateStr, startDate, endDate) {
  if (!dateStr || !startDate || !endDate) return false;
  
  // Parse dates as local dates to avoid timezone issues
  const [year, month, day] = dateStr.split('-').map(Number);
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
  
  const date = new Date(year, month - 1, day);
  const start = new Date(startYear, startMonth - 1, startDay);
  const end = new Date(endYear, endMonth - 1, endDay);
  
  return date >= start && date <= end;
}

/**
 * Create a date range object with proper timezone handling
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Object} Date range object with formatted dates
 */
export function createDateRange(startDate, endDate) {
  return {
    startDate: formatDateForDisplay(startDate),
    endDate: formatDateForDisplay(endDate),
    formattedStartDate: formatDateForFileMaker(startDate),
    formattedEndDate: formatDateForFileMaker(endDate)
  };
}

/**
 * Get current date in user's timezone
 * @returns {Date} Current date in local timezone
 */
export function getCurrentLocalDate() {
  return new Date();
}

/**
 * Parse a date string and ensure it's treated as local timezone
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} Date object in local timezone
 */
export function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day); // month is 0-indexed
}

/**
 * Format a Date object for US display (MM/DD/YYYY format) in local timezone
 * @param {Date} date - Date object
 * @returns {string} Formatted date string in US format
 */
export function formatDateForUSDisplay(date) {
  if (!date || !(date instanceof Date)) return '';
  
  // Use local timezone methods to avoid UTC conversion
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${month}/${day}/${year}`;
}

/**
 * Format a date string from YYYY-MM-DD to US format (MM/DD/YYYY)
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string in US format
 */
export function formatDateStringForUSDisplay(dateStr) {
  if (!dateStr) return '';
  
  const date = parseLocalDate(dateStr);
  return formatDateForUSDisplay(date);
}

/**
 * Get a formatted date range string in US format
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} Formatted date range string
 */
export function formatDateRangeForUSDisplay(startDate, endDate) {
  if (!startDate || !endDate) return '';
  
  const formattedStart = formatDateStringForUSDisplay(startDate);
  const formattedEnd = formatDateStringForUSDisplay(endDate);
  
  return `${formattedStart} - ${formattedEnd}`;
}