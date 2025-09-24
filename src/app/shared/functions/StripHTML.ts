/**
 * Strips out HTML tags from a given string.
 * Mainly used for feeding in learning object description to a search endpoint
 *
 * @param input - The string to be stripped of HTML tags
 * @returns The input string without HTML tags
 */
export function stripHtmlTags(input: string): string {
    return input.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}
