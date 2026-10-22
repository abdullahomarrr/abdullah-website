// Sample a twisting 3D strip into a character grid. No animation dependencies.
const canvas = document.querySelector<HTMLCanvasElement>('#ascii-ribbon');
const toggle = document.querySelector<HTMLButtonElement>('#motion-toggle');
if (canvas && toggle) {
 const context = canvas.getContext('2d');
 if (context) {
  const ctx = context;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduced.matches, visible = true;
  let width = 0, height = 0, frame = 0, phase = 0, last = 0, pointerX = 0, pointerY = 0;
  const chars = '·:+=x*#%@';
  function updateButton() {
   toggle!.setAttribute('aria-pressed', String(paused));
   toggle!.setAttribute('aria-label', paused ? 'Play ribbon animation' : 'Pause ribbon animation');
   toggle!.textContent = paused ? 'Play ▷' : 'Pause ↕';
  }
  function draw() {
   ctx.clearRect(0,0,width,height);
   const cell = width < 400 ? 6 : 7, cols = Math.ceil(width/cell), rows = Math.ceil(height/cell);
   const depths = new Float32Array(cols*rows).fill(-100), shades = new Float32Array(cols*rows);
   const scale = Math.min(width/3.25,height/3.15);
   for(let u=-3.65;u<3.65;u+=.019){
    const twist=u*1.45+phase, cx=Math.sin(u*1.05+phase*.2)*.71, cy=u*.30, cz=Math.cos(u*1.05+phase*.2)*.48;
    for(let v=-.51;v<=.51;v+=.023){
     const x=cx+v*Math.cos(twist), y=cy+v*Math.sin(twist)*.35, z=cz+v*Math.sin(twist), a=-.32+pointerX*.12;
     const rx=x*Math.cos(a)-y*Math.sin(a), ry=x*Math.sin(a)+y*Math.cos(a), perspective=3.8/(3.8-z);
     const col=Math.floor((width*.5+rx*scale*perspective)/cell), row=Math.floor((height*.46+(ry+pointerY*.06)*scale*perspective)/cell);
     if(col<0||col>=cols||row<0||row>=rows)continue;
     const i=row*cols+col;if(z<=depths[i])continue;depths[i]=z;
     const edge=Math.min(1,(.51-Math.abs(v))*12), end=Math.min(1,(3.65-Math.abs(u))*3);
     shades[i]=(.25+.7*Math.abs(Math.cos(twist-.7)))*(.5+.5*edge)*end;
    }
   }
   ctx.font=`${cell-1}px "Courier New", monospace`;ctx.textAlign='center';ctx.textBaseline='middle';
   for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
    const shade=shades[row*cols+col];if(shade<.04)continue;
    const noise=((col*73+row*37)%101)/101;if(shade<.25&&noise>shade*2.8)continue;
    ctx.fillStyle=noise>.91?`rgba(195,235,157,${shade})`:`rgba(217,225,207,${shade*.85})`;
    ctx.fillText(chars[Math.min(chars.length-1,Math.floor(shade*(chars.length-1)))],col*cell,row*cell);
   }
  }
  function tick(now:number){frame=0;if(paused||!visible||document.hidden)return;if(now-last>=40){phase+=Math.min(now-last,80)*.00018;last=now;draw()}frame=requestAnimationFrame(tick)}
  function sync(){cancelAnimationFrame(frame);frame=0;last=performance.now();if(!paused&&visible&&!document.hidden)frame=requestAnimationFrame(tick)}
  new ResizeObserver(()=>{const rect=canvas!.getBoundingClientRect();width=rect.width;height=rect.height;const dpr=Math.min(devicePixelRatio||1,2);canvas!.width=Math.round(width*dpr);canvas!.height=Math.round(height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);draw()}).observe(canvas);
  new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(canvas);
  canvas.addEventListener('pointermove',event=>{if(paused||reduced.matches||event.pointerType==='touch')return;const rect=canvas.getBoundingClientRect();pointerX=(event.clientX-rect.left)/rect.width-.5;pointerY=(event.clientY-rect.top)/rect.height-.5});
  canvas.addEventListener('pointerleave',()=>{pointerX=0;pointerY=0});
  toggle.addEventListener('click',()=>{paused=!paused;updateButton();sync()});
  reduced.addEventListener('change',()=>{paused=reduced.matches;updateButton();sync()});
  document.addEventListener('visibilitychange',sync);updateButton();sync();
 } else {toggle.hidden=true;}
}
