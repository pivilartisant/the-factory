/**
 * Text truncation utilities
 */

function truncateDescription(description, maxWords = 30) {
  if (!description) return '';
  
  const words = description.split(/\s+/);
  
  if (words.length <= maxWords) {
    return description;
  }
  
  return words.slice(0, maxWords).join(' ') + '...';
}

function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}

module.exports = {
  truncateDescription,
  truncateText
};
