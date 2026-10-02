/**
 * High-Performance Interactive Particle & Aurora Mesh Canvas
 * Pure Vanilla JS, Zero Dependencies, 60fps GPU-optimized
 * Passive listeners - 100% Non-blocking to scrolling
 */
class HeroCanvas {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { alpha: true });
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, radius: 160, isHovering: false };
    this.animId = null;
    this.isTabActive = true;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

    this.init();
  }

  init() {
    // Ensure canvas never traps scroll or touch gestures
    this.canvas.style.pointerEvents = 'none';
    this.resize();
    this.createParticles();
    this.attachEvents();
    this.animate();
  }

  resize() {
    const parent = this.canvas.parentElement || document.body;
    this.width = parent.clientWidth || window.innerWidth;
    this.height = parent.clientHeight || window.innerHeight;
    
    this.canvas.width = this.width * this.pixelRatio;
    this.canvas.height = this.height * this.pixelRatio;
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(this.pixelRatio, this.pixelRatio);

    const baseCount = this.width < 768 ? 35 : 80;
    if (this.particles.length > 0) {
      this.createParticles(baseCount);
    }
  }

  createParticles(count = null) {
    const total = count || (this.width < 768 ? 35 : 80);
    this.particles = [];

    const colors = [
      { r: 99, g: 102, b: 241 },   // Indigo
      { r: 139, g: 92, b: 246 },   // Violet
      { r: 6, g: 182, b: 212 },    // Cyan
      { r: 217, g: 70, b: 239 }    // Fuchsia
    ];

    for (let i = 0; i < total; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        baseRadius: Math.random() * 2 + 1,
        radius: Math.random() * 2 + 1,
        color: color,
        alpha: Math.random() * 0.5 + 0.25,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }
  }

  attachEvents() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => this.resize(), 150);
    }, { passive: true });

    // Track mouse on hero section or window without blocking any click or scroll
    const heroSection = document.getElementById('hero') || window;
    
    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // Only track if cursor is within viewport or near hero
      if (rect.top <= window.innerHeight && rect.bottom >= 0) {
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isHovering = true;
      } else {
        this.mouse.isHovering = false;
      }
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
      this.mouse.isHovering = false;
    }, { passive: true });

    // Passive touch tracking that NEVER stops touch scrolling
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        if (rect.top <= window.innerHeight && rect.bottom >= 0) {
          this.mouse.x = e.touches[0].clientX - rect.left;
          this.mouse.y = e.touches[0].clientY - rect.top;
          this.mouse.isHovering = true;
        }
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.mouse.isHovering = false;
    }, { passive: true });

    // Pause on hidden tab
    document.addEventListener('visibilitychange', () => {
      this.isTabActive = !document.hidden;
      if (this.isTabActive) {
        this.animate();
      } else if (this.animId) {
        cancelAnimationFrame(this.animId);
      }
    });
  }

  animate() {
    if (!this.isTabActive) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    const maxDist = this.width < 768 ? 90 : 130;
    const pLen = this.particles.length;

    for (let i = 0; i < pLen; i++) {
      const p1 = this.particles[i];

      p1.x += p1.vx;
      p1.y += p1.vy;

      if (p1.x < 0 || p1.x > this.width) p1.vx *= -1;
      if (p1.y < 0 || p1.y > this.height) p1.vy *= -1;

      // Mouse repulsion/attraction
      if (this.mouse.isHovering) {
        const dx = p1.x - this.mouse.x;
        const dy = p1.y - this.mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.mouse.radius) {
          const force = (1 - dist / this.mouse.radius) * 1.8;
          p1.x += (dx / dist) * force;
          p1.y += (dy / dist) * force;
        }
      }

      p1.pulseAngle += p1.pulseSpeed;
      p1.radius = p1.baseRadius + Math.sin(p1.pulseAngle) * 0.5;

      // Draw connecting lines
      for (let j = i + 1; j < pLen; j++) {
        const p2 = this.particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.2;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${opacity})`;
          this.ctx.lineWidth = 0.85;
          this.ctx.stroke();
        }
      }

      // Draw glow & point
      this.ctx.beginPath();
      this.ctx.arc(p1.x, p1.y, p1.radius * 2, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${p1.alpha * 0.22})`;
      this.ctx.fill();

      this.ctx.beginPath();
      this.ctx.arc(p1.x, p1.y, p1.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${p1.color.r}, ${p1.color.g}, ${p1.color.b}, ${p1.alpha})`;
      this.ctx.fill();
    }

    this.animId = requestAnimationFrame(() => this.animate());
  }
}

window.HeroCanvas = HeroCanvas;
