/* ============================================================
   CORLITH — Hero 3D Scene
   A wireframe icosahedron core surrounded by a particle field,
   reacting to mouse position and scroll. Cinematic, dark,
   and engine-room feeling.
   ============================================================ */

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a0c, 0.06);

  const camera = new THREE.PerspectiveCamera(
    55, window.innerWidth / window.innerHeight, 0.1, 100
  );
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true, powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ---------- Core: icosahedron wireframe ----------
  const coreGeo = new THREE.IcosahedronGeometry(1.4, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0xe6ff55, wireframe: true, transparent: true, opacity: 0.6
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  // Inner solid mesh (very dark, gives depth)
  const innerGeo = new THREE.IcosahedronGeometry(1.35, 1);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0a0a0c, transparent: true, opacity: 0.95
  });
  const inner = new THREE.Mesh(innerGeo, innerMat);
  scene.add(inner);

  // Outer glow shell
  const glowGeo = new THREE.IcosahedronGeometry(1.7, 1);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xe6ff55, wireframe: true, transparent: true, opacity: 0.12
  });
  const glow = new THREE.Mesh(glowGeo, glowMat);
  scene.add(glow);

  // Outer faint wireframe (bigger)
  const outerGeo = new THREE.IcosahedronGeometry(2.4, 0);
  const outerMat = new THREE.MeshBasicMaterial({
    color: 0xffffff, wireframe: true, transparent: true, opacity: 0.05
  });
  const outer = new THREE.Mesh(outerGeo, outerMat);
  scene.add(outer);

  // ---------- Particle field ----------
  const particleCount = 1800;
  const positions = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const r = 4 + Math.random() * 18;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
    sizes[i] = Math.random() * 0.04 + 0.005;
  }

  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xe6ff55,
    size: 0.04,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ---------- Connecting lines (subtle) ----------
  const lineGeo = new THREE.BufferGeometry();
  const linePositions = new Float32Array(200 * 6);
  for (let i = 0; i < 200; i++) {
    const a = Math.random() * Math.PI * 2;
    const b = Math.random() * Math.PI * 2;
    const r1 = 1.5, r2 = 2.6;
    linePositions[i * 6]     = Math.cos(a) * r1;
    linePositions[i * 6 + 1] = Math.sin(a) * r1;
    linePositions[i * 6 + 2] = (Math.random() - 0.5) * 1.2;
    linePositions[i * 6 + 3] = Math.cos(b) * r2;
    linePositions[i * 6 + 4] = Math.sin(b) * r2;
    linePositions[i * 6 + 5] = (Math.random() - 0.5) * 1.2;
  }
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0xe6ff55, transparent: true, opacity: 0.08, blending: THREE.AdditiveBlending
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  scene.add(lines);

  // ---------- Lights (for any future MeshStandard, but mostly ambient via emissive look) ----------
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  // ---------- Mouse + scroll state ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollY = 0;
  const clock = new THREE.Clock();

  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });
  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  // ---------- Resize ----------
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- Animation loop ----------
  function animate() {
    const t = clock.getElapsedTime();
    const dt = clock.getDelta();

    // Smooth mouse follow
    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;

    // Core rotation (reacts to mouse)
    core.rotation.x = t * 0.15 + mouse.y * 0.5;
    core.rotation.y = t * 0.2 + mouse.x * 0.5;
    inner.rotation.copy(core.rotation);
    glow.rotation.x = -t * 0.1 - mouse.y * 0.3;
    glow.rotation.y = -t * 0.13 - mouse.x * 0.3;
    outer.rotation.x = t * 0.05;
    outer.rotation.y = t * 0.07;

    // Particle slow drift
    particles.rotation.y = t * 0.02 + mouse.x * 0.15;
    particles.rotation.x = mouse.y * 0.1;
    lines.rotation.y = -t * 0.04;

    // Camera reacts to scroll — pull back as user scrolls
    const targetZ = 6 + scrollY * 0.004;
    camera.position.z += (targetZ - camera.position.z) * 0.08;

    // Subtle parallax
    camera.position.x = mouse.x * 0.3;
    camera.position.y = -mouse.y * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();