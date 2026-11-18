/* ==========================================================================
   AEGIS-X CYBER SHIELD ENGINE (Full 3D Holographic FX + Web Audio Synth)
   ========================================================================== */

// --- 1. Procedural Web Audio API Synthesizer ---
class CyberAudio {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playKeypress() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(900 + Math.random() * 500, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0.015, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.045);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.045);
  }

  playStateChange(frequency = 440) {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.6, this.ctx.currentTime + 0.28);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.28);
  }

  playShockwave() {
    if (!this.enabled) return;
    this.init();
    const now = this.ctx.currentTime;
    [220, 330, 440, 660].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 2, now + 0.5);

      gain.gain.setValueAtTime(0.04, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.55);
    });
  }

  playWarning() {
    if (!this.enabled) return;
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(95, this.ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }
}

const audio = new CyberAudio();

// --- 2. Full 3D Holographic Shield Scene (Three.js) ---
class CyberShieldScene {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.targetRotation = { x: 0, y: 0 };
    this.currentStrength = 0; // 0 to 1
    this.isGlitching = false;
    this.targetColor = new THREE.Color(0x00f0ff);
    this.shockwaves = [];

    this.initScene();
    this.build3DGridFloor();
    this.buildShield();
    this.buildEnergyField();
    this.buildOrbitRings();
    this.buildParticles();
    this.bindEvents();

    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02050a, 0.045);

    this.camera = new THREE.PerspectiveCamera(
      48,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 0.2, 7.2);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // Scene Lights
    this.ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(this.ambientLight);

    this.pointLight = new THREE.PointLight(0x00f0ff, 3.5, 25);
    this.pointLight.position.set(2, 2, 4.5);
    this.scene.add(this.pointLight);

    this.backLight = new THREE.PointLight(0x00f0ff, 2.5, 18);
    this.backLight.position.set(-2, -2, -3);
    this.scene.add(this.backLight);

    this.shieldGroup = new THREE.Group();
    this.scene.add(this.shieldGroup);
  }

  build3DGridFloor() {
    // True 3D Perspective Cyber Grid Floor & Ceiling
    this.bottomGrid = new THREE.GridHelper(40, 40, 0x00f0ff, 0x07253b);
    this.bottomGrid.position.y = -3.6;
    this.bottomGrid.material.transparent = true;
    this.bottomGrid.material.opacity = 0.45;
    this.scene.add(this.bottomGrid);

    this.topGrid = new THREE.GridHelper(40, 40, 0x00f0ff, 0x07253b);
    this.topGrid.position.y = 3.8;
    this.topGrid.material.transparent = true;
    this.topGrid.material.opacity = 0.2;
    this.scene.add(this.topGrid);
  }

  buildShield() {
    // Custom Beveled Crest Geometry
    const shape = new THREE.Shape();
    shape.moveTo(0, 1.9);
    shape.quadraticCurveTo(1.35, 1.75, 1.45, 0.55);
    shape.quadraticCurveTo(1.45, -0.65, 0, -1.95);
    shape.quadraticCurveTo(-1.45, -0.65, -1.45, 0.55);
    shape.quadraticCurveTo(-1.35, 1.75, 0, 1.9);

    const extrudeSettings = {
      depth: 0.35,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.1,
      bevelThickness: 0.1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.center();

    // Inner Armor Core Material
    this.shieldMaterial = new THREE.MeshStandardMaterial({
      color: 0x051324,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.38,
      metalness: 0.9,
      roughness: 0.15,
      transparent: true,
      opacity: 0.88
    });

    this.shieldMesh = new THREE.Mesh(geometry, this.shieldMaterial);
    this.shieldGroup.add(this.shieldMesh);

    // Additive Neon Lattice Wireframe Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    this.wireMesh = new THREE.Mesh(geometry, wireMat);
    this.wireMesh.scale.set(1.035, 1.035, 1.05);
    this.shieldGroup.add(this.wireMesh);

    // Spinning Center Quantum Reactor Core
    const coreGeo = new THREE.OctahedronGeometry(0.45, 1);
    this.coreMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });
    this.hexCore = new THREE.Mesh(coreGeo, this.coreMat);
    this.hexCore.position.z = 0.32;
    this.shieldGroup.add(this.hexCore);
  }

  buildEnergyField() {
    // Outer Geodesic Forcefield Sphere around the Shield
    const icoGeo = new THREE.IcosahedronGeometry(2.2, 2);
    this.fieldMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending
    });
    this.energyField = new THREE.Mesh(icoGeo, this.fieldMat);
    this.shieldGroup.add(this.energyField);
  }

  buildOrbitRings() {
    this.rings = [];
    const ringConfigs = [
      { radius: 2.35, tube: 0.018, speedX: 0.007, speedY: 0.012, speedZ: 0.004 },
      { radius: 2.65, tube: 0.012, speedX: -0.01, speedY: -0.006, speedZ: 0.008 },
      { radius: 2.95, tube: 0.014, speedX: 0.004, speedY: -0.014, speedZ: -0.005 }
    ];

    ringConfigs.forEach((cfg, index) => {
      const geo = new THREE.TorusGeometry(cfg.radius, cfg.tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.65 - index * 0.12,
        blending: THREE.AdditiveBlending
      });
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(index * 0.8, index * 0.5, 0);
      ring.userData = cfg;
      this.rings.push(ring);
      this.scene.add(ring);
    });
  }

  buildParticles() {
    const count = 600;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 18;
      positions[i + 1] = (Math.random() - 0.5) * 14;
      positions[i + 2] = (Math.random() - 0.5) * 12;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particleMaterial = new THREE.PointsMaterial({
      color: 0x00f0ff,
      size: 0.055,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  triggerShockwave() {
    const geo = new THREE.RingGeometry(0.5, 0.68, 64);
    const mat = new THREE.MeshBasicMaterial({
      color: this.targetColor.clone(),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(this.shieldGroup.position);
    mesh.rotation.copy(this.shieldGroup.rotation);
    this.scene.add(mesh);
    this.shockwaves.push({ mesh, scale: 1, opacity: 0.95 });
  }

  recenter() {
    this.targetRotation.x = 0;
    this.targetRotation.y = 0;
    this.triggerShockwave();
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    window.addEventListener('pointermove', (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      this.targetRotation.y = x * 0.55;
      this.targetRotation.x = -y * 0.4;
    });
  }

  updateStrength(scoreNormalized, hexColor, isWeakGlitch = false) {
    const prevStrength = this.currentStrength;
    this.currentStrength = scoreNormalized;
    this.isGlitching = isWeakGlitch;
    this.targetColor.set(hexColor);

    // Fire shockwave when crossing into strong/quantum tier
    if (scoreNormalized >= 0.85 && prevStrength < 0.85) {
      this.triggerShockwave();
      audio.playShockwave();
    }
  }

  animate(time) {
    requestAnimationFrame(this.animate);
    const delta = time * 0.001;

    // Smooth Color Transitions
    this.shieldMaterial.emissive.lerp(this.targetColor, 0.06);
    this.wireMesh.material.color.lerp(this.targetColor, 0.06);
    this.pointLight.color.lerp(this.targetColor, 0.06);
    this.backLight.color.lerp(this.targetColor, 0.06);
    this.fieldMat.color.lerp(this.targetColor, 0.06);
    this.particleMaterial.color.lerp(this.targetColor, 0.06);

    // Forcefield opacity scales with password strength
    this.fieldMat.opacity = 0.06 + this.currentStrength * 0.18;
    this.energyField.rotation.y = -delta * 0.25;
    this.energyField.rotation.z = delta * 0.15;

    // Mouse Parallax Gimbal Interpolation
    this.shieldGroup.rotation.y += (this.targetRotation.y - this.shieldGroup.rotation.y) * 0.06;
    this.shieldGroup.rotation.x += (this.targetRotation.x - this.shieldGroup.rotation.x) * 0.06;

    // Hovering Sine Float + Glitch Jitter on Weak Passwords
    let jitterX = 0;
    let jitterY = Math.sin(delta * 1.8) * 0.14;
    if (this.isGlitching && Math.random() > 0.65) {
      jitterX = (Math.random() - 0.5) * 0.12;
      jitterY += (Math.random() - 0.5) * 0.12;
    }
    this.shieldGroup.position.set(jitterX, jitterY, 0);

    // Core Rotation & Pulse
    const pulseFactor = 1 + Math.sin(delta * (2.5 + this.currentStrength * 9)) * 0.12;
    this.hexCore.scale.set(pulseFactor, pulseFactor, pulseFactor);
    this.hexCore.rotation.y = delta * 1.5;
    this.hexCore.rotation.x = delta * 0.9;

    // Orbit Rings Speed & Sync
    const speedMultiplier = 1 + this.currentStrength * 2.8;
    this.rings.forEach(ring => {
      ring.rotation.x += ring.userData.speedX * speedMultiplier;
      ring.rotation.y += ring.userData.speedY * speedMultiplier;
      ring.rotation.z += ring.userData.speedZ * speedMultiplier;
      ring.material.color.lerp(this.targetColor, 0.06);
      ring.position.y = this.shieldGroup.position.y;
    });

    // Animate Expanding 3D Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.scale += 0.14;
      sw.opacity -= 0.022;
      sw.mesh.scale.set(sw.scale, sw.scale, 1);
      sw.mesh.material.opacity = Math.max(0, sw.opacity);
      if (sw.opacity <= 0) {
        this.scene.remove(sw.mesh);
        sw.mesh.geometry.dispose();
        sw.mesh.material.dispose();
        this.shockwaves.splice(i, 1);
      }
    }

    // Scroll 3D Grid Floor Forward
    this.bottomGrid.position.z = (delta * 1.2) % 1;
    this.topGrid.position.z = (delta * 1.2) % 1;

    // Particle Field Rotation
    this.particles.rotation.y = delta * 0.035;
    this.particles.rotation.x = Math.sin(delta * 0.1) * 0.05;

    // Update Center HUD Telemetry
    document.getElementById('spec-rotation').innerText = 
      `GIMBAL: ${(this.shieldGroup.rotation.y * (180 / Math.PI)).toFixed(1)}°`;
    document.getElementById('spec-resonance').innerText = 
      `RESONANCE: ${Math.floor(this.currentStrength * 100)}%`;
    document.getElementById('spec-flux').innerText = 
      this.isGlitching ? 'FLUX: UNSTABLE' : (this.currentStrength > 0.8 ? 'FLUX: QUANTUM' : 'FLUX: STABLE');

    this.renderer.render(this.scene, this.camera);
  }
}

// --- 3. Cryptographic Password Analyzer ---
class PasswordAnalyzer {
  static evaluate(password) {
    const result = {
      length: password.length,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNum: /[0-9]/.test(password),
      hasSym: /[^a-zA-Z0-9]/.test(password),
      entropy: 0,
      crackTimeStr: 'INSTANTANEOUS',
      score: 0,
      statusText: 'SHIELD OFFLINE',
      statusColor: '#00f0ff',
      isGlitching: false,
      vulnerabilities: []
    };

    if (!password) {
      result.vulnerabilities.push('Awaiting credential sequence input.');
      return result;
    }

    let poolSize = 0;
    if (result.hasLower) poolSize += 26;
    if (result.hasUpper) poolSize += 26;
    if (result.hasNum) poolSize += 10;
    if (result.hasSym) poolSize += 33;
    if (poolSize === 0) poolSize = 1;

    result.entropy = Math.round(password.length * Math.log2(poolSize) * 10) / 10;

    if (password.length < 8) {
      result.vulnerabilities.push('CRITICAL: Vector length under 8 characters.');
    } else if (password.length < 12) {
      result.vulnerabilities.push('WARNING: Sub-optimal length (< 12 characters).');
    }

    if (/(.)\1{2,}/.test(password)) {
      result.vulnerabilities.push('Repetitive character blocks detected.');
    }
    if (/^[0-9]+$/.test(password)) {
      result.vulnerabilities.push('High Risk: Numeric-only sequence.');
    }
    if (/^[a-zA-Z]+$/.test(password)) {
      result.vulnerabilities.push('Missing numbers and special symbols.');
    }
    if (/(1234|asdf|qwerty|password|admin|welcome|letmein)/i.test(password)) {
      result.vulnerabilities.push('ALERT: Known dictionary/keyboard pattern detected.');
    }

    const combinations = Math.pow(poolSize, password.length);
    const seconds = combinations / 1e10;
    result.crackTimeStr = this.formatTime(seconds);

    let score = Math.min(100, (result.entropy / 95) * 100);
    if (result.vulnerabilities.length >= 2) score = Math.min(score, 32);
    result.score = Math.round(score);

    if (score < 30) {
      result.statusText = 'CRITICAL BREACH // WEAK';
      result.statusColor = '#ff2a55';
      result.isGlitching = true;
    } else if (score < 60) {
      result.statusText = 'MODERATE DEFENSE';
      result.statusColor = '#ffb800';
    } else if (score < 85) {
      result.statusText = 'HARDENED SHIELD';
      result.statusColor = '#00f0ff';
    } else {
      result.statusText = 'QUANTUM FORTIFIED';
      result.statusColor = '#00ff88';
    }

    if (result.vulnerabilities.length === 0) {
      result.vulnerabilities.push('Zero structural vulnerabilities detected.');
    }

    return result;
  }

  static formatTime(seconds) {
    if (seconds < 0.001) return 'INSTANTANEOUS';
    if (seconds < 1) return `${seconds.toFixed(2)} SEC`;
    if (seconds < 60) return `${Math.round(seconds)} SECONDS`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} MINUTES`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} HOURS`;
    if (seconds < 31536000) return `${Math.round(seconds / 86400)} DAYS`;
    if (seconds < 31536000000) return `${Math.round(seconds / 31536000)} YEARS`;
    return '1.0E+ BILLION YRS';
  }
}

// --- 4. Main UI Controller ---
document.addEventListener('DOMContentLoaded', () => {
  const shieldScene = new CyberShieldScene('canvas-container');

  const passwordInput = document.getElementById('password-input');
  const toggleVisibility = document.getElementById('toggle-visibility');
  const copyBtn = document.getElementById('copy-password');
  const recenterBtn = document.getElementById('recenter-btn');
  const entropyVal = document.getElementById('entropy-value');
  const entropyBar = document.getElementById('entropy-bar');
  const crackTime = document.getElementById('crack-time');
  const shieldStatus = document.getElementById('shield-status-text');
  const gaugeFill = document.getElementById('gauge-fill');
  const vulnList = document.getElementById('vuln-list');
  const audioToggle = document.getElementById('audio-toggle');
  const feedMsg = document.getElementById('feed-msg');

  const genSlider = document.getElementById('gen-length');
  const genLengthDisplay = document.getElementById('gen-length-display');
  const genBtn = document.getElementById('generate-btn');
  const genSym = document.getElementById('gen-sym-chk');
  const genNum = document.getElementById('gen-num-chk');
  const genMixed = document.getElementById('gen-mixed-chk');

  const critMap = {
    length: document.getElementById('crit-len'),
    upper: document.getElementById('crit-upper'),
    lower: document.getElementById('crit-lower'),
    num: document.getElementById('crit-num'),
    sym: document.getElementById('crit-sym')
  };

  let previousScoreCategory = '';

  function handleInput() {
    const val = passwordInput.value;
    audio.playKeypress();
    const evaluation = PasswordAnalyzer.evaluate(val);

    entropyVal.innerHTML = `${evaluation.entropy} <span class="unit">BITS</span>`;
    entropyBar.style.width = `${Math.min(100, (evaluation.entropy / 110) * 100)}%`;
    crackTime.innerText = evaluation.crackTimeStr;
    shieldStatus.innerText = evaluation.statusText;
    gaugeFill.style.width = `${evaluation.score}%`;
    document.documentElement.style.setProperty('--theme-color', evaluation.statusColor);

    critMap.length.classList.toggle('active', val.length >= 12);
    critMap.upper.classList.toggle('active', evaluation.hasUpper);
    critMap.lower.classList.toggle('active', evaluation.hasLower);
    critMap.num.classList.toggle('active', evaluation.hasNum);
    critMap.sym.classList.toggle('active', evaluation.hasSym);

    vulnList.innerHTML = '';
    evaluation.vulnerabilities.forEach(msg => {
      const li = document.createElement('li');
      li.className = `vuln-item ${evaluation.score >= 80 ? 'safe' : ''}`;
      li.innerText = msg;
      vulnList.appendChild(li);
    });

    if (evaluation.statusText !== previousScoreCategory && val.length > 0) {
      if (evaluation.score < 30) {
        audio.playWarning();
        feedMsg.innerText = 'WARNING: Shield integrity compromised. High brute-force vulnerability.';
      } else {
        audio.playStateChange(320 + evaluation.score * 4);
        feedMsg.innerText = `SHIELD MATRIX UPGRADED: Integrity at ${evaluation.score}%.`;
      }
      previousScoreCategory = evaluation.statusText;
    }

    shieldScene.updateStrength(
      evaluation.score / 100,
      evaluation.statusColor,
      evaluation.isGlitching
    );
  }

  passwordInput.addEventListener('input', handleInput);

  recenterBtn.addEventListener('click', () => {
    shieldScene.recenter();
    audio.playShockwave();
    feedMsg.innerText = 'GIMBAL CALIBRATED: Shield orientation locked to zero-point.';
  });

  toggleVisibility.addEventListener('click', () => {
    const isPass = passwordInput.type === 'password';
    passwordInput.type = isPass ? 'text' : 'password';
    toggleVisibility.innerText = isPass ? '🔒' : '👁️';
    audio.playStateChange(700);
  });

  copyBtn.addEventListener('click', () => {
    if (!passwordInput.value) return;
    navigator.clipboard.writeText(passwordInput.value);
    feedMsg.innerText = 'SECURE BUFFER: Cipher copied to system clipboard.';
    audio.playStateChange(950);
  });

  genSlider.addEventListener('input', (e) => {
    genLengthDisplay.innerText = `${e.target.value} CH`;
  });

  genBtn.addEventListener('click', () => {
    const length = parseInt(genSlider.value, 10);
    const chars = {
      lower: 'abcdefghijklmnopqrstuvwxyz',
      upper: genMixed.checked ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      num: genNum.checked ? '0123456789' : '',
      sym: genSym.checked ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : ''
    };

    let allowed = chars.lower + chars.upper + chars.num + chars.sym;
    if (!allowed) allowed = chars.lower;

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    let generated = '';
    for (let i = 0; i < length; i++) {
      generated += allowed[array[i] % allowed.length];
    }

    passwordInput.value = generated;
    handleInput();
    shieldScene.triggerShockwave();
    audio.playShockwave();
    feedMsg.innerText = 'QUANTUM FORGE COMPLETE: Maximum entropy shield deployed.';
  });

  audioToggle.addEventListener('click', () => {
    audio.enabled = !audio.enabled;
    audioToggle.querySelector('.btn-label').innerText = audio.enabled
      ? 'SYNTH: ACTIVE'
      : 'SYNTH: MUTED';
    audioToggle.style.opacity = audio.enabled ? '1' : '0.5';
  });
});