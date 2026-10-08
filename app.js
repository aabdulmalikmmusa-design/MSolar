/**
 * SOLARIS NIGERIA - Premium 3D Solar & Inverter Selling UI/UX
 * Interactive Refraction Glass Cube with Chromatic Aberration & Rolling Physics
 * Tailored for Nigerian Homes, Duplexes, and Businesses
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

  // --- NIGERIAN SOLAR SLIDE DATA (3 PAGES OF SLIDE ANIMATION) ---
  const slides = [
    {
      index: '01',
      title: 'Get your durable Solar',
      lines: ['GET YOUR', 'DURABLE SOLAR'],
      tagline: 'Get your durable Solar',
      description: 'High-yield Monocrystalline Solar Panels & Smart Hybrid Inverters delivering uninterrupted clean electricity across Nigeria.',
      category: 'Complete Solar Bundles',
      metricVal: '24/7',
      metricLabel: 'Continuous Light',
      accentColor: '#FFF1A6',
    },
    {
      index: '02',
      title: 'We offer the best service',
      lines: ['WE OFFER THE', 'BEST SERVICE'],
      tagline: 'We offer the best service',
      description: 'Certified NEMSA & COREN engineering installation with 5-year comprehensive inverter warranties nationwide.',
      category: 'Professional Installation',
      metricVal: '10+ Yrs',
      metricLabel: 'Battery Lifespan',
      accentColor: '#FFF1A6',
    },
    {
      index: '03',
      title: 'Durable Solar services here',
      lines: ['DURABLE SOLAR', 'SERVICES HERE'],
      tagline: 'Durable Solar services here',
      description: 'End generator fuel costs and enjoy tier-1 lithium power built to last for decades in tropical Nigerian weather.',
      category: 'Generator Fuel Savings',
      metricVal: '₦3.6M+',
      metricLabel: 'Annual Cash Saved',
      accentColor: '#FFF1A6',
    },
  ];

  let currentSlideIndex = 0;
  let isTransitioning = false;

  // --- THREE.JS 3D GLASS REFRACTION SCENE ---
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#FFF1A6'); // Pure milky Soft Butter scene background

  const isMobileInit = container.clientWidth < 768;
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 0, isMobileInit ? 11.2 : 8.5);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0xFFF1A6, 1); // Never clear to black!
  renderer.toneMapping = THREE.LinearToneMapping;
  renderer.toneMappingExposure = 1.0;
  container.appendChild(renderer.domElement);
  renderer.domElement.id = 'webgl-canvas';

  // --- OFFSCREEN CANVAS FOR 22cm x 15cm TYPOGRAPHY & REFRACTION TEXTURE ---
  const textCanvas = document.createElement('canvas');
  textCanvas.width = 2200;
  textCanvas.height = 1500;
  const ctx = textCanvas.getContext('2d');

  function renderTextCanvas(slide, crossfadeAlpha = 1.0, prevSlide = null) {
    ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

    // Soft radiant butter glow around typography for high legibility over faded solar panels
    const bgGrad = ctx.createRadialGradient(
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      120,
      textCanvas.width * 0.5,
      textCanvas.height * 0.5,
      textCanvas.width * 0.48
    );
    bgGrad.addColorStop(0, 'rgba(255, 241, 166, 0.85)');
    bgGrad.addColorStop(0.6, 'rgba(255, 241, 166, 0.45)');
    bgGrad.addColorStop(1, 'rgba(255, 241, 166, 0)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, textCanvas.width, textCanvas.height);

    // Draw typography function (Bold & Moderate inside 22cm x 15cm aspect ratio)
    function drawSlideText(s, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const centerX = textCanvas.width * 0.5;
      const centerY = textCanvas.height * 0.5;

      // Glow pass in warm Clay Brown
      ctx.shadowColor = 'rgba(107, 53, 42, 0.16)';
      ctx.shadowBlur = 18;
      ctx.fillStyle = '#6B352A'; // Clay Brown

      // Bold and human realistic Courier typography (comfortably fits 22cm x 15cm)
      const fontSize = 140;
      ctx.font = `700 ${fontSize}px "Courier Prime", "Courier New", Courier, monospace`;

      if (s.lines && s.lines.length === 2) {
        const lineOffset = 100;
        ctx.fillText(s.lines[0], centerX, centerY - lineOffset);
        ctx.fillText(s.lines[1], centerX, centerY + lineOffset);
      } else {
        ctx.fillText(s.title || s.line1, centerX, centerY);
      }

      ctx.restore();
    }

    if (prevSlide && crossfadeAlpha < 1.0) {
      drawSlideText(prevSlide, 1.0 - crossfadeAlpha);
    }
    drawSlideText(slide, crossfadeAlpha);
  }

  // Initial draw
  renderTextCanvas(slides[0]);

  // Re-draw once custom web fonts are fully loaded to guarantee crisp Courier weight
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      renderTextCanvas(slides[currentSlideIndex]);
      if (textTexture) textTexture.needsUpdate = true;
    });
  }

  const textTexture = new THREE.CanvasTexture(textCanvas);
  textTexture.minFilter = THREE.LinearFilter;
  textTexture.magFilter = THREE.LinearFilter;
  textTexture.generateMipmaps = false;

  // --- FADED SOLAR PANELS WATERMARK BACKGROUND TEXTURE ---
  const textureLoader = new THREE.TextureLoader();
  const solarBgTex = textureLoader.load('./assets/solar_panels_hero_bg.jpg', () => {
    solarBgTex.needsUpdate = true;
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  });
  solarBgTex.minFilter = THREE.LinearFilter;
  solarBgTex.magFilter = THREE.LinearFilter;

  // Background Plane in 3D Scene - oversized plane displaying faded solar panels
  const bgGeometry = new THREE.PlaneGeometry(36, 22);
  const bgMaterial = new THREE.MeshBasicMaterial({
    map: solarBgTex,
    transparent: true,
    opacity: 0.32, // Clearly visible faded solar panels so visitors immediately identify solar company
    depthWrite: false,
    depthTest: false,
  });
  const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
  bgMesh.position.set(0, 0, -3.2);
  scene.add(bgMesh);

  // Dedicated Write-up Mesh - mathematically sized to exactly 22cm width x 15cm height on screen
  const textGeometry = new THREE.PlaneGeometry(1, 1);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    depthWrite: false,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 0, -2);
  scene.add(textMesh);

  function updateTextMeshSize() {
    if (!container) return;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const isMobile = width < 768;

    let targetWidthPx;
    let targetHeightPx;

    if (isMobile) {
      // Mobile responsive sizing: enlarged for mobile clarity while fitting inside refraction prism
      targetWidthPx = width * 0.78;
      targetHeightPx = targetWidthPx * (1500 / 2200); // maintain 22:15 aspect ratio
    } else {
      // Desktop: mathematically exact 22cm width x 15cm height
      const cmToPx = 96 / 2.54; // 37.79527559 px/cm
      targetWidthPx = 22 * cmToPx; // 831.50 px (22cm)
      targetHeightPx = 15 * cmToPx; // 566.93 px (15cm)

      const maxAllowedWidth = Math.min(width * 0.90, targetWidthPx);
      const maxAllowedHeight = Math.min(height * 0.85, targetHeightPx);
      const scaleFactor = Math.min(maxAllowedWidth / targetWidthPx, maxAllowedHeight / targetHeightPx, 1.0);
      targetWidthPx *= scaleFactor;
      targetHeightPx *= scaleFactor;
    }

    const dist = camera.position.z - textMesh.position.z;
    const vFovRad = (camera.fov * Math.PI) / 360;
    const visibleHeightUnits = 2 * Math.tan(vFovRad) * dist;
    const unitsPerPixel = visibleHeightUnits / height;

    const planeW = targetWidthPx * unitsPerPixel;
    const planeH = targetHeightPx * unitsPerPixel;
    textMesh.scale.set(planeW, planeH, 1);
  }
  updateTextMeshSize();

  // Render Target for Refraction
  const renderTarget = new THREE.WebGLRenderTarget(container.clientWidth * 1.5, container.clientHeight * 1.5, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  // --- 3D ROUNDED CUBE WITH GLASS REFRACTION & CHROMATIC ABERRATION SHADER ---
  let cubeGeometry;
  if (THREE.RoundedBoxGeometry) {
    cubeGeometry = new THREE.RoundedBoxGeometry(3.1, 3.1, 3.1, 8, 0.48);
  } else {
    cubeGeometry = new THREE.BoxGeometry(3.0, 3.0, 3.0, 16, 16, 16);
  }

  // Refraction + Chromatic Aberration Shader for Milky Canvas
  const glassUniforms = {
    uTexture: { value: renderTarget.texture },
    uResolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) },
    uRefraction: { value: 0.11 }, // refractive bending
    uChromaticAberration: { value: 0.024 }, // clean dispersion on light background
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
        distortion += centerOffset * dot(distortion, distortion) * 1.5;
        
        // Chromatic Aberration (dispersion separates Red, Green, Blue)
        float rOffset = 1.0 + uChromaticAberration * 2.2;
        float gOffset = 1.0;
        float bOffset = 1.0 - uChromaticAberration * 2.2;
        
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
        float specular = pow(NdotH, 45.0) * 1.35;
        
        // Secondary soft rim light
        vec3 lightDir2 = normalize(vec3(-4.0, 4.0, 5.0));
        vec3 halfDir2 = normalize(lightDir2 + viewDir);
        float specular2 = pow(max(dot(normal, halfDir2), 0.0), 22.0) * 0.35;
        
        // Fresnel Edge Sheen (glinting border of crystal quartz)
        float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 2.5);
        
        vec3 refracted = vec3(r, g, b);
        vec3 highlights = (specular + specular2) * vec3(1.0, 1.0, 1.0);
        vec3 edgeRim = vec3(0.42, 0.208, 0.165) * fresnel * 0.35;
        
        vec3 finalColor = refracted + highlights * 0.45 - edgeRim * 0.15 + fresnel * vec3(0.1, 0.06, 0.03);
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `,
    transparent: true,
  });

  const glassCube = new THREE.Mesh(cubeGeometry, glassMaterial);
  glassCube.position.set(0, 0, 1.2);
  const cubeScaleInit = isMobileInit ? 0.88 : 1.0;
  glassCube.scale.set(cubeScaleInit, cubeScaleInit, cubeScaleInit);
  scene.add(glassCube);

  // Subtle floating clay brown particles
  const particleCount = 55;
  const particleGeo = new THREE.BufferGeometry();
  const particlePos = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount * 3; i += 3) {
    particlePos[i] = (Math.random() - 0.5) * 14;
    particlePos[i + 1] = (Math.random() - 0.5) * 10;
    particlePos[i + 2] = (Math.random() - 0.5) * 4 + 0.5;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x6B352A,
    size: 0.055,
    transparent: true,
    opacity: 0.35,
    blending: THREE.NormalBlending,
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

  // Initial tilt (matching reference angle)
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
    // If scrolled past hero section and not dragging, skip parallax work to keep scrolling 100% fluid
    if (window.scrollY > 800 && !isDragging) return;

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
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('mouseup', onPointerUp, { passive: true });

  canvasEl.addEventListener('touchstart', onPointerDown, { passive: true });
  window.addEventListener('touchmove', onPointerMove, { passive: true });
  window.addEventListener('touchend', onPointerUp, { passive: true });

  // --- SLIDE NAVIGATION & 3D TUMBLE ROLLING ANIMATION ---
  function updateSlideUI(slide) {
    const taglineEl = document.getElementById('hero-tagline');
    const descEl = document.getElementById('hero-desc');
    const slideNumberEl = document.getElementById('hero-slide-number');
    const startTodayTextEl = document.getElementById('start-today-text');
    const sliderInput = document.getElementById('hero-slide-range');

    if (taglineEl) taglineEl.textContent = slide.tagline;
    if (descEl) descEl.textContent = slide.description;
    if (slideNumberEl) slideNumberEl.textContent = slide.index;
    if (startTodayTextEl) startTodayTextEl.textContent = `Get Quote: ${slide.category}`;
    if (sliderInput) sliderInput.value = currentSlideIndex;

    // Update pagination dots in hero
    document.querySelectorAll('.slide-dot').forEach((dot, idx) => {
      if (idx === currentSlideIndex) {
        dot.classList.add('bg-clay-500', 'scale-125');
        dot.classList.remove('bg-clay-500/30');
      } else {
        dot.classList.remove('bg-clay-500', 'scale-125');
        dot.classList.add('bg-clay-500/30');
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

      // Animate DOM text fade
      window.gsap.fromTo(
        ['#hero-tagline', '#hero-desc'],
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, delay: 0.2 }
      );
    } else {
      renderTextCanvas(nextSlide, 1.0);
      textTexture.needsUpdate = true;
      glassCube.rotation.y += Math.PI * 1.5;
      isTransitioning = false;
    }

    updateSlideUI(nextSlide);
    resetSlideTimer();
  }

  // --- AUTOMATIC SLIDE TRANSITION PAGE TIMER (Every 9 seconds per slide) ---
  let slideInterval = null;
  function startSlideTimer() {
    stopSlideTimer();
    slideInterval = setInterval(() => {
      if (!isDragging && !isTransitioning) {
        goToSlide((currentSlideIndex + 1) % slides.length, 1);
      }
    }, 9000);
  }

  function stopSlideTimer() {
    if (slideInterval) {
      clearInterval(slideInterval);
      slideInterval = null;
    }
  }

  function resetSlideTimer() {
    startSlideTimer();
  }

  // Initialize auto-slide transition
  startSlideTimer();

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
    { label: 'Medium', val: 0.024 },
    { label: 'High', val: 0.05 },
    { label: 'Subtle', val: 0.01 },
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

    // If hero section is completely out of view, pause expensive WebGL rendering passes
    // to give 100% GPU priority and hardware compositing to smooth trackpad cursor scrolling
    if (window.scrollY > (window.innerHeight + 150)) {
      return;
    }

    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    glassUniforms.uTime.value = elapsedTime;

    // Smooth tilt interpolation
    mouseTilt.x += (targetTilt.x - mouseTilt.x) * 0.05;
    mouseTilt.y += (targetTilt.y - mouseTilt.y) * 0.05;

    // Apply continuous 3D rolling physics if not actively dragging
    if (!isDragging) {
      const baseRollX = 0.005 * baseSpeedMultiplier;
      const baseRollY = 0.007 * baseSpeedMultiplier;
      const baseRollZ = 0.002 * baseSpeedMultiplier;

      // Inertia decay
      velocity.x *= 0.94;
      velocity.y *= 0.94;

      glassCube.rotation.x += baseRollX + velocity.x;
      glassCube.rotation.y += baseRollY + velocity.y;
      glassCube.rotation.z += baseRollZ;

      const isMobileAnim = container.clientWidth < 768;
      // Levitation floating bob
      glassCube.position.y = Math.sin(elapsedTime * 1.5) * (isMobileAnim ? 0.08 : 0.12);
      glassCube.position.x = mouseTilt.x * (isMobileAnim ? 0.12 : 0.4);
    }

    // Animate background particles
    if (particles) {
      particles.rotation.y = elapsedTime * 0.03;
      particles.rotation.x = elapsedTime * 0.015;
    }

    // Two-pass rendering pipeline for refraction
    glassCube.visible = false;
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

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
    const isMobile = width < 768;

    camera.aspect = width / height;
    camera.position.z = isMobile ? 11.2 : 8.5;
    camera.updateProjectionMatrix();

    const cubeScale = isMobile ? 0.88 : 1.0;
    glassCube.scale.set(cubeScale, cubeScale, cubeScale);

    renderer.setSize(width, height);
    renderTarget.setSize(width * 1.5, height * 1.5);
    glassUniforms.uResolution.value.set(width, height);

    if (typeof updateTextMeshSize === 'function') {
      updateTextMeshSize();
    }
  }

  window.addEventListener('resize', onWindowResize);

  // --- NIGERIAN GENERATOR & SOLAR SAVINGS CALCULATOR LOGIC ---
  const fuelSlider = document.getElementById('calc-fuel-slider');
  const fuelValDisplay = document.getElementById('calc-fuel-val');
  const hoursSlider = document.getElementById('calc-hours-slider');
  const hoursValDisplay = document.getElementById('calc-hours-val');
  const packageSelect = document.getElementById('calc-package-select');
  const propertyTypeSelect = document.getElementById('calc-property-type');

  const monthlyFuelSavedDisplay = document.getElementById('calc-monthly-saved');
  const yearlyFuelSavedDisplay = document.getElementById('calc-yearly-saved');
  const packageCostDisplay = document.getElementById('calc-package-cost');
  const paybackMonthsDisplay = document.getElementById('calc-payback-months');
  const fiveYearNetDisplay = document.getElementById('calc-5year-net');
  const recommendedHardwareDisplay = document.getElementById('calc-hardware-rec');

  // Package lookup definitions
  const packageSpecs = {
    '1.5kva': {
      title: '2.5kVA / 24V Pure Sine Wave Inverter',
      panels: '4x 450W Mono PERC Panels (1.8kW Array)',
      battery: '2.56kWh Lithium LiFePO4 Battery',
      cost: 1650000,
      appliances: 'Lights, Inverter Fans, Smart TV, Laptops, Decoders, Phones',
    },
    '5kva': {
      title: '5kVA / 48V Hybrid Deye/Felicity Inverter',
      panels: '6x 550W Tier-1 Mono Half-Cell Panels (3.3kW Array)',
      battery: '5.12kWh / 48V LiFePO4 Lithium Wallmount',
      cost: 3850000,
      appliances: '1x 1.5HP Inverter AC, Fridge, Inverter Freezer, 1HP Pumping Machine, Lighting, Sound System',
    },
    '10kva': {
      title: '10kVA / 48V Dual-MPPT Commercial Hybrid Inverter',
      panels: '12x 585W Bifacial Monocrystalline Panels (7.0kW Array)',
      battery: '15kWh High-Capacity Lithium Server Rack',
      cost: 8600000,
      appliances: '3x Inverter ACs, Deep Freezers, Borehole Pumping Machine, Washing Machine, Entire 5-Bed Duplex',
    },
    '15kva': {
      title: '15kVA - 20kVA Three-Phase Industrial Solar System',
      panels: '20x 600W Tier-1 Monocrystalline Array (12kW Array)',
      battery: '30kWh Industrial Lithium Battery Bank',
      cost: 14500000,
      appliances: 'Multiple ACs, Cold Room, Commercial Plaza, Hotel, Supermarket, Hospital Clinic',
    },
  };

  function calculateNigerianSolarSavings() {
    if (!fuelSlider) return;

    const dailyFuel = parseFloat(fuelSlider.value); // Daily Naira spent on fuel
    const dailyHours = parseFloat(hoursSlider ? hoursSlider.value : 10);
    const selectedPkgKey = packageSelect ? packageSelect.value : '5kva';
    const pkg = packageSpecs[selectedPkgKey] || packageSpecs['5kva'];

    if (fuelValDisplay) {
      fuelValDisplay.innerHTML = `<span class="text-butter-500 font-bold mr-0.5">₦</span>${dailyFuel.toLocaleString()}/day`;
    }
    if (hoursValDisplay) hoursValDisplay.textContent = `${dailyHours} Hours/day`;

    // Monthly & Annual Generator Expense
    const monthlyFuelCost = dailyFuel * 30;
    const yearlyFuelCost = monthlyFuelCost * 12;

    // Generator Servicing / Oil / Spark plug overhead (~₦25,000/month)
    const annualGenMaintenance = 25000 * 12;
    const totalYearlyGenBurden = yearlyFuelCost + annualGenMaintenance;

    // System Package Cost
    const systemCost = pkg.cost;

    // Payback period in months
    const monthlyGenBurden = totalYearlyGenBurden / 12;
    const paybackMonths = Math.max(6, Math.round((systemCost / monthlyGenBurden) * 10) / 10);

    // 5-Year Cumulative Savings: 5 years of gen expenses minus the solar investment
    const fiveYearGenExpense = totalYearlyGenBurden * 5;
    const fiveYearNetSavings = Math.max(0, fiveYearGenExpense - systemCost);

    // Update Displays with clean tabular numerals
    if (monthlyFuelSavedDisplay) {
      monthlyFuelSavedDisplay.innerHTML = `<span class="text-xs text-butter-500/80 mr-0.5">₦</span>${monthlyFuelCost.toLocaleString()}/mo`;
    }
    if (yearlyFuelSavedDisplay) {
      yearlyFuelSavedDisplay.innerHTML = `<span class="text-xs text-butter-500/80 mr-0.5">₦</span>${totalYearlyGenBurden.toLocaleString()}`;
    }
    if (packageCostDisplay) {
      packageCostDisplay.innerHTML = `<span class="text-xs text-butter-500/80 mr-0.5">₦</span>${systemCost.toLocaleString()}`;
    }
    if (paybackMonthsDisplay) paybackMonthsDisplay.textContent = `${paybackMonths} Months`;
    if (fiveYearNetDisplay) {
      fiveYearNetDisplay.innerHTML = `<span class="text-butter-500 mr-1 font-bold text-2xl sm:text-3xl">₦</span><span>${fiveYearNetSavings.toLocaleString()}</span>`;
    }
    if (recommendedHardwareDisplay) {
      recommendedHardwareDisplay.innerHTML = `
        <span class="text-butter-500 font-bold">${pkg.title}</span> + 
        <span class="text-butter-500/90">${pkg.panels}</span> + 
        <span class="text-butter-500 font-bold">${pkg.battery}</span>.
        <span class="block text-butter-500/70 text-[11px] mt-1">Powers: ${pkg.appliances}</span>
      `;
    }
  }

  if (fuelSlider) fuelSlider.addEventListener('input', calculateNigerianSolarSavings);
  if (hoursSlider) hoursSlider.addEventListener('input', calculateNigerianSolarSavings);
  if (packageSelect) packageSelect.addEventListener('change', calculateNigerianSolarSavings);
  if (propertyTypeSelect) propertyTypeSelect.addEventListener('change', calculateNigerianSolarSavings);

  calculateNigerianSolarSavings();

  // --- 24-HOUR NIGERIAN POWER FLOW SIMULATOR ---
  const timeSlider = document.getElementById('sim-time-slider');
  const timeDisplay = document.getElementById('sim-time-display');
  const simPhaseDisplay = document.getElementById('sim-phase-display');
  const simSolarGauge = document.getElementById('sim-solar-kw');
  const simHomeGauge = document.getElementById('sim-home-kw');
  const simBatteryGauge = document.getElementById('sim-battery-pct');
  const simGenStatus = document.getElementById('sim-gen-status');
  const simSunIndicator = document.getElementById('sim-sun-indicator');

  function update24hSimulator() {
    if (!timeSlider) return;
    const hourFloat = parseFloat(timeSlider.value);
    const hours = Math.floor(hourFloat);
    const minutes = Math.floor((hourFloat - hours) * 60);
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    if (timeDisplay) timeDisplay.textContent = timeStr;

    // Tropical Solar curve in Nigeria (intense sun from 07:00 to 18:30)
    let solarKW = 0;
    if (hourFloat >= 6.5 && hourFloat <= 18.5) {
      const progress = (hourFloat - 6.5) / (18.5 - 6.5);
      solarKW = Math.sin(progress * Math.PI) * 5.8; // for 5kVA system
    }

    // Home power consumption
    let homeKW = 1.4;
    if (hourFloat >= 6.5 && hourFloat <= 8.5) homeKW = 2.8; // morning pump, kettle, ironing
    else if (hourFloat >= 12.0 && hourFloat <= 16.0) homeKW = 3.6; // afternoon heat: Inverter AC running
    else if (hourFloat >= 18.5 && hourFloat <= 22.5) homeKW = 4.1; // evening lighting, TV, AC, microwave
    else homeKW = 1.2;

    let batteryPct = 90;
    let phase = 'Solar Generation Active';

    if (solarKW > homeKW) {
      phase = '☀️ Full Tropical Solar: Home Powered + Battery Fast Charging';
      batteryPct = Math.min(100, Math.round(55 + ((hourFloat - 8) / 6) * 45));
    } else if (solarKW > 0) {
      phase = '⛅ Partial Solar + Seamless Lithium Battery Discharge';
      batteryPct = Math.max(40, Math.round(98 - (hourFloat - 14) * 12));
    } else {
      if (hourFloat >= 19.0 || hourFloat <= 4.0) {
        phase = '🌙 Night Time: 100% Silent Lithium Battery Power (Gen OFF)';
        batteryPct = Math.max(30, Math.round(92 - ((hourFloat >= 19.0 ? hourFloat - 19.0 : hourFloat + 5.0) * 6)));
      } else {
        phase = '🌅 Pre-dawn Baseline: Battery Sustaining Essential Load';
        batteryPct = 35;
      }
    }

    if (simPhaseDisplay) simPhaseDisplay.textContent = phase;
    if (simSolarGauge) simSolarGauge.textContent = `${solarKW.toFixed(1)} kW`;
    if (simHomeGauge) simHomeGauge.textContent = `${homeKW.toFixed(1)} kW`;
    if (simBatteryGauge) simBatteryGauge.textContent = `${batteryPct}%`;
    if (simGenStatus) {
      simGenStatus.textContent = 'OFF (₦0.00 Fuel Used)';
    }

    if (simSunIndicator) {
      const sunProgress = Math.max(0, Math.min(1, (hourFloat - 6) / 13));
      const leftPos = sunProgress * 100;
      const topPos = Math.sin(sunProgress * Math.PI) * -38 + 38;
      simSunIndicator.style.left = `${leftPos}%`;
      simSunIndicator.style.top = `${topPos}%`;
      simSunIndicator.style.opacity = solarKW > 0.4 ? '1' : '0.25';
    }
  }

  if (timeSlider) {
    timeSlider.addEventListener('input', update24hSimulator);
    update24hSimulator();
  }

  // --- WHATSAPP & ROOF SURVEY BOOKING MODAL ---
  const quoteModal = document.getElementById('quote-modal');
  const openModalBtns = document.querySelectorAll('.open-quote-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');

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

  if (quoteModal) {
    quoteModal.addEventListener('click', (e) => {
      if (e.target === quoteModal) closeModal();
    });
  }

  // Pre-fill estimate to modal from calculator button
  const lockInEstimateBtn = document.getElementById('calc-lock-in-btn');
  if (lockInEstimateBtn) {
    lockInEstimateBtn.addEventListener('click', () => {
      openModal();
    });
  }

  // Instant WhatsApp Inquiry Handler
  const sendWhatsAppBtn = document.getElementById('modal-whatsapp-btn');
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('modal-client-name')?.value || 'Valued Customer';
      const state = document.getElementById('modal-client-state')?.value || 'Lagos';
      const property = document.getElementById('modal-client-property')?.value || 'Duplex';
      const system = document.getElementById('modal-system-capacity')?.value || '5kVA Hybrid';
      const phone = document.getElementById('modal-client-phone')?.value || '';

      const message = `Hello Solaris Nigeria, I would like to get a quote and schedule an engineering site survey.%0A%0A*Name:* ${encodeURIComponent(name)}%0A*Location/State:* ${encodeURIComponent(state)}%0A*Property Type:* ${encodeURIComponent(property)}%0A*Interested System:* ${encodeURIComponent(system)}%0A*Phone:* ${encodeURIComponent(phone)}`;
      
      const whatsappURL = `https://wa.me/2349035851824?text=${message}`;
      window.open(whatsappURL, '_blank');
      closeModal();
    });
  }

  // Consistent Clay Brown header styling with scroll shadow enhancement
  const headerEl = document.querySelector('header');
  function handleHeaderScroll() {
    if (!headerEl) return;
    if (window.scrollY > 15) {
      headerEl.classList.add('is-scrolled');
    } else {
      headerEl.classList.remove('is-scrolled');
    }
  }

  window.addEventListener('scroll', handleHeaderScroll, { passive: true });
  handleHeaderScroll();

  // Automatic fit calculation for straight-line headings to guarantee zero truncation
  function fitHeadingsToContainer() {
    if (window.innerWidth < 768) return;
    document.querySelectorAll('.heading-straight-line').forEach((el) => {
      const parent = el.parentElement;
      if (!parent) return;
      el.style.fontSize = '';
      const availableWidth = parent.clientWidth - 16;
      const currentWidth = el.scrollWidth;
      if (currentWidth > availableWidth && availableWidth > 200) {
        const computedSize = parseFloat(window.getComputedStyle(el).fontSize);
        const ratio = (availableWidth / currentWidth) * 0.98;
        el.style.fontSize = `${Math.floor(computedSize * ratio)}px`;
      }
    });
  }

  fitHeadingsToContainer();
  window.addEventListener('resize', fitHeadingsToContainer);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(fitHeadingsToContainer);
  }

  // Mobile Left Slide-Over Navigation Drawer
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuCloseBtn = document.getElementById('mobile-menu-close-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer');
  const mobileMenuBackdrop = document.getElementById('mobile-nav-backdrop');

  function openMobileMenu() {
    if (mobileMenuDrawer) mobileMenuDrawer.classList.add('is-open');
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    if (window.lucide) window.lucide.createIcons();
  }

  function closeMobileMenu() {
    if (mobileMenuDrawer) mobileMenuDrawer.classList.remove('is-open');
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
  }
  if (mobileMenuCloseBtn) {
    mobileMenuCloseBtn.addEventListener('click', closeMobileMenu);
  }
  if (mobileMenuBackdrop) {
    mobileMenuBackdrop.addEventListener('click', closeMobileMenu);
  }

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

  // --- SCROLL ENTRANCE ANIMATIONS (Always & At All Times on Scroll) ---
  function initScrollAnimations() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    if (!revealElements.length) return;

    // Graceful fallback if IntersectionObserver is not available
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((el) => {
        el.classList.add('is-revealed');
        el.querySelectorAll('.reveal-stagger-item').forEach((item) => item.classList.add('is-revealed'));
      });
      return;
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.08,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const el = entry.target;
        const staggerItems = el.querySelectorAll('.reveal-stagger-item');

        if (entry.isIntersecting) {
          el.classList.add('is-revealed');
          staggerItems.forEach((item) => item.classList.add('is-revealed'));
        } else {
          // Re-arm element and children when scrolled out of view so it animates in every time you scroll
          // Since CSS has transition:none on reset, this re-arms instantaneously without frame drops or jitter
          el.classList.remove('is-revealed');
          staggerItems.forEach((item) => item.classList.remove('is-revealed'));
        }
      });
    }, observerOptions);

    // Observe all elements continuously so entrance animation triggers at all times on scroll
    revealElements.forEach((el) => {
      observer.observe(el);
    });
  }

  initScrollAnimations();

  // --- MOBILE PACKAGES SWIPE CAROUSEL (Horizontal Swipe on Phones) ---
  const pkgCarousel = document.getElementById('packages-carousel');
  const pkgDots = document.querySelectorAll('.pkg-dot');

  if (pkgCarousel && pkgDots.length > 0) {
    function updateActivePackageDot() {
      if (window.innerWidth >= 1024) return;
      const scrollLeft = pkgCarousel.scrollLeft;
      const cardEl = pkgCarousel.querySelector('.reveal-stagger-item');
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth;
      const gap = 16;
      const activeIndex = Math.min(
        pkgDots.length - 1,
        Math.max(0, Math.round(scrollLeft / (cardWidth + gap)))
      );

      pkgDots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('bg-butter-500', 'scale-125');
          dot.classList.remove('bg-butter-500/30');
        } else {
          dot.classList.remove('bg-butter-500', 'scale-125');
          dot.classList.add('bg-butter-500/30');
        }
      });
    }

    pkgCarousel.addEventListener('scroll', updateActivePackageDot, { passive: true });

    pkgDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        const cards = pkgCarousel.querySelectorAll('.reveal-stagger-item');
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  }

  // --- MOBILE SERVICES SWIPE CAROUSEL ---
  const servicesCarousel = document.getElementById('services-carousel');
  const servicesDots = document.querySelectorAll('.service-dot');

  if (servicesCarousel && servicesDots.length > 0) {
    function updateActiveServiceDot() {
      if (window.innerWidth >= 1024) return;
      const scrollLeft = servicesCarousel.scrollLeft;
      const cardEl = servicesCarousel.querySelector('.reveal-stagger-item');
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth;
      const gap = 16;
      const activeIndex = Math.min(
        servicesDots.length - 1,
        Math.max(0, Math.round(scrollLeft / (cardWidth + gap)))
      );

      servicesDots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('bg-butter-500', 'scale-125');
          dot.classList.remove('bg-butter-500/30');
        } else {
          dot.classList.remove('bg-butter-500', 'scale-125');
          dot.classList.add('bg-butter-500/30');
        }
      });
    }

    servicesCarousel.addEventListener('scroll', updateActiveServiceDot, { passive: true });

    servicesDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        const cards = servicesCarousel.querySelectorAll('.reveal-stagger-item');
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  }

  // --- MOBILE TESTIMONIALS / CUSTOMER PROOF SWIPE CAROUSEL ---
  const reviewCarousel = document.getElementById('testimonials-carousel');
  const reviewDots = document.querySelectorAll('.review-dot');

  if (reviewCarousel && reviewDots.length > 0) {
    function updateActiveReviewDot() {
      if (window.innerWidth >= 768) return;
      const scrollLeft = reviewCarousel.scrollLeft;
      const cardEl = reviewCarousel.querySelector('.reveal-stagger-item');
      if (!cardEl) return;
      const cardWidth = cardEl.offsetWidth;
      const gap = 16;
      const activeIndex = Math.min(
        reviewDots.length - 1,
        Math.max(0, Math.round(scrollLeft / (cardWidth + gap)))
      );

      reviewDots.forEach((dot, idx) => {
        if (idx === activeIndex) {
          dot.classList.add('bg-butter-500', 'scale-125');
          dot.classList.remove('bg-butter-500/30');
        } else {
          dot.classList.remove('bg-butter-500', 'scale-125');
          dot.classList.add('bg-butter-500/30');
        }
      });
    }

    reviewCarousel.addEventListener('scroll', updateActiveReviewDot, { passive: true });

    reviewDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.dataset.index);
        const cards = reviewCarousel.querySelectorAll('.reveal-stagger-item');
        if (cards[idx]) {
          cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    });
  }

  // --- FLOATING BACK TO TOP BUTTON ---
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    function toggleBackToTop() {
      if (window.scrollY > 300) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-4');
        backToTopBtn.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
      } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none', 'translate-y-4');
        backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
      }
    }

    window.addEventListener('scroll', toggleBackToTop, { passive: true });
    toggleBackToTop();

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // --- SMOOTH SCROLL FOR IN-PAGE ANCHOR LINKS (Keeps 2-Finger Trackpad Scrolling 100% Fluid) ---
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId && targetId !== '#' && targetId.length > 1) {
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
});
