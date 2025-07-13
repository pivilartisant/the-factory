/**
 * Utility functions shared across CLI and web interfaces
 */

/**
 * Slugify a string for use in filenames
 */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Validate required job fields
 */
function validateJob(job) {
  if (!job || typeof job !== 'object') {
    throw new Error('Job data must be an object');
  }
  
  // Only require title - other fields can be empty/null
  if (!job.title || job.title.trim() === '') {
    throw new Error('Job title is required');
  }
  
  return true;
}

/**
 * Validate creative config
 */
function validateCreative(creative) {
  if (!creative.canvas || !creative.canvas.width || !creative.canvas.height) {
    throw new Error('Creative config must include canvas width and height');
  }
  
  return true;
}

/**
 * Get unique fonts from creative config
 */
function extractFonts(creative) {
  const fonts = new Set();
  
  if (creative.fonts) {
    Object.values(creative.fonts).forEach(font => {
      if (typeof font === 'string') {
        fonts.add(font);
      }
    });
  }
  
  return Array.from(fonts);
}

module.exports = {
  slugify,
  validateJob,
  validateCreative,
  extractFonts
};
