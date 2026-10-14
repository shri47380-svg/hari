import * as THREE from "three";

const container = document.getElementById("hero-canvas");

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function init() {
  if (!container) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (err) {
    container.classList.add("webgl-fallback");
    return;
  }

  const reduced = prefersReducedMotion();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05070f, 0.055);

  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 9);

  const group = new THREE.Group();
  scene.add(group);

  const geometry = new THREE.IcosahedronGeometry(2.35, 1);
  const solidMat = new THREE.MeshStandardMaterial({
    color: 0x4f6df5,
    metalness: 0.65,
    roughness: 0.28,
    flatShading: true,
    emissive: 0x101a3a,
    emissiveIntensity: 0.6,
  });
  const solid = new THREE.Mesh(geometry, solidMat);
  group.add(solid);

  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x6ff2d6,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const wire = new THREE.Mesh(geometry, wireMat);
  wire.scale.setScalar(1.06);
  group.add(wire);

  const coreMat = new THREE.MeshStandardMaterial({
    color: 0x6ff2d6,
    emissive: 0x6ff2d6,
    emissiveIntensity: 1.4,
    roughness: 0.2,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.72, 0), coreMat);
  group.add(core);

  // Particle starfield
  const starCount = 900;
  const positions = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    const r = 7 + Math.random() * 16;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0x9fb0d0,
    size: 0.06,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // Lights
  const ambient = new THREE.AmbientLight(0x2a3b6b, 1.1);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0x7c9cff, 2.4);
  key.position.set(5, 4, 6);
  scene.add(key);

  const rim = new THREE.PointLight(0x6ff2d6, 22, 30);
  rim.position.set(-6, -3, 4);
  scene.add(rim);

  const pointer = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };

  function onPointerMove(e) {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  }
  window.addEventListener("pointermove", onPointerMove);

  function onResize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);

  let visible = true;
  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0].isIntersecting;
    },
    { threshold: 0.01 }
  );
  io.observe(container);

  let hidden = false;
  document.addEventListener("visibilitychange", () => {
    hidden = document.hidden;
  });

  const clock = new THREE.Clock();

  function render() {
    if (!hidden && visible) {
      const t = clock.getElapsedTime();

      if (!reduced) {
        group.rotation.y = t * 0.28;
        group.rotation.x = Math.sin(t * 0.5) * 0.16;
        group.position.y = Math.sin(t * 0.8) * 0.15;
        stars.rotation.y = t * 0.02;
        core.scale.setScalar(1 + Math.sin(t * 3) * 0.06);

        pointer.x += (target.x - pointer.x) * 0.05;
        pointer.y += (target.y - pointer.y) * 0.05;
        camera.position.x = pointer.x * 1.4;
        camera.position.y = -pointer.y * 1.1;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }

  if (reduced) {
    renderer.render(scene, camera);
  } else {
    render();
  }
}

init();
