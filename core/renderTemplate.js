/**
 * Template rendering and merging logic
 */

const fs = require('fs');
const path = require('path');
const { formatSalary } = require('./formatSalary');
const { truncateDescription } = require('./truncateText');
const { injectFonts, generateFontLinks } = require('./applyFonts');
const { validateJob, validateCreative, extractFonts } = require('./utils');

/**
 * Merge job data with template using placeholder replacement
 */
function mergeJobWithTemplate(template, job, creative) {
  // Validate inputs
  validateJob(job);
  validateCreative(creative);

  // Process job data
  const processedJob = { ...job };
  
  // Format salary (handle both job_function and direct salary fields)
  if (job.job_function) {
    processedJob.salary = formatSalary(job.job_function);
  } else if (job.salary_min || job.salary_max || job.salary) {
    // Handle alternative salary formats
    if (job.salary) {
      processedJob.salary = job.salary;
    } else if (job.salary_min && job.salary_max) {
      processedJob.salary = `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`;
    } else if (job.salary_min) {
      processedJob.salary = `$${job.salary_min.toLocaleString()}+`;
    }
  } else {
    processedJob.salary = ''; // No salary info available
  }
  
  // Handle description (could be null)
  processedJob.description = job.description || '';
  
  // Truncate description if configured and not empty
  if (creative.elements?.truncate_description && processedJob.description) {
    const maxWords = creative.elements.max_description_words || 30;
    processedJob.description = truncateDescription(processedJob.description, maxWords);
  }
  
  // Format location (handle both object and string formats)
  if (job.location) {
    if (typeof job.location === 'string' && job.location.trim()) {
      processedJob.location_formatted = job.location.trim();
    } else if (typeof job.location === 'object' && job.location !== null) {
      const parts = [];
      if (job.location.city) parts.push(job.location.city);
      if (job.location.state) parts.push(job.location.state);
      if (job.location.country) parts.push(job.location.country);
      processedJob.location_formatted = parts.join(', ');
    } else {
      processedJob.location_formatted = '';
    }
  } else {
    processedJob.location_formatted = '';
  }
  
  // Add remote indicator
  if (job.is_remote) {
    processedJob.remote_text = 'Remote';
    processedJob.location_formatted = processedJob.location_formatted 
      ? `${processedJob.location_formatted} (Remote)` 
      : 'Remote';
  } else {
    processedJob.remote_text = '';
  }
  
  // Ensure job_type is not null
  processedJob.job_type = job.job_type || 'Not specified';
  
  // Ensure required fields have fallbacks
  processedJob.title = job.title || 'Untitled Position';
  processedJob.company = job.company || 'Company Not Specified';
  processedJob.date_posted = job.date_posted || '';

  // Replace placeholders in template
  let html = template;
  
  // Replace job fields
  Object.keys(processedJob).forEach(key => {
    const value = processedJob[key] || '';
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    html = html.replace(placeholder, String(value));
  });
  
  // Hide meta items with empty content
  html = html.replace(/<div class="meta-item">\s*<span class="icon">[^<]*<\/span>\s*<span><\/span>\s*<\/div>/g, '');
  html = html.replace(/<div class="meta-item">\s*<span class="icon">[^<]*<\/span>\s*<span>\s*<\/span>\s*<\/div>/g, '');
  
  // Replace nested fields (like location.city)
  html = html.replace(/{{\s*location\.city\s*}}/g, job.location?.city || '');
  html = html.replace(/{{\s*location\.state\s*}}/g, job.location?.state || '');
  html = html.replace(/{{\s*location\.country\s*}}/g, job.location?.country || '');
  
  // Apply creative config to CSS variables
  if (creative.canvas) {
    html = html.replace(/{{canvas_width}}/g, creative.canvas.width + 'px');
    html = html.replace(/{{canvas_height}}/g, creative.canvas.height + 'px');
    html = html.replace(/{{canvas_padding}}/g, creative.canvas.padding || '40px');
    html = html.replace(/{{background_color}}/g, creative.canvas.backgroundColor || '#ffffff');
  }
  
  if (creative.fonts) {
    html = html.replace(/{{font_heading}}/g, creative.fonts.heading || 'Arial');
    html = html.replace(/{{font_body}}/g, creative.fonts.body || 'Arial');
    if (creative.fonts.size) {
      html = html.replace(/{{font_size_title}}/g, creative.fonts.size.title || '48px');
      html = html.replace(/{{font_size_meta}}/g, creative.fonts.size.meta || '24px');
    }
  }
  
  if (creative.colors) {
    html = html.replace(/{{color_text}}/g, creative.colors.text || '#222222');
    html = html.replace(/{{color_accent}}/g, creative.colors.accent || '#4f46e5');
  }

  return html;
}

/**
 * Load and process a template file
 */
function loadTemplate(templatePath) {
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template file not found: ${templatePath}`);
  }
  
  return fs.readFileSync(templatePath, 'utf8');
}

/**
 * Complete template rendering pipeline
 */
function renderJobTemplate(templatePath, job, creative) {
  // Load template
  const template = loadTemplate(templatePath);
  
  // Merge data
  let html = mergeJobWithTemplate(template, job, creative);
  
  // Inject fonts
  const fonts = extractFonts(creative);
  html = injectFonts(html, fonts);
  
  return html;
}

module.exports = {
  mergeJobWithTemplate,
  loadTemplate,
  renderJobTemplate
};
