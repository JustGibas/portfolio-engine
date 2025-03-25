/**
 * @fileoverview About Module.
 * Renders the about section content for the portfolio.
 * @module about
 */
const about = {
  init(entity) {
    const container = entity.getComponent('dom').container;
    
    container.innerHTML = `
      <div class="about-container">
        <h2>About Me</h2>
        <div class="about-content">
          <div class="about-image">
            <img src="assets/images/profile.jpg" alt="Profile Image">
          </div>
          <div class="about-text">
            <p>Welcome to my portfolio. I am a creative technologist with a passion for developing innovative solutions and pushing the boundaries of technology.</p>
            <p>With extensive experience in web development, interactive media, and software engineering, I specialize in creating engaging digital experiences that combine cutting-edge technology with intuitive design.</p>
            <p>My approach is rooted in a deep understanding of both technical implementation and user-centered design principles, allowing me to build solutions that are not only functionally robust but also enjoyable to use.</p>
            <div class="about-details">
              <div class="detail-item">
                <span class="detail-label">Name:</span>
                <span class="detail-value">John Developer</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location:</span>
                <span class="detail-value">New York, USA</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Email:</span>
                <span class="detail-value">contact@johndeveloper.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
};

export { about };
