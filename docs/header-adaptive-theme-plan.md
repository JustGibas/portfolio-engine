# Development Plan: Adaptive Header with Integrated Theme Selector

This document outlines the steps to implement an adaptive header that integrates the theme selector and auto-hides when scrolling down, reappearing when scrolling up.

---

## Goals

1. **Integrate Theme Selector**:
   - Move the theme selector functionality into the header.
   - Ensure the theme selector UI is seamlessly integrated with the header design.

2. **Make the Header Adaptive**:
   - The header should auto-hide when the user scrolls down.
   - The header should reappear when the user scrolls up.
   - Ensure smooth animations for hiding and showing the header.

3. **Maintain Usability**:
   - The header should remain accessible and functional.
   - Avoid abrupt or distracting animations.

---

## Implementation Steps

### Step 1: Move Theme Selector into Header

1. **Update Header Module**:
   - Modify the `headerBase` module to include the theme selector UI.
   - Remove the standalone `theme-selector` module.

2. **Update Header HTML**:
   - Add the theme selector buttons directly into the header's DOM structure.

3. **Update Theme Selector Logic**:
   - Move the theme selector's event listeners and logic into the header module.

---

### Step 2: Implement Auto-Hide Header

1. **Track Scroll Events**:
   - Use the `window.scroll` event to detect scrolling direction.
   - Determine if the user is scrolling up or down.

2. **Add CSS for Hidden Header**:
   - Create a CSS class (e.g., `.header-hidden`) to hide the header.
   - Use `transform: translateY(-100%)` for smooth hiding.

3. **Update Header Visibility**:
   - Add logic to toggle the `.header-hidden` class based on scroll direction.
   - Use a debounce or throttle function to optimize performance.

---

### Step 3: Ensure Smooth Animations

1. **Add CSS Transitions**:
   - Use `transition: transform 0.3s ease-in-out` for smooth animations.

2. **Test Across Devices**:
   - Ensure the animations work smoothly on both desktop and mobile devices.

---

### Step 4: Update Documentation

1. **Update Header Module Documentation**:
   - Document the new functionality and integration with the theme selector.

2. **Update Developer Instructions**:
   - Add notes about the adaptive header and its implementation.

---

## Technical Details

### CSS Changes

```css
/* filepath: d:\Game of life\GitHub\portfolio-engine\styles\base.css */
/* Add styles for the adaptive header */
.header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  transition: transform 0.3s ease-in-out;
}

.header-hidden {
  transform: translateY(-100%);
}
```

---

### JavaScript Changes

#### Update Header Module

```javascript
// filepath: d:\Game of life\GitHub\portfolio-engine\modules\header\header-base.js
/**
 * @fileoverview Base Header Module.
 * Renders the basic header content and integrates the theme selector.
 * Implements adaptive behavior to auto-hide on scroll down and reappear on scroll up.
 * @module headerBase
 */

import config from '../../config.js';

const headerBase = {
  lastScrollY: 0,
  isHidden: false,

  init(container) {
    // Render header with theme selector
    container.innerHTML = `
      <div class="header">
        <h1>Welcome to My Portfolio</h1>
        <div class="theme-selector">
          ${config.theme.availableThemes
            .map(
              (theme) =>
                `<button class="theme-btn" data-theme="${theme}">${theme}</button>`
            )
            .join('')}
        </div>
      </div>
    `;

    // Add theme selector logic
    this.initThemeSelector(container);

    // Add scroll event listener for adaptive behavior
    window.addEventListener('scroll', this.handleScroll.bind(this));
  },

  initThemeSelector(container) {
    const buttons = container.querySelectorAll('.theme-btn');
    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        const selectedTheme = button.getAttribute('data-theme');
        document.documentElement.setAttribute('data-theme', selectedTheme);
        localStorage.setItem('portfolio-theme', selectedTheme);
      });
    });
  },

  handleScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > this.lastScrollY && !this.isHidden) {
      // Scrolling down, hide header
      document.querySelector('.header').classList.add('header-hidden');
      this.isHidden = true;
    } else if (currentScrollY < this.lastScrollY && this.isHidden) {
      // Scrolling up, show header
      document.querySelector('.header').classList.remove('header-hidden');
      this.isHidden = false;
    }

    this.lastScrollY = currentScrollY;
  },
};

export { headerBase };
```

---

## Testing Plan

1. **Functional Testing**:
   - Verify that the theme selector works correctly within the header.
   - Test the auto-hide and reappear functionality on scroll.

2. **Cross-Browser Testing**:
   - Ensure compatibility with major browsers (Chrome, Firefox, Safari, Edge).

3. **Responsive Testing**:
   - Test the header behavior on different screen sizes and devices.

4. **Performance Testing**:
   - Ensure smooth animations and minimal impact on scroll performance.

---

## Future Enhancements

1. **Customizable Header**:
   - Allow users to customize the header (e.g., change colors or add a logo).

2. **Sticky Header Option**:
   - Add a toggle to make the header sticky (always visible).

3. **Dynamic Content**:
   - Add dynamic elements to the header, such as a search bar or notifications.

---

By following this plan, we can implement an adaptive header with integrated theme-changing functionality while maintaining a smooth user experience.
