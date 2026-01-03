/**
 * Composable for parsing markdown text
 * Handles comprehensive markdown formatting
 */
export const useMarkdown = () => {
  /**
   * Convert markdown to HTML
   * Supports: headings, bold, italic, strikethrough, code blocks, inline code,
   * blockquotes, lists (ordered/unordered), links, images, horizontal rules
   */
  const parseMarkdown = (text: string): string => {
    if (!text) return '';

    let html = text;

    // Convert code blocks (```) - must be done before inline code
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${language}>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Convert inline code (`)
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Convert headings (# to ######)
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // Convert horizontal rules (---, ___, ***)
    html = html.replace(/^(?:---+|___+|\*\*\*+)\s*$/gm, '<hr>');

    // Convert blockquotes (>)
    html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

    // Convert unordered lists (-, *, +)
    html = html.replace(/^[\*\-\+]\s+(.+)$/gm, '<li>$1</li>');
    // Wrap consecutive list items in <ul>
    html = html.replace(/(<li>.*<\/li>)(?:\n<li>.*<\/li>)*/g, (match) => {
      return `<ul>${match}</ul>`;
    });

    // Convert ordered lists (1., 2., etc.)
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    // Note: This will wrap ALL <li> tags. A more sophisticated approach would 
    // differentiate between ul and ol, but for simplicity we're keeping it basic

    // Convert images ![alt](url)
    html = html.replace(/!\[([^\]]*)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1" />');

    // Convert links [text](url)
    html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert ~~strikethrough~~
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // Convert **bold** and __bold__
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

    // Convert *italic* and _italic_ (must be after bold)
    html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');

    // Convert line breaks to <br> (but not inside pre/code blocks)
    html = html.replace(/\n(?![^\n]*<\/(?:pre|code|ul|ol|blockquote)>)/g, '<br>');

    // Clean up extra <br> tags after block elements
    html = html.replace(/<\/(h[1-6]|hr|blockquote|ul|ol|pre)><br>/g, '</$1>');
    html = html.replace(/<br><(h[1-6]|hr|blockquote|ul|ol|pre)>/g, '<$1>');

    return html;
  };

  /**
   * Escape HTML special characters in code blocks
   */
  const escapeHtml = (text: string): string => {
    const htmlEscapeMap: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return text.replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
  };

  return {
    parseMarkdown,
  };
};
