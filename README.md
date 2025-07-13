# The Factory

A production-ready, efficient, and modular system for generating PNG images from job data using Puppeteer. Features both CLI batch processing and a minimalist web interface

## Features

- **CLI Tool**: Batch process multiple jobs with a single command
- ** Web Interface**: Simple UI for single job processing and preview
- ** Template System**: HTML templates with placeholder replacement
- ** Creative Configs**: Control fonts, colors, layout, and styling
- ** Google Fonts**: Automatic font loading from Google Fonts
- ** Smart Formatting**: Automatic salary formatting and text truncation
- ** Performance**: Shared browser instances for efficiency

## Quick Start

### Installation

```bash
npm install
```

### Web Interface

Start the web server:

```bash
npm start
```

Open http://localhost:3000 in your browser.

### CLI Usage

Generate PNGs from job data:

```bash
npm run cli -- --jobs ./data/jobs.json --creative ./creative/theme.json --template ./templates/job-card.html --out ./output
```

Or using the binary:

```bash
npx factory --jobs ./data/jobs.json --creative ./creative/theme.json --template ./templates/job-card.html
```

## 📁 Project Structure

```
the-factory/
├── cli/                    # CLI batch processing
│   ├── index.js           # CLI entry point
│   └── batchRender.js     # Batch rendering logic
├── server/                # Web server
│   ├── server.js          # Express server
│   └── renderRoute.js     # API endpoints
├── core/                  # Shared logic
│   ├── renderTemplate.js  # Template merging
│   ├── applyFonts.js      # Google Fonts integration
│   ├── formatSalary.js    # Salary formatting
│   ├── truncateText.js    # Text truncation
│   └── utils.js           # Utility functions
├── public/                # Web UI
│   └── index.html         # Frontend interface
├── templates/             # HTML templates
│   └── job-card.html      # Sample template
├── creative/              # Creative configurations
│   └── theme.json         # Sample theme
├── data/                  # Sample job data
│   └── jobs.json          # Test jobs
└── output/                # Generated PNG output
```

## 📋 Job Data Schema

The system supports flexible job data formats. Here are two common structures:

**Full Schema (traditional format):**
```json
{
  "title": "Full Stack Developer",
  "company": "ExampleCorp",
  "company_url": "https://example.com",
  "job_url": "https://example.com/jobs/123",
  "location": {
    "country": "USA",
    "city": "New York", 
    "state": "NY"
  },
  "is_remote": true,
  "description": "We are looking for a full stack developer...",
  "job_type": "fulltime",
  "job_function": {
    "interval": "yearly",
    "min_amount": 90000,
    "max_amount": 120000,
    "currency": "USD",
    "salary_source": "direct_data"
  },
  "date_posted": "2025-07-10",
  "emails": ["apply@example.com"]
}
```

**LinkedIn-style Schema (real-world format):**
```json
{
  "title": "Creative Designer",
  "company": "CHANEL",
  "location": "Paris, France",
  "date_posted": "2025-07-12", 
  "job_url": "https://linkedin.com/jobs/view/123",
  "site": "linkedin",
  "salary_source": null,
  "description": "Join our creative team...",
  "is_remote": false,
  "job_type": "contract",
  "company_industry": "Luxury Goods",
  "experience_range": "junior"
}
```

### Required Fields
- `title` (string) - Only truly required field
- All other fields are optional and handled gracefully if missing or null

### Array Support
- **Web UI**: Accepts both single job objects and arrays of jobs
- **CLI**: Always processes arrays (single jobs should be wrapped in an array)  
- **Preview/Single Generation**: Uses the first job in an array
- **Batch Processing**: CLI processes all jobs in the array

## Creative Config Schema

```json
{
  "canvas": {
    "width": 1200,
    "height": 630,
    "padding": "40px",
    "backgroundColor": "#ffffff"
  },
  "fonts": {
    "heading": "Inter",
    "body": "Lato",
    "size": {
      "title": "48px",
      "meta": "24px"
    }
  },
  "colors": {
    "text": "#222222",
    "accent": "#4f46e5"
  },
  "elements": {
    "truncate_description": true,
    "max_description_words": 30
  }
}
```

## Template Placeholders

Available placeholders in HTML templates:

### Job Data
- `{{title}}` - Job title
- `{{company}}` - Company name
- `{{description}}` - Job description (auto-truncated)
- `{{salary}}` - Formatted salary range
- `{{location_formatted}}` - Formatted location string
- `{{remote_text}}` - "Remote" if applicable
- `{{date_posted}}` - Posted date
- `{{job_type}}` - Job type (fulltime, parttime, etc.)

### Creative Config
- `{{canvas_width}}` - Canvas width in pixels
- `{{canvas_height}}` - Canvas height in pixels
- `{{canvas_padding}}` - Canvas padding
- `{{background_color}}` - Background color
- `{{font_heading}}` - Heading font family
- `{{font_body}}` - Body font family
- `{{font_size_title}}` - Title font size
- `{{font_size_meta}}` - Meta font size
- `{{color_text}}` - Text color
- `{{color_accent}}` - Accent color

## API Endpoints

### POST /api/render
Generate PNG from job data
- **Body**: `{ job, creative, templatePath }`
- **Response**: PNG file download

### POST /api/preview
Generate HTML preview
- **Body**: `{ job, creative, templatePath }`
- **Response**: HTML content

### GET /api/templates
List available templates
- **Response**: Array of template objects

## 🛠 Development

### Build Commands
- `npm start` - Start web server
- `npm run cli` - Run CLI tool
- `npm run build` - No build step required
- `npm test` - Run tests (not implemented)

### Adding Templates

1. Create HTML file in `templates/` directory
2. Use placeholder syntax: `{{field_name}}`
3. Include CSS for styling
4. Template will be auto-detected by the web interface

### Custom Creative Configs

Create JSON files in `creative/` directory with:
- Canvas dimensions and styling
- Font families (Google Fonts supported)
- Color scheme
- Layout options

## 📊 Performance Notes

- Browser instance is shared across requests for efficiency
- Fonts are loaded from Google Fonts CDN
- Templates are loaded on-demand
- Large batches process sequentially to manage memory

## Security

- Input validation on all JSON inputs
- File path sanitization
- No arbitrary code execution
- Rate limiting recommended for production use

## License

MIT License - see LICENSE file for details.

