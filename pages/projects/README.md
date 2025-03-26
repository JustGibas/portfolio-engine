# Projects Directory

This directory contains both the projects page implementation and individual project data folders.

## Structure

```
projects/
│
├── projects.js     # Main projects page implementation
├── projects.css    # Projects page styles
│
├── Portfolio_Engine/   # Sample project folder
│   ├── project.js      # Project metadata
│   └── README.md       # Project documentation
│
├── Data_Visualization/ # Another project example
│   └── ...
│
└── AI_Chatbot/         # Another project example
    └── ...
```

## Projects Page

The main `projects.js` file:
- Loads project data via the page.getProjects() method
- Renders project cards for all available projects
- Handles click events to show detailed project views

## Project Configuration

Each project folder contains at minimum:

### project.js

Defines metadata for the project:

```javascript
export const projectConfig = {
  title: "Project Title",
  description: "Project description...",
  technologies: ["JavaScript", "CSS", "HTML"],
  image: "assets/images/project.jpg", // Path to project image
  link: "#projects/project-id", // Link to project detail or external URL
  // Optional metadata
  repository: "https://github.com/username/project",
  status: "Active",
  lastUpdated: "2023-11-20"
};
```

### README.md

Contains detailed documentation about the project, which is displayed in the project detail view.

## Adding a New Project

1. Create a new directory under `projects/` with your project name
2. Add a `project.js` file with your project metadata
3. Add a `README.md` file with project details
4. Optionally add project-specific assets in the project folder

The project will be automatically discovered and displayed on the projects page.
