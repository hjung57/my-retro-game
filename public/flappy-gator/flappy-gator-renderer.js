/**
 * GatorRenderer - Side-view gator with white wings (based on Pac-Gator design)
 * Uses the same gator face from Pac-Gator but adds wings for flying
 */
class GatorRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.gatorGreen = '#5CB54D';
    this.darkOutline = '#2a4a3a';
    this.white = '#FFFFFF';
  }

  /**
   * Main render method - draws side-view gator with wings
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} rotation - Rotation angle in degrees
   * @param {boolean} isFlapping - Whether the gator is currently flapping
   */
  drawGator(x, y, rotation, isFlapping) {
    const ctx = this.ctx;
    
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rotation * Math.PI) / 180);
    
    // Calculate wing angle
    const wingAngle = this.animateWings(isFlapping);
    
    // Draw gator head first (side view, based on Pac-Gator)
    this.drawGatorHead(0, 0);
    
    // Draw wings on top (more visible)
    this.drawWings(0, 0, wingAngle);
    
    ctx.restore();
  }

  /**
   * Draws the gator head (side view, from Pac-Gator design)
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  drawGatorHead(x, y) {
    const ctx = this.ctx;
    const size = 20; // Scaled down for Flappy Gator
    
    // Draw outline/shadow first
    ctx.fillStyle = this.darkOutline;
    ctx.strokeStyle = this.darkOutline;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    // Main body outline
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y, size * 0.6, Math.PI * 0.6, Math.PI * 1.4);
    ctx.lineTo(x - size * 0.2, y - size * 0.6);
    ctx.lineTo(x, y - size * 0.5);
    ctx.lineTo(x + size * 0.2, y - size * 0.55);
    ctx.lineTo(x + size * 0.4, y - size * 0.5);
    ctx.lineTo(x + size * 1.2, y - size * 0.25);
    ctx.lineTo(x + size * 1.3, y - size * 0.15);
    ctx.lineTo(x + size * 1.35, y);
    ctx.lineTo(x + size * 1.3, y + size * 0.15);
    ctx.lineTo(x + size * 1.2, y + size * 0.25);
    ctx.lineTo(x + size * 0.4, y + size * 0.4);
    ctx.lineTo(x - size * 0.2, y + size * 0.5);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    
    // Draw main green body
    ctx.fillStyle = this.gatorGreen;
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y, size * 0.55, Math.PI * 0.6, Math.PI * 1.4);
    ctx.lineTo(x - size * 0.2, y - size * 0.55);
    ctx.lineTo(x, y - size * 0.45);
    ctx.lineTo(x + size * 0.2, y - size * 0.5);
    ctx.lineTo(x + size * 0.4, y - size * 0.45);
    ctx.lineTo(x + size * 1.2, y - size * 0.2);
    ctx.lineTo(x + size * 1.3, y - size * 0.1);
    ctx.lineTo(x + size * 1.35, y);
    ctx.lineTo(x + size * 1.3, y + size * 0.1);
    ctx.lineTo(x + size * 1.2, y + size * 0.2);
    ctx.lineTo(x + size * 0.4, y + size * 0.35);
    ctx.lineTo(x - size * 0.2, y + size * 0.45);
    ctx.closePath();
    ctx.fill();
    
    // Draw eye socket bump
    ctx.fillStyle = this.gatorGreen;
    ctx.beginPath();
    ctx.arc(x + size * 0.1, y - size * 0.3, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = this.darkOutline;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    
    // Draw eye (dark oval)
    ctx.fillStyle = this.darkOutline;
    ctx.beginPath();
    ctx.ellipse(x + size * 0.1, y - size * 0.3, size * 0.12, size * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw nostril
    ctx.fillStyle = this.darkOutline;
    ctx.beginPath();
    ctx.arc(x + size * 1.15, y - size * 0.05, size * 0.06, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw closed mouth line
    ctx.strokeStyle = this.darkOutline;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.3, y);
    ctx.lineTo(x + size * 1.25, y);
    ctx.stroke();
  }

  /**
   * Draws a single side-view wing with scalloped feather edge
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} wingAngle - Wing rotation angle in degrees
   */
  drawWings(x, y, wingAngle) {
    const ctx = this.ctx;
    const angleRad = (wingAngle * Math.PI) / 180;
    
    // Single wing extending from the side (fatter teardrop shape with scalloped edge)
    ctx.save();
    ctx.translate(x - 5, y + 2); // Shifted down slightly for better positioning
    ctx.rotate(angleRad);
    
    // Wing styling
    ctx.fillStyle = this.white;
    ctx.strokeStyle = this.darkOutline;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';
    
    // Main wing shape with scalloped feather edge (much fatter/wider vertically)
    ctx.beginPath();
    ctx.moveTo(0, 0); // Attachment point on body
    
    // Upper smooth curve (goes up more)
    ctx.quadraticCurveTo(-8, -15, -15, -18);
    
    // Rounded tip
    ctx.quadraticCurveTo(-18, -19, -20, -18);
    
    // Scalloped feather edge (4 scallops going down - much lower)
    ctx.quadraticCurveTo(-22, -14, -21, -10); // First scallop
    ctx.quadraticCurveTo(-20, -8, -19, -6);
    
    ctx.quadraticCurveTo(-18, -3, -17, 0); // Second scallop (crosses center)
    ctx.quadraticCurveTo(-16, 2, -15, 4);
    
    ctx.quadraticCurveTo(-12, 6, -10, 7); // Third scallop (goes below)
    ctx.quadraticCurveTo(-8, 8, -6, 8);
    
    ctx.quadraticCurveTo(-4, 7, -2, 5); // Fourth scallop
    
    // Back to attachment point (wider base)
    ctx.quadraticCurveTo(-1, 2, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }

  /**
   * Calculates wing angle with animation
   * @param {boolean} isFlapping - Whether actively flapping
   * @returns {number} Wing angle in degrees
   */
  animateWings(isFlapping) {
    if (isFlapping) {
      return -30; // Wings up when flapping (side view)
    } else {
      // Gentle idle animation - wing moves up and down slightly
      const time = Date.now() / 250;
      return 5 + Math.sin(time) * 10;
    }
  }
}

// Export for Node.js testing environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GatorRenderer;
}
