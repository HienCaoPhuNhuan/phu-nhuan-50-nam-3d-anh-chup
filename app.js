const viewer=document.getElementById('trophy'),stage=document.getElementById('stage'),canvas=document.getElementById('fire'),ctx=canvas.getContext('2d'),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const REVEAL_MS=10000;let width=0,height=0,start=0,previous=0,started=false,completed=false,raf=0,particles=[],spawnCredit=0,bursts=0,modelReady=false,textReady=false,offsetX=0,offsetY=0,viewportWidth=0,viewportHeight=0;
function resize(){
 const r=stage.getBoundingClientRect();width=r.width;height=r.height;offsetX=r.left;offsetY=r.top;viewportWidth=innerWidth;viewportHeight=innerHeight;
 const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(viewportWidth*dpr);canvas.height=Math.round(viewportHeight*dpr);
 // Draw relative to the cup, with the entire viewport available for the glow tails.
 ctx.setTransform(dpr,0,0,dpr,offsetX*dpr,offsetY*dpr);ctx.lineCap='round';ctx.lineJoin='round';
}
new ResizeObserver(resize).observe(stage);addEventListener('resize',resize);
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function glow(x,y,r,color,alpha){if(r<=0||alpha<=0)return;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(255,242,184,${alpha})`);g.addColorStop(.18,`rgba(255,188,67,${alpha*.8})`);g.addColorStop(.5,`rgba(${color},${alpha*.25})`);g.addColorStop(1,`rgba(${color},0)`);ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
function emit(p,dt){const power=Math.sin(Math.PI*clamp(p))*1.3,rate=9+(p<1?470*power:0);spawnCredit+=rate*dt;const count=Math.min(45,Math.floor(spawnCredit));spawnCredit-=count;for(let i=0;i<count;i++){const theta=Math.random()*Math.PI*2,radius=width*(.15+Math.random()*.20),progress=clamp((p-.12)/.72),front=height*(.88-progress*.76);const around=Math.random()<.64&&p>.15;particles.push({x:width*.5+(around?Math.cos(theta)*radius:(Math.random()-.5)*width*.18),y:around?front+Math.sin(theta)*height*.04:height*.88,vx:(Math.random()-.5)*120,vy:-(50+Math.random()*190),life:0,max:.6+Math.random()*1.8,size:.7+Math.random()*2.2,wobble:Math.random()*6,color:Math.random()>.25?'255,191,79':'255,106,26'})}}
function flames(p,t){if(p>=1||reduced)return;const power=Math.sin(Math.PI*clamp((p-.025)/.975)),rise=clamp((p-.07)/.83),baseY=height*.88,cx=width*.5;ctx.globalCompositeOperation='lighter';glow(cx,baseY,width*.43,'255,80,8',power*.55);const frontY=baseY-rise*height*.77;glow(cx,frontY,width*.36,'255,115,17',power*.32);for(let i=0;i<40;i++){const phase=i/40*Math.PI*2+t*1.1,spread=width*(.15+.16*Math.sin(rise*Math.PI)),x=cx+Math.cos(phase)*spread,yy=frontY+Math.sin(phase)*height*.035,len=height*(.16+.08*Math.sin(i*2+t*4));const bend=Math.sin(t*3+i)*width*.045;const g=ctx.createLinearGradient(x,yy+len,x+bend,yy-len);g.addColorStop(0,'rgba(255,65,5,0)');g.addColorStop(.4,`rgba(255,128,15,${power*.50})`);g.addColorStop(.7,`rgba(255,226,132,${power*.9})`);g.addColorStop(1,'rgba(255,210,120,0)');ctx.beginPath();ctx.moveTo(x,yy+len*.8);ctx.bezierCurveTo(x-bend,yy+len*.1,x+bend*2,yy-len*.55,x+bend,yy-len);ctx.strokeStyle=g;ctx.lineWidth=4+Math.sin(i+t*2)*2;ctx.shadowBlur=22;ctx.shadowColor='#ff9d24';ctx.stroke()}
ctx.shadowBlur=0;for(let i=0;i<24;i++){const q=i/24*Math.PI*2+t*.65,x=cx+Math.cos(q)*width*.19,y=frontY+Math.sin(q)*height*.035,h=height*(.13+.10*(.5+.5*Math.sin(i*2.3+t*5))),w=width*(.012+.010*Math.sin(i+t)*Math.sin(i+t)),bend=Math.sin(t*4+i)*w*2;const g=ctx.createLinearGradient(x,y+h*.25,x,y-h);g.addColorStop(0,'rgba(255,82,9,0)');g.addColorStop(.38,`rgba(255,121,20,${power*.52})`);g.addColorStop(.7,`rgba(255,214,102,${power*.52})`);g.addColorStop(1,'rgba(255,235,173,0)');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(x-w,y+h*.25);ctx.bezierCurveTo(x-w*2,y-h*.3,x+bend-w,y-h*.55,x+bend,y-h);ctx.bezierCurveTo(x+bend+w,y-h*.45,x+w*2,y-h*.05,x+w,y+h*.25);ctx.closePath();ctx.fill()}const sweep=rise*Math.PI*7;for(let k=0;k<3;k++){ctx.beginPath();for(let j=0;j<80;j++){const a=sweep-j*.035+k*Math.PI*2/3,decay=1-j/80,x=cx+Math.cos(a)*width*(.15+.07*Math.sin(rise*Math.PI)),y=frontY+j*height*.0007+Math.sin(a)*height*.04;if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y)}ctx.strokeStyle=`rgba(255,213,116,${power*.34})`;ctx.lineWidth=1.3;ctx.shadowColor='#ffbe56';ctx.shadowBlur=13;ctx.stroke()}ctx.shadowBlur=0;ctx.globalCompositeOperation='source-over'}

// Broad radiant corona, outward light shafts and two expanding shockwaves.
function energy(p,t){
 if(p>=1||reduced)return;
 const cx=width*.5,cy=height*.52,envelope=Math.sin(Math.PI*clamp((p-.025)/.975)),scale=Math.min(width,height),surge=Math.exp(-Math.pow((p-.19)/.075,2))+.9*Math.exp(-Math.pow((p-.78)/.085,2));
 ctx.globalCompositeOperation='lighter';
 glow(cx,cy,scale*(.54+surge*.22),'255,108,12',envelope*.26+surge*.18);
 // Feathered light strokes replace the solid triangular wedges.
 ctx.lineCap='round';
 for(let i=0;i<34;i++){
  const a=i*Math.PI*2/34+Math.sin(t*.38)*.06,inner=scale*(.17+.025*Math.sin(i*2)),outer=scale*(.58+.18*Math.sin(i*7.31+t*.6)+surge*.15);
  const x=cx+Math.cos(a)*inner,y=cy+Math.sin(a)*inner,endX=cx+Math.cos(a)*outer,endY=cy+Math.sin(a)*outer,g=ctx.createLinearGradient(x,y,endX,endY);
  g.addColorStop(0,'rgba(255,224,137,0)');g.addColorStop(.24,`rgba(255,205,92,${envelope*(.10+.11*surge)})`);g.addColorStop(.65,`rgba(255,135,25,${envelope*.05})`);g.addColorStop(1,'rgba(255,106,12,0)');
  ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo((x+endX)/2+Math.sin(i+t)*5,(y+endY)/2,endX,endY);
  ctx.strokeStyle=g;ctx.lineWidth=3+5*(.5+.5*Math.sin(i*3.77));ctx.shadowColor='#ffb542';ctx.shadowBlur=18;ctx.stroke();
 }
 ctx.shadowBlur=0;
 // A broad, transparent annulus diffuses outward without a hard neon outline.
 for(const origin of [.12,.70]){
  const q=clamp((p-origin)/.28);if(q<=0||q>=1)continue;
  const r=scale*(.08+.85*(1-Math.pow(1-q,2))),alpha=Math.sin(Math.PI*Math.min(q*3,1)/2)*Math.pow(1-q,1.5)*.52;
  ctx.save();ctx.translate(cx,cy);ctx.scale(1,.76);
  const g=ctx.createRadialGradient(0,0,r*.60,0,0,r*1.13);
  g.addColorStop(0,'rgba(255,126,23,0)');g.addColorStop(.36,`rgba(255,139,34,${alpha*.12})`);g.addColorStop(.64,`rgba(255,210,114,${alpha})`);g.addColorStop(.83,`rgba(255,159,49,${alpha*.17})`);g.addColorStop(1,'rgba(255,126,23,0)');
  ctx.fillStyle=g;ctx.fillRect(-r*1.14,-r*1.14,r*2.28,r*2.28);ctx.restore();
 }
 ctx.globalCompositeOperation='source-over';
 if((p>.14&&bursts===0)||(p>.72&&bursts===1)){
  bursts++;const count=width<500?100:190;
  for(let i=0;i<count;i++){const angle=Math.random()*Math.PI*2,speed=scale*(.28+Math.random()*.68);particles.push({x:cx+Math.cos(angle)*scale*.09,y:cy+Math.sin(angle)*scale*.09,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed-35,life:0,max:1+Math.random()*1.4,size:.7+Math.random()*2.4,wobble:Math.random()*6,color:Math.random()>.4?'255,216,121':'255,119,24',burst:true})}
 }
}

const updateShowcase = createShowcase(viewer, stage);

function draw(now){if(document.hidden){raf=0;return}if(!start)start=now;const elapsed=(now-start)/1000,p=elapsed/10,dt=Math.min((now-(previous||now))/1000,.05);previous=now;ctx.clearRect(-offsetX,-offsetY,viewportWidth,viewportHeight);if(!reduced){energy(p,elapsed);flames(p,elapsed);emit(p,dt);ctx.globalCompositeOperation='lighter';particles=particles.filter(s=>s.life<s.max).slice(-900);for(const s of particles){s.life+=dt;s.x+=s.vx*dt+Math.sin(elapsed*3+s.wobble)*dt*8;s.y+=s.vy*dt;if(s.burst){s.vy+=75*dt;s.vx*=Math.exp(-.35*dt)}const a=Math.sin(Math.PI*clamp(s.life/s.max))*(1-.65*clamp((p-.9)/.22));ctx.strokeStyle=`rgba(${s.color},${a})`;ctx.lineWidth=s.size;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.vx*.015,s.y-s.vy*.035+3+s.size*2);ctx.stroke()}ctx.globalCompositeOperation='source-over'}if(p>.68)document.body.classList.add('illuminated');if(p>=1&&!completed)finish();if(completed&&!reduced&&viewer.loaded)updateShowcase(now,dt,ctx,width,height);raf=requestAnimationFrame(draw)}
function finish(){if(completed)return;completed=true;document.body.classList.remove('revealing');document.body.classList.add('revealed','illuminated');document.body.dataset.phase='rotation';document.body.dataset.revealDuration=String(REVEAL_MS);currentCue=null;if(reduced){cancelAnimationFrame(raf);ctx.clearRect(-offsetX,-offsetY,viewportWidth,viewportHeight)}}
function begin(){if(started||!modelReady||!textReady)return;started=true;resize();document.body.dataset.phase='reveal';document.body.classList.add('revealing');playCue('fire');start=performance.now();previous=start;raf=requestAnimationFrame(draw)}
function ready(){modelReady=true;begin()}
viewer.addEventListener('load',ready);viewer.addEventListener('error',()=>{document.getElementById('fallback').hidden=false;document.getElementById('model-reveal').hidden=true;ready()});
// Keep sound cues on the visual timeline even if the browser unlocks audio late.
let audioContext;
let audioOutput;
let audioBuffers;
let currentCue;
let playingCue;
let activeSource;

function startCurrentCue() {
 if (!currentCue || playingCue === currentCue || !audioBuffers || audioContext.state !== 'running') return;
 const buffer = audioBuffers[currentCue.name];
 const offset = (performance.now() - currentCue.startedAt) / 1000;
 if (offset >= buffer.duration) return;
 if (activeSource) activeSource.stop();
 const source = audioContext.createBufferSource();
 source.buffer = buffer;
 source.connect(audioOutput);
 source.onended = () => {
  source.disconnect();
  if (activeSource === source) activeSource = null;
 };
 activeSource = source;
 playingCue = currentCue;
 source.start(0, offset);
}

function playCue(name) {
 currentCue = { name, startedAt: performance.now() };
 startCurrentCue();
}

async function prepareSound() {
 const AudioContext = window.AudioContext || window.webkitAudioContext;
 if (!AudioContext) return;
 audioContext = new AudioContext();
 audioOutput = audioContext.createGain();
 audioOutput.gain.value = document.hidden ? 0 : .85;
 audioOutput.connect(audioContext.destination);
 audioContext.addEventListener('statechange', startCurrentCue);

 const resumeSound = () => {
  if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
 };
 // Some browsers require an interaction before audio can start.
 document.addEventListener('click', resumeSound, {capture:true});
 document.addEventListener('keydown', resumeSound, {capture:true});
 resumeSound();

 const decode = async path => {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Could not load sound effect');
  return audioContext.decodeAudioData(await response.arrayBuffer());
 };
 const [light, fire] = await Promise.all([
  decode('assets/text-light.wav'),
  decode('assets/trophy-fire.wav'),
 ]);
 audioBuffers = { light, fire };
 startCurrentCue();
}

function playTextIntro() {
 document.body.dataset.phase = 'text';
 document.body.classList.add('lettering');
 playCue('light');
 setTimeout(() => {
  textReady = true;
  document.body.classList.add('text-ready');
  begin();
 }, 4300);
}

prepareSound().catch(error => console.warn('Không thể tải âm thanh.', error));
Promise.all([document.fonts.ready, new Promise(resolve => requestAnimationFrame(resolve))]).then(playTextIntro);
document.addEventListener('visibilitychange', () => {
 if (audioOutput) audioOutput.gain.value = document.hidden ? 0 : .85;
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0;viewer.removeAttribute('auto-rotate')}else if(started){previous=performance.now();raf=requestAnimationFrame(draw)}});
