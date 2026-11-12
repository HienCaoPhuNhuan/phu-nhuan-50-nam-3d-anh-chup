function createShowcase(viewer, stage) {
 const tau = Math.PI * 2;
 const smooth = x => x * x * (3 - 2 * x);
 const seed = n => (Math.sin(n * 12.9898 + 78.233) * 43758.5453) % 1 + 1;
 const random = n => seed(n) % 1;
 const model = document.getElementById('model-reveal');
 let elapsed = 0;
 let manualUntil = 0;
 let heading;
 let cycleOffset = -1;

 viewer.addEventListener('camera-change', event => {
  if (event.detail.source === 'user-interaction') manualUntil = performance.now() + 6500;
 });

 function line(g, points, color, width = 1) {
  g.beginPath();
  points.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y));
  g.strokeStyle = color;
  g.lineWidth = width;
  g.stroke();
 }

 function halo({g, x, y, r, u, glow, rgb}) {
  for (let k = 0; k < 4; k++) {
   const p = (u * 2.5 + k / 4) % 1;
   const radius = r * (.47 + .76 * p);
   g.beginPath();
   g.ellipse(x, y + r * .10, radius, radius * .76, -.12, 0, tau);
   g.strokeStyle = `rgba(${rgb},${glow * .46 * Math.sin(Math.PI * p)})`;
   g.lineWidth = 2 + 4 * (1 - p);
   g.stroke();
  }
 }

 function ribbon({g, x, y, r, t, glow, rgb}) {
  for (let k = 0; k < 6; k++) {
   const points = [];
   for (let i = 0; i <= 50; i++) {
    const a = i / 50 * Math.PI * 1.5 + t * .6 + k * .36;
    const radius = r * (.78 + .04 * k);
    points.push([x + Math.cos(a) * radius, y + Math.sin(a) * radius * .35 + (i / 50 - .5) * r * .85]);
   }
   line(g, points, `rgba(${rgb},${glow * (.12 + k * .04)})`, 1.5 + k * .35);
  }
 }

 function starfield({g, x, y, r, t, glow, rgb, variation}) {
  for (let i = 0; i < 43; i++) {
   const a = random(i + variation) * tau + .07 * t;
   const distance = r * (.62 + .66 * random(i * 3 + 8));
   const px = x + Math.cos(a) * distance;
   const py = y + Math.sin(a) * distance * .89;
   const pulse = Math.pow(.5 + .5 * Math.sin(t * 2.2 + i * 3.3), 3);
   const size = 1 + pulse * 3;
   g.fillStyle = `rgba(${rgb},${glow * (.12 + pulse * .63)})`;
   g.fillRect(px - size, py - .55, size * 2, 1.1);
   g.fillRect(px - .55, py - size, 1.1, size * 2);
  }
 }

 function sweep({g, x, y, r, u, glow, rgb}) {
  const edge = x + (u * 2 - 1) * r * 1.65;
  g.save();
  g.translate(edge, y);
  g.rotate(-.22);
  g.scale(.23, 1);
  const gradient = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gradient.addColorStop(0, `rgba(${rgb},${glow * .34})`);
  gradient.addColorStop(.46, `rgba(${rgb},${glow * .12})`);
  gradient.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = gradient;
  g.fillRect(-r, -r, 2 * r, 2 * r);
  g.restore();
 }

 function rays({g, x, y, r, t, glow, rgb}) {
  for (let i = 0; i < 20; i++) {
   const a = i / 20 * tau + t * .14;
   const inner = r * .70;
   const outer = r * (1.02 + .32 * (.5 + .5 * Math.sin(t * 1.8 + i)));
   const x1 = x + Math.cos(a) * inner, y1 = y + Math.sin(a) * inner;
   const x2 = x + Math.cos(a) * outer, y2 = y + Math.sin(a) * outer;
   const fade = g.createLinearGradient(x1, y1, x2, y2);
   fade.addColorStop(0, `rgba(${rgb},0)`);
   fade.addColorStop(.45, `rgba(${rgb},${glow * .51})`);
   fade.addColorStop(1, `rgba(${rgb},0)`);
   line(g, [[x1,y1],[x2,y2]], fade, 2.5);
  }
 }

 function sparks({g, x, y, r, t, glow, rgb, variation}) {
  for (let i = 0; i < 49; i++) {
   const p = (t * (.28 + .24 * random(i * 2 + 5)) + random(i + variation)) % 1;
   const side = i % 2 ? -1 : 1;
   const px = x + side * r * (.43 + .69 * p + .12 * Math.sin(i + t));
   const py = y + r * (.59 - 1.28 * p);
   line(g, [[px,py],[px - side * 8 * p,py + 11 * p]], `rgba(${rgb},${glow * Math.sin(Math.PI * p) * .72})`, 1.65);
  }
 }

 function orbit({g, x, y, r, t, glow, rgb}) {
  for (let k = 0; k < 3; k++) {
   g.beginPath();
   g.ellipse(x, y + r * .19, r * (1.02 - k * .10), r * (.34 + k * .08),
    k * .62 - .52, t * .7 + k, t * .7 + k + 3.6);
   g.strokeStyle = `rgba(${rgb},${glow * (.30 + k * .12)})`;
   g.lineWidth = 2 + k;
   g.stroke();
  }
 }

 function laurel({g, x, y, r, t, glow, rgb}) {
  for (const side of [-1, 1]) {
   for (let i = 0; i < 12; i++) {
    const a = .16 + i * .105 + .04 * Math.sin(t * 2 - i * .7);
    const px = x + side * Math.sin(a) * r * 1.13;
    const py = y + Math.cos(a) * r * .81;
    g.beginPath();
    g.ellipse(px, py, r * .057, r * .015, side * (a - .7), 0, tau);
    g.fillStyle = `rgba(${rgb},${glow * (.20 + .35 * (.5 + .5 * Math.sin(t * 2.1 - i * .67)))})`;
    g.fill();
   }
  }
 }

 const scenes = [
  { name:'halo', duration:11, rgb:'255,199,104', zoom:.085, motion:'hold', effect:halo },
  { name:'ribbon', duration:20, rgb:'106,207,255', zoom:.045, motion:'turn', effect:ribbon },
  { name:'stars', duration:10, rgb:'230,239,255', zoom:.035, motion:'rock', effect:starfield },
  { name:'sweep', duration:9, rgb:'255,223,155', zoom:.10, motion:'hold', effect:sweep },
  { name:'rays', duration:19, rgb:'255,172,75', zoom:.045, motion:'turn', effect:rays },
  { name:'sparks', duration:10, rgb:'255,134,94', zoom:.055, motion:'rock', effect:sparks },
  { name:'orbit', duration:20, rgb:'157,163,255', zoom:.05, motion:'turn', effect:orbit },
  { name:'laurel', duration:11, rgb:'255,215,124', zoom:.09, motion:'hold', effect:laurel },
 ];
 const duration = scenes.reduce((sum, scene) => sum + scene.duration, 0);

 return function tick(now, dt, g, width, height) {
  const orbitAngle = viewer.getCameraOrbit().theta;
  if (now < manualUntil) {
   heading = undefined;
   model.style.removeProperty('--show-scale');
   model.style.removeProperty('--show-lift');
   stage.style.removeProperty('--show-glow');
   return;
  }
  const round = Math.floor(elapsed / duration);
  let t = elapsed % duration;
  let scene = scenes[0];
  for (let i = 0; i < scenes.length; i++) {
   scene = scenes[(i + round) % scenes.length];
   if (t < scene.duration) break;
   t -= scene.duration;
  }
  const u = t / scene.duration;
  const envelope = Math.sin(Math.PI * u);
  const glow = Math.pow(envelope, .85);
  let angle = .36 * envelope * Math.sin(t * .65);
  if (scene.motion === 'hold') angle *= .24;
  if (scene.motion === 'turn') angle = tau * (u - .075 * Math.sin(tau * u));

  // Use the angle nearest the current view so crossing zero never snaps the cup.
  const desired = orbitAngle + angle;
  if (heading === undefined) heading = viewer.turntableRotation;
  heading += Math.atan2(Math.sin(desired - heading), Math.cos(desired - heading)) * (1 - Math.exp(-dt * 10));
  viewer.resetTurntableRotation(heading);
  elapsed += dt;

  if (cycleOffset !== round || stage.dataset.scene !== scene.name) {
   cycleOffset = round;
   stage.dataset.scene = scene.name;
   stage.style.setProperty('--show-color', scene.rgb);
  }
  model.style.setProperty('--show-scale', (1 + scene.zoom * smooth(glow)).toFixed(4));
  model.style.setProperty('--show-lift', (-height * .021 * glow).toFixed(2) + 'px');
  stage.style.setProperty('--show-glow', (.23 * glow).toFixed(3));

  g.save();
  g.globalCompositeOperation = 'screen';
  g.lineCap = 'round';
  scene.effect({g, x:width*.5, y:height*.50, r:Math.min(width*.43,height*.39), u, t, glow, rgb:scene.rgb, variation:round*17});
  g.restore();
 };
}
