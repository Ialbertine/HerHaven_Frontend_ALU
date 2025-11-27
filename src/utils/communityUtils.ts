import type { Post, Comment } from '@/apis/community';

/**
 * Safely gets the display name for a post or comment author.
 * Handles anonymous posts, missing authorName, and undefined firstName/lastName.
 * 
 * @param item - Post or Comment object
 * @returns Display name string
 */
export const getAuthorDisplayName = (item: Post | Comment): string => {
  // If anonymous, return "Anonymous"
  if (item.isAnonymous) {
    return 'Anonymous';
  }

  // Check if authorName exists and is valid (not "undefined undefined" or empty)
  if (item.authorName && 
      item.authorName.trim() !== '' && 
      !item.authorName.includes('undefined')) {
    return item.authorName.trim();
  }

  // Fallback: Try to construct from author object
  if (item.author) {
    const firstName = item.author.firstName?.trim() || '';
    const lastName = item.author.lastName?.trim() || '';
    
    if (firstName || lastName) {
      return `${firstName} ${lastName}`.trim();
    }
  }

  // Final fallback
  return 'User';
};

/**
 * Gets the initial character for avatar display.
 * 
 * @param item - Post or Comment object
 * @returns Single character string for avatar
 */
export const getAuthorInitial = (item: Post | Comment): string => {
  const displayName = getAuthorDisplayName(item);
  
  // For anonymous, return "A"
  if (item.isAnonymous) {
    return 'A';
  }
  
  // Return first character of display name, or "U" as fallback
  return displayName.charAt(0).toUpperCase() || 'U';
};

