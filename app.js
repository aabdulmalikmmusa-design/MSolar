/**
 * SOLARIS QUANTUM - Advanced 3D Solar UI/UX
 * Interactive Refraction Glass Cube with Chromatic Aberration & Rolling Physics
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons if available
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playGlassChime(pitch = 520, decay = 0.8) {
    if (!soundEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, audioCtx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.95, audioCtx.currentTime + decay);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(pitch * 1.8, audioCtx.currentTime);
      filter.Q.setValueAtTime(4.0, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + decay);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + decay);
    } catch (e) {
      console.warn('Audio feedback error', e);
    }
  }

  // --- SLIDE DATA (matches reference format) ---
  const slides = [
    {
      index: '01',
      line1: 'HARVEST',
      line2: 'PURE',
      line3: 'LIGHT',
      tagline: 'We Capture Worlds Born from Sun.',
      description: 'Next-Gen Photovoltaic Architecture. Aerospace-grade silicon capturing 24.8% pure solar flux.',
      category: 'Photovoltaics',
      metricVal: '24.8%',
      metricLabel: 'Peak Cell Efficiency',
      accentColor: '#f59e0b',
    },
    {
      index: '02',
      line1: 'STORING',
      line2: 'ZERO',
      line3: 'CARBON',
      tagline: 'We Forge Resilience from Void.',
      description: 'Nexus Solid-State Storage. 15kWh scalable LFP battery with 8ms instant blackout shield.',
      category: 'Nexus Battery',
      metricVal: '100%',
      metricLabel: 'Grid Independence',
      accentColor: '#06b6d4',
    },
    {
      index: '03',
      line1: 'POWERING',
      line2: 'SMART',
      line3: 'GRIDS',
      tagline: 'We Orchestrate Autonomous Energy.',
      description: 'Autonomous Microgrid Optimization. AI-driven peak shaving and automated wholesale energy export.',
      category: 'Smart Grid',
      metricVal: '$0.00',
      metricLabel: 'Net Electric Utility Cost',
      accentColor: '#10b981',
    },
  ];

  let currentSlideIndex = 0;
  let isTransitioning = false;

  // --- THREE.JS 3D GLASS REFRACTION SCENE ---
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, 8.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  container.appendChild(renderer.domElement);
  renderer.domElement.id = 'webgl-canvas';

  // --- OFFSCREEN CANVAS FOR SHARP TYPOGRAPHY & REFRACTION TEXTURE ---
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 2048;
  textCanvas.height = 1536;
  const ctx = textCanvas.getContext('2d');

  function renderTextCanvas(slide, crossfadeAlpha = 1.0, prevSlide = null) {
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    // Deep cosmic background
    const bgGrad = ctx.createRadialGradient(
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      100,
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      textCanvas.width * 0.7
    );
    bgGrad.addColorStop(0, '#0c0e17');
    bgGrad.addColorStop(0.6, '#07080c');
    bgGrad.addColorStop(1, '#050608');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    // Subtle solar energy grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    ctx.lineWidth = 1;
    const gridSpacing = 120;
    for (let x = 0; x < textCanvas.width; x += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, textCanvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < textCanvas.height; y += gridSpacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(textCanvas.width, y);
      ctx.stroke();
    }

    // Warm solar flare behind the center typography
    const flare = ctx.createRadialGradient(
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      30,
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      480
    );
    flare.addColorStop(0, 'rgba(245, 158, 11, 0.16)');
    flare.addColorStop(0.5, 'rgba(234, 88, 12, 0.05)');
    flare.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = flare;
    ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    // Draw typography
    function drawSlideText(s, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '800 240px "Syne", sans-serif';

      const centerX = textCanvas.width * 0.5;
      const centerY = textCanvas.height * 0.5;
      const lineHeight = 250;

      // Glow pass
      ctx.shadowColor = 'rgba(245, 158, 11, 0.35)';
      ctx.shadowBlur = 30;
      ctx.fillStyle = '#ffffff';

      // 3 Stacked Words (matching "shaping Raw Forms")
      ctx.fillText(s.line1, centerX, centerY - lineHeight);
      ctx.fillText(s.line2, centerX, centerY);
      ctx.fillText(s.line3, centerX, centerY + lineHeight);

      ctx.restore();
    }

    if (prevSlide && crossfadeAlpha < 1.0) {
      drawSlideText(prevSlide, 1.0 - crossfadeAlpha);
    }
    drawSlideText(slide, crossfadeAlpha);
  }

  // Initial draw
  renderTextCanvas(slides[0]);

  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.generateMipmaps = false;

  // Background Plane in 3D Scene
  const bgGeometry = new THREE.PlaneGeometry(16, 12);
  const bgMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    depthWrite: false,
    depthTest: false,
  });
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  bgMesh.position.set(0, 0, -2);
  scene.add(bgMesh);

  // Render Target for Refraction
  const renderTarget = new THREE.WebGLRenderTarget(container.clientWidth * 1.5, container.clientHeight * 1.5, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  // --- 3D ROUNDED CUBE WITH GLASS REFRACTION & CHROMATIC ABERRATION SHADER ---
  // Create rounded cube geometry using THREE.RoundedBoxGeometry
  let cubeGeometry;
  if (THREE.RoundedBoxGeometry) {
    cubeGeometry = new THREE.RoundedBoxGeometry(3.1, 3.1, 3.1, 8, 0.48);
  } else {
    cubeGeometry = new THREE.BoxGeometry(3.0, 3.0, 3.0, 16, 16, 16);
  }

  // Refraction + Chromatic Aberration Shader
  const glassUniforms = {
    uTexture: { value: renderTarget.texture },
    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    uRefraction: { value: 0.125 }, // refractive bending
    uChromaticAberration: { value: 0.048 }, // dispersion (rainbow RGB split)
    uTime: { value: 0.0 },
    uLightPos: { value: new THREE.Vector3(4.0, 6.0, 7.0) },
  };

  const glassMaterial = new THREE.ShaderMaterial({
    uniforms: glassUniforms,
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vEyeVector;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPos.xyz;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vEyeVector = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      uniform vec2 uResolution;
      uniform float uRefraction;
      uniform float uChromaticAberration;
      uniform float uTime;
      uniform vec3 uLightPos;
      
      varying vec3 vNormal;
      varying vec3 vEyeVector;
      varying vec3 vWorldPosition;
      varying vec2 vUv;
      
      void main() {
        vec3 normal = normalize(vNormal);
        vec2 screenUV = gl_FragCoord.xy / uResolution;
        
        // Surface normal in eye space causes refraction
        vec2 distortion = normal.xy * uRefraction;
        
        // Lens curvature barrel distortion
        vec2 centerOffset = screenUV - vec2(0.5);
        distortion += centerOffset * dot(distortion, distortion) * 1.8;
        
        // Chromatic Aberration (dispersion separates Red, Green, Blue)
        float rOffset = 1.0 + uChromaticAberration * 2.8;
        float gOffset = 1.0;
        float bOffset = 1.0 - uChromaticAberration * 2.8;
        
        vec2 uvR = clamp(screenUV + distortion * rOffset, 0.001, 0.999);
        vec2 uvG = clamp(screenUV + distortion * gOffset, 0.001, 0.999);
        vec2 uvB = clamp(screenUV + distortion * bOffset, 0.001, 0.999);
        
        float r = texture2D(uTexture, uvR).r;
        float g = texture2D(uTexture, uvG).g;
        float b = texture2D(uTexture, uvB).b;
        
        // Specular Highlights: Crisp glossy reflections on bevels
        vec3 viewDir = normalize(vEyeVector);
        vec3 lightDir = normalize(uLightPos - vWorldPosition);
        vec3 halfDir = normalize(lightDir + viewDir);
        float NdotH = max(dot(normal, halfDir), 0.0);
        float specular = pow(NdotH, 45.0) * 1.95;
        
        // Secondary soft solar rim light
        vec3 lightDir2 = normalize(vec3(-4.0, 4.0, 5.0));
        vec3 halfDir2 = normalize(lightDir2 + viewDir);
        float specular2 = pow(max(dot(normal, halfDir2), 0.0), 22.0) * 0.5;
        
        // Fresnel Edge Sheen (glinting border of crystal quartz)
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.8);
        
        // Subtle solar golden prism iridescence
        vec3 prismTint = vec3(1.0, 0.98, 0.94);
        vec3 edgeGlow = vec3(0.96, 0.65, 0.2) * fresnel * 0.35;
        
        vec3 finalColor = vec3(r, g, b) * prismTint + (specular + specular2) * vec3(1.0, 1.0, 1.0) + fresnel * vec3(0.35, 0.45, 0.65) + edgeGlow;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
  });

  const glassCube = new THREE.Mesh(cubeGeometry, glassMaterial);
  glassCube.position.set(0, 0, 1.2);
  scene.add(glassCube);

  // Subtle floating solar quantum particles
  const particleCount = 60;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 14;
    particlePos[i + 1] = (Math.random() - 0.5) * 10;
    particlePos[i + 2] = (Math.random() - 0.5) * 4 + 0.5;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xf59e0b,
    size: 0.06,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- ROLLING PHYSICS & MOUSE DRAGGING STATE ---
  let isDragging = false;
  let prevMouse = { x: 0, y: 0 };
  let velocity = { x: 0.005, y: 0.007, z: 0.002 };
  let baseSpeedMultiplier = 1.0;
  let mouseTilt = { x: 0, y: 0 };
  let targetTilt = { x: 0, y: 0 };

  // Initial tilt (matching angle in screenshot 1)
  glassCube.rotation.x = 0.42;
  glassCube.rotation.y = 0.55;
  glassCube.rotation.z = -0.15;

  const canvasEl = renderer.domElement;

  function onPointerDown(e) {
    isDragging = true;
    prevMouse.x = e.clientX || (e.touches && e.touches[0].clientX);
    prevMouse.y = e.clientY || (e.touches && e.touches[0].clientY);
    velocity.x = 0;
    velocity.y = 0;
    canvasEl.classList.add('grabbing');
    playGlassChime(680, 0.4);
  }

  function onPointerMove(e) {
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    // Track mouse parallax across hero
    const rect = container.getBoundingClientRect();
    const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -(((clientY - rect.top) / rect.height) * 2 - 1);
    targetTilt.x = nx * 0.35;
    targetTilt.y = ny * 0.35;

    if (!isDragging) return;

    const deltaX = (clientX - prevMouse.x) * 0.008;
    const deltaY = (clientY - prevMouse.y) * 0.008;

    glassCube.rotation.y += deltaX;
    glassCube.rotation.x += deltaY;

    // Rolling momentum velocity
    velocity.x = deltaY * 0.35;
    velocity.y = deltaX * 0.35;

    prevMouse.x = clientX;
    prevMouse.y = clientY;
  }

  function onPointerUp() {
    if (isDragging) {
      isDragging = false;
      canvasEl.classList.remove('grabbing');
      playGlassChime(440, 0.5);
    }
  }

  canvasEl.addEventListener('mousedown', onPointerDown);
  window.addEventListener('mousemove', onPointerMove);
  window.addEventListener('mouseup', onPointerUp);

  canvasEl.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp);

  // --- SLIDE NAVIGATION & 3D TUMBLE ROLLING ANIMATION ---
  function updateSlideUI(slide) {
    // Update bottom left text
    const taglineEl = document.getElementById('hero-tagline');
    const descEl = document.getElementById('hero-desc');
    const slideNumberEl = document.getElementById('hero-slide-number');
    const startTodayTextEl = document.getElementById('start-today-text');
    const sliderInput = document.getElementById('hero-slide-range');

    if (taglineEl) taglineEl.textContent = slide.tagline;
    if (descEl) descEl.textContent = slide.description;
    if (slideNumberEl) slideNumberEl.textContent = slide.index;
    if (startTodayTextEl) startTodayTextEl.textContent = `Start Today: ${slide.category}`;
    if (sliderInput) sliderInput.value = currentSlideIndex;

    // Update pagination dots
    document.querySelectorAll('.slide-dot').forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('bg-amber-400', 'scale-125');
        dot.classList.remove('bg-white/30');
      } else {
        dot.classList.remove('bg-amber-400', 'scale-125');
        dot.classList.add('bg-white/30');
      }
    });
  }

  function goToSlide(newIndex, direction = 1) {
    if (isTransitioning || newIndex === currentSlideIndex) return;
    isTransitioning = true;

    const prevSlide = slides[currentSlideIndex];
    currentSlideIndex = (newIndex + slides.length) % slides.length;
    const nextSlide = slides[currentSlideIndex];

    playGlassChime(560 + currentSlideIndex * 80, 0.7);

    // Dynamic 3D Tumble Rolling Animation with GSAP
    if (window.gsap) {
      // 1. Tumble roll the cube energetically
      window.gsap.to(glassCube.rotation, {
        x: glassCube.rotation.x + Math.PI * 1.5 * direction,
        y: glassCube.rotation.y + Math.PI * 2.0 * direction,
        z: glassCube.rotation.z + 0.8 * direction,
        duration: 1.25,
        ease: 'power3.out',
      });

      // 2. Pulse cube scale & depth
      window.gsap.to(glassCube.position, {
        z: 0.3,
        duration: 0.5,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });

      // 3. Temporary chromatic aberration surge during spin
      window.gsap.to(glassUniforms.uChromaticAberration, {
        value: 0.085,
        duration: 0.4,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
        onComplete: () => {
          glassUniforms.uChromaticAberration.value = currentAberrationVal;
        },
      });

      // 4. Smooth canvas text crossfade
      const animObj = { progress: 0 };
      window.gsap.to(animObj, {
        progress: 1.0,
        duration: 0.85,
        ease: 'power2.inOut',
        onUpdate: () => {
          renderTextCanvas(nextSlide, animObj.progress, prevSlide);
          textTexture.needsUpdate = true;
        },
        onComplete: () => {
          renderTextCanvas(nextSlide, 1.0);
          textTexture.needsUpdate = true;
          isTransitioning = false;
        },
      });

      // Animate DOM elements fade
      window.gsap.fromTo(
        ['#hero-tagline', '#hero-desc'],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2 }
      );
    } else {
      // Fallback without GSAP
      renderTextCanvas(nextSlide, 1.0);
      textTexture.needsUpdate = true;
      glassCube.rotation.y += Math.PI * 1.5;
      isTransitioning = false;
    }

    updateSlideUI(nextSlide);
  }

  // Next / Prev Button Listeners
  const prevBtn = document.getElementById('slide-prev-btn');
  const nextBtn = document.getElementById('slide-next-btn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => goToSlide(currentSlideIndex - 1, -1));
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => goToSlide(currentSlideIndex + 1, 1));
  }

  // Slide Range Slider Listener
  const slideRange = document.getElementById('hero-slide-range');
  if (slideRange) {
    slideRange.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      if (val !== currentSlideIndex) {
        goToSlide(val, val > currentSlideIndex ? 1 : -1);
      }
    });
  }

  // Dot Click Listeners
  document.querySelectorAll('.slide-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.slide);
      if (!isNaN(idx)) {
        goToSlide(idx, idx > currentSlideIndex ? 1 : -1);
      }
    });
  });

  // --- HERO 3D CONTROLS (SPEED & CHROMATIC ABERRATION TOGGLES) ---
  const speedBtn = document.getElementById('toggle-speed-btn');
  const speedDisplay = document.getElementById('speed-display');
  const speeds = [1.0, 2.0, 0.5, 0.0];
  let speedIdx = 0;

  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      baseSpeedMultiplier = speeds[speedIdx];
      if (speedDisplay) {
        speedDisplay.textContent = baseSpeedMultiplier === 0 ? 'Paused' : `${baseSpeedMultiplier.toFixed(1)}x`;
      }
      playGlassChime(480 + speedIdx * 60, 0.3);
    });
  }

  const aberrationBtn = document.getElementById('toggle-aberration-btn');
  const aberrationDisplay = document.getElementById('aberration-display');
  const aberrations = [
    { label: 'Medium', val: 0.048 },
    { label: 'High', val: 0.09 },
    { label: 'Subtle', val: 0.02 },
  ];
  let aberrationIdx = 0;
  let currentAberrationVal = aberrations[0].val;

  if (aberrationBtn) {
    aberrationBtn.addEventListener('click', () => {
      aberrationIdx = (aberrationIdx + 1) % aberrations.length;
      currentAberrationVal = aberrations[aberrationIdx].val;
      glassUniforms.uChromaticAberration.value = currentAberrationVal;
      if (aberrationDisplay) {
        aberrationDisplay.textContent = aberrations[aberrationIdx].label;
      }
      playGlassChime(600 + aberrationIdx * 90, 0.3);
    });
  }

  // Sound Mute Toggle
  const soundBtn = document.getElementById('toggle-sound-btn');
  const soundIcon = document.getElementById('sound-icon');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      if (soundIcon) {
        soundIcon.setAttribute('data-lucide', soundEnabled ? 'volume-2' : 'volume-x');
        if (window.lucide) window.lucide.createIcons();
      }
      if (soundEnabled) playGlassChime(640, 0.3);
    });
  }

  // --- MAIN RENDER & ANIMATION LOOP ---
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    glassUniforms.uTime.value = elapsedTime;

    // Smooth tilt interpolation
    mouseTilt.x += (targetTilt.x - mouseTilt.x) * 0.05;
    mouseTilt.y += (targetTilt.y - mouseTilt.y) * 0.05;

    // Apply continuous 3D rolling physics if not actively dragging
    if (!isDragging) {
      // Natural ambient rolling motion
      const baseRollX = 0.005 * baseSpeedMultiplier;
      const baseRollY = 0.007 * baseSpeedMultiplier;
      const baseRollZ = 0.002 * baseSpeedMultiplier;

      // Inertia decay
      velocity.x *= 0.94;
      velocity.y *= 0.94;

      glassCube.rotation.x += baseRollX + velocity.x;
      glassCube.rotation.y += baseRollY + velocity.y;
      glassCube.rotation.z += baseRollZ;

      // Levitation floating bob
      glassCube.position.y = Math.sin(elapsedTime * 1.5) * 0.12;
      glassCube.position.x = mouseTilt.x * 0.4;
    }

    // Animate background particles
    if (particles) {
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;
    }

    // --- TWO-PASS RENDERING PIPELINE FOR REFRACTION ---
    // 1. Hide the glass cube and render background scene to renderTarget
    glassCube.visible = false;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    // 2. Make glass cube visible and render scene to default screen buffer
    glassCube.visible = true;
    renderer.setRenderTarget(null);
    renderer.render(scene, camera);
  }

  animate();

  // --- WINDOW RESIZE HANDLER ---
  function onWindowResize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderTarget.setSize(width * 1.5, height * 1.5);
    glassUniforms.uResolution.value.set(width, height);
  }

  window.addEventListener('resize', onWindowResize);

  // --- SOLAR SAVINGS CALCULATOR LOGIC ---
  const billSlider = document.getElementById('calc-bill-slider');
  const billValDisplay = document.getElementById('calc-bill-val');
  const homeSlider = document.getElementById('calc-home-slider');
  const homeValDisplay = document.getElementById('calc-home-val');
  const regionSelect = document.getElementById('calc-region');
  const batterySelect = document.getElementById('calc-battery');

  const savingsTotalDisplay = document.getElementById('calc-savings-total');
  const systemSizeDisplay = document.getElementById('calc-system-size');
  const taxCreditDisplay = document.getElementById('calc-tax-credit');
  const paybackDisplay = document.getElementById('calc-payback');
  const co2Display = document.getElementById('calc-co2');

  function calculateSolarSavings() {
    if (!billSlider) return;

    const monthlyBill = parseFloat(billSlider.value);
    const sqft = parseFloat(homeSlider ? homeSlider.value : 2500);
    const sunHours = parseFloat(regionSelect ? regionSelect.value : 5.2);
    const batteryCount = parseInt(batterySelect ? batterySelect.value : 1);

    if (billValDisplay) billValDisplay.textContent = `$${monthlyBill}`;
    if (homeValDisplay) homeValDisplay.textContent = `${sqft.toLocaleString()} sq ft`;

    // Calculation formulas
    const annualElectricCost = monthlyBill * 12;
    // Estimated kW needed based on monthly bill & sun hours
    const estimatedKWhPerMonth = monthlyBill / 0.18; // ~18c per kWh avg
    const dailyKWh = estimatedKWhPerMonth / 30;
    const systemSizeKW = Math.max(4.0, (dailyKWh / sunHours) * 1.15);

    // Estimated system gross cost ($2.95 per watt installed)
    const baseSolarCost = systemSizeKW * 1000 * 2.95;
    const batteryCost = batteryCount * 8500;
    const totalGrossCost = baseSolarCost + batteryCost;

    // 30% Federal ITC Tax Credit
    const taxCredit = totalGrossCost * 0.3;
    const netCost = totalGrossCost - taxCredit;

    // 25-Year cumulative savings (assuming 4.5% annual utility inflation)
    let cumulativeUtilityExpense = 0;
    let rate = annualElectricCost;
    for (let yr = 1; yr <= 25; yr++) {
      cumulativeUtilityExpense += rate;
      rate *= 1.045; // 4.5% grid inflation
    }

    const lifetimeSavings = Math.max(0, cumulativeUtilityExpense - netCost);
    const paybackYears = Math.min(12, netCost / annualElectricCost);
    const co2Tons = Math.round(systemSizeKW * 1.35 * 25);

    // Update UI Displays
    if (savingsTotalDisplay) savingsTotalDisplay.textContent = `$${Math.round(lifetimeSavings).toLocaleString()}`;
    if (systemSizeDisplay) systemSizeDisplay.textContent = `${systemSizeKW.toFixed(1)} kW DC`;
    if (taxCreditDisplay) taxCreditDisplay.textContent = `$${Math.round(taxCredit).toLocaleString()}`;
    if (paybackDisplay) paybackDisplay.textContent = `${paybackYears.toFixed(1)} Years`;
    if (co2Display) co2Display.textContent = `${co2Tons} Metric Tons`;
  }

  if (billSlider) billSlider.addEventListener('input', calculateSolarSavings);
  if (homeSlider) homeSlider.addEventListener('input', calculateSolarSavings);
  if (regionSelect) regionSelect.addEventListener('change', calculateSolarSavings);
  if (batterySelect) batterySelect.addEventListener('change', calculateSolarSavings);

  calculateSolarSavings();

  // --- 24-HOUR INTERACTIVE SOLAR ENERGY SIMULATOR ---
  const timeSlider = document.getElementById('sim-time-slider');
  const timeDisplay = document.getElementById('sim-time-display');
  const simPhaseDisplay = document.getElementById('sim-phase-display');
  const simSolarGauge = document.getElementById('sim-solar-kw');
  const simHomeGauge = document.getElementById('sim-home-kw');
  const simBatteryGauge = document.getElementById('sim-battery-pct');
  const simGridGauge = document.getElementById('sim-grid-kw');
  const simSunIndicator = document.getElementById('sim-sun-indicator');

  function update24hSimulator() {
    if (!timeSlider) return;
    const hourFloat = parseFloat(timeSlider.value);
    const hours = Math.floor(hourFloat);
    const minutes = Math.floor((hourFloat - hours) * 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    if (timeDisplay) timeDisplay.textContent = timeStr;

    // Solar production curve (peaks at 13:00, 0 at night)
    let solarKW = 0;
    if (hourFloat >= 6.0 && hourFloat <= 19.5) {
      // Bell curve between 6:00 and 19:30
      const progress = (hourFloat - 6.0) / (19.5 - 6.0);
      solarKW = Math.sin(progress * Math.PI) * 11.4;
    }

    // Typical home power consumption curve
    let homeKW = 1.2;
    if (hourFloat >= 7.0 && hourFloat <= 9.0) homeKW = 3.8; // morning routine
    else if (hourFloat >= 12.0 && hourFloat <= 16.0) homeKW = 4.2; // AC cooling
    else if (hourFloat >= 17.5 && hourFloat <= 22.0) homeKW = 5.6; // evening cooking, lighting, EV
    else homeKW = 1.4;

    // Battery state of charge calculation
    let batteryPct = 85;
    let gridKW = 0.0;
    let phase = 'Solar Generating';

    if (solarKW > homeKW) {
      // Surplus solar charges battery
      phase = 'Surplus Solar Charging Battery';
      batteryPct = Math.min(100, Math.round(50 + ((hourFloat - 8) / 8) * 50));
      gridKW = 0.0;
    } else if (solarKW > 0) {
      // Solar partial
      phase = 'Solar + Battery Discharging';
      batteryPct = Math.max(35, Math.round(100 - (hourFloat - 14) * 8));
      gridKW = 0.0;
    } else {
      // Night time
      if (hourFloat >= 20 || hourFloat <= 4) {
        phase = '100% Battery Clean Storage Power';
        batteryPct = Math.max(25, Math.round(90 - ((hourFloat >= 20 ? hourFloat - 20 : hourFloat + 4) * 6)));
      } else {
        phase = 'Pre-dawn Baseline';
        batteryPct = 32;
      }
      gridKW = 0.0;
    }

    // Update Gauges
    if (simPhaseDisplay) simPhaseDisplay.textContent = phase;
    if (simSolarGauge) simSolarGauge.textContent = `${solarKW.toFixed(1)} kW`;
    if (simHomeGauge) simHomeGauge.textContent = `${homeKW.toFixed(1)} kW`;
    if (simBatteryGauge) simBatteryGauge.textContent = `${batteryPct}%`;
    if (simGridGauge) simGridGauge.textContent = `${gridKW.toFixed(1)} kW (Zero Cost)`;

    // Update sun position arc
    if (simSunIndicator) {
      const sunProgress = Math.max(0, Math.min(1, (hourFloat - 6) / 14));
      const leftPos = sunProgress * 100;
      const topPos = Math.sin(sunProgress * Math.PI) * -40 + 40;
      simSunIndicator.style.left = `${leftPos}%`;
      simSunIndicator.style.top = `${topPos}%`;
      simSunIndicator.style.opacity = solarKW > 0.5 ? '1' : '0.2';
    }
  }

  if (timeSlider) {
    timeSlider.addEventListener('input', update24hSimulator);
    update24hSimulator();
  }

  // --- 3D ROOF SURVEY QUOTE MODAL ---
  const quoteModal = document.getElementById('quote-modal');
  const openModalBtns = document.querySelectorAll('.open-quote-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalForm = document.getElementById('quote-wizard-form');

  function openModal() {
    if (!quoteModal) return;
    quoteModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    playGlassChime(620, 0.4);
  }

  function closeModal() {
    if (!quoteModal) return;
    quoteModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    playGlassChime(420, 0.3);
  }

  openModalBtns.forEach((btn) => btn.addEventListener('click', openModal));
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside backdrop
  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeModal();
    });
  }

  // Multi-step modal navigation
  let currentStep = 1;
  const nextStepBtn = document.getElementById('modal-next-btn');
  const prevStepBtn = document.getElementById('modal-prev-btn');

  function updateModalStep(step) {
    currentStep = step;
    document.querySelectorAll('.modal-step-panel').forEach((panel) => {
      const s = parseInt(panel.dataset.step);
      panel.classList.toggle('hidden', s !== currentStep);
    });

    if (prevStepBtn) prevStepBtn.classList.toggle('hidden', currentStep === 1);
    if (nextStepBtn) {
      nextStepBtn.textContent = currentStep === 3 ? 'Generate 3D Solar Proposal' : 'Continue Next';
    }

    // Step progress indicators
    document.querySelectorAll('.step-pill').forEach((pill, idx) => {
      if (idx + 1 <= currentStep) {
        pill.classList.add('bg-amber-400', 'text-black');
        pill.classList.remove('bg-white/10', 'text-white/40');
      } else {
        pill.classList.remove('bg-amber-400', 'text-black');
        pill.classList.add('bg-white/10', 'text-white/40');
      }
    });
  }

  if (nextStepBtn) {
    nextStepBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep < 3) {
        updateModalStep(currentStep + 1);
        playGlassChime(580 + currentStep * 60, 0.3);
      } else {
        // Show success state
        document.getElementById('modal-wizard-body').classList.add('hidden');
        document.getElementById('modal-success-screen').classList.remove('hidden');
        playGlassChime(780, 0.8);
      }
    });
  }

  if (prevStepBtn) {
    prevStepBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        updateModalStep(currentStep - 1);
        playGlassChime(480, 0.3);
      }
    });
  }

  // Pre-fill estimate from calculator button
  const lockInEstimateBtn = document.getElementById('calc-lock-in-btn');
  if (lockInEstimateBtn) {
    lockInEstimateBtn.addEventListener('click', () => {
      openModal();
      const monthlyBillInput = document.getElementById('modal-monthly-bill');
      if (monthlyBillInput && billSlider) {
        monthlyBillInput.value = billSlider.value;
      }
    });
  }
});
