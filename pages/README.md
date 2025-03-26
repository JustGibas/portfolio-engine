# Pages Directory

This directory contains the content pages of the portfolio application. Each page is implemented as a module that can be dynamically loaded by the ModuleLoader system.

## Directory Structure

```
pages/
│
├── about/                  # About page
│   ├── about.js            # Page implementation
│   ├── about.css           # Page-specific styles
│   └── images/             # Page-specific images
│
├── contact/                # Contact page
│   ├── contact.js
│   └── contact.css
│
└── projects/               # Projects showcase page
    ├── projects.js         # Projects list implementation
    ├── projects.css        # Projects page styles
    │
    └── Portfolio_Engine/   # Individual project folder
        ├── project.js      # Project metadata
        └── README.md       # Project description
```

## Page Module Structure

Each page module follows this standard structure:

```javascript
const pageName = {
  // Page content data
  content: {
    title: "Page Title",
    // Other content properties...
  },
  
  // Initialize the page (called when page is first loaded)
  async init(entity) {
    // Load CSS, set up the page...
    this.render(entity.getComponent('dom').container);
  },
  
  // Render the page content
  render(container) {
    // Generate HTML and update the container...
  },
  
  // Called when page becomes visible
  mount() {
    // Additional setup when page is shown...
  },
  
  // Called when page is hidden
  unmount() {
    // Clean up when navigating away...
  }
};
```

## Project Folders

Individual projects under `projects/` each have their own directory containing:

- `project.js` - Exports project metadata (title, description, technologies, etc.)
- `README.md` - Detailed project description in markdown format
- Project-specific assets (images, etc.)

## Loading Process

Pages are discovered dynamically by the ResourceDiscoverySystem and loaded on demand by the ModuleLoader when the corresponding route is navigated to.

See the [engine documentation](../engine/README.md) for details on the module loading process.
