import * as THREE from 'three';

// Generates a Mobius Strip BufferGeometry
function createMobiusGeometry(radius = 1.5, width = 0.6, uSteps = 60, vSteps = 10) {
  const vertices = [];
  const indices = [];

  for (let i = 0; i <= uSteps; i++) {
    const u = (i / uSteps) * Math.PI * 2;
    for (let j = 0; j <= vSteps; j++) {
      const v = (j / vSteps - 0.5) * 2 * width;
      const x = (radius + v * Math.cos(u / 2)) * Math.cos(u);
      const y = (radius + v * Math.cos(u / 2)) * Math.sin(u);
      const z = v * Math.sin(u / 2);
      vertices.push(x, y, z);
    }
  }

  for (let i = 0; i < uSteps; i++) {
    for (let j = 0; j < vSteps; j++) {
      const a = i * (vSteps + 1) + j;
      const b = (i + 1) * (vSteps + 1) + j;
      const c = i * (vSteps + 1) + (j + 1);
      const d = (i + 1) * (vSteps + 1) + (j + 1);

      indices.push(a, b, d);
      indices.push(a, d, c);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

// WebGL support check
export function webGLSupported() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function initScene() {
  if (!webGLSupported()) {
    const fallback = document.getElementById('webgl-fallback');
    const webgl = document.getElementById('webgl');
    if (webgl) webgl.style.display = 'none';
    if (fallback) fallback.classList.add('active');
    return null;
  }

  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050505);
  scene.fog = new THREE.FogExp2(0x050505, 0.04);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#webgl'),
    antialias: true,
    alpha: true
  });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  camera.position.z = 5;

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(0x6366f1, 8, 20);
  pointLight1.position.set(5, 5, 2);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xec4899, 8, 20);
  pointLight2.position.set(-5, -5, 2);
  scene.add(pointLight2);

  const pointLight3 = new THREE.PointLight(0xffffff, 4, 30);
  pointLight3.position.set(0, 0, 10);
  scene.add(pointLight3);

  // Particle Field
  const particlesCount = 2000;
  const positions = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;     // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.04,
    color: 0x6366f1,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  // Large Wireframe Objects
  const objects = [];
  const geometries = [
    new THREE.IcosahedronGeometry(1.4, 0),
    new THREE.TorusKnotGeometry(1.2, 0.3, 100, 16),
    new THREE.OctahedronGeometry(1.6, 0),
    createMobiusGeometry(1.6, 0.8) // <--- Mobius Strip
  ];

  const objectMaterial = new THREE.MeshStandardMaterial({
    color: 0x050505,
    metalness: 0.9,
    roughness: 0.1,
    emissive: 0xec4899,
    emissiveIntensity: 0.2,
    wireframe: true,
    transparent: true,
    opacity: 0.7
  });

  for (let i = 0; i < 8; i++) {
    const geometry = geometries[Math.floor(Math.random() * geometries.length)];
    const mesh = new THREE.Mesh(geometry, objectMaterial);

    mesh.position.x = (Math.random() - 0.5) * 25;
    mesh.position.y = (Math.random() - 0.5) * 25;
    mesh.position.z = (Math.random() - 0.5) * 10 - 2;

    mesh.rotation.x = Math.random() * Math.PI;
    mesh.rotation.y = Math.random() * Math.PI;

    mesh.userData.velocity = {
      x: (Math.random() - 0.5) * 0.004,
      y: (Math.random() - 0.5) * 0.004,
      rotationX: (Math.random() - 0.5) * 0.008,
      rotationY: (Math.random() - 0.5) * 0.008
    };

    scene.add(mesh);
    objects.push(mesh);
  }

  // Scroll handling
  let scrollY = window.scrollY;
  let targetScrollY = window.scrollY;
  window.addEventListener('scroll', () => { targetScrollY = window.scrollY; });

  // Mouse movement
  const mouse = { x: 0, y: 0 };
  const targetMouse = { x: 0, y: 0 };
  window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  // Animation loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Smooth scroll interpolation
    scrollY += (targetScrollY - scrollY) * 0.05;
    
    // Smooth mouse interpolation
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Animate particles
    particleSystem.rotation.y = elapsedTime * 0.03;
    particleSystem.rotation.x = elapsedTime * 0.01;

    // Animate large objects
    objects.forEach((obj, index) => {
      obj.position.x += obj.userData.velocity.x;
      obj.position.y += obj.userData.velocity.y;
      obj.rotation.x += obj.userData.velocity.rotationX;
      obj.rotation.y += obj.userData.velocity.rotationY;

      // Keep objects in bounds softly
      if (Math.abs(obj.position.x) > 15) obj.userData.velocity.x *= -1;
      if (Math.abs(obj.position.y) > 15) obj.userData.velocity.y *= -1;

      // Gentle floating based on time
      obj.position.y += Math.sin(elapsedTime * 0.5 + index) * 0.002;
    });

    // Camera rig movement combining mouse and scroll
    const cameraTargetX = mouse.x * 1.5;
    const cameraTargetY = mouse.y * 1.5 - scrollY * 0.002;
    
    camera.position.x += (cameraTargetX - camera.position.x) * 0.05;
    camera.position.y += (cameraTargetY - camera.position.y) * 0.05;
    camera.lookAt(scene.position);
    
    // Base camera Z modified slightly by scroll
    camera.position.z = 6 - scrollY * 0.001;

    renderer.render(scene, camera);
  }

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  animate();
  return { scene, camera, renderer };
}

// Loading screen
export function initLoader() {
  window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => { loadingScreen.style.display = 'none'; }, 600);
    }, 1000);
  });
}

// Scroll-based section reveal
export function initObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.section').forEach((section) => observer.observe(section));
  return observer;
}

// Bootstrap application if in browser and not testing
if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
  if (!navigator.userAgent.includes('jsdom')) {
    initScene();
    initLoader();
    initObserver();
  }
}
