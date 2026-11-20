/**
 * Utility class for text-related operations
 */
export class TextUtil {
  /**
   * Truncates text to a specified length and adds ellipsis if truncated
   * @param text The text to truncate
   * @param maxLength Maximum length before truncation
   * @param ellipsis The string to append when truncating (defaults to '...')
   * @returns Truncated text with ellipsis if needed
   */
  static truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + ellipsis : text;
  }

  /**
   * Capitalizes the first letter of a string
   * @param text The text to capitalize
   * @returns Text with first letter capitalized
   */
  static capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  /**
   * Converts text to title case
   * @param text The text to convert
   * @returns Text in title case
   */
  static toTitleCase(text: string): string {
    if (!text) return '';
    return text.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  /**
   * Removes HTML tags from text
   * @param text The text containing HTML tags
   * @returns Plain text without HTML tags
   */
  static stripHtmlTags(text: string): string {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '');
  }

  /**
   * Generates initials from a full name
   * @param fullName The full name
   * @param maxInitials Maximum number of initials to return
   * @returns Initials string
   */
  static getInitials(fullName: string, maxInitials: number = 2): string {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, maxInitials)
      .join('');
  }
}