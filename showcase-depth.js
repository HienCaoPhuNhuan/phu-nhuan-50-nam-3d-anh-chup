import {
 AdditiveBlending, BufferAttribute, BufferGeometry, DoubleSide, Group,
 Mesh, ShaderMaterial, Vector3,
} from './assets/three.core.r174.min.js';

const steps = 96;
const tau = Math.PI * 2;
const vertex = `
 varying vec2 ribbonUV;
 void main() {
  ribbonUV = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
 }
`;
const fragment = `
 uniform vec3 tint;
 uniform float strength;
 uniform float diffuseHalo;
 varying vec2 ribbonUV;
 void main() {
  float distanceFromCenter = abs(ribbonUV.y * 2.0 - 1.0);
  float core = exp(-distanceFromCenter * distanceFromCenter * 23.0);
  float softEdge = 1.0 - smoothstep(0.04, 1.0, distanceFromCenter);
  float ends = smoothstep(0.0, 0.15, ribbonUV.x) * (1.0 - smoothstep(0.79, 1.0, ribbonUV.x));
  // The golden halo fades to zero with a flat slope at both mesh edges.
  float diffuse = pow(max(0.0, 1.0 - distanceFromCenter * distanceFromCenter), 3.0);
  float haloEnds = smoothstep(0.0, 0.26, ribbonUV.x) * (1.0 - smoothstep(0.70, 1.0, ribbonUV.x));
  float variation = 0.72 + 0.28 * sin(ribbonUV.x * 11.0 + 0.8);
  float alpha = mix(ends * (0.67 * core + 0.33 * softEdge),
   diffuse * haloEnds * variation, diffuseHalo);
  gl_FragColor = vec4(tint, strength * alpha);
 }
`;

function createStrip() {
 const positions = new Float32Array((steps + 1) * 6);
 const uv = [];
 const indices = [];
 for (let i = 0; i <= steps; i++) {
  uv.push(i / steps, 0, i / steps, 1);
  if (i < steps) {
   const a = i * 2;
   indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
 }
 const geometry = new BufferGeometry();
 geometry.setAttribute('position', new BufferAttribute(positions, 3));
 geometry.setAttribute('uv', new BufferAttribute(new Float32Array(uv), 2));
 geometry.setIndex(indices);
 const material = new ShaderMaterial({
  vertexShader: vertex, fragmentShader: fragment,
  uniforms: {
   tint: { value: new Vector3() },
   strength: { value: 0 },
   diffuseHalo: { value: 0 },
  },
  side: DoubleSide, transparent: true, depthTest: true, depthWrite: false,
  blending: AdditiveBlending, toneMapped: false,
 });
 material.forceSinglePass = true;
 const mesh = new Mesh(geometry, material);
 mesh.frustumCulled = false;
 mesh.renderOrder = 9;
 return mesh;
}

function updateStrip(strip, { angle, arc, radius, height, rise, pitch, roll, width, strength }, tint) {
 const positions = strip.geometry.attributes.position;
 const cosPitch = Math.cos(pitch), sinPitch = Math.sin(pitch);
 const cosRoll = Math.cos(roll), sinRoll = Math.sin(roll);
 for (let i = 0; i <= steps; i++) {
  const u = i / steps;
  const a = angle + arc * u;
  for (let edge = 0; edge < 2; edge++) {
   const outer = radius + (edge - .5) * width;
   const x = Math.cos(a) * outer;
   const y = (u - .5) * rise;
   const z = Math.sin(a) * outer;
   const tiltedY = y * cosPitch - z * sinPitch;
   positions.setXYZ(i * 2 + edge, x * cosRoll - tiltedY * sinRoll,
    height + x * sinRoll + tiltedY * cosRoll, y * sinPitch + z * cosPitch);
  }
 }
 positions.needsUpdate = true;
 strip.material.uniforms.tint.value.copy(tint);
 strip.material.uniforms.strength.value = strength;
}

export function createDepthRibbons(viewer) {
 const group = new Group();
 group.name = 'Trophy light trails in 3D';
 group.visible = false;
 const strips = Array.from({ length: 4 }, createStrip);
 group.add(...strips);

 let renderer, scene, camera, target;
 const center = viewer.getBoundingBoxCenter();
 const size = viewer.getDimensions();
 const tint = new Vector3();
 // This hook keeps the trophy and light trails in the same WebGL render pass.
 viewer.registerEffectComposer({
  setRenderer(value) { renderer = value; },
  setMainCamera(value) { camera = value; },
  setMainScene(value) {
   scene = value;
   target = scene.getObjectByName('Target');
   scene.add(group);
  },
  setSize() {},
  beforeRender() {},
  render() {
   renderer.autoClear = true;
   renderer.toneMapping = scene.toneMapping;
   renderer.render(scene, camera);
  },
 });

 return function update(name, t, u, glow, rgb) {
  const wasVisible = group.visible;
  group.visible = name === 'halo' || name === 'ribbon' || name === 'orbit';
  if (group.visible || wasVisible) scene.queueRender();
  if (!group.visible) return;
  group.position.set(center.x, center.y, center.z);
  target?.localToWorld(group.position);
  const [red, green, blue] = rgb.split(',').map(Number);
  tint.set(red / 255, green / 255, blue / 255);
  const isHalo = name === 'halo';
  strips.forEach((strip, i) => {
   let angle = t * .72 + i * .68;
   let arc = Math.PI * 1.68;
   let radius = size.x * (.59 + .038 * i);
   let height = size.y * (-.21 + i * .124);
   let pitch = .22 + i * .045;
   let roll = -.19 + i * .09;
   let rise = size.y * .58;
   let strength = glow * (.46 + i * .07);
   let width = size.x * (.045 + .008 * i);
   strip.material.uniforms.diffuseHalo.value = isHalo ? 1 : 0;
   if (isHalo) {
    const spread = (u * 2.1 + i / 4) % 1;
    angle = t * .45 + i * 1.6;
    arc = tau * .94;
    radius = size.x * (.60 + spread * .33);
    height = size.y * (-.31 + spread * .54);
    rise = 0;
    width = size.x * (.14 + .06 * spread);
    strength *= .42 * Math.sin(Math.PI * spread);
   } else if (name === 'orbit') {
    arc = Math.PI * 1.39;
    height = size.y * (-.10 + i * .06);
    pitch = (i - 1.5) * .42;
    roll = (i - 1.5) * .22;
    rise = 0;
   }
   updateStrip(strip, { angle, arc, radius, height, rise, pitch, roll,
    width, strength }, tint);
  });
 };
}
