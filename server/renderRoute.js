/**
 * Express route for PNG rendering API
 */

const puppeteer = require('puppeteer');
const { renderJobTemplate } = require('../core/renderTemplate');
const { slugify } = require('../core/utils');

// Shared browser instance for efficiency
let browser = null;

async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
  }
  return browser;
}

async function renderPNG(req, res) {
  try {
    const { job, creative, templatePath } = req.body;

    // Validate input
    if (!job || !creative) {
      return res.status(400).json({
        error: 'Missing required fields: job and creative'
      });
    }

    if (!templatePath) {
      return res.status(400).json({
        error: 'Missing template path'
      });
    }

    // Handle arrays - use first job
    const jobData = Array.isArray(job) ? job[0] : job;
    if (!jobData) {
      return res.status(400).json({
        error: 'No job data found. Please provide a job object or non-empty array of jobs.'
      });
    }

    // Render template
    console.log(`Rendering job: ${jobData.title} at ${jobData.company}`);
    const html = renderJobTemplate(templatePath, jobData, creative);

    // Get browser
    const browserInstance = await getBrowser();
    const page = await browserInstance.newPage();

    try {
      // Set viewport to match canvas size
      await page.setViewport({
        width: creative.canvas.width,
        height: creative.canvas.height,
        deviceScaleFactor: 1
      });

      // Set content and wait for fonts to load
      await page.setContent(html, { 
        waitUntil: ['networkidle0', 'domcontentloaded'] 
      });

      // Take screenshot
      const pngBuffer = await page.screenshot({
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: creative.canvas.width,
          height: creative.canvas.height
        }
      });

      // Generate filename
      const filename = `job-${slugify(jobData.title)}-${slugify(jobData.company)}.png`;

      // Send PNG response
      res.set({
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pngBuffer.length
      });
      
      res.send(pngBuffer);
      
      console.log(`✅ Successfully rendered: ${filename}`);
    } finally {
      await page.close();
    }
  } catch (error) {
    console.error('❌ Render error:', error);
    res.status(500).json({
      error: 'Failed to render PNG',
      message: error.message
    });
  }
}

async function renderPreview(req, res) {
  try {
    const { job, creative, templatePath } = req.body;

    // Validate input
    if (!job || !creative) {
      return res.status(400).json({
        error: 'Missing required fields: job and creative'
      });
    }

    if (!templatePath) {
      return res.status(400).json({
        error: 'Missing template path'
      });
    }

    // Handle arrays - use first job  
    const jobData = Array.isArray(job) ? job[0] : job;
    if (!jobData) {
      return res.status(400).json({
        error: 'No job data found. Please provide a job object or non-empty array of jobs.'
      });
    }

    // Render template and return HTML for preview
    const html = renderJobTemplate(templatePath, jobData, creative);
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('❌ Preview error:', error);
    res.status(500).json({
      error: 'Failed to render preview',
      message: error.message
    });
  }
}

// Cleanup browser on process exit
process.on('exit', async () => {
  if (browser) {
    await browser.close();
  }
});

module.exports = {
  renderPNG,
  renderPreview
};
