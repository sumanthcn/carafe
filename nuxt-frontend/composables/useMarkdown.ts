/**
 * Composable for parsing markdown text
 * Handles basic markdown formatting: bold, italic, links
 */
export const useMarkdown = () => {
  /**
   * Convert markdown to HTML
   * Supports: **bold**, *italic*, [links](url)
   */
  const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let html = text;

    // Convert **bold** to <strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Convert *italic* to <em>
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Convert [text](url) to <a href="url">text</a>
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert line breaks to <br>
    html = html.replace(/\n/g, '<br>');

    return html;
  };

  return {
    parseMarkdown,
  };
};
