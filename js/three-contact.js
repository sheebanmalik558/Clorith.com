/* ============================================================
   CORLITH — Contact 3D Scene
   A flowing wave of particles / ribbons, atmospheric and calm.
   ============================================================ */

(function () {
  const canvas = document.getElementById('contactCanvas');
  if (!canvas) return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    60, window.innerWidth / window.innerHeight, 0.1, 50
  );
  camera.position.set(0, 0, 8);

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Grid of points that wave
  const cols = 80, rows = 40;
  const count = cols * rows;
  const positions = new Float32Array(count * 3);
  const baseY = new Float32Array(count);

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const idx = i * rows + j;
      const x = (i / cols - 0.5) * 20;
      const y = (j / rows - 0.5) * 10;
      positions[idx * 3]     = x;
      positions[idx * 3 + 1] = y;
      positions[idx * 3 + 2] = 0;
      baseY[idx] = y;
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xe6ff55,
    size: 0.03,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // Floating ring
  const ringGeo = new THREE.TorusGeometry(3, 0.005, 16, 100);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xe6ff55, transparent: true, opacity: 0.4
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.5;
  scene.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(4, 0.003, 16, 100),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.2 })
  );
  ring2.rotation.x = Math.PI / 3;
  scene.add(ring2);

  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const clock = new THREE.Clock();

  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.ty = (e.clientY / window.innerHeight) * 2 - 1;
  });

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    const t = clock.getElapsedTime();
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;

    // Wave the grid
    const pos = geo.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const x = pos[i * 3];
      pos[i * 3 + 2] = Math.sin(x * 0.5 + t * 1.2) * 0.6
                      + Math.cos(baseY[i] * 0.4 + t * 0.8) * 0.4;
    }
    geo.attributes.position.needsUpdate = true;

    points.rotation.y = mouse.x * 0.2;
    points.rotation.x = mouse.y * 0.1;

    ring.rotation.z = t * 0.2;
    ring2.rotation.z = -t * 0.15;

    camera.position.x = mouse.x * 0.5;
    camera.position.y = -mouse.y * 0.3;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();
})();