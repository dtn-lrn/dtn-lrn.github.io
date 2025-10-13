document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) {console.error('Canvas #bgCanvas nicht gefunden'); return;}
  const ctx = canvas.getContext('2d');
  let w = window.innerWidth, h = window.innerHeight;
  canvas.width = w; canvas.height = h;
  let PARTS = [];
  for(let i=0; i<55; i++){
    PARTS.push({x: Math.random() * w, y: Math.random() * h, vx: .3 - Math.random()*.6, vy: .3 - Math.random()*.6, r: Math.random() * 2.7 + 1.5});
  }
  function anim() {
    ctx.clearRect(0,0,w,h);
    for(let p of PARTS){
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,2*Math.PI);
      ctx.fillStyle='rgba(110,160,255,0.10)';
      ctx.shadowColor="#82b1fb"; ctx.shadowBlur=6;
      ctx.fill();
      ctx.shadowBlur=0;
      p.x += p.vx; p.y += p.vy;
      if(p.x<0||p.x>w) p.vx=-p.vx;
      if(p.y<0||p.y>h) p.vy=-p.vy;
      for(let q of PARTS){
        let d= Math.hypot(p.x-q.x,p.y-q.y);
        if(d<75){ ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(q.x,q.y); ctx.strokeStyle='rgba(80,180,255,0.07)'; ctx.stroke();}
      }
    }
    requestAnimationFrame(anim);
  }
  anim();
  window.addEventListener('resize', () => {
    w=window.innerWidth; h=window.innerHeight; 
    canvas.width=w; canvas.height=h; 
  });
});
