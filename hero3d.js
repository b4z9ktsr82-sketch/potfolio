/* ==========================================================================
   HERO 3D SCENE (Three.js — loaded locally from js/vendor/three.min.js)
   - Wireframe icosahedron "core" placed behind the profile photo
   - Orbiting geometric shapes + particle field
   - Reacts to mouse movement and scroll
   - Pauses when off-screen or when the tab is hidden
   - Falls back to the CSS shapes (.hero__fallback) if WebGL is unavailable
   - Renders a single still frame for reduced-motion users
   ========================================================================== */
(function () {
  "use strict";

  var canvas = document.querySelector("[data-hero-canvas]");
  if (!canvas) return;

  var root = document.documentElement;

  function webglAvailable() {
    try {
      var c = document.createElement("canvas");
      return !!(window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl")));
    } catch (e) { return false; }
  }

  if (!window.THREE || !webglAvailable()) {
    root.classList.add("no-webgl");
    canvas.remove();
    return;
  }

  var THREE = window.THREE;
  var hero = canvas.parentElement;
  var anchor = document.querySelector("[data-hero-anchor]"); // element the core is centred on
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isSmall = window.matchMedia("(max-width: 860px)").matches;
  var lowPower = (navigator.hardwareConcurrency || 8) <= 4 || isSmall;

  var COLORS = {
    sky: 0x3D87CB,
    blue: 0x0A387D,
    navy: 0x1C2644,
    mist: 0xDAE4EE
  };

  /* ---------- Renderer, scene, camera ---------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: !lowPower, powerPreference: "high-performance" });
  } catch (e) {
    root.classList.add("no-webgl");
    canvas.remove();
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, lowPower ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0B1122, 9, 22);

  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 11);

  /* ---------- Lights ---------- */
  scene.add(new THREE.AmbientLight(COLORS.mist, 0.35));
  var keyLight = new THREE.PointLight(COLORS.sky, 1.6, 30);
  keyLight.position.set(4, 4, 6);
  scene.add(keyLight);
  var rimLight = new THREE.PointLight(COLORS.blue, 2.2, 30);
  rimLight.position.set(-5, -3, 3);
  scene.add(rimLight);

  /* ---------- Core: wireframe icosahedron + inner faceted solid ---------- */
  var core = new THREE.Group();
  scene.add(core);

  var outerGeo = new THREE.IcosahedronGeometry(2.9, 1);
  var wire = new THREE.LineSegments(
    new THREE.EdgesGeometry(outerGeo),
    new THREE.LineBasicMaterial({ color: COLORS.sky, transparent: true, opacity: 0.55 })
  );
  core.add(wire);

  var verts = new THREE.Points(
    outerGeo,
    new THREE.PointsMaterial({ color: COLORS.mist, size: 0.07, transparent: true, opacity: 0.9 })
  );
  core.add(verts);

  var inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.7, 0),
    new THREE.MeshStandardMaterial({
      color: COLORS.blue, emissive: COLORS.navy, emissiveIntensity: 0.6,
      metalness: 0.4, roughness: 0.35, flatShading: true, transparent: true, opacity: 0.55
    })
  );
  core.add(inner);

  // Thin orbit rings
  function ring(radius, tiltX, tiltY, opacity) {
    var r = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.008, 6, 160),
      new THREE.MeshBasicMaterial({ color: COLORS.sky, transparent: true, opacity: opacity })
    );
    r.rotation.set(tiltX, tiltY, 0);
    return r;
  }
  var ring1 = ring(3.9, Math.PI / 2.4, 0.3, 0.5);
  var ring2 = ring(4.5, Math.PI / 1.8, -0.5, 0.25);
  core.add(ring1, ring2);

  /* ---------- Orbiting shapes ---------- */
  var floaters = [];
  var shapeDefs = [
    { geo: new THREE.OctahedronGeometry(0.42, 0), pos: [-3.3, 3.4, -2], wire: false },
    { geo: new THREE.TorusGeometry(0.36, 0.12, 12, 32), pos: [4.4, -2.4, 0.5], wire: false },
    { geo: new THREE.TetrahedronGeometry(0.42, 0), pos: [3.8, 2.9, -1.5], wire: true },
    { geo: new THREE.BoxGeometry(0.5, 0.5, 0.5), pos: [-3.2, -3.3, 0.4], wire: true },
    { geo: new THREE.IcosahedronGeometry(0.3, 0), pos: [0.6, 3.8, -2], wire: false },
    { geo: new THREE.OctahedronGeometry(0.28, 0), pos: [-1.2, -3.9, -1], wire: true }
  ];
  shapeDefs.forEach(function (d, i) {
    var mat = d.wire
      ? new THREE.MeshBasicMaterial({ color: COLORS.sky, wireframe: true, transparent: true, opacity: 0.7 })
      : new THREE.MeshStandardMaterial({ color: i % 2 ? COLORS.sky : COLORS.blue, metalness: 0.5, roughness: 0.3, flatShading: true, emissive: COLORS.navy, emissiveIntensity: 0.4 });
    var m = new THREE.Mesh(d.geo, mat);
    m.position.set(d.pos[0], d.pos[1], d.pos[2]);
    m.userData = { base: m.position.clone(), speed: 0.4 + Math.random() * 0.5, phase: Math.random() * Math.PI * 2 };
    core.add(m);
    floaters.push(m);
  });

  /* ---------- Particle field ---------- */
  var count = lowPower ? 260 : 650;
  var positions = new Float32Array(count * 3);
  for (var i = 0; i < count; i++) {
    // random points in a thick spherical shell
    var r = 6 + Math.random() * 9;
    var theta = Math.random() * Math.PI * 2;
    var phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
    positions[i * 3 + 2] = r * Math.cos(phi) - 4;
  }
  var particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  var particles = new THREE.Points(
    particleGeo,
    new THREE.PointsMaterial({ color: COLORS.mist, size: 0.035, transparent: true, opacity: 0.55, depthWrite: false })
  );
  scene.add(particles);

  /* ---------- Layout: keep the core centred behind the photo ---------- */
  var anchorWorld = new THREE.Vector3();

  function screenToWorld(x, y, w, h) {
    var v = new THREE.Vector3(x / w * 2 - 1, -(y / h) * 2 + 1, 0.5).unproject(camera);
    var dir = v.sub(camera.position).normalize();
    var dist = -camera.position.z / dir.z;
    return camera.position.clone().add(dir.multiplyScalar(dist));
  }

  function resize() {
    var w = hero.clientWidth;
    var h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.set(0, 0, 11);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();

    if (anchor) {
      var hr = hero.getBoundingClientRect();
      var ar = anchor.getBoundingClientRect();
      anchorWorld.copy(screenToWorld(ar.left - hr.left + ar.width / 2, ar.top - hr.top + ar.height / 2, w, h));
    }
    // Smaller core on narrow screens so it sits behind the photo
    var s = w < 860 ? 0.62 : w < 1200 ? 0.85 : 1;
    core.scale.setScalar(s);
    core.position.copy(anchorWorld);
    if (reduceMotion) render(0);
  }

  /* ---------- Interaction state ---------- */
  var mouse = { x: 0, y: 0 };
  var eased = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = e.clientX / window.innerWidth * 2 - 1;
    mouse.y = e.clientY / window.innerHeight * 2 - 1;
  }, { passive: true });

  /* ---------- Render loop ---------- */
  var clock = new THREE.Clock();
  var visible = true;
  var running = false;

  function render(t) {
    eased.x += (mouse.x - eased.x) * 0.04;
    eased.y += (mouse.y - eased.y) * 0.04;

    var scroll = Math.min(window.scrollY / window.innerHeight, 1.5);

    core.rotation.y = t * 0.12 + eased.x * 0.5 + scroll * 0.8;
    core.rotation.x = t * 0.06 + eased.y * 0.35;
    inner.rotation.y = -t * 0.3;
    inner.rotation.z = t * 0.15;
    ring1.rotation.z = t * 0.2;
    ring2.rotation.z = -t * 0.14;
    core.position.y = anchorWorld.y + Math.sin(t * 0.8) * 0.12 + scroll * 1.2;

    for (var k = 0; k < floaters.length; k++) {
      var f = floaters[k];
      var u = f.userData;
      f.rotation.x = t * u.speed;
      f.rotation.y = t * u.speed * 0.8;
      f.position.y = u.base.y + Math.sin(t * u.speed + u.phase) * 0.3;
    }

    particles.rotation.y = t * 0.02 + eased.x * 0.08;
    particles.rotation.x = eased.y * 0.05;

    camera.position.x = eased.x * 0.6;
    camera.position.y = -eased.y * 0.4;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function loop() {
    if (!visible || document.hidden) { running = false; return; }
    render(clock.getElapsedTime());
    requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    requestAnimationFrame(loop);
  }

  // Pause when the hero is off-screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden) start(); });

  var resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  });

  // Fonts can shift the layout, so re-measure once they are ready
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);

  root.classList.add("webgl");
  resize();
  // The photo slides in on load; re-measure once that entrance animation is done
  setTimeout(resize, 1600);
  if (reduceMotion) render(0); else start();
})();
