/**
 * Google Fonts integration
 */

/**
 * Generate Google Fonts link tags for fonts used in creative config
 */
function generateFontLinks(fonts) {
  if (!fonts || fonts.length === 0) {
    return '';
  }

  // Create a single link tag with all fonts
  const fontFamily = fonts
    .map(font => font.replace(/\s+/g, '+'))
    .join('&family=');
  
  return `<link href="https://fonts.googleapis.com/css2?family=${fontFamily}&display=swap" rel="stylesheet">`;
}

/**
 * Inject font links into HTML head
 */
function injectFonts(html, fonts) {
  const fontLinks = generateFontLinks(fonts);
  
  if (!fontLinks) {
    return html;
  }

  // Find the head tag and inject font links
  const headRegex = /(<head[^>]*>)/i;
  
  if (headRegex.test(html)) {
    return html.replace(headRegex, `$1\n  ${fontLinks}`);
  }

  // If no head tag, add it
  return `<!DOCTYPE html><html><head>\n  ${fontLinks}\n</head><body>${html}</body></html>`;
}

module.exports = {
  generateFontLinks,
  injectFonts
};
