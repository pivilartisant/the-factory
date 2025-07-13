#!/usr/bin/env node

/**
 * CLI interface for batch PNG generation
 */

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const { BatchRenderer } = require('./batchRender');

async function main() {
  const argv = yargs
    .usage('Usage: $0 --jobs <file> --creative <file> --template <file> [--out <dir>]')
    .option('jobs', {
      alias: 'j',
      describe: 'Path to jobs JSON file',
      type: 'string',
      demandOption: true
    })
    .option('creative', {
      alias: 'c',
      describe: 'Path to creative config JSON file',
      type: 'string',
      demandOption: true
    })
    .option('template', {
      alias: 't',
      describe: 'Path to HTML template file',
      type: 'string',
      demandOption: true
    })
    .option('out', {
      alias: 'o',
      describe: 'Output directory for PNG files',
      type: 'string',
      default: './output'
    })
    .help()
    .alias('help', 'h')
    .example('$0 --jobs ./data/jobs.json --creative ./creative/theme.json --template ./templates/job-card.html', 'Generate PNGs for all jobs')
    .argv;

  try {
    // Validate input files
    if (!fs.existsSync(argv.jobs)) {
      throw new Error(`Jobs file not found: ${argv.jobs}`);
    }
    if (!fs.existsSync(argv.creative)) {
      throw new Error(`Creative config file not found: ${argv.creative}`);
    }
    if (!fs.existsSync(argv.template)) {
      throw new Error(`Template file not found: ${argv.template}`);
    }

    // Load data
    console.log('Loading configuration files...');
    const jobsData = JSON.parse(fs.readFileSync(argv.jobs, 'utf8'));
    const creative = JSON.parse(fs.readFileSync(argv.creative, 'utf8'));

    // Ensure jobs is an array
    const jobs = Array.isArray(jobsData) ? jobsData : [jobsData];

    if (jobs.length === 0) {
      throw new Error('No jobs found in input file');
    }

    console.log(`Found ${jobs.length} job(s) to process`);

    // Initialize renderer
    const renderer = new BatchRenderer();
    await renderer.initialize();

    try {
      // Render jobs
      const results = await renderer.renderJobs(
        jobs,
        creative,
        argv.template,
        argv.out
      );

      // Print summary
      console.log('\n' + '='.repeat(50));
      console.log('BATCH RENDER COMPLETE');
      console.log('='.repeat(50));
      console.log(`Total jobs: ${results.total}`);
      console.log(`✅ Success: ${results.success}`);
      console.log(`❌ Failed: ${results.failed}`);

      if (results.errors.length > 0) {
        console.log('\nErrors:');
        results.errors.forEach(err => {
          console.log(`  - ${err.job}: ${err.error}`);
        });
      }

      console.log(`\nOutput saved to: ${path.resolve(argv.out)}`);
      
      // Exit with error code if any jobs failed
      process.exit(results.failed > 0 ? 1 : 0);
    } finally {
      await renderer.cleanup();
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run CLI
main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
