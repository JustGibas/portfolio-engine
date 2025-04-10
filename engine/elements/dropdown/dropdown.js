/**
 * @fileoverview Header Dropdown Component
 * 
 * A plugin-based dropdown menu that can contain multiple sections, each 
 * provided by a different module. The dropdown handles its own positioning,
 * toggle behavior, accessibility, and animations.
 * 
 * PLUGIN ARCHITECTURE:
 * The dropdown demonstrates a plugin container pattern where:
 * 
 * 1. The dropdown provides the container and core behavior (show/hide/position)
 * 2. Content is provided by plugin sections with a consistent interface
 * 3. Each section must implement a render() method returning an HTMLElement
 * 4. Sections can be dynamically added at any time
 * 
 * This architecture enables highly composable UIs where functionality can be
 * added without modifying the core container code.
 * 
 * ### Key Responsibilities of page.js

- **Resource Discovery**: Finds available pages and projects
- **Module Lifecycle**: Handles loading, mounting, updating, and unmounting
- **Content Management**: Updates and re-renders page content
- **Error Handling**: Gracefully manages loading and rendering errors

### Main Methods

- `discoverPages()`: Discovers available pages in the pages directory
- `discoverProjects()`: Discovers available projects in the projects directory
- `load(moduleName, entity)`: Loads a page module by name
- `switchTo(moduleName, entity)`: Switches to a new page
- `updateContent(moduleName, newContent)`: Updates page content and re-renders
- `unmountCurrentModule()`: Unmounts the currently active module

## Module Reusability: Dropdown Example

The dropdown module demonstrates perfect reusability - it can be used in different contexts while maintaining its core functionality.

```ascii
┌─────────────────────────────────────────────────────────────────────┐
│                       Dropdown Module Reuse                         │
└─────────────────────────────────────────────────────────────────────┘

┌─── Header Implementation ────────────────────────────────────────────┐
│                                                                      │
│  ┌─── Navigation Bar ─────────────────┐    ┌─── Dropdown ──────────┐ │
│  │ Home  Projects  About  Contact     │    │ ▼                     │ │
│  └────────────────────────────────────┘    │ ┌─── Theme Select ──┐ │ │
│                                            │ │ Light             │ │ │
│                                            │ │ Dark              │ │ │
│                                            │ │ Neon              │ │ │
│                                            │ └──────────────────┘ │ │
│                                            │                      │ │
│                                            │ ┌─── Settings ─────┐ │ │
│                                            │ │ [x] Animations   │ │ │
│                                            │ │ [ ] Sounds       │ │ │
│                                            │ └──────────────────┘ │ │
│                                            └──────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘

┌─── Footer Implementation ───────────────────────────────────────────┐
│ © 2023 Portfolio Engine                                             │
│                           ┌─── Dropdown ─────────────────────────┐  │
│                           │ ▼                                    │  │
│                           │ ┌─── Language Select ─────────────┐  │  │
│                           │ │ English                         │  │  │
│                           │ │ Spanish                         │  │  │
│                           │ │ German                          │  │  │
│                           │ └─────────────────────────────────┘  │  │
│                           └────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### How Dropdown Reuse Works

1. **Same Core Component**: The `HeaderDropdown` class is used in multiple contexts
2. **Plugin Architecture**: Content is provided by plugins (ThemeSelector, Settings, etc.)
3. **Context Awareness**: The dropdown adapts to its parent container
4. **Same Event System**: Consistent event handling regardless of location
5. **CSS Scoping**: Styles apply correctly regardless of context

## Creating New Modules

Follow this pattern to ensure consistency:

1. **Interface Implementation**: Implement standard lifecycle methods (init, render, mount, unmount)
2. **CSS Loading**: Use cssLoader.loadLocalCSS(import.meta.url)
3. **Event Delegation**: Use event delegation for complex interactions
4. **State Management**: Encapsulate state within the module
5. **Error Handling**: Implement proper error fallbacks

## Module Lifecycle Flow

```ascii
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│               │     │               │     │               │
│     Init      │────►│    Mount      │────►│    Update     │
│               │     │               │     │               │
└───────┬───────┘     └───────────────┘     └───────┬───────┘
        │                                           │
        │                                           │
        │           ┌───────────────┐               │
        │           │               │               │
        └───────────┤    Unmount    │◄──────────────┘
                    │               │
                    └───────────────┘
```

## Best Practices

1. **Lazy Loading**: Load CSS and dependencies only when needed
2. **Fallback Handling**: Always provide fallbacks for assets
3. **Accessibility**: Include ARIA attributes and keyboard navigation
4. **Performance**: Optimize render cycles and DOM operations
5. **Documentation**: Document interface methods and expected behavior

By following these patterns, modules can be seamlessly moved between different contexts while maintaining full functionality and proper integration with the ECS architecture.
 * 
 */
import { cssLoader } from '../../modules/css-loader.js';

/**
 * Header Dropdown Component
 * 
 * A dropdown menu component that can have multiple sections registered
 * via plugins. Manages its own positioning, animations, and accessibility.
 */
class HeaderDropdown {
	constructor(options) {
		this.options = Object.assign({
			container: document.body,
			trigger: null,
			position: 'top-left',
			closeOnClickOutside: true,
			width: 'auto',
			onOpen: null,
			onClose: null
		}, options);
		this.isOpen = false;
		this.sections = new Map();
		this._loadCSS();
		this._createElements();
		this._setupEventHandlers();
		this._setupAccessibility();
	}
  
	async _loadCSS() {
		try {
			await cssLoader.loadLocalCSS(import.meta.url);
			console.info('Dropdown CSS loaded successfully');
		} catch (error) {
			console.warn('Could not load dropdown CSS:', error);
		}
	}
  
	_createElements() {
		this.dropdownElement = document.createElement('div');
		this.dropdownElement.className = 'header-dropdown';
		this.dropdownElement.setAttribute('role', 'menu');
		this.dropdownElement.setAttribute('aria-hidden', 'true');
		this.dropdownElement.style.display = 'none';
		this.options.container.appendChild(this.dropdownElement);
		this._updatePosition();
		if (this.options.width !== 'auto') {
			this.dropdownElement.style.width = this.options.width;
		}
	}
  
	_setupEventHandlers() {
		if (this.options.trigger) {
			this.options.trigger.addEventListener('click', (e) => {
				e.preventDefault();
				this.toggle();
			});
		}
		if (this.options.closeOnClickOutside) {
			document.addEventListener('click', (e) => {
				if (this.isOpen && !this.dropdownElement.contains(e.target) &&
					this.options.trigger !== e.target &&
					!this.options.trigger.contains(e.target)) {
					this.close();
				}
			});
		}
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen) {
				this.close();
			}
		});
	}
  
	_setupAccessibility() {
		if (this.options.trigger) {
			this.options.trigger.setAttribute('aria-haspopup', 'true');
			this.options.trigger.setAttribute('aria-expanded', 'false');
			const triggerId = this.options.trigger.id || 'header-dropdown-trigger';
			this.options.trigger.id = triggerId;
			this.dropdownElement.setAttribute('aria-labelledby', triggerId);
		}
	}
  
	_updatePosition() {
		this.dropdownElement.classList.remove(
			'position-bottom-right', 
			'position-bottom-left',
			'position-top-right',
			'position-top-left'
		);
		this.dropdownElement.classList.add(`position-${this.options.position}`);
	}
  
	toggle() {
		this.isOpen ? this.close() : this.open();
	}
  
	open() {
		if (this.isOpen) return;
		this.dropdownElement.style.display = 'block';
		setTimeout(() => {
			this.dropdownElement.classList.add('dropdown-visible');
		}, 10);
		this.isOpen = true;
		this.dropdownElement.setAttribute('aria-hidden', 'false');
		if (this.options.trigger) {
			this.options.trigger.setAttribute('aria-expanded', 'true');
		}
		if (this.options.onOpen) {
			this.options.onOpen();
		}
	}
  
	close() {
		if (!this.isOpen) return;
		this.dropdownElement.classList.remove('dropdown-visible');
		setTimeout(() => {
			this.dropdownElement.style.display = 'none';
		}, 150);
		this.isOpen = false;
		this.dropdownElement.setAttribute('aria-hidden', 'true');
		if (this.options.trigger) {
			this.options.trigger.setAttribute('aria-expanded', 'false');
		}
		if (this.options.onClose) {
			this.options.onClose();
		}
	}
  
	addSection(id, section) {
		if (this.sections.has(id)) return;
		this.sections.set(id, section);
		try {
			const sectionElement = section.render();
			if (sectionElement) {
				this.dropdownElement.appendChild(sectionElement);
			} else {
				console.warn(`Section ${id} rendered null element`);
			}
		} catch (error) {
			console.error(`Failed to render dropdown section ${id}:`, error);
		}
	}
}

export { HeaderDropdown };

export function createDropdown(world, options = {}) {
  const {
    parent,
    label = 'Dropdown',
    items = [],
    position = { x: 0, y: 0 }
  } = options;

  const dropdownId = world.entityManager.createEntity();

  const dropdownElement = document.createElement('div');
  dropdownElement.className = 'dropdown';

  world.componentManager.addComponent(dropdownId, 'domElement', {
    element: dropdownElement,
    parent: parent || document.body
  });

  world.componentManager.addComponent(dropdownId, 'dropdown', {
    isOpen: false,
    items: items,
    label: label
  });

  const itemIds = items.map((item) => {
    const itemId = world.entityManager.createEntity();
    const itemElement = document.createElement('div');
    itemElement.className = 'dropdown-item';
    itemElement.textContent = item.label;

    world.componentManager.addComponent(itemId, 'domElement', {
      element: itemElement,
      parent: dropdownElement
    });

    return itemId;
  });

  world.componentManager.addComponent(dropdownId, 'container', {
    children: itemIds
  });

  return dropdownId;
}
