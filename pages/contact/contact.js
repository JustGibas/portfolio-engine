/**
 * @fileoverview Contact Page
 * 
 * This module defines the structure and content of the Contact page,
 * including form handling and validation.
 * 
 * @module contact
 * @requires config from ../../config.js
 */
//import config from '../../../config.js';
import { cssLoader } from '../../../engine/utils/css-loader.js';

const contact = {
  // Content data for the contact page
  content: {
    title: "Contact Me",
    intro: "Want to get in touch? Fill out the form below and I'll get back to you as soon as possible.",
    formLabels: {
      name: "Your Name",
      email: "Email Address",
      subject: "Subject",
      message: "Message",
      submit: "Send Message"
    },
    contactInfo: {
      email: config.site?.email || "contact@example.com",
      location: config.site?.location || "Location not specified",
      phone: config.site?.phone || "Phone not specified"
    }
  },
  
  // Initialize the contact page
  async init(entity) {
    this.entity = entity;
    this.ecs = entity.ecs;
    
    // Load CSS specific to this module
    try {
      await cssLoader.loadLocalCSS(import.meta.url);
    } catch (error) {
      console.warn('Failed to load contact page CSS:', error);
    }
    
    // Get the container from the entity
    const container = entity.getComponent('dom')?.container;
    if (container) {
      this.render(container);
    }
    
    return this;
  },
  
  // Render the contact page content
  render(container) {
    if (!container) return;
    
    const content = this.content;
    
    container.innerHTML = `
      <div class="contact-page">
        <h2 class="page-title">${content.title}</h2>
        <p class="page-intro">${content.intro}</p>
        
        <div class="contact-layout">
          <div class="contact-form-container">
            <form id="contact-form" class="contact-form">
              <div class="form-group">
                <label for="name">${content.formLabels.name}</label>
                <input type="text" id="name" name="name" required>
              </div>
              
              <div class="form-group">
                <label for="email">${content.formLabels.email}</label>
                <input type="email" id="email" name="email" required>
              </div>
              
              <div class="form-group">
                <label for="subject">${content.formLabels.subject}</label>
                <input type="text" id="subject" name="subject" required>
              </div>
              
              <div class="form-group">
                <label for="message">${content.formLabels.message}</label>
                <textarea id="message" name="message" rows="5" required></textarea>
              </div>
              
              <button type="submit" class="submit-btn">${content.formLabels.submit}</button>
            </form>
            <div id="form-response" class="form-response hidden"></div>
          </div>
          
          <div class="contact-info">
            <h3>Contact Information</h3>
            <ul>
              <li><i class="fas fa-envelope"></i> ${content.contactInfo.email}</li>
              <li><i class="fas fa-map-marker-alt"></i> ${content.contactInfo.location}</li>
              <li><i class="fas fa-phone"></i> ${content.contactInfo.phone}</li>
            </ul>
          </div>
        </div>
      </div>
    `;
    
    // Set up form submission handler
    const form = container.querySelector('#contact-form');
    if (form) {
      form.addEventListener('submit', this._handleFormSubmit.bind(this));
    }
  },
  
  // Handle form submission
  _handleFormSubmit(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const formResponse = document.getElementById('form-response');
    
    // Simple validation
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!name || !email || !message) {
      this._showFormResponse('Please fill in all required fields.', 'error');
      return;
    }
    
    // In a real application, you would send this data to a server
    // For this example, we'll just simulate a successful submission
    setTimeout(() => {
      this._showFormResponse('Thank you for your message! I\'ll get back to you soon.', 'success');
      form.reset();
    }, 1000);
  },
  
  // Show response message after form submission
  _showFormResponse(message, type) {
    const formResponse = document.getElementById('form-response');
    if (formResponse) {
      formResponse.textContent = message;
      formResponse.className = `form-response ${type}`;
      
      // Hide the message after a few seconds
      setTimeout(() => {
        formResponse.className = 'form-response hidden';
      }, 5000);
    }
  },
  
  // Lifecycle methods for the page module system
  mount() {
    console.info('Contact page mounted');
  },
  
  unmount() {
    // Clean up event listeners if needed
    const form = document.querySelector('#contact-form');
    if (form) {
      form.removeEventListener('submit', this._handleFormSubmit);
    }
    console.info('Contact page unmounted');
  }
};

export { contact };
