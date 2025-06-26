class ChristmasLights {
  constructor() {
    this.canvas = document.getElementById("lightsCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.isAnimating = false;
    this.animationId = null;
    this.currentLightIndex = 0;
    this.lastUpdateTime = 0;

    // Configuration
    this.config = {
      speed: 500, // milliseconds
      color: "#ff0000",
      maxIntensity: 1.0,
      circleSize: 40,
      rows: 1,
      lightsPerRow: 7,
      minIntensity: 0.2,
    };

    // Light states
    this.lights = [];
    this.rainbowColors = [
      "#ff0000",
      "#ff8000",
      "#ffff00",
      "#00ff00",
      "#0080ff",
      "#8000ff",
      "#ff0080",
    ];

    this.initializeLights();
    this.setupEventListeners();
    this.setupCanvas();
    this.updateDisplayValues();
    this.render();
  }

  initializeLights() {
    this.lights = [];
    for (let row = 0; row < this.config.rows; row++) {
      this.lights[row] = [];
      for (let col = 0; col < this.config.lightsPerRow; col++) {
        this.lights[row][col] = {
          intensity: this.config.minIntensity,
          targetIntensity: this.config.minIntensity,
          color: this.config.color,
          size: this.config.circleSize,
          glowRadius: 0,
          isActive: false,
        };
      }
    }
  }

  setupCanvas() {
    const container = this.canvas.parentElement;
    const containerRect = container.getBoundingClientRect();

    // Set canvas size based on content
    const padding = 40;
    const spacing = 20;
    const maxLightSize = Math.max(this.config.circleSize, 80);

    const canvasWidth = Math.max(
      400,
      this.config.lightsPerRow * (maxLightSize + spacing) + padding * 2
    );
    const canvasHeight = Math.max(
      200,
      this.config.rows * (maxLightSize + spacing) + padding * 2
    );

    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;

    // Set CSS size for responsive behavior
    this.canvas.style.maxWidth = "100%";
    this.canvas.style.height = "auto";
  }

  setupEventListeners() {
    // Toggle button
    document.getElementById("toggleBtn").addEventListener("click", () => {
      this.toggleAnimation();
    });

    // Reset button
    document.getElementById("resetBtn").addEventListener("click", () => {
      this.resetLights();
    });

    // Speed slider
    document.getElementById("speedSlider").addEventListener("input", (e) => {
      this.config.speed = parseInt(e.target.value);
      this.updateDisplayValues();
    });

    // Color picker
    document.getElementById("colorPicker").addEventListener("input", (e) => {
      this.config.color = e.target.value;
      this.updateLightColors();
      this.updateDisplayValues();
    });

    // Intensity slider
    document
      .getElementById("intensitySlider")
      .addEventListener("input", (e) => {
        this.config.maxIntensity = parseFloat(e.target.value);
        this.updateDisplayValues();
      });

    // Size slider
    document.getElementById("sizeSlider").addEventListener("input", (e) => {
      this.config.circleSize = parseInt(e.target.value);
      this.updateLightSizes();
      this.setupCanvas();
      this.updateDisplayValues();
    });

    // Rows slider
    document.getElementById("rowsSlider").addEventListener("input", (e) => {
      this.config.rows = parseInt(e.target.value);
      this.initializeLights();
      this.setupCanvas();
      this.updateDisplayValues();
    });

    // Lights per row slider
    document.getElementById("lightsPerRow").addEventListener("input", (e) => {
      this.config.lightsPerRow = parseInt(e.target.value);
      this.initializeLights();
      this.setupCanvas();
      this.updateDisplayValues();
    });

    // Preset buttons
    document.querySelectorAll(".preset-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.applyPreset(e.target.dataset.preset);
      });
    });

    // Window resize
    window.addEventListener("resize", () => {
      this.setupCanvas();
    });
  }

  updateDisplayValues() {
    document.getElementById(
      "speedValue"
    ).textContent = `${this.config.speed}ms`;
    document.getElementById("intensityValue").textContent = `${Math.round(
      this.config.maxIntensity * 100
    )}%`;
    document.getElementById(
      "sizeValue"
    ).textContent = `${this.config.circleSize}px`;
    document.getElementById("rowsValue").textContent = this.config.rows;
    document.getElementById("lightsPerRowValue").textContent =
      this.config.lightsPerRow;
  }

  updateLightColors() {
    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        this.lights[row][col].color = this.config.color;
      }
    }
  }

  updateLightSizes() {
    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        this.lights[row][col].size = this.config.circleSize;
      }
    }
  }

  applyPreset(preset) {
    switch (preset) {
      case "classic":
        this.config.color = "#ff0000";
        document.getElementById("colorPicker").value = "#ff0000";
        this.updateLightColors();
        break;
      case "rainbow":
        this.applyRainbowColors();
        break;
      case "winter":
        this.config.color = "#00bfff";
        document.getElementById("colorPicker").value = "#00bfff";
        this.updateLightColors();
        break;
      case "gold":
        this.config.color = "#ffd700";
        document.getElementById("colorPicker").value = "#ffd700";
        this.updateLightColors();
        break;
    }
  }

  applyRainbowColors() {
    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        this.lights[row][col].color =
          this.rainbowColors[col % this.rainbowColors.length];
      }
    }
  }

  toggleAnimation() {
    const toggleBtn = document.getElementById("toggleBtn");
    const container = document.querySelector(".container");

    if (this.isAnimating) {
      this.stopAnimation();
      toggleBtn.textContent = "Start Lights";
      container.classList.remove("lights-active");
    } else {
      this.startAnimation();
      toggleBtn.textContent = "Stop Lights";
      container.classList.add("lights-active");
    }
  }

  startAnimation() {
    this.isAnimating = true;
    this.lastUpdateTime = performance.now();
    this.animate();
  }

  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  resetLights() {
    this.stopAnimation();
    this.currentLightIndex = 0;

    // Reset all lights to minimum intensity
    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        this.lights[row][col].intensity = this.config.minIntensity;
        this.lights[row][col].targetIntensity = this.config.minIntensity;
        this.lights[row][col].isActive = false;
        this.lights[row][col].glowRadius = 0;
      }
    }

    document.getElementById("toggleBtn").textContent = "Start Lights";
    document.querySelector(".container").classList.remove("lights-active");
    this.render();
  }

  animate() {
    if (!this.isAnimating) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;

    if (deltaTime >= this.config.speed) {
      this.updateLightSequence();
      this.lastUpdateTime = currentTime;
    }

    this.updateLightTransitions();
    this.render();

    this.animationId = requestAnimationFrame(() => this.animate());
  }

  updateLightSequence() {
    // Reset previous light
    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        if (this.lights[row][col].isActive) {
          this.lights[row][col].targetIntensity = this.config.minIntensity;
          this.lights[row][col].isActive = false;
        }
      }
    }

    // Activate current light in all rows
    for (let row = 0; row < this.lights.length; row++) {
      if (this.lights[row] && this.lights[row][this.currentLightIndex]) {
        this.lights[row][this.currentLightIndex].targetIntensity =
          this.config.maxIntensity;
        this.lights[row][this.currentLightIndex].isActive = true;
      }
    }

    // Move to next light
    this.currentLightIndex =
      (this.currentLightIndex + 1) % this.config.lightsPerRow;
  }

  updateLightTransitions() {
    const transitionSpeed = 0.1;

    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        const light = this.lights[row][col];

        // Smooth intensity transition
        const intensityDiff = light.targetIntensity - light.intensity;
        light.intensity += intensityDiff * transitionSpeed;

        // Update glow radius based on intensity
        light.glowRadius = (light.intensity - this.config.minIntensity) * 30;
      }
    }
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.lights.length === 0) return;

    const padding = 40;
    const spacing = 20;
    const totalWidth =
      this.config.lightsPerRow * (this.config.circleSize + spacing) - spacing;
    const totalHeight =
      this.config.rows * (this.config.circleSize + spacing) - spacing;

    const startX = (this.canvas.width - totalWidth) / 2;
    const startY = (this.canvas.height - totalHeight) / 2;

    for (let row = 0; row < this.lights.length; row++) {
      for (let col = 0; col < this.lights[row].length; col++) {
        const light = this.lights[row][col];
        const x =
          startX +
          col * (this.config.circleSize + spacing) +
          this.config.circleSize / 2;
        const y =
          startY +
          row * (this.config.circleSize + spacing) +
          this.config.circleSize / 2;

        this.drawLight(x, y, light);
      }
    }

    // Draw connecting wire
    this.drawWire(startX, startY);
  }

  drawLight(x, y, light) {
    const radius = light.size / 2;

    // Draw glow effect
    if (light.glowRadius > 0) {
      const gradient = this.ctx.createRadialGradient(
        x,
        y,
        0,
        x,
        y,
        radius + light.glowRadius
      );
      const glowColor = this.hexToRgba(light.color, light.intensity * 0.3);
      gradient.addColorStop(0, glowColor);
      gradient.addColorStop(1, "transparent");

      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius + light.glowRadius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw main light circle
    this.ctx.fillStyle = this.hexToRgba(light.color, light.intensity);
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw light border
    this.ctx.strokeStyle = this.hexToRgba("#ffffff", 0.3);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    // Draw highlight
    const highlightGradient = this.ctx.createRadialGradient(
      x - radius * 0.3,
      y - radius * 0.3,
      0,
      x - radius * 0.3,
      y - radius * 0.3,
      radius * 0.6
    );
    highlightGradient.addColorStop(
      0,
      this.hexToRgba("#ffffff", light.intensity * 0.6)
    );
    highlightGradient.addColorStop(1, "transparent");

    this.ctx.fillStyle = highlightGradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawWire(startX, startY) {
    if (this.lights.length === 0) return;

    const spacing = 20;
    const wireY = startY - 10;

    for (let row = 0; row < this.config.rows; row++) {
      const currentWireY = wireY + row * (this.config.circleSize + spacing);

      this.ctx.strokeStyle = "#333333";
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(startX - 20, currentWireY);
      this.ctx.lineTo(
        startX +
          (this.config.lightsPerRow - 1) * (this.config.circleSize + spacing) +
          this.config.circleSize +
          20,
        currentWireY
      );
      this.ctx.stroke();

      // Draw connection points
      for (let col = 0; col < this.config.lightsPerRow; col++) {
        const x =
          startX +
          col * (this.config.circleSize + spacing) +
          this.config.circleSize / 2;

        this.ctx.strokeStyle = "#666666";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, currentWireY);
        this.ctx.lineTo(x, currentWireY + 15);
        this.ctx.stroke();
      }
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ChristmasLights();
});
