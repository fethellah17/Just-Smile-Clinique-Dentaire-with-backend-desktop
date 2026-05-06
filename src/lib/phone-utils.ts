/**
 * Utility functions for phone number handling
 */

/**
 * Format phone number for WhatsApp API
 * Removes spaces, dashes, parentheses and ensures it's in international format
 */
export function formatPhoneForWhatsApp(phoneNumber: string): string {
  // Remove common formatting characters
  let cleaned = phoneNumber.replace(/[\s\-()]/g, '');
  
  // If it doesn't start with +, assume it's a local number and add country code
  // For Algeria: +213
  if (!cleaned.startsWith('+')) {
    // Remove leading 0 if present (common in local numbers)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = '+213' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate WhatsApp link
 */
export function getWhatsAppLink(phoneNumber: string): string {
  const formatted = formatPhoneForWhatsApp(phoneNumber);
  return `https://wa.me/${formatted.replace('+', '')}`;
}

/**
 * Generate tel: link for direct calling
 */
export function getTelLink(phoneNumber: string): string {
  return `tel:${phoneNumber}`;
}
