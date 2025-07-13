/**
 * Batch PNG rendering using Puppeteer
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { renderJobTemplate } = require('../core/renderTemplate');
const { slugify } = require('../core/utils');

class BatchRenderer {
  constructor() {
    this.browser = null;
  }

  async initialize() {
    console.log('Launching Puppeteer browser...');
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async renderToPNG(html, creative, outputPath) {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call initialize() first.');
    }

    const page = await this.browser.newPage();
    
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
      await page.screenshot({
        path: outputPath,
        type: 'png',
        clip: {
          x: 0,
          y: 0,
          width: creative.canvas.width,
          height: creative.canvas.height
        }
      });

      console.log(`✅ Generated: ${outputPath}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to generate ${outputPath}:`, error.message);
      return false;
    } finally {
      await page.close();
    }
  }

  async renderJobs(jobs, creative, templatePath, outputDir) {
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const results = {
      total: jobs.length,
      success: 0,
      failed: 0,
      errors: []
    };

    console.log(`Starting batch render of ${jobs.length} jobs...`);

    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i];
      console.log(`\nProcessing job ${i + 1}/${jobs.length}: ${job.title} at ${job.company}`);

      try {
        // Render template
        const html = renderJobTemplate(templatePath, job, creative);
        
        // Generate filename
        const filename = `job-${slugify(job.title)}-${slugify(job.company)}.png`;
        const outputPath = path.join(outputDir, filename);

        // Render to PNG
        const success = await this.renderToPNG(html, creative, outputPath);
        
        if (success) {
          results.success++;
        } else {
          results.failed++;
        }
      } catch (error) {
        console.error(`❌ Error processing job: ${error.message}`);
        results.failed++;
        results.errors.push({
          job: `${job.title} at ${job.company}`,
          error: error.message
        });
      }
    }

    return results;
  }
}

module.exports = { BatchRenderer };
