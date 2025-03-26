/**
 * @fileoverview Asset Configuration
 * 
 * This file centralizes configuration for all asset paths and defaults.
 * 
 * @module assetConfig
 */

const assetConfig = {
  // Base directory for assets
  baseDir: './assets/',
  
  // Default image to use when image loading fails
  defaultImage: './assets/images/placeholder.jpg',
  
  // Project image directory
  projectImages: './assets/images/projects/',
  
  // Profile images
  profileImage: './assets/images/profile.jpg',
  profileImageFallback: 'https://via.placeholder.com/300x300?text=Profile+Image',
  
  // Directory structure for different asset types
  directories: {
    images: 'images/',
    fonts: 'fonts/',
    data: 'data/',
    audio: 'audio/',
    video: 'video/',
  }
};

export default assetConfig;
