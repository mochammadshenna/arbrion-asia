import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── HERO SCENE: Cable Tray Infrastructure System ────────────
// Ref: silverlinepower, legrand, oglaend, sketchfab 06b7ba70
// Key principle: each rail is a single ExtrudeGeometry swept along
// a CatmullRomCurve3 path — NO segmented boxes, NO seam lines.
export function initHeroScene(canvas, options = {}) {
  const { lowPower = false, onFirstFrame = null } = options;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPower,
    alpha: false,
    powerPreference: lowPower ? 'low-power' : 'high-performance',
  });
  const W = canvas.clientWidth || 800;
  const H = canvas.clientHeight || 600;
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(lowPower ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !lowPower;
  if (!lowPower) renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0xFCFAF7, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFCFAF7);
  scene.fog = new THREE.FogExp2(0xFCFAF7, 0.018);

  // Camera — angled overhead isometric view, cables filling frame
  const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 150);
  camera.position.set(5.5, 5.5, 6.0);
  camera.lookAt(0, 0, 0);

  // ── LIGHTING ─────────────────────────────────────────────
  // Bright overhead key — galvanized steel needs strong top light
  const keyLight = new THREE.DirectionalLight(0xFFFFFF, 3.8);
  keyLight.position.set(-3, 16, 6);
  keyLight.castShadow = !lowPower;
  keyLight.shadow.mapSize.set(2048, 2048);
  keyLight.shadow.camera.near = 1;
  keyLight.shadow.camera.far = 50;
  keyLight.shadow.camera.left = -14;
  keyLight.shadow.camera.right = 14;
  keyLight.shadow.camera.top = 14;
  keyLight.shadow.camera.bottom = -14;
  keyLight.shadow.bias = -0.0003;
  scene.add(keyLight);

  // Warm fill — front face readability
  const fillLight = new THREE.DirectionalLight(0xFFF6E8, 2.0);
  fillLight.position.set(-9, 3, 9);
  scene.add(fillLight);

  // Cool rim — separates rails from background, defines edges
  const rimLight = new THREE.DirectionalLight(0xD0E4F8, 1.6);
  rimLight.position.set(12, 5, -12);
  scene.add(rimLight);

  // Soft ambient — vellum bg, no harsh darks
  scene.add(new THREE.AmbientLight(0xEEF2F6, 2.2));

  // ── MATERIALS ────────────────────────────────────────────
  // Galvanized steel: light silver-grey, high metalness
  const railMat = new THREE.MeshStandardMaterial({
    color: 0x9AAAB8,
    metalness: 0.78,
    roughness: 0.28,
  });
  // Pan (bottom) — slightly darker, less reflective
  const panMat = new THREE.MeshStandardMaterial({
    color: 0x7A8E9E,
    metalness: 0.65,
    roughness: 0.42,
  });
  // Perforation holes — very dark inset to simulate punched holes
  const holeMat = new THREE.MeshStandardMaterial({
    color: 0x1A2530,
    metalness: 0.0,
    roughness: 0.95,
  });
  // Cabinet body — medium grey, industrial
  const cabinetMat = new THREE.MeshStandardMaterial({
    color: 0x6E7E8C,
    metalness: 0.45,
    roughness: 0.62,
  });
  const cabinetDarkMat = new THREE.MeshStandardMaterial({
    color: 0x3C4C5A,
    metalness: 0.40,
    roughness: 0.72,
  });
  // Hanger strap — flat steel, slightly lighter
  const hangerMat = new THREE.MeshStandardMaterial({
    color: 0xA8B8C4,
    metalness: 0.82,
    roughness: 0.24,
  });

  // Cable palette — dense multi-colour bundle (Sketchfab ref)
  const CABLE_COLS = [
    0xEFBF10, 0xEFBF10, 0xEFBF10, // yellow dominant
    0x38B832, 0x38B832,            // green
    0xD03018,                      // red
    0xE87818,                      // orange
    0x2860D8,                      // blue
    0xE8E8E8,                      // white
    0x202020,                      // black
    0xEFBF10, 0x38B832,            // repeat
  ];
  const cableMats = CABLE_COLS.map(c =>
    new THREE.MeshStandardMaterial({ color: c, roughness: 0.82, metalness: 0.0 })
  );

  // ── CORE DIMENSIONS ──────────────────────────────────────
  const TW   = 0.300;  // tray outer width
  const TH   = 0.075;  // rail height (C-profile side wall)
  const WALL = 0.010;  // sheet metal thickness
  const LIP  = 0.018;  // inward return lip width (Type C)

  // ── C-PROFILE CROSS-SECTION SHAPE ────────────────────────
  // Viewed end-on (X-Y plane). Bottom pan + two side walls + inward lips.
  // Origin at center of bottom pan outer face.
  //
  //  lip←  wall  →lip
  //  ┌──┐         ┌──┐
  //  │  │         │  │  ← TH tall side walls
  //  │  └─────────┘  │
  //  └───────────────┘  ← WALL thick bottom pan
  //
  function makeCProfileShape(w = TW, h = TH) {
    const s = new THREE.Shape();
    const hw = w / 2;
    // Start bottom-left outer corner, go clockwise
    s.moveTo(-hw, 0);
    s.lineTo( hw, 0);           // bottom pan outer bottom edge
    s.lineTo( hw, WALL);        // up inside right wall
    s.lineTo( hw - WALL, WALL); // left to inner right wall
    s.lineTo( hw - WALL, h - WALL);    // up right inner wall
    s.lineTo( hw - WALL - LIP, h - WALL); // inward right lip
    s.lineTo( hw - WALL - LIP, h);     // lip top right
    s.lineTo(-hw + WALL + LIP, h);     // across top between lips
    s.lineTo(-hw + WALL + LIP, h - WALL); // lip top left
    s.lineTo(-hw + WALL, h - WALL);    // to left inner wall
    s.lineTo(-hw + WALL, WALL);        // down left inner wall
    s.lineTo(-hw, WALL);               // across bottom
    s.lineTo(-hw, 0);                  // back to start
    return s;
  }

  // ── EXTRUDE A STRAIGHT RUN ALONG Z ───────────────────────
  // Returns a single seamless Mesh — no box segments, no seam lines.
  function makeRailStraight(len, w = TW, h = TH) {
    const shape = makeCProfileShape(w, h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: len,
      bevelEnabled: false,
    });
    // ExtrudeGeometry extrudes along +Z; shift so length is centred
    geo.translate(0, -h / 2, -len / 2);
    const mesh = new THREE.Mesh(geo, railMat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // ── EXTRUDE A 90° BEND ALONG A QUARTER-CIRCLE PATH ───────
  // dir +1 = turns right (+X), -1 = turns left (-X)
  // Comes in along +Z, exits along dir*X.
  // Uses ExtrudeGeometry with FrenetFrames path — single mesh, zero seams.
  function makeRailBend(R = 0.55, dir = 1, w = TW, h = TH) {
    // Build quarter-circle path in XZ plane
    // Sufficient curve points for smooth extrusion (48 divisions)
    const DIVS = 48;
    const pts = [];
    for (let i = 0; i <= DIVS; i++) {
      const a = (i / DIVS) * Math.PI / 2; // 0 → π/2
      // Centre of bend arc at (dir*R, 0, 0)
      pts.push(new THREE.Vector3(
        dir * R * (1 - Math.cos(a)),
        0,
        -R * Math.sin(a)
      ));
    }
    const path = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);

    const shape = makeCProfileShape(w, h);
    const geo = new THREE.ExtrudeGeometry(shape, {
      extrudePath: path,
      steps: DIVS,
      bevelEnabled: false,
    });
    const mesh = new THREE.Mesh(geo, railMat);
    // Offset shape so tray centre is at Y=0 (shape drawn from Y=0..TH, shift down TH/2)
    mesh.position.y = -h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // ── PERFORATED PAN ────────────────────────────────────────
  // Flat pan with dark inset quads simulating stamped holes — no Z-fighting.
  function makePan(len, w = TW, h = TH) {
    const g = new THREE.Group();
    const panW = w - WALL * 2;
    const panBase = new THREE.Mesh(
      new THREE.BoxGeometry(panW, WALL, len),
      panMat
    );
    panBase.position.y = -h / 2 + WALL / 2;
    panBase.castShadow = true;
    panBase.receiveShadow = true;
    g.add(panBase);

    // Perforation rows — 2 columns, evenly spaced along length
    const holeW = panW * 0.28;
    const holeD = 0.032;
    const cols = 2;
    const colXs = [-panW * 0.22, panW * 0.22];
    const rows = Math.max(2, Math.round(len / 0.072));
    const rowStep = len / rows;
    for (let r = 0; r < rows; r++) {
      const zPos = -len / 2 + rowStep * 0.5 + r * rowStep;
      for (let c = 0; c < cols; c++) {
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(holeW, WALL * 0.6, holeD),
          holeMat
        );
        hole.position.set(colXs[c], -h / 2 + WALL * 1.2, zPos);
        g.add(hole);
      }
    }
    return g;
  }

  // ── ASSEMBLE ONE TRAY RUN (straight) ─────────────────────
  function makeTray(len, w = TW, h = TH) {
    const g = new THREE.Group();
    g.add(makeRailStraight(len, w, h));
    g.add(makePan(len, w, h));
    return g;
  }

  // ── ASSEMBLE ONE 90° BEND UNIT ────────────────────────────
  // Returns group with seamless bent rail + matching pan arc.
  function makeBend(R = 0.55, dir = 1, w = TW, h = TH) {
    const g = new THREE.Group();
    g.add(makeRailBend(R, dir, w, h));

    // Pan along the arc — extruded flat rectangle along same path
    const DIVS = 48;
    const pts = [];
    for (let i = 0; i <= DIVS; i++) {
      const a = (i / DIVS) * Math.PI / 2;
      pts.push(new THREE.Vector3(
        dir * R * (1 - Math.cos(a)),
        -h / 2 + WALL / 2,  // at pan height
        -R * Math.sin(a)
      ));
    }
    const panPath = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.0);
    const panShape = new THREE.Shape();
    const panW = w - WALL * 2;
    panShape.moveTo(-panW / 2, 0);
    panShape.lineTo( panW / 2, 0);
    panShape.lineTo( panW / 2, WALL);
    panShape.lineTo(-panW / 2, WALL);
    panShape.lineTo(-panW / 2, 0);
    const panGeo = new THREE.ExtrudeGeometry(panShape, {
      extrudePath: panPath,
      steps: DIVS,
      bevelEnabled: false,
    });
    const panMesh = new THREE.Mesh(panGeo, panMat);
    panMesh.castShadow = true;
    panMesh.receiveShadow = true;
    g.add(panMesh);

    return g;
  }

  // ── CABLE BUNDLE (straight, along Z) ─────────────────────
  function makeCables(len, count = 10) {
    const g = new THREE.Group();
    const usableW = TW - WALL * 2 - 0.02;
    const spacing = usableW / count;
    for (let i = 0; i < count; i++) {
      const r = 0.013;
      const cab = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, len, 6),
        cableMats[i % cableMats.length]
      );
      cab.rotation.x = Math.PI / 2;
      cab.position.set(
        -usableW / 2 + spacing * 0.5 + i * spacing,
        -TH / 2 + WALL + r + 0.002,
        0
      );
      cab.castShadow = !lowPower;
      g.add(cab);
    }
    return g;
  }

  // ── CABLE BUNDLE along bend path ─────────────────────────
  function makeCablesBend(R = 0.55, dir = 1, count = 10) {
    const g = new THREE.Group();
    const usableW = TW - WALL * 2 - 0.02;
    const spacing = usableW / count;
    const DIVS = 32;
    for (let i = 0; i < count; i++) {
      const xOff = -usableW / 2 + spacing * 0.5 + i * spacing;
      const pts = [];
      // Cable radius offset from arc centre: R ± xOff (perpendicular in XZ plane)
      for (let s = 0; s <= DIVS; s++) {
        const a = (s / DIVS) * Math.PI / 2;
        const rCab = R + dir * xOff; // adjust for cable lateral position
        pts.push(new THREE.Vector3(
          dir * R * (1 - Math.cos(a)),
          -TH / 2 + WALL + 0.013 + 0.002,
          -R * Math.sin(a)
        ));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      const tubeGeo = new THREE.TubeGeometry(curve, DIVS, 0.013, 6, false);
      const tube = new THREE.Mesh(tubeGeo, cableMats[i % cableMats.length]);
      tube.castShadow = !lowPower;
      // Translate each cable laterally along the arc width
      tube.position.x = dir * xOff * 0;
      g.add(tube);
    }
    return g;
  }

  // ── HANGER STRAP (flat steel, bolted to structure above) ──
  function makeHanger(dropH = 2.4) {
    const g = new THREE.Group();
    // Flat strap — 20mm wide, 3mm thick
    const strap = new THREE.Mesh(
      new THREE.BoxGeometry(0.020, dropH, 0.003),
      hangerMat
    );
    strap.position.y = dropH / 2;
    strap.castShadow = true;
    g.add(strap);
    // Tray clamp at bottom — wider flat piece
    const clamp = new THREE.Mesh(
      new THREE.BoxGeometry(TW + 0.04, 0.012, 0.020),
      hangerMat
    );
    clamp.position.y = 0;
    g.add(clamp);
    // Ceiling plate at top
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.008, 0.06),
      hangerMat
    );
    plate.position.y = dropH;
    g.add(plate);
    return g;
  }

  // ── ELECTRICAL CABINET ────────────────────────────────────
  function makeCabinet(w = 0.30, h = 0.64, d = 0.20) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cabinetMat);
    body.castShadow = true; body.receiveShadow = true;
    g.add(body);
    // Base plinth
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.04, d + 0.04), cabinetDarkMat);
    plinth.position.y = -h / 2 - 0.02;
    plinth.castShadow = true;
    g.add(plinth);
    // Recessed door panel
    const door = new THREE.Mesh(new THREE.BoxGeometry(w * 0.86, h * 0.86, 0.007), cabinetDarkMat);
    door.position.set(0, 0, d / 2 + 0.003);
    g.add(door);
    // Identification strip
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.65, 0.038, 0.008),
      new THREE.MeshStandardMaterial({ color: 0xEEC010, roughness: 0.75 })
    );
    strip.position.set(0, h * 0.28, d / 2 + 0.004);
    g.add(strip);
    return g;
  }

  // ── ASSEMBLE SYSTEM ───────────────────────────────────────
  const sys = new THREE.Group();
  scene.add(sys);

  //
  // Layout (top-down, Y=0):
  //
  //   CAB                    MAIN RUN (along X)                 CAB
  //   ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●
  //              ╔═══╗                       ╔═══╗
  //              ║   ║ bend left             ║   ║ bend right
  //              ╚═══╝                       ╚═══╝
  //              ┃ lArm (Z-)                 ┃ rArm (Z-)
  //              ┃                           ┃
  //   ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━●
  //                    CROSS RUN (along X)
  //   CAB                                                     CAB
  //

  const R = 0.55;      // bend radius — generous for smooth look
  const MAIN_LEN = 9.6;
  const ARM_LEN  = 4.0;
  const CROSS_LEN = 5.6;

  // MAIN RUN — rotated 90° so it runs along X
  const mainTray = makeTray(MAIN_LEN);
  mainTray.rotation.y = Math.PI / 2;
  sys.add(mainTray);
  const mainCables = makeCables(MAIN_LEN);
  mainCables.rotation.y = Math.PI / 2;
  sys.add(mainCables);

  // LEFT BEND — comes from main run at x=-2.4, turns toward -Z
  // Bend origin: main run position where the branch starts
  const BX_L = -2.4;  // x position on main run
  const lBend = makeBend(R, -1);
  lBend.position.set(BX_L, 0, 0);
  sys.add(lBend);

  // LEFT ARM — starts at end of left bend
  const lArm = makeTray(ARM_LEN);
  lArm.position.set(BX_L - R, 0, -ARM_LEN / 2 - R);
  sys.add(lArm);
  const lCables = makeCables(ARM_LEN);
  lCables.position.set(BX_L - R, 0, -ARM_LEN / 2 - R);
  sys.add(lCables);

  // RIGHT BEND — at x=+2.4, turns toward -Z
  const BX_R = 2.4;
  const rBend = makeBend(R, 1);
  rBend.position.set(BX_R, 0, 0);
  sys.add(rBend);

  // RIGHT ARM
  const rArm = makeTray(ARM_LEN);
  rArm.position.set(BX_R + R, 0, -ARM_LEN / 2 - R);
  sys.add(rArm);
  const rCables = makeCables(ARM_LEN);
  rCables.position.set(BX_R + R, 0, -ARM_LEN / 2 - R);
  sys.add(rCables);

  // CROSS RUN — connects bottom of both arms
  const crossZ = -ARM_LEN - R;
  const crossX = (BX_L - R + BX_R + R) / 2;
  const crossTray = makeTray(CROSS_LEN);
  crossTray.rotation.y = Math.PI / 2;
  crossTray.position.set(crossX, 0, crossZ);
  sys.add(crossTray);
  const crossCables = makeCables(CROSS_LEN);
  crossCables.rotation.y = Math.PI / 2;
  crossCables.position.set(crossX, 0, crossZ);
  sys.add(crossCables);

  // ── HANGERS ───────────────────────────────────────────────
  const dropH = 2.2;
  const hangerY = TH / 2;
  [
    { x: -3.8, z: 0 }, { x: -1.2, z: 0 }, { x: 1.2, z: 0 }, { x: 3.8, z: 0 },
    { x: BX_L - R, z: -1.4 }, { x: BX_L - R, z: -3.0 },
    { x: BX_R + R, z: -1.4 }, { x: BX_R + R, z: -3.0 },
    { x: crossX - 1.8, z: crossZ }, { x: crossX + 1.8, z: crossZ },
  ].forEach(({ x, z }) => {
    const hng = makeHanger(dropH);
    hng.position.set(x, hangerY, z);
    sys.add(hng);
  });

  // ── CABINETS ──────────────────────────────────────────────
  [
    { x: -MAIN_LEN / 2 - 0.16, z: 0, ry: Math.PI / 2 },
    { x:  MAIN_LEN / 2 + 0.16, z: 0, ry: -Math.PI / 2 },
    { x: BX_L - R,   z: crossZ - 0.16, ry: 0 },
    { x: BX_R + R,   z: crossZ - 0.16, ry: 0 },
  ].forEach(({ x, z, ry }) => {
    const cab = makeCabinet();
    cab.position.set(x, 0, z);
    cab.rotation.y = ry;
    sys.add(cab);
  });

  // ── FLOOR SHADOW ──────────────────────────────────────────
  if (!lowPower) {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(40, 40),
      new THREE.ShadowMaterial({ opacity: 0.07 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);
  }

  // Centre and frame the system
  sys.position.set(-0.4, -0.15, 0.8);

  // ── RENDER LOOP ───────────────────────────────────────────
  const clock = new THREE.Clock();
  let elapsed = 0;
  let firstFrameFired = false;

  const loop = () => {
    requestAnimationFrame(loop);
    elapsed += clock.getDelta();
    // Gentle slow rotation — no bounce, just steady drift
    sys.rotation.y = Math.sin(elapsed * 0.08) * 0.14;
    renderer.render(scene, camera);
    if (!firstFrameFired) {
      firstFrameFired = true;
      if (onFirstFrame) onFirstFrame();
    }
  };
  loop();

  // ── RESIZE ───────────────────────────────────────────────
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  });
  ro.observe(canvas);
}
// ─── PRODUCT VIEWER SCENE ────────────────────────────────────
export function initProductScene(canvas) {
  const W = canvas.clientWidth || 600;
  const H = canvas.clientHeight || 450;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0xFCFAF7, 1);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xFCFAF7);

  // No fog — product viewer needs clean visibility

  const camera = new THREE.PerspectiveCamera(40, W / H, 0.01, 100);
  camera.position.set(0, 0.5, 2.0);
  camera.lookAt(0, -0.05, 0);

  // OrbitControls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.2;
  controls.minDistance = 0.8;
  controls.maxDistance = 4;
  controls.maxPolarAngle = Math.PI / 1.85;
  controls.enablePan = false;
  controls.target.set(0, -0.05, 0);

  // Lighting — bright industrial studio, makes silver pop on dark bg
  scene.add(new THREE.AmbientLight(0xFFFFFF, 2.5));

  const key = new THREE.DirectionalLight(0xFFFFFF, 5.0);
  key.position.set(3, 5, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 20;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xC0D4EC, 2.5);
  fill.position.set(-4, 2, 2);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xD8E8F8, 3.0);
  rim.position.set(0, 1, -5);
  scene.add(rim);

  // Shadow plane
  const shadowFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.ShadowMaterial({ opacity: 0.08 })
  );
  shadowFloor.rotation.x = -Math.PI / 2;
  shadowFloor.position.y = -0.55;
  shadowFloor.receiveShadow = true;
  scene.add(shadowFloor);

  // Blueprint grid
  const grid = new THREE.GridHelper(8, 20, 0x99AABB, 0xBBCCD4);
  grid.material.opacity = 0.25;
  grid.material.transparent = true;
  grid.position.y = -0.54;
  scene.add(grid);

  // Materials — bright galvanized silver
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xD0D8DE,
    metalness: 0.75,
    roughness: 0.30,
  });
  const steelDarkMat = new THREE.MeshStandardMaterial({
    color: 0xA8B8C4,
    metalness: 0.70,
    roughness: 0.45,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xC0CCD4,
    metalness: 0.85,
    roughness: 0.20,
  });
  // Hole mat — matches background so cylinders look like real punched holes
  const holeMat = new THREE.MeshBasicMaterial({ color: 0xFCFAF7 });

  // ── PRODUCT BUILDERS ──────────────────────────────────────

  const thick = 0.009;

  function buildTypeC(width = 0.3, height = 0.08, length = 2.4) {
    const g = new THREE.Group();
    // Left rail
    const railGeo = new THREE.BoxGeometry(thick, height, length);
    const l = new THREE.Mesh(railGeo, steelMat);
    l.position.x = -width / 2;
    l.castShadow = true; l.receiveShadow = true;
    g.add(l);
    // Right rail
    const r = new THREE.Mesh(railGeo, steelMat);
    r.position.x = width / 2;
    r.castShadow = true; r.receiveShadow = true;
    g.add(r);
    // Bottom pan
    const panGeo = new THREE.BoxGeometry(width, thick, length);
    const pan = new THREE.Mesh(panGeo, steelDarkMat);
    pan.position.y = -height / 2;
    pan.castShadow = true; pan.receiveShadow = true;
    g.add(pan);
    // Top lips
    const lipGeo = new THREE.BoxGeometry(0.022, thick, length);
    ['left','right'].forEach((side, i) => {
      const lip = new THREE.Mesh(lipGeo, steelMat);
      lip.position.set((i === 0 ? -1 : 1) * (width / 2 - 0.011), height / 2, 0);
      lip.castShadow = true;
      g.add(lip);
    });

    // Pan slot holes — thin box cuts through pan thickness
    const colXs = [-width * 0.20, width * 0.20];
    const slotSpacing = 0.090;
    const slotCount = Math.floor((length - 0.10) / slotSpacing);
    for (let i = 0; i < slotCount; i++) {
      const z = -length / 2 + 0.07 + i * slotSpacing;
      colXs.forEach(cx => {
        const slot = new THREE.Mesh(
          new THREE.BoxGeometry(0.008, thick * 3, 0.022),
          holeMat
        );
        slot.position.set(cx, -height / 2, z);
        g.add(slot);
      });
    }

    // Wall holes — thin box cuts through rail thickness
    const holeSpacing = 0.120;
    const holeCount = Math.floor((length - 0.10) / holeSpacing);
    [-width / 2, width / 2].forEach(xWall => {
      for (let i = 0; i < holeCount; i++) {
        const z = -length / 2 + 0.08 + i * holeSpacing;
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(thick * 4, 0.010, 0.010),
          holeMat
        );
        hole.position.set(xWall, 0, z);
        g.add(hole);
      }
    });

    return g;
  }

  function buildTypeU(width = 0.3, height = 0.1, length = 2.4) {
    const g = new THREE.Group();
    // Solid bottom + tall sides (U profile — no lip)
    const leftGeo = new THREE.BoxGeometry(thick, height, length);
    const l = new THREE.Mesh(leftGeo, steelMat);
    l.position.x = -width / 2;
    l.castShadow = true; l.receiveShadow = true;
    g.add(l);
    const r = new THREE.Mesh(leftGeo, steelMat);
    r.position.x = width / 2;
    r.castShadow = true; r.receiveShadow = true;
    g.add(r);
    // Solid pan
    const pan = new THREE.Mesh(new THREE.BoxGeometry(width, thick, length), steelMat);
    pan.position.y = -height / 2;
    pan.castShadow = true; pan.receiveShadow = true;
    g.add(pan);

    // Pan slot holes — thin box cuts through pan thickness
    const colXs = [-width * 0.20, width * 0.20];
    const slotSpacing = 0.090;
    const slotCount = Math.floor((length - 0.10) / slotSpacing);
    for (let i = 0; i < slotCount; i++) {
      const z = -length / 2 + 0.07 + i * slotSpacing;
      colXs.forEach(cx => {
        const slot = new THREE.Mesh(
          new THREE.BoxGeometry(0.008, thick * 3, 0.022),
          holeMat
        );
        slot.position.set(cx, -height / 2, z);
        g.add(slot);
      });
    }

    // Wall holes — thin box cuts through wall thickness
    const holeSpacing = 0.120;
    const holeCount = Math.floor((length - 0.10) / holeSpacing);
    [-width / 2, width / 2].forEach(xWall => {
      for (let i = 0; i < holeCount; i++) {
        const z = -length / 2 + 0.08 + i * holeSpacing;
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(thick * 4, 0.010, 0.010),
          holeMat
        );
        hole.position.set(xWall, 0, z);
        g.add(hole);
      }
    });

    return g;
  }

  function buildTypeW(width = 0.5, height = 0.08, length = 2.4) {
    const g = new THREE.Group();
    // Wide flange — extra width, center divider
    const railGeo = new THREE.BoxGeometry(thick, height, length);
    const l = new THREE.Mesh(railGeo, steelMat);
    l.position.x = -width / 2;
    l.castShadow = true; l.receiveShadow = true;
    g.add(l);
    const r = new THREE.Mesh(railGeo, steelMat);
    r.position.x = width / 2;
    r.castShadow = true; r.receiveShadow = true;
    g.add(r);
    // Pan
    const pan = new THREE.Mesh(new THREE.BoxGeometry(width, thick, length), steelDarkMat);
    pan.position.y = -height / 2;
    pan.castShadow = true;
    g.add(pan);
    // Center divider (Type W characteristic)
    const div = new THREE.Mesh(new THREE.BoxGeometry(thick, height * 0.6, length), steelDarkMat);
    div.position.y = -height * 0.2;
    g.add(div);

    // Pan slot holes — thin box cuts, 4 columns
    const colXs = [-width * 0.35, -width * 0.12, width * 0.12, width * 0.35];
    const slotSpacing = 0.090;
    const slotCount = Math.floor((length - 0.10) / slotSpacing);
    for (let i = 0; i < slotCount; i++) {
      const z = -length / 2 + 0.07 + i * slotSpacing;
      colXs.forEach(cx => {
        const slot = new THREE.Mesh(
          new THREE.BoxGeometry(0.008, thick * 3, 0.022),
          holeMat
        );
        slot.position.set(cx, -height / 2, z);
        g.add(slot);
      });
    }

    // Wall holes — thin box cuts
    const holeSpacing = 0.120;
    const holeCount = Math.floor((length - 0.10) / holeSpacing);
    [-width / 2, width / 2].forEach(xWall => {
      for (let i = 0; i < holeCount; i++) {
        const z = -length / 2 + 0.08 + i * holeSpacing;
        const hole = new THREE.Mesh(
          new THREE.BoxGeometry(thick * 4, 0.010, 0.010),
          holeMat
        );
        hole.position.set(xWall, 0, z);
        g.add(hole);
      }
    });

    return g;
  }

  function buildHeavyDuty(width = 0.3, height = 0.12, length = 2.4) {
    const g = buildTypeC(width, height, length);
    // Additional external stiffener on rails — flush against outer face of rail
    [-1, 1].forEach(side => {
      const stiffW = 0.018;
      const stiffGeo = new THREE.BoxGeometry(stiffW, height * 0.7, length);
      const stiff = new THREE.Mesh(stiffGeo, steelMat);
      stiff.position.set(side * (width / 2 + thick / 2 + stiffW / 2), -height * 0.15, 0);
      stiff.castShadow = true;
      g.add(stiff);
    });
    return g;
  }

  function buildCableLadder(width = 0.3, height = 0.065, length = 2.4) {
    const g = new THREE.Group();
    const rungThick = thick * 1.5;

    // Side rails (solid, no lip — ladder profile)
    const railGeo = new THREE.BoxGeometry(rungThick * 2, height, length);
    const l = new THREE.Mesh(railGeo, steelMat);
    l.position.x = -width / 2;
    l.castShadow = true; l.receiveShadow = true;
    g.add(l);
    const r = new THREE.Mesh(railGeo, steelMat);
    r.position.x = width / 2;
    r.castShadow = true; r.receiveShadow = true;
    g.add(r);

    // Rungs with holes — evenly spaced, characteristic ladder look
    const rungSpacing = 0.2; // 200mm standard
    const rungCount = Math.floor(length / rungSpacing) - 1;
    const rungW = width - rungThick * 4;
    const rungH = height * 0.55;
    const rungD = rungThick * 2.5;

    // Build rung shape with 3 rectangular holes using ExtrudeGeometry
    // Shape drawn in X-Z plane (width x depth), then extruded in Y (height)
    const holeW = rungW * 0.22;
    const holeD = rungD * 0.55;
    const holeOffX = rungW * 0.28;

    function makeRungGeo() {
      const shape = new THREE.Shape();
      shape.moveTo(-rungW / 2, -rungD / 2);
      shape.lineTo( rungW / 2, -rungD / 2);
      shape.lineTo( rungW / 2,  rungD / 2);
      shape.lineTo(-rungW / 2,  rungD / 2);
      shape.closePath();

      // Left hole
      const holeL = new THREE.Path();
      holeL.moveTo(-holeOffX - holeW / 2, -holeD / 2);
      holeL.lineTo(-holeOffX + holeW / 2, -holeD / 2);
      holeL.lineTo(-holeOffX + holeW / 2,  holeD / 2);
      holeL.lineTo(-holeOffX - holeW / 2,  holeD / 2);
      holeL.closePath();
      shape.holes.push(holeL);

      // Center hole
      const holeC = new THREE.Path();
      holeC.moveTo(-holeW / 2, -holeD / 2);
      holeC.lineTo( holeW / 2, -holeD / 2);
      holeC.lineTo( holeW / 2,  holeD / 2);
      holeC.lineTo(-holeW / 2,  holeD / 2);
      holeC.closePath();
      shape.holes.push(holeC);

      // Right hole
      const holeR = new THREE.Path();
      holeR.moveTo( holeOffX - holeW / 2, -holeD / 2);
      holeR.lineTo( holeOffX + holeW / 2, -holeD / 2);
      holeR.lineTo( holeOffX + holeW / 2,  holeD / 2);
      holeR.lineTo( holeOffX - holeW / 2,  holeD / 2);
      holeR.closePath();
      shape.holes.push(holeR);

      return new THREE.ExtrudeGeometry(shape, {
        depth: rungH,
        bevelEnabled: false
      });
    }

    const rungGeo = makeRungGeo();

    for (let i = 0; i < rungCount; i++) {
      const rung = new THREE.Mesh(rungGeo, steelDarkMat);
      // ExtrudeGeometry extrudes in Z; rotate so extrusion goes in Y
      rung.rotation.x = -Math.PI / 2;
      rung.position.set(0, -rungH / 2, -length / 2 + rungSpacing + i * rungSpacing);
      rung.castShadow = true;
      g.add(rung);
    }
    return g;
  }

  function buildCover(width = 0.3, length = 2.4) {
    const g = new THREE.Group();
    const plateThick = 0.008; // thin flat plate
    const lipH = 0.022;       // small downward lip on each side
    const lipThick = thick;

    // Main flat top plate — solid, no holes
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(width, plateThick, length),
      steelMat
    );
    plate.castShadow = true;
    plate.receiveShadow = true;
    g.add(plate);

    // Left downward lip
    const leftLip = new THREE.Mesh(
      new THREE.BoxGeometry(lipThick, lipH, length),
      steelMat
    );
    leftLip.position.set(-width / 2 + lipThick / 2, -plateThick / 2 - lipH / 2, 0);
    leftLip.castShadow = true;
    g.add(leftLip);

    // Right downward lip
    const rightLip = new THREE.Mesh(
      new THREE.BoxGeometry(lipThick, lipH, length),
      steelMat
    );
    rightLip.position.set(width / 2 - lipThick / 2, -plateThick / 2 - lipH / 2, 0);
    rightLip.castShadow = true;
    g.add(rightLip);

    return g;
  }


  // ── SCENE STATE ──────────────────────────────────────────
  let currentModel = null;

  const productBuilders = {
    'type-c':     () => buildTypeC(),
    'type-u':     () => buildTypeU(),
    'type-w':     () => buildTypeW(),
    'heavy-duty': () => buildHeavyDuty(),
    'cable-ladder': () => buildCableLadder(),
    'cover':      () => buildCover(),
  };

  function loadProduct(type) {
    if (currentModel) {
      // Fade out old model
      const oldModel = currentModel;
      let elapsed = 0;
      const fadeOut = () => {
        elapsed += 16;
        const t = Math.min(elapsed / 280, 1);
        oldModel.traverse(c => {
          if (c.isMesh && c.material) c.material.opacity = 1 - t;
        });
        if (t < 1) requestAnimationFrame(fadeOut);
        else scene.remove(oldModel);
      };
      oldModel.traverse(c => {
        if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; }
      });
      requestAnimationFrame(fadeOut);
    }

    const builder = productBuilders[type] || productBuilders['type-c'];
    const model = builder();
    // Rotate to good default view
    model.rotation.y = 0.4;
    model.rotation.x = 0.08;

    // Seat model on floor: shift down so bounding box bottom = floor y
    const bbox = new THREE.Box3().setFromObject(model);
    const floorY = -0.54;
    model.position.y = floorY - bbox.min.y;

    // Fade in
    model.traverse(c => {
      if (c.isMesh) { c.material = c.material.clone(); c.material.transparent = true; c.material.opacity = 0; }
    });
    scene.add(model);
    currentModel = model;

    let elapsed = 0;
    const fadeIn = () => {
      elapsed += 16;
      const t = Math.min(elapsed / 500, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      model.traverse(c => {
        if (c.isMesh && c.material) c.material.opacity = eased;
      });
      if (t < 1) requestAnimationFrame(fadeIn);
    };
    requestAnimationFrame(fadeIn);
  }

  // Load default
  loadProduct('type-c');

  // Render loop
  const clock = new THREE.Clock();
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  // Resize
  const ro = new ResizeObserver(() => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
  ro.observe(canvas);

  return { loadProduct };
}
