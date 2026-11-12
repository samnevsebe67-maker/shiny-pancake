/* KINETIA / Beauty вЂ” emerald crystal sculpture
   Procedural Three.js scene. No external 3D assets are used.
   The supplied reference image is only the static no-WebGL fallback. */
(function () {
  'use strict';

  var host = document.getElementById('bt3d');
  var canvas = document.getElementById('btCrystal');
  if (!host || !canvas) return;

  var THREE = window.THREE;
  var mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduced = mqReduced.matches;
  var mqSmall = window.matchMedia('(max-width: 1000px)');
  var mqNarrow = window.matchMedia('(max-width: 640px)');

  function useFallback() {
    host.classList.remove('is-live', 'is-start', 'is-dragging');
    host.classList.add('bt-no3d');
  }

  if (!THREE) { useFallback(); return; }

  var probe = document.createElement('canvas');
  var probeGL = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!probeGL) { useFallback(); return; }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: !mqSmall.matches,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    useFallback();
    return;
  }

  var isSmall = mqSmall.matches;
  var isNarrow = mqNarrow.matches;
  var useTransmission = renderer.capabilities.isWebGL2 && !isSmall;
  var maxAniso = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 1;

  renderer.setClearColor(0x06110d, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.02;

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x06110d);
  scene.fog = new THREE.FogExp2(0x06110d, 0.024);

  var camera = new THREE.PerspectiveCamera(isNarrow ? 44 : 40, 1, 0.1, 80);
  var LOOK = new THREE.Vector3(isNarrow ? 0.05 : 0, isNarrow ? 1.82 : 1.85, -0.05);
  var BASE_AZ = 0.30;
  var BASE_RADIUS = isNarrow ? 5.8 : 6.45;
  var BASE_Y = isNarrow ? 1.72 : 1.62;
  camera.position.set(Math.sin(BASE_AZ) * BASE_RADIUS, BASE_Y, Math.cos(BASE_AZ) * BASE_RADIUS);
  camera.lookAt(LOOK);

  /* deterministic pseudo-random */
  var seed = 20261112;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function smoothstep(a, b, x) {
    var t = clamp((x - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /* ------------------------------------------------------------------ textures */
  function dotTexture() {
    var c = document.createElement('canvas');
    c.width = c.height = 128;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.22, 'rgba(214,255,240,.9)');
    grd.addColorStop(0.55, 'rgba(122,255,203,.24)');
    grd.addColorStop(1, 'rgba(122,255,203,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = Math.min(4, maxAniso);
    return t;
  }

  function beamTexture() {
    var c = document.createElement('canvas');
    c.width = 64; c.height = 512;
    var g = c.getContext('2d');
    var grd = g.createLinearGradient(0, 0, 0, 512);
    grd.addColorStop(0, 'rgba(122,255,203,0)');
    grd.addColorStop(0.34, 'rgba(122,255,203,.10)');
    grd.addColorStop(0.64, 'rgba(25,223,160,.22)');
    grd.addColorStop(0.88, 'rgba(25,223,160,.06)');
    grd.addColorStop(1, 'rgba(25,223,160,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 512);
    g.globalCompositeOperation = 'destination-in';
    var h = g.createLinearGradient(0, 0, 64, 0);
    h.addColorStop(0, 'rgba(0,0,0,0)');
    h.addColorStop(0.42, 'rgba(0,0,0,.8)');
    h.addColorStop(0.58, 'rgba(0,0,0,.8)');
    h.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = h;
    g.fillRect(0, 0, 64, 512);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  function radialTexture(inner, mid, outer) {
    var c = document.createElement('canvas');
    c.width = c.height = 512;
    var g = c.getContext('2d');
    var grd = g.createRadialGradient(256, 256, 0, 256, 256, 256);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.45, mid);
    grd.addColorStop(1, outer);
    g.fillStyle = grd;
    g.fillRect(0, 0, 512, 512);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  var TEX_DOT = dotTexture();
  var TEX_BEAM = beamTexture();
  var TEX_FLOOR = radialTexture('rgba(25,223,160,.26)', 'rgba(8,122,88,.09)', 'rgba(3,10,8,0)');
  var TEX_SHADOW = radialTexture('rgba(0,0,0,.78)', 'rgba(0,0,0,.30)', 'rgba(0,0,0,0)');

  /* studio environment: dark room, wide soft boxes, emerald horizon */
  function envTexture() {
    var c = document.createElement('canvas');
    c.width = 1024; c.height = 512;
    var g = c.getContext('2d');
    var base = g.createLinearGradient(0, 0, 0, 512);
    base.addColorStop(0, '#010403');
    base.addColorStop(0.34, '#04110d');
    base.addColorStop(0.52, '#071d16');
    base.addColorStop(0.7, '#03100c');
    base.addColorStop(1, '#010302');
    g.fillStyle = base;
    g.fillRect(0, 0, 1024, 512);

    g.globalCompositeOperation = 'lighter';

    var boxes = [
      [92, 42, 132, 0.34, '240,255,250'],
      [236, 158, 58, 0.16, '122,255,203'],
      [392, 76, 190, 0.30, '224,255,244'],
      [548, 24, 120, 0.14, '122,255,203'],
      [676, 118, 168, 0.24, '205,255,238'],
      [846, 56, 150, 0.20, '122,255,203'],
      [952, 30, 210, 0.12, '240,255,250']
    ];
    for (var i = 0; i < boxes.length; i++) {
      var x = boxes[i][0], w = boxes[i][1], h = boxes[i][2], a = boxes[i][3], rgb = boxes[i][4];
      var grd = g.createLinearGradient(x - w, 0, x + w, 0);
      grd.addColorStop(0, 'rgba(' + rgb + ',0)');
      grd.addColorStop(0.42, 'rgba(' + rgb + ',' + a + ')');
      grd.addColorStop(0.58, 'rgba(' + rgb + ',' + a + ')');
      grd.addColorStop(1, 'rgba(' + rgb + ',0)');
      g.fillStyle = grd;
      g.fillRect(x - w, 10, w * 2, h);
    }

    var low = g.createLinearGradient(0, 330, 0, 512);
    low.addColorStop(0, 'rgba(8,122,88,0)');
    low.addColorStop(0.68, 'rgba(25,223,160,.18)');
    low.addColorStop(1, 'rgba(122,255,203,.04)');
    g.fillStyle = low;
    g.fillRect(0, 330, 1024, 182);

    var horizon = g.createLinearGradient(0, 300, 0, 360);
    horizon.addColorStop(0, 'rgba(25,223,160,0)');
    horizon.addColorStop(0.5, 'rgba(25,223,160,.10)');
    horizon.addColorStop(1, 'rgba(25,223,160,0)');
    g.fillStyle = horizon;
    g.fillRect(0, 300, 1024, 60);

    var t = new THREE.CanvasTexture(c);
    t.mapping = THREE.EquirectangularReflectionMapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }

  var pmrem = new THREE.PMREMGenerator(renderer);
  var envSrc = envTexture();
  var envMap = pmrem.fromEquirectangular(envSrc).texture;
  envSrc.dispose();
  pmrem.dispose();
  scene.environment = envMap;

  /* ------------------------------------------------------------------ materials */
  var crystalMat = new THREE.MeshPhysicalMaterial({
    color: 0x128a66,
    metalness: 0.0,
    roughness: 0.06,
    transmission: useTransmission ? 0.36 : 0,
    thickness: 3,
    ior: 1.49,
    attenuationColor: new THREE.Color(0x087a58),
    attenuationDistance: 3,
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    envMapIntensity: 2.6,
    iridescence: 0.32,
    iridescenceIOR: 1.35,
    iridescenceThicknessRange: [140, 480],
    emissive: new THREE.Color(0x0a4d39),
    emissiveIntensity: 1.1,
    transparent: true,
    opacity: 1,
    side: THREE.FrontSide
  });

  var neckMat = crystalMat.clone();
  neckMat.side = THREE.DoubleSide;
  neckMat.attenuationColor = new THREE.Color(0x0a6b4f);

  var hairMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.04,
    roughness: 0.11,
    transmission: useTransmission ? 0.25 : 0,
    thickness: 3,
    ior: 1.5,
    attenuationColor: new THREE.Color(0x07503a),
    attenuationDistance: 2.4,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    envMapIntensity: 2.6,
    iridescence: 0.22,
    iridescenceIOR: 1.4,
    flatShading: true,
    transparent: true,
    opacity: 1,
    emissive: new THREE.Color(0x04241b),
    emissiveIntensity: 0.9
  });

  var darkMat = new THREE.MeshStandardMaterial({
    color: 0x02100c,
    metalness: 0.55,
    roughness: 0.22,
    emissive: new THREE.Color(0x02140f),
    emissiveIntensity: 0.9
  });

  var lipMat = new THREE.MeshPhysicalMaterial({
    color: 0x0e6b51,
    metalness: 0.05,
    roughness: 0.16,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.7,
    emissive: new THREE.Color(0x052018),
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.94
  });

  var irisMat = new THREE.MeshStandardMaterial({
    color: 0x19dfa0,
    metalness: 0.25,
    roughness: 0.2,
    emissive: new THREE.Color(0x0b6b4e),
    emissiveIntensity: 0.9,
    toneMapped: false
  });

  var glintMat = new THREE.MeshBasicMaterial({ color: 0xeafff6, toneMapped: false });


  var REFLECT_MAT = new THREE.MeshBasicMaterial({
    color: 0x0a5a44,
    transparent: true,
    opacity: 0.17,
    depthWrite: false,
    side: THREE.DoubleSide,
    toneMapped: false
  });

  var FIN_MAT = new THREE.MeshStandardMaterial({
    color: 0x040a08,
    metalness: 0.65,
    roughness: 0.5,
    envMapIntensity: 0.35
  });

  var METAL = new THREE.MeshStandardMaterial({
    color: 0x030807,
    metalness: 0.94,
    roughness: 0.24,
    envMapIntensity: 0.8
  });

  /* ------------------------------------------------------------------ lights */
  var hemi = new THREE.HemisphereLight(0x0b3a2c, 0x010403, 0.42);
  scene.add(hemi);

  var ambient = new THREE.AmbientLight(0x0a2a20, 0.32);
  scene.add(ambient);

  var key = new THREE.DirectionalLight(0xe6fff5, 2.9);
  key.position.set(-4.6, 6.2, 4.3);
  scene.add(key);

  var fill = new THREE.DirectionalLight(0xa8e8d0, 0.5);
  fill.position.set(3.2, 2.4, 5.4);
  scene.add(fill);

  var rim = new THREE.DirectionalLight(0x19dfa0, 2.0);
  rim.position.set(4.8, 3.4, -4.2);
  scene.add(rim);

  var back = new THREE.DirectionalLight(0x7affcb, 0.9);
  back.position.set(0.6, 4.6, -6.2);
  scene.add(back);

  var under = new THREE.PointLight(0x19dfa0, 3.4, 5.5, 2);
  under.position.set(0.2, 0.42, 1.35);
  scene.add(under);

  /* ------------------------------------------------------------------ bust */
  var bust = new THREE.Group();
  var BUST_X = 0.22;
  var BASE_ROT = 0.1;
  bust.position.x = BUST_X;
  bust.rotation.y = BASE_ROT;
  scene.add(bust);

  var innerLight = new THREE.PointLight(0x7affcb, 6.2, 3.6, 2);
  innerLight.position.set(0, 2.45, 0.12);
  bust.add(innerLight);

  var chestLight = new THREE.PointLight(0x19dfa0, 2.6, 2.6, 2);
  chestLight.position.set(0, 1.05, 0.25);
  bust.add(chestLight);

  function gauss(x, y, z, cx, cy, cz, sx, sy, sz, amp) {
    var dx = (x - cx) / sx;
    var dy = (y - cy) / sy;
    var dz = (z - cz) / sz;
    return amp * Math.exp(-0.5 * (dx * dx + dy * dy + dz * dz));
  }

  function makeHeadGeometry(detail) {
    var geo = new THREE.IcosahedronGeometry(1, detail);
    var pos = geo.attributes.position;
    var v = new THREE.Vector3();
    var dir = new THREE.Vector3();
    for (var i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      dir.copy(v).normalize();
      var x = v.x * 0.735;
      var y = v.y * 1.02;
      var z = v.z * 0.84;

      if (y < 0) {
        var tt = Math.min(1, -y);
        var taper = 1 - 0.20 * tt * tt;
        x *= taper;
        z *= 1 - 0.055 * tt * tt;
      }
      if (y > 0.62) {
        var tc = Math.min(1, (y - 0.62) / 0.4);
        x *= 1 - 0.055 * tc * tc;
        z *= 1 - 0.03 * tc * tc;
      }

      var d = 0;
      /* brow / sockets */
      d += gauss(x, y, z, -0.26, 0.295, 0.66, 0.19, 0.07, 0.26, 0.046);
      d += gauss(x, y, z, 0.26, 0.295, 0.66, 0.19, 0.07, 0.26, 0.046);
      d -= gauss(x, y, z, -0.265, 0.13, 0.73, 0.165, 0.085, 0.22, 0.072);
      d -= gauss(x, y, z, 0.265, 0.13, 0.73, 0.165, 0.085, 0.22, 0.072);
      /* nose bridge, tip, wings */
      d += gauss(x, y, z, 0, 0.11, 0.82, 0.075, 0.24, 0.18, 0.055);
      d += gauss(x, y, z, 0, -0.145, 0.87, 0.07, 0.095, 0.15, 0.088);
      d += gauss(x, y, z, -0.105, -0.175, 0.83, 0.04, 0.045, 0.10, 0.03);
      d += gauss(x, y, z, 0.105, -0.175, 0.83, 0.04, 0.045, 0.10, 0.03);
      d -= gauss(x, y, z, -0.078, -0.2, 0.87, 0.028, 0.03, 0.075, 0.022);
      d -= gauss(x, y, z, 0.078, -0.2, 0.87, 0.028, 0.03, 0.075, 0.022);
      /* philtrum + lips */
      d -= gauss(x, y, z, 0, -0.305, 0.84, 0.026, 0.05, 0.12, 0.018);
      d += gauss(x, y, z, 0, -0.36, 0.82, 0.145, 0.042, 0.14, 0.056);
      d -= gauss(x, y, z, 0, -0.4, 0.85, 0.155, 0.011, 0.14, 0.028);
      d += gauss(x, y, z, 0, -0.438, 0.82, 0.12, 0.047, 0.14, 0.062);
      d -= gauss(x, y, z, 0, -0.505, 0.78, 0.1, 0.03, 0.14, 0.014);
      /* chin + jaw */
      d += gauss(x, y, z, 0, -0.6, 0.71, 0.13, 0.14, 0.2, 0.055);
      d += gauss(x, y, z, -0.37, -0.46, 0.43, 0.14, 0.16, 0.22, 0.03);
      d += gauss(x, y, z, 0.37, -0.46, 0.43, 0.14, 0.16, 0.22, 0.03);
      /* cheekbones, cheek hollow, temples */
      d += gauss(x, y, z, -0.44, 0.0, 0.55, 0.2, 0.14, 0.24, 0.05);
      d += gauss(x, y, z, 0.44, 0.0, 0.55, 0.2, 0.14, 0.24, 0.05);
      d -= gauss(x, y, z, -0.41, -0.25, 0.6, 0.15, 0.13, 0.2, 0.022);
      d -= gauss(x, y, z, 0.41, -0.25, 0.6, 0.15, 0.13, 0.2, 0.022);
      d -= gauss(x, y, z, -0.55, 0.31, 0.4, 0.12, 0.17, 0.22, 0.018);
      d -= gauss(x, y, z, 0.55, 0.31, 0.4, 0.12, 0.17, 0.22, 0.018);
      /* forehead plane */
      d += gauss(x, y, z, 0, 0.5, 0.62, 0.36, 0.22, 0.24, 0.022);
      /* organic asymmetry + micro facets */
      d += Math.sin(y * 9 + x * 5) * 0.0035;
      d += Math.sin(x * 18 + y * 11) * Math.cos(z * 15 - y * 6) * 0.0032;

      x += dir.x * d;
      y += dir.y * d;
      z += dir.z * d;
      pos.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  function makeTorsoGeometry(seg) {
    var rings = [
      [2.06, 0.295, 0.30], [1.98, 0.305, 0.305], [1.90, 0.32, 0.315],
      [1.82, 0.345, 0.33], [1.72, 0.41, 0.36], [1.62, 0.51, 0.395],
      [1.52, 0.63, 0.43], [1.42, 0.77, 0.465], [1.32, 0.93, 0.5],
      [1.22, 1.08, 0.525], [1.12, 1.19, 0.545], [1.02, 1.25, 0.56],
      [0.92, 1.27, 0.568], [0.82, 1.23, 0.57], [0.72, 1.14, 0.562],
      [0.62, 1.03, 0.55], [0.52, 0.93, 0.535], [0.42, 0.84, 0.515],
      [0.34, 0.78, 0.5]
    ];
    var verts = [];
    var idx = [];
    var i, j;
    for (i = 0; i < rings.length; i++) {
      var y = rings[i][0], rx = rings[i][1], rz = rings[i][2];
      for (j = 0; j <= seg; j++) {
        var a = (j / seg) * Math.PI * 2;
        var ripple = 1 + Math.sin(a * 7 + y * 5.2) * 0.006;
        var x = Math.cos(a) * rx * ripple;
        var z = Math.sin(a) * rz * ripple;
        var d = 0;
        if (z > 0) {
          var front = smoothstep(0, 0.34, z);
          d += gauss(x, y, z, -0.39, 0.94, 0.54, 0.27, 0.2, 0.24, 0.11) * front;
          d += gauss(x, y, z, 0.39, 0.94, 0.54, 0.27, 0.2, 0.24, 0.11) * front;
          d -= gauss(x, y, z, 0, 1.0, 0.56, 0.055, 0.16, 0.2, 0.028) * front;
          d += gauss(x, y, z, 0, 1.44, 0.4, 0.5, 0.05, 0.12, 0.018) * front;
        }
        x += Math.cos(a) * d;
        z += Math.sin(a) * d;
        verts.push(x, y, z);
      }
    }
    for (i = 0; i < rings.length - 1; i++) {
      for (j = 0; j < seg; j++) {
        var a0 = i * (seg + 1) + j;
        var a1 = a0 + 1;
        var b0 = a0 + seg + 1;
        var b1 = b0 + 1;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    geo.computeBoundingSphere();
    return geo;
  }

  var headGeo = makeHeadGeometry(isSmall ? 3 : 4);
  var headMesh = new THREE.Mesh(headGeo, crystalMat);
  var head = new THREE.Group();
  head.position.y = 2.55;
  head.add(headMesh);
  bust.add(head);

  var torsoGeo = makeTorsoGeometry(isSmall ? 48 : 72);
  var torso = new THREE.Mesh(torsoGeo, crystalMat);
  bust.add(torso);

  var neckGeo = new THREE.CylinderGeometry(0.315, 0.43, 0.64, isSmall ? 20 : 28, 3, true);
  var neck = new THREE.Mesh(neckGeo, neckMat);
  neck.scale.z = 0.9;
  neck.position.y = 1.79;
  bust.add(neck);


  /* ------------------------------------------------------------------ face */
  var eyeGeo = new THREE.SphereGeometry(1, 18, 12);
  var eyeMat = new THREE.MeshStandardMaterial({
    color: 0x02100c, metalness: 0.45, roughness: 0.14,
    emissive: new THREE.Color(0x031c14), emissiveIntensity: 0.7
  });

  [-1, 1].forEach(function (s) {
    var eye = new THREE.Group();
    eye.position.set(0.265 * s, 0.135, 0.708);
    eye.rotation.y = 0.24 * s;
    eye.rotation.z = -0.035 * s;
    head.add(eye);

    var ball = new THREE.Mesh(eyeGeo, eyeMat);
    ball.scale.set(0.104, 0.052, 0.048);
    eye.add(ball);

    var iris = new THREE.Mesh(eyeGeo, irisMat);
    iris.scale.set(0.039, 0.039, 0.012);
    iris.position.set(0, 0.002, 0.046);
    eye.add(iris);

    var pupil = new THREE.Mesh(eyeGeo, darkMat);
    pupil.scale.set(0.019, 0.019, 0.007);
    pupil.position.set(0, 0.002, 0.057);
    eye.add(pupil);

    var glint = new THREE.Mesh(new THREE.SphereGeometry(0.0075, 8, 6), glintMat);
    glint.position.set(0.016, 0.018, 0.062);
    eye.add(glint);

    var lashPts = [
      new THREE.Vector3(-0.088 * s, 0.012, 0.048),
      new THREE.Vector3(-0.018 * s, 0.045, 0.058),
      new THREE.Vector3(0.082 * s, 0.018, 0.047)
    ];
    var lash = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(lashPts), 10, 0.0062, 4, false),
      darkMat
    );
    eye.add(lash);

    var browPts = [
      new THREE.Vector3(0.145 * s, 0.292, 0.749),
      new THREE.Vector3(0.275 * s, 0.312, 0.739),
      new THREE.Vector3(0.395 * s, 0.283, 0.689)
    ];
    var brow = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(browPts), 12, 0.011, 4, false),
      darkMat
    );
    head.add(brow);

    var ear = new THREE.Mesh(eyeGeo, crystalMat);
    ear.scale.set(0.06, 0.15, 0.105);
    ear.position.set(0.705 * s, 0.02, 0.03);
    ear.rotation.z = -0.14 * s;
    ear.rotation.y = 0.16 * s;
    head.add(ear);

    var earIn = new THREE.Mesh(eyeGeo, darkMat);
    earIn.scale.set(0.022, 0.075, 0.045);
    earIn.position.set(0.735 * s, 0.02, 0.055);
    earIn.rotation.z = -0.14 * s;
    head.add(earIn);

    var nostril = new THREE.Mesh(eyeGeo, darkMat);
    nostril.scale.set(0.021, 0.013, 0.011);
    nostril.position.set(0.052 * s, -0.197, 0.92);
    nostril.rotation.x = 0.35;
    head.add(nostril);
  });

  var upperLip = new THREE.Mesh(eyeGeo, lipMat);
  upperLip.scale.set(0.132, 0.028, 0.036);
  upperLip.position.set(0, -0.373, 0.818);
  head.add(upperLip);

  var lowerLip = new THREE.Mesh(eyeGeo, lipMat);
  lowerLip.scale.set(0.114, 0.034, 0.04);
  lowerLip.position.set(0, -0.438, 0.815);
  head.add(lowerLip);

  var mouthLine = new THREE.Mesh(eyeGeo, darkMat);
  mouthLine.scale.set(0.108, 0.0075, 0.018);
  mouthLine.position.set(0, -0.406, 0.833);
  head.add(mouthLine);

  /* ------------------------------------------------------------------ hair */
  function makeLockGeometry(twist, thickness) {
    var sides = 6;
    var profile = [0.17, 0.155, 0.125, 0.082, 0.034];
    var verts = [];
    var idx = [];
    var s, k;
    for (s = 0; s < profile.length; s++) {
      var ty = s / (profile.length - 1);
      var r = profile[s];
      for (k = 0; k < sides; k++) {
        var a = (k / sides) * Math.PI * 2 + twist * ty;
        verts.push(Math.cos(a) * r, ty, Math.sin(a) * r * thickness);
      }
    }
    for (s = 0; s < profile.length - 1; s++) {
      for (k = 0; k < sides; k++) {
        var a0 = s * sides + k;
        var a1 = s * sides + ((k + 1) % sides);
        var b0 = a0 + sides;
        var b1 = a1 + sides;
        idx.push(a0, b0, a1, a1, b0, b1);
      }
    }
    var apex = verts.length / 3;
    verts.push(0, 1.07, 0);
    var last = (profile.length - 1) * sides;
    for (k = 0; k < sides; k++) {
      idx.push(last + k, apex, last + ((k + 1) % sides));
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    return geo;
  }

  var lockGeoA = makeLockGeometry(0.34, 0.62);
  var lockGeoB = makeLockGeometry(-0.26, 0.82);
  var UP = new THREE.Vector3(0, 1, 0);
  var hairPalette = [0x0b4a37, 0x0d5f45, 0x107a59, 0x149a70, 0x2fbf90, 0x7affcb];

  function hairColor() {
    var r = rnd();
    if (r > 0.955) return hairPalette[5];
    if (r > 0.84) return hairPalette[4];
    if (r > 0.6) return hairPalette[3];
    if (r > 0.34) return hairPalette[2];
    if (r > 0.14) return hairPalette[1];
    return hairPalette[0];
  }

  var hairInstances = [];
  var hairRings = [
    { y: 0.83, rx: 0.42, rz: 0.44, n: 9, gap: 0.32, len: [0.3, 0.52], kind: 'top' },
    { y: 0.63, rx: 0.63, rz: 0.64, n: 14, gap: 0.55, len: [0.42, 0.68], kind: 'top' },
    { y: 0.37, rx: 0.78, rz: 0.78, n: 17, gap: 0.8, len: [0.5, 0.82], kind: 'mid' },
    { y: 0.09, rx: 0.84, rz: 0.8, n: 15, gap: 1.05, len: [0.56, 0.98], kind: 'mid' },
    { y: -0.2, rx: 0.74, rz: 0.68, n: 11, gap: 1.32, len: [0.62, 1.06], kind: 'low' },
    { y: -0.46, rx: 0.56, rz: 0.53, n: 8, gap: 1.58, len: [0.7, 1.18], kind: 'low' }
  ];

  hairRings.forEach(function (ring, ri) {
    var span = Math.PI * 2 - ring.gap * 2;
    for (var i = 0; i < ring.n; i++) {
      var a = ring.gap + (ring.n === 1 ? span / 2 : (i / (ring.n - 1)) * span) + (rnd() - 0.5) * 0.12;
      var root = new THREE.Vector3(
        Math.sin(a) * ring.rx + (rnd() - 0.5) * 0.05,
        ring.y + (rnd() - 0.5) * 0.06,
        Math.cos(a) * ring.rz + (rnd() - 0.5) * 0.05
      );
      var dir;
      if (ring.kind === 'top') {
        dir = new THREE.Vector3(root.x * 0.5 + (rnd() - 0.5) * 0.12, 0.52 + rnd() * 0.2, root.z * 0.5 - 0.5);
      } else if (ring.kind === 'mid') {
        dir = new THREE.Vector3(root.x * 0.72, 0.08 - rnd() * 0.18, root.z * 0.72 - 0.3);
      } else {
        dir = new THREE.Vector3(root.x * 0.5, -1 + rnd() * 0.16, root.z * 0.5 - 0.12);
      }
      dir.normalize();
      var len = lerp(ring.len[0], ring.len[1], rnd());
      hairInstances.push({
        p: root,
        q: new THREE.Quaternion().setFromUnitVectors(UP, dir),
        s: new THREE.Vector3(0.42 + rnd() * 0.32, len, 0.34 + rnd() * 0.26),
        c: hairColor(),
        variant: rnd() > 0.5 ? 0 : 1
      });
    }
  });

  for (var hl = 0; hl < (isSmall ? 4 : 6); hl++) {
    var ha = Math.PI + (hl - ((isSmall ? 4 : 6) - 1) / 2) * 0.26 + (rnd() - 0.5) * 0.1;
    var hRoot = new THREE.Vector3(Math.sin(ha) * 0.58, -0.34 - rnd() * 0.12, Math.cos(ha) * 0.5);
    var hDir = new THREE.Vector3(Math.sin(ha) * 0.28, -1, Math.cos(ha) * 0.22).normalize();
    hairInstances.push({
      p: hRoot,
      q: new THREE.Quaternion().setFromUnitVectors(UP, hDir),
      s: new THREE.Vector3(0.5 + rnd() * 0.18, 1.15 + rnd() * 0.35, 0.42 + rnd() * 0.2),
      c: rnd() > 0.7 ? hairPalette[2] : hairPalette[1],
      variant: 1
    });
  }

  var hairGroups = [[], []];
  hairInstances.forEach(function (h) { hairGroups[h.variant].push(h); });

  var hairMeshes = hairGroups.map(function (list, vi) {
    var mesh = new THREE.InstancedMesh(vi === 0 ? lockGeoA : lockGeoB, hairMat, Math.max(1, list.length));
    var m = new THREE.Matrix4();
    var col = new THREE.Color();
    list.forEach(function (h, i) {
      m.compose(h.p, h.q, h.s);
      mesh.setMatrixAt(i, m);
      col.setHex(h.c);
      mesh.setColorAt(i, col);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.frustumCulled = false;
    head.add(mesh);
    return mesh;
  });
  var hairMesh = hairMeshes[0];

  /* ------------------------------------------------------------------ fresnel crystal aura */
  var fresnelHead = new THREE.ShaderMaterial({
    uniforms: {
      uA: { value: new THREE.Color(0x087a58) },
      uB: { value: new THREE.Color(0x7affcb) },
      uI: { value: 0.42 },
      uP: { value: 2.7 },
      uT: { value: 0 }
    },
    vertexShader: [
      'varying vec3 vN; varying vec3 vV; varying vec3 vP;',
      'void main(){',
      '  vec4 mv = modelViewMatrix * vec4(position, 1.0);',
      '  vN = normalize(normalMatrix * normal);',
      '  vV = normalize(-mv.xyz);',
      '  vP = position;',
      '  gl_Position = projectionMatrix * mv;',
      '}'
    ].join('\n'),
    fragmentShader: [
      'uniform vec3 uA; uniform vec3 uB; uniform float uI; uniform float uP; uniform float uT;',
      'varying vec3 vN; varying vec3 vV; varying vec3 vP;',
      'void main(){',
      '  float f = pow(1.0 - clamp(abs(dot(normalize(vN), normalize(vV))), 0.0, 1.0), uP);',
      '  float bands = 0.84 + 0.16 * sin(vP.y * 26.0 + uT * 0.55);',
      '  vec3 col = mix(uA, uB, clamp(f * 1.3, 0.0, 1.0));',
      '  gl_FragColor = vec4(col * bands, f * uI);',
      '}'
    ].join('\n'),
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide
  });
  var fresnelBody = fresnelHead.clone();

  var headAura = new THREE.Mesh(headGeo, fresnelHead);
  headAura.scale.setScalar(1.012);
  head.add(headAura);

  var torsoAura = new THREE.Mesh(torsoGeo, fresnelBody);
  torsoAura.scale.setScalar(1.01);
  bust.add(torsoAura);

  /* inner emerald core */
  var coreMat = new THREE.MeshBasicMaterial({
    color: 0x19dfa0, transparent: true, opacity: 0.10,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  var core = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 14), coreMat);
  core.scale.set(0.32, 0.5, 0.3);
  core.position.set(0, -0.02, 0.02);
  head.add(core);

  var innerGlow = new THREE.Sprite(new THREE.SpriteMaterial({
    map: TEX_DOT, color: 0x7affcb, transparent: true, opacity: 0.22,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  }));
  innerGlow.scale.set(1.7, 1.7, 1);
  innerGlow.position.set(0, -0.05, 0.08);
  head.add(innerGlow);

  /* ------------------------------------------------------------------ pedestal */
  var FLOOR_Y = -0.25;
  var pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.02, 1.1, 0.6, 6, 1), METAL);
  pedestal.position.set(BUST_X, 0.05, 0);
  pedestal.rotation.y = Math.PI / 6;
  scene.add(pedestal);

  var rimRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.0, 0.007, 4, 96),
    new THREE.MeshBasicMaterial({ color: 0x7affcb, transparent: true, opacity: 0.4, toneMapped: false })
  );
  rimRing.position.set(BUST_X, 0.355, 0);
  rimRing.rotation.x = Math.PI / 2;
  scene.add(rimRing);


  /* ------------------------------------------------------------------ floor */
  var floor = new THREE.Mesh(
    new THREE.PlaneGeometry(70, 70),
    new THREE.MeshStandardMaterial({
      color: 0x030807,
      metalness: 0.92,
      roughness: 0.24,
      envMapIntensity: 0.82,
      transparent: true,
      opacity: 0.86
    })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = FLOOR_Y;
  floor.renderOrder = 0;
  scene.add(floor);

  var contact = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 4.4),
    new THREE.MeshBasicMaterial({
      map: TEX_SHADOW, transparent: true, opacity: 0.82,
      depthWrite: false, toneMapped: false
    })
  );
  contact.rotation.x = -Math.PI / 2;
  contact.position.set(BUST_X, FLOOR_Y + 0.004, 0);
  contact.renderOrder = 1;
  scene.add(contact);

  var pool = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshBasicMaterial({
      map: TEX_FLOOR, transparent: true, opacity: 0.46,
      blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
    })
  );
  pool.rotation.x = -Math.PI / 2;
  pool.position.set(BUST_X, FLOOR_Y + 0.006, 0);
  pool.renderOrder = 2;
  scene.add(pool);

  /* polished-floor reflection of the sculpture */
  var mirror = new THREE.Group();
  mirror.scale.y = -1;
  mirror.position.set(BUST_X, FLOOR_Y * 2, 0);
  mirror.rotation.y = BASE_ROT;

  var mHead = new THREE.Mesh(headGeo, REFLECT_MAT);
  mHead.position.y = 2.55;
  mirror.add(mHead);
  var mTorso = new THREE.Mesh(torsoGeo, REFLECT_MAT);
  mirror.add(mTorso);
  var mNeck = new THREE.Mesh(neckGeo, REFLECT_MAT);
  mNeck.position.y = 1.79;
  mNeck.scale.z = 0.9;
  mirror.add(mNeck);
  scene.add(mirror);

  /* ------------------------------------------------------------------ gallery architecture */
  var fins = new THREE.Group();
  scene.add(fins);
  var finEdgeMat = new THREE.MeshBasicMaterial({
    color: 0x19dfa0, transparent: true, opacity: 0.16,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false
  });
  var finData = [
    [-9.6, -10.5, 1.5, 12], [-5.2, -12.5, 1.0, 16],
    [-1.0, -14.5, 1.3, 18], [3.4, -11.5, 0.95, 13], [8.4, -13.5, 1.6, 17]
  ];
  finData.forEach(function (f, i) {
    var w = f[2] * (isNarrow ? 1.25 : 1);
    var h = f[3];
    var box = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.5), FIN_MAT);
    box.position.set(f[0] * (isNarrow ? 0.62 : 1), h / 2 + FLOOR_Y, f[1]);
    fins.add(box);
    if (i % 2 === 1) {
      var edge = new THREE.Mesh(new THREE.BoxGeometry(0.02, h * 0.9, 0.52), finEdgeMat);
      edge.position.set(box.position.x + (f[0] < 0 ? w / 2 : -w / 2), box.position.y, f[1]);
      fins.add(edge);
    }
  });

  var beams = [];
  var beamDefs = [
    [-2.7, -3.4, 1.15, -0.2, 0.095],
    [2.4, -4.2, 0.8, 0.16, 0.065]
  ];
  beamDefs.forEach(function (b) {
    var mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(b[2], 7.4),
      new THREE.MeshBasicMaterial({
        map: TEX_BEAM, transparent: true, opacity: b[4],
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
        color: 0x7affcb, toneMapped: false
      })
    );
    mesh.position.set(b[0], 3.35, b[1]);
    mesh.rotation.set(0, b[3], b[3] * 0.5);
    mesh.userData.base = b[4];
    scene.add(mesh);
    beams.push(mesh);
  });

  /* a few drifting crystal fragments */
  var fragGeo = new THREE.OctahedronGeometry(1, 0);
  var fragMat = new THREE.MeshStandardMaterial({
    color: 0x0e8a66, emissive: new THREE.Color(0x0b6b4e),
    emissiveIntensity: 0.85, metalness: 0.2, roughness: 0.24,
    transparent: true, opacity: 0.62, flatShading: true
  });
  var fragCount = isSmall ? 3 : 5;
  var fragMesh = new THREE.InstancedMesh(fragGeo, fragMat, fragCount);
  fragMesh.frustumCulled = false;
  scene.add(fragMesh);
  var frags = [];
  for (var fi = 0; fi < fragCount; fi++) {
    var fa = 0.55 + fi * 1.18 + rnd() * 0.3;
    var fr = 1.65 + rnd() * 0.85;
    frags.push({
      x: Math.cos(fa) * fr + BUST_X,
      y: 0.6 + fi * 0.52 + rnd() * 0.3,
      z: Math.sin(fa) * fr * 0.7 - 0.35,
      s: 0.03 + rnd() * 0.045,
      rot: rnd() * Math.PI * 2,
      spd: 0.3 + rnd() * 0.35,
      phase: rnd() * Math.PI * 2
    });
  }

  /* atmospheric dust */
  var dustCount = isSmall ? 34 : 72;
  var dustGeo = new THREE.BufferGeometry();
  var dustPos = new Float32Array(dustCount * 3);
  for (var di = 0; di < dustCount; di++) {
    dustPos[di * 3] = (rnd() - 0.5) * 8.5;
    dustPos[di * 3 + 1] = rnd() * 4.4 - 0.1;
    dustPos[di * 3 + 2] = (rnd() - 0.5) * 5.5 - 1;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  var dustMat = new THREE.PointsMaterial({
    map: TEX_DOT, size: 0.038, sizeAttenuation: true, transparent: true,
    opacity: 0.42, depthWrite: false, blending: THREE.AdditiveBlending,
    color: 0x7affcb, toneMapped: false
  });
  var dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  /* ------------------------------------------------------------------ state */
  var pointer = { x: 0, y: 0, tx: 0, ty: 0, hover: 0, hoverT: 0 };
  var scrollStart = 0;
  var scrollSpan = 620;
  var scrollTarget = 0;
  var scrollSmooth = 0;
  var introT = reduced ? 1 : 0;
  var last = performance.now();
  var startTime = performance.now();
  var W = 1, H = 1;
  var frameTimes = [];
  var fps = 0;
  var qualityDpr = isSmall ? 1.45 : 1.8;
  var pulse = 0;

  var yaw = 0;
  var yawVel = 0;
  var dragging = false;
  var dragId = null;
  var dragStartX = 0;
  var dragStartYaw = 0;
  var dragDist = 0;
  var lastDragT = 0;
  var lastMoveT = 0;
  var YAW_LIMIT = 0.62;
  var RETURN_DELAY = 2.8;

  var raycaster = new THREE.Raycaster();
  var ndc = new THREE.Vector2();
  var hoverTargets = [headMesh, torso, neck];
  for (var hm = 0; hm < hairMeshes.length; hm++) hoverTargets.push(hairMeshes[hm]);

  function readScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    scrollTarget = clamp((y - scrollStart) / scrollSpan, 0, 1);
  }

  function measureScroll() {
    var r = host.getBoundingClientRect();
    var top = r.top + (window.pageYOffset || document.documentElement.scrollTop || 0);
    scrollStart = top - 130;
    scrollSpan = Math.max(isNarrow ? 340 : 360, host.offsetHeight * (isNarrow ? 1.0 : 0.9));
    readScroll();
  }

  function dpr() {
    return Math.min(window.devicePixelRatio || 1, qualityDpr);
  }

  function resize() {
    var w = host.clientWidth;
    var h = host.clientHeight;
    if (!w || !h) { w = 640; h = 520; }
    W = w; H = h;
    renderer.setPixelRatio(dpr());
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    measureScroll();
    if (reduced) {
      updateScene(performance.now(), 0);
      renderer.render(scene, camera);
    }
  }

  function updateHover(e) {
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ndc.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    bust.updateMatrixWorld(true);
    raycaster.setFromCamera(ndc, camera);
    pointer.hoverT = raycaster.intersectObjects(hoverTargets, false).length ? 1 : 0;
  }

  function onPointerDown(e) {
    if (reduced) return;
    if (e.button && e.button !== 0) return;
    dragging = true;
    dragId = e.pointerId;
    dragStartX = e.clientX;
    dragStartYaw = yaw;
    dragDist = 0;
    yawVel = 0;
    lastDragT = performance.now();
    lastMoveT = lastDragT;
    host.classList.add('is-dragging');
    pointer.hoverT = 1;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
  }

  function onPointerMove(e) {
    var r = host.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pointer.tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    pointer.ty = clamp(-(((e.clientY - r.top) / r.height) * 2 - 1), -1, 1);

    if (dragging && e.pointerId === dragId) {
      var now = performance.now();
      var w = Math.max(280, host.clientWidth);
      var want = clamp(dragStartYaw + ((e.clientX - dragStartX) / w) * 1.15, -YAW_LIMIT, YAW_LIMIT);
      var dt = Math.max(0.008, (now - lastMoveT) / 1000);
      if (dt > 0.12) dt = 0.016;
      yawVel = clamp((want - yaw) / dt, -2.2, 2.2);
      yaw = want;
      dragDist = Math.max(dragDist, Math.abs(e.clientX - dragStartX));
      lastMoveT = now;
      lastDragT = now;
      pointer.hoverT = 1;
    } else if (e.pointerType === 'mouse' || e.pointerType === 'pen' || !e.pointerType) {
      updateHover(e);
    }
  }

  function onPointerUp(e) {
    if (!dragging || (e.pointerId !== undefined && e.pointerId !== dragId)) return;
    dragging = false;
    lastDragT = performance.now();
    if (dragDist < 5) pulse = 1;
    host.classList.remove('is-dragging');
    try { canvas.releasePointerCapture(dragId); } catch (err) {}
    dragId = null;
    updateHover(e);
  }

  function onPointerLeave() {
    pointer.tx = 0;
    pointer.ty = 0;
    pointer.hoverT = 0;
  }


  /* ------------------------------------------------------------------ animation */
  var m4 = new THREE.Matrix4();
  var q4 = new THREE.Quaternion();
  var e4 = new THREE.Euler();
  var v3 = new THREE.Vector3();
  var s3 = new THREE.Vector3();

  function updateScene(now, dt) {
    var t = reduced ? 0 : Math.max(0, (now - startTime) / 1000);
    if (!reduced) introT = Math.min(1, t / 2.9);
    var ease = 1 - Math.pow(1 - introT, 3);
    var k = reduced ? 1 : 1 - Math.exp(-dt * 4.2);

    scrollSmooth += (scrollTarget - scrollSmooth) * k;
    pointer.x += (pointer.tx - pointer.x) * k;
    pointer.y += (pointer.ty - pointer.y) * k;
    pointer.hover += (pointer.hoverT - pointer.hover) * k;
    pulse *= reduced ? 0 : Math.exp(-dt * 2.1);

    if (!reduced && !dragging) {
      yaw += yawVel * dt;
      yawVel *= Math.exp(-dt * 2.6);
      if ((now - lastDragT) / 1000 > RETURN_DELAY) {
        yaw += (0 - yaw) * (1 - Math.exp(-dt * 1.15));
        yawVel *= Math.exp(-dt * 3.6);
      }
      if (yaw > YAW_LIMIT) { yaw = YAW_LIMIT; yawVel *= -0.3; }
      if (yaw < -YAW_LIMIT) { yaw = -YAW_LIMIT; yawVel *= -0.3; }
    }

    renderer.toneMappingExposure = 0.02 + ease * 1.38;
    hemi.intensity = 0.03 + ease * 0.44;
    ambient.intensity = 0.02 + ease * 0.34;
    key.intensity = 0.1 + ease * 2.8 + pointer.hover * 0.16;
    fill.intensity = 0.03 + ease * 0.52;
    rim.intensity = 0.05 + ease * (1.95 + scrollSmooth * 0.5) + pointer.hover * 0.24;
    back.intensity = 0.04 + ease * (0.8 + scrollSmooth * 0.25);
    under.intensity = 0.1 + ease * 3.2 + pointer.hover * 0.4;
    chestLight.intensity = 0.2 + ease * 2.2 + pointer.hover * 0.5;

    key.position.x = -4.6 + Math.sin(t * 0.09) * 0.3;
    key.position.z = 4.3 + Math.cos(t * 0.07) * 0.22;
    rim.position.x = 4.8 + Math.sin(t * 0.061 + 1.7) * 0.35;
    back.position.x = 0.6 + Math.sin(t * 0.043 + 3.1) * 0.5;
    under.position.x = BUST_X + Math.sin(t * 0.17) * 0.16;

    innerLight.position.set(
      Math.sin(t * 0.19) * 0.22,
      1.45 + (Math.sin(t * 0.13 + 0.6) * 0.5 + 0.5) * 1.18,
      0.1 + Math.cos(t * 0.155) * 0.16
    );
    innerLight.intensity = (0.3 + ease * (4.6 + scrollSmooth * 2.2)) * (1 + pointer.hover * 0.32 + pulse * 0.7);
    innerGlow.position.set(0.03 + Math.sin(t * 0.21) * 0.05, -0.05 + Math.cos(t * 0.17) * 0.05, 0.08);
    innerGlow.material.opacity = (0.07 + ease * 0.15) * (0.86 + Math.sin(t * 0.7) * 0.14 + pointer.hover * 0.24 + pulse * 0.45);
    coreMat.opacity = 0.04 + ease * 0.05 + pointer.hover * 0.035 + pulse * 0.04;

    crystalMat.envMapIntensity = 2.6 + pointer.hover * 0.42 + pulse * 0.18;
    hairMat.envMapIntensity = 2.6 + pointer.hover * 0.4 + pulse * 0.16;
    var fres = (0.15 + ease * 0.25 + scrollSmooth * 0.18 + pointer.hover * 0.26 + pulse * 0.18);
    fresnelHead.uniforms.uI.value = fres;
    fresnelBody.uniforms.uI.value = fres * 0.85;
    fresnelHead.uniforms.uT.value = t;
    fresnelBody.uniforms.uT.value = t;

    if (!reduced) {
      var az = BASE_AZ + Math.sin(t * 0.047) * 0.05 + scrollSmooth * 0.17 + pointer.x * 0.03;
      var rad = BASE_RADIUS + Math.sin(t * 0.037) * 0.09 - scrollSmooth * 0.12;
      var cy = BASE_Y + Math.sin(t * 0.061) * 0.03 + pointer.y * 0.042;
      camera.position.set(Math.sin(az) * rad, cy, Math.cos(az) * rad);
      camera.lookAt(
        LOOK.x + pointer.x * 0.022,
        LOOK.y + scrollSmooth * 0.09 + Math.sin(t * 0.05) * 0.012,
        LOOK.z
      );
    }

    bust.rotation.y = BASE_ROT + yaw;
    bust.rotation.z = Math.sin(t * 0.37) * 0.004;
    bust.position.y = Math.sin(t * 0.6) * 0.006;
    bust.scale.y = 1 + Math.sin(t * 0.6) * 0.003;
    head.rotation.z = Math.sin(t * 0.29 + 0.8) * 0.006;
    head.rotation.x = Math.sin(t * 0.23 + 2.1) * 0.005;

    mirror.rotation.y = BASE_ROT + yaw;
    mirror.scale.y = -bust.scale.y;
    mirror.position.y = FLOOR_Y * 2 + bust.position.y;

    for (var b = 0; b < beams.length; b++) {
      beams[b].material.opacity = beams[b].userData.base * (0.55 + ease * 0.6 + Math.sin(t * 0.26 + b * 1.9) * 0.14);
    }

    pool.material.opacity = 0.28 + ease * 0.16 + Math.sin(t * 0.2) * 0.03;
    rimRing.material.opacity = 0.16 + ease * 0.2 + pointer.hover * 0.08;

    if (!reduced) {
      dust.rotation.y = t * 0.006;
      dust.position.y = Math.sin(t * 0.12) * 0.04;
    }
    dustMat.opacity = 0.2 + ease * 0.2 + pointer.hover * 0.07;

    for (var f = 0; f < frags.length; f++) {
      var fr = frags[f];
      var fy = fr.y + Math.sin(t * fr.spd * 0.5 + fr.phase) * 0.09;
      e4.set(fr.rot + t * fr.spd * 0.24, fr.rot + t * 0.06, fr.rot * 0.6 + t * fr.spd * 0.16);
      q4.setFromEuler(e4);
      v3.set(fr.x + Math.sin(t * 0.14 + fr.phase) * 0.05, fy, fr.z);
      s3.set(fr.s, fr.s * 1.7, fr.s);
      m4.compose(v3, q4, s3);
      fragMesh.setMatrixAt(f, m4);
    }
    fragMesh.instanceMatrix.needsUpdate = true;
  }

  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.06, Math.max(0.001, (now - last) / 1000));
    last = now;
    frameTimes.push(dt);
    if (frameTimes.length > 90) frameTimes.shift();
    var sum = 0;
    for (var i = 0; i < frameTimes.length; i++) sum += frameTimes[i];
    fps = frameTimes.length / sum;

    if (frameTimes.length === 90 && fps < 46 && qualityDpr > 1.25) {
      qualityDpr = Math.max(1.25, qualityDpr - 0.25);
      frameTimes.length = 0;
      resize();
    }

    updateScene(now, dt);
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(loop);
  }

  /* ------------------------------------------------------------------ lifecycle */
  var running = false;
  var rafId = 0;
  var visible = false;
  var io = null;
  var ro = null;

  function start() {
    if (running || reduced || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = 0;
  }

  canvas.addEventListener('pointerdown', onPointerDown, { passive: true });
  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerup', onPointerUp, { passive: true });
  host.addEventListener('pointercancel', onPointerUp, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('scroll', readScroll, { passive: true });
  window.addEventListener('resize', resize, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(resize);
    ro.observe(host);
  }

  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) start(); else stop();
    }, { rootMargin: '120px' });
    io.observe(host);
  } else {
    visible = true;
  }

  resize();
  measureScroll();

  if (!reduced) host.classList.add('is-start');

  renderer.compile(scene, camera);
  startTime = performance.now();
  updateScene(startTime, reduced ? 0.016 : 0.016);
  renderer.render(scene, camera);

  if (reduced) {
    host.classList.add('is-live');
    host.classList.remove('is-start');
  } else {
    requestAnimationFrame(function () {
      host.classList.remove('is-start');
      host.classList.add('is-live');
    });
  }

  setTimeout(function () { if (!running && visible) start(); }, 60);

  canvas.addEventListener('webglcontextlost', function (e) {
    e.preventDefault();
    stop();
    useFallback();
  }, false);

  /* ------------------------------------------------------------------ QA hook */
  function projectBox(obj) {
    if (!obj) return null;
    camera.updateMatrixWorld();
    obj.updateWorldMatrix(true, true);
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var v = new THREE.Vector3();
    var im = new THREE.Matrix4();
    obj.traverse(function (o) {
      if (o.isSprite || !o.isMesh || !o.geometry) return;
      var pos = o.geometry.attributes.position;
      if (!pos) return;
      var step = Math.max(1, Math.floor(pos.count / 4000));
      var count = o.isInstancedMesh ? o.count : 1;
      for (var inst = 0; inst < count; inst++) {
        if (o.isInstancedMesh) o.getMatrixAt(inst, im);
        for (var i = 0; i < pos.count; i += step) {
          v.fromBufferAttribute(pos, i);
          if (o.isInstancedMesh) v.applyMatrix4(im);
          v.applyMatrix4(o.matrixWorld).project(camera);
          var nx = v.x * 0.5 + 0.5;
          var ny = -v.y * 0.5 + 0.5;
          if (nx < minX) minX = nx;
          if (nx > maxX) maxX = nx;
          if (ny < minY) minY = ny;
          if (ny > maxY) maxY = ny;
        }
      }
    });
    if (!isFinite(minX) || !isFinite(minY)) return null;
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  }

  window.KINETIA_BEAUTY_3D = {
    renderer: renderer,
    scene: scene,
    camera: camera,
    bust: bust,
    head: headMesh,
    torso: torso,
    hairMeshes: hairMeshes,
    reduced: reduced,
    get fps() { return Math.round(fps); },
    get yaw() { return Math.round(yaw * 1000) / 1000; },
    metrics: function () {
      return {
        width: W, height: H,
        head: projectBox(head),
        bust: projectBox(bust),
        torso: projectBox(torso),
        transmission: useTransmission,
        dpr: Math.round(dpr() * 100) / 100,
        hover: Math.round(pointer.hover * 100) / 100,
        yaw: Math.round(yaw * 1000) / 1000,
        scroll: Math.round(scrollSmooth * 100) / 100,
        running: running
      };
    }
  };

  var disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    stop();
    if (io) io.disconnect();
    if (ro) ro.disconnect();
    window.removeEventListener('scroll', readScroll);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('pointerdown', onPointerDown);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerup', onPointerUp);
    host.removeEventListener('pointercancel', onPointerUp);
    host.removeEventListener('pointerleave', onPointerLeave);
    host.classList.remove('is-dragging');
    var geos = [], mats = [], texs = [];
    scene.traverse(function (o) {
      if (o.geometry) geos.push(o.geometry);
      if (o.material) {
        var list = Array.isArray(o.material) ? o.material : [o.material];
        list.forEach(function (m) {
          mats.push(m);
          if (m.map) texs.push(m.map);
        });
      }
    });
    geos.forEach(function (g) { g.dispose(); });
    mats.forEach(function (m) { m.dispose(); });
    texs.forEach(function (x) { x.dispose(); });
    envMap.dispose();
    renderer.dispose();
    delete window.KINETIA_BEAUTY_3D;
  }
  window.addEventListener('pagehide', dispose, { once: true });
})();
