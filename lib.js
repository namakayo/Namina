//Custom personal library by namakayo and for namakayo
//version 1.0.0
export class Lib{
  static TAU=Math.PI*2;
  static d8=[{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0},{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1}];
  //Usage: Lib.loop2d((x,y)=>{return ...})
  static loop2d(w,h,con){
    const returnMap=new Map();
    for(let x=0;x<w;x++){
      for(let y=0;y<h;y++){
        returnMap.set(new Vec(x,y).toString(),con(x,y));
      }
    }
    return returnMap;
  }
  static cloneObject(obj){
    return Object.create(Object.getPrototypeOf(obj),Object.getOwnPropertyDescriptors(obj));
  }
  static randomId(){
    return Math.floor(Math.random()*16777216).toString(16);
  }
  static random2(){
    return Math.random()*2-1;
  }
  static randomImi(){
    return Math.random()<0.5?1:-1;
  }
  static mapToObj(map){
    return Object.fromEntries(map);
  }
  static rgb(r,g,b){
    return `rgb(${r},${g},${b})`;
  }
  static rgCol(value){
    return `rgb(${value*-255},${value*255},${255/2})`;
  }
  static sigmoid(value){
    return 1/(1+Math.pow(Math.E,-value))*2-1;
  }
  static clamp(value,min,max){
    return Math.min(Math.max(value,min),max);
  }
  static pause(ms){
    return new Promise(r=>setTimeout(r,ms));
  }
  static roundImi(value){
    return Math.round((value+1)/2)==1?1:-1;
  }
  static getCSSColors(){
    const root=getComputedStyle(document.documentElement);
    const pal={};
    for (let i=0;i<root.length;i++){
      const prop=root[i];
      if(prop.startsWith('--')){
        pal[prop.slice(2)]=root.getPropertyValue(prop).trim();
      }
    }
    return pal;
  }
  static getBit(int,at){
    return (int>>at)&1;
  }
  static setBit(int,at,to){
    if(to){
      return activateBit(int,at);
    }else{
      return clearBit(int,at);
    }
  }
  static activateBit(int,at){
    return n|(1<<at);
  }
  static clearBit(int,at){
    return n&~(1<<at);
  }
  static toggleBit(int,at){
    return n^(1<<at);
  }
}
export class Map2{
  constructor(w,h=undefined,con=()=>{return undefined}){
    this.w=w;
    if(h==null){
      h=w;
    }
    this.h=h;
    this.map=Lib.loop2d(w,h,(x,y)=>{return con(x,y);});
  }
  iterate(con){
    for(let [pos,value] of this.map){
      const vecpos=Vec.fromString(pos);
      value=con(vecpos.x,vecpos.y,value);
    }
  }
  get(x,y){
    if(x.x!=null&&x.y!=null){
      return this.map.get(x.toString());
    }else{
      return this.map.get(new Vec(x,y).toString());
    }
  }
  set(x,y,to){
    if(x.x!=null&&x.y!=null){
      //Use a vector instead
      this.map.set(x.toString(),y);
    }else{
      this.map.set(new Vec(x,y).toString(),to);
    }
  }
}
//Class that handles actual drawing through Drawv
//Construct only once in your main js!
export class Drawer{
  constructor(canv,channel=0){
    this.canv=canv;
    this.channel=channel;
    this.currentChannel=0;
    const ctx=canv.getContext("2d");
    document.addEventListener("drawchannel",(e)=>{
      this.currentChannel=e.detail.channel;
    });
    document.addEventListener("draw",(e)=>{
      if(this.channel!==this.currentChannel){
        return;
      }
      const d=e.detail;
      const type=d.type;
      if(type==="clear"){
        ctx.clearRect(0,0,canv.width,canv.height);
      }else if(type==="rect"){
        ctx.beginPath();
        ctx.rect(d.x,d.y,d.w,d.h);
      }else if(type==="fillrect"){
        ctx.fillRect(d.x,d.y,d.w,d.h);
      }else if(type==="arc"){
        ctx.beginPath();
        ctx.arc(d.x,d.y,d.radius,d.from,d.to,d.clockwise);
      }else if(type==="line"){
        if(d.begin){
          ctx.beginPath();
          ctx.moveTo(d.x,d.y);
        }else{
          ctx.lineTo(d.x,d.y);
        }
      }else if(type==="draw"){
        if(d.draw==="stroke"){
          ctx.stroke();
        }else if(d.draw==="fill"){
          ctx.fill();
        }
      }else if(type==="text"){
        if(d.draw==="stroke"){
          ctx.strokeText(d.text,d.x,d.y);
        }else if(d.draw==="fill"){
          ctx.fillText(d.text,d.x,d.y);
        }
      }else if(d.type==="set"){
        ctx[d.prop]=d.to;
      }
    });
  }
  resizeCanvas(){
    this.canv.width=window.innerWidth;
    this.canv.height=window.innerWidth;
  }
  get w(){
    return this.canv.width;
  }
  get h(){
    return this.canv.height;
  }
  set w(to){
    this.canv.width=to;
    return this;
  }
  set h(to){
    this.canv.height=to;
    return this;
  }
}
//Class for drawing without needing ctx reference
export class Draw{
  constructor(){}
  static clear(){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"clear"
      }
    }));
  }
  static circle(x,y,radius){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"arc",
        x:x,y:y,radius:radius,from:0,to:Lib.TAU,clockwise:true
      }
    }));
  }
  static arc(x,y,radius,from,to,clockwise=true){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"arc",
        x:x,y:y,radius:radius,from:from,to:to,clockwise:clockwise
      }
    }));
  }
  static lineTo(x,y){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"line",
        x:x,y:y,begin:false
      }
    }));
  }
  static moveTo(x,y){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"line",
        x:x,y:y,begin:true
      }
    }));
  }
  static fillRect(x,y,w,h){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"fillrect",
        x:x,y:y,w:w,h:h
      }
    }));
  }
  static rect(x,y,w,h){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"rect",
        x:x,y:y,w:w,h:h
      }
    }));
  }
  static stroke(){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"draw",
        draw:"stroke"
      }
    }));
  }
  static fill(){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"draw",
        draw:"fill"
      }
    }));
  }
  static strokeText(text,x,y){
    document.dispatchEvent(new CustomEvent("draw", {
      detail:{
        type:"text",
        draw:"stroke",text:text,x:x,y:y
      }
    }));
  }
  static fillText(text,x,y){
    document.dispatchEvent(new CustomEvent("draw", {
      detail:{
        type:"text",
        draw:"fill",text:text,x:x,y:y
      }
    }));
  }
  static set(prop,value){
    document.dispatchEvent(new CustomEvent("draw", {
      detail:{
        type:"set",
        prop:prop,to:value
      }
    }));
  }
  static channel(cha){
    document.dispatchEvent(new CustomEvent("drawchannel", {
      detail:{
        channel:cha
      }
    }));
  }
}
export class Drawv extends Draw{
  static circle(vec,radius){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"arc",
        x:vec.x,y:vec.y,radius:radius,from:0,to:Lib.TAU,clockwise:true
      }
    }));
  }
  static arc(vec,radius,from,to,clockwise=true){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"arc",
        x:vec.x,y:vec.y,radius:radius,from:from,to:to,clockwise:clockwise
      }
    }));
  }
  static lineTo(vec){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"line",
        x:vec.x,y:vec.y,begin:false
      }
    }));
  }
  static moveTo(vec){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"line",
        x:vec.x,y:vec.y,begin:true
      }
    }));
  }
  static fillRect(vec,size){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"fillrect",
        x:vec.x,y:vec.y,w:size.x,h:size.y
      }
    }));
  }
  static rect(vec,size){
    document.dispatchEvent(new CustomEvent("draw",{
      detail:{
        type:"rect",
        x:vec.x,y:vec.y,w:size.x,h:size.y
      }
    }));
  }
  static strokeText(text,vec){
    document.dispatchEvent(new CustomEvent("draw", {
      detail:{
        type:"text",
        draw:"stroke",text:text,x:vec.x,y:vec.y
      }
    }));
  }
  static fillText(text,vec){
    document.dispatchEvent(new CustomEvent("draw", {
      detail:{
        type:"text",
        draw:"fill",text:text,x:vec.x,y:vec.y
      }
    }));
  }
}
export class Vec{
  constructor(x=0,y=0){
    this.x=x;
    this.y=y;
  }
  toString(){
    return `${this.x},${this.y}`;
  }
  static fromString(str){
    const [x,y]=str.split(",").map(Number);
    return new Vec(x,y);
  }
  addInPlace(vec){
    this.x+=vec.x;
    this.y+=vec.y;
    return this;
  }
  subInPlace(vec){
    this.x-=vec.x;
    this.y-=vec.y;
    return this;
  }
  mulInPlace(value){
    this.x*=value;
    this.y*=value;
    return this;
  }
  divInPlace(value){
    this.x/=value;
    this.y/=value;
    return this;
  }
  floorInPlace(){
    this.x=Math.floor(this.x);
    this.y=Math.floor(this.y);
    return this;
  }
  static add(vec1,vec2){
    return new Vec(vec1.x+vec2.x,vec1.y+vec2.y);
  }
  static sub(vec1,vec2){
    return new Vec(vec1.x-vec2.x,vec1.y-vec2.y);
  }
  static mul(vec1,value){
    return new Vec(vec1.x*value,vec1.y*value);
  }
  static div(vec1,value){
    return new Vec(vec1.x/value,vec1.y/value);
  }
  static floor(vec){
    return new Vec(Math.floor(vec.x),Math.floor(vec.y));
  }
  static dst(vec1,vec2){
    const dx=vec1.x-vec2.x;
    const dy=vec1.y-vec2.y;
    return Math.sqrt(dx*dx+dy*dy);
  }
  static mag(vec){
    return Math.sqrt(vec.x*vec.x+vec.y*vec.y);
  }
}
export class Rot{
  constructor(rot=0) {
    this.rot=this.normalize(rot);
  }
  normalize(rot) {
    return ((rot%Lib.TAU)+Lib.TAU)%Lib.TAU;
  }
  add(value){
    this.rot=this.normalize(this.rot+value);
  }
  toVec(){
    return new Vec(Math.cos(this.rot),Math.sin(this.rot));
  }
  static random(){
    return Math.random()*Lib.TAU;
  }
  set(value){
    this.rot=this.normalize(value);
  }
  get(){
    return this.rot;
  }
}
export class Pointer{
  constructor(node,useVec=false){
    this.node=node;
    this.useVec=useVec;
    this.start=new Function();
    this.move=new Function();
    this.holdTreshold=100;
    this.holdTimer;
    this.holded=new Function();
    this.touches=new Map();
    this.limit=true;
    node.addEventListener("pointerdown",(e)=>{
      const ex=this.limit?Lib.clamp(e.offsetX,0,node.width):e.offsetX;
      const ey=this.limit?Lib.clamp(e.offsetY,0,node.height):e.offsetY;
      if(this.useVec){
        const now=new Vec(ex,ey);
        this.start(now);
        this.touches.set(e.pointerId,now);
      }else{
        this.start(ex,ey);
        this.touches.set(e.pointerId,{x:ex,y:ey});
      }
      this.holdTimer=setTimeout(()=>{
        if(this.useVec){
          const now=new Vec(ex,ey);
          this.holded(now);
          this.touches.set(e.pointerId,now);
        }else{
          this.holded(ex,ey);
        }
      },this.holdTreshold);
    });
    node.addEventListener("pointermove",(e)=>{
      const ex=this.limit?Lib.clamp(e.offsetX,0,node.width):e.offsetX;
      const ey=this.limit?Lib.clamp(e.offsetY,0,node.height):e.offsetY;
      if(this.touches.has(e.pointerId)){
        if(this.useVec){
          const last=this.touches.get(e.pointerId);
          const now=new Vec(ex,ey);
          const d=Vec.sub(now,last);
          this.move(now,d);
          this.touches.set(e.pointerId,now);
        }else{
          const last=this.touches.get(e.pointerId);
          const dx=ex-last.x;
          const dy=ey-last.y;
          this.move(ex,ey,dx,dy);
          this.touches.set(e.pointerId,{x:ex,y:ey,lastX:e.offsetX,lastY:e.offsetY});
        }
      }
    });
    node.addEventListener("pointerup",(e)=>{
      this.touches.delete(e.pointerId);
      clearTimeout(this.holdTimer);
    });
    node.addEventListener("pointercancel",(e)=>{
      this.touches.delete(e.pointerId);
      clearTimeout(this.holdTimer);
    });
  }
}
export class Raf{
  constructor(fn){
    this.last=0;
    this.fn=fn;
    this.upd=(t)=>{
      const dt=t-this.last;
      this.last=t;
      this.fn(dt);
      requestAnimationFrame(this.upd);
    }
  }
  run(){
    requestAnimationFrame(this.upd);
  }
}
export class Color{
  constructor(r,g,b,a=1){
    this.r=Lib.clamp(r,0,255);
    this.g=Lib.clamp(g,0,255);
    this.b=Lib.clamp(b,0,255);
    this.a=Lib.clamp(a,0,1);
  }
  static rgb(r,g,b,a=1){
    return new Color(r, g, b, a);
  }
  static rgba(r,g,b,a){
    return new Color(r, g, b, a);
  }
  static validHex(hex){
    return /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex);
  }
  static hex(hex){
    hex=hex.replace("#","");
    if(hex.length==3||hex.length==4){
      hex=hex.split("").map(x=>x+x).join("");
    }
    if(hex.length==8){
      const a=parseInt(hex.slice(6,8),16)/255;
      return new Color(
        parseInt(hex.slice(0,2),16),
        parseInt(hex.slice(2,4),16),
        parseInt(hex.slice(4,6),16),
        a
      );
    }
    if(hex.length!=6){
      throw new Error("invalid hex");
    }
    return new Color(
      parseInt(hex.slice(0,2),16),
      parseInt(hex.slice(2,4),16),
      parseInt(hex.slice(4,6),16)
    );
  }
  toHex(){
    let hex=[this.r,this.g,this.b].map(x=>Math.round(x).toString(16).padStart(2,"0")).join("");
    if(this.a<1){
      hex+=Math.floor(this.a*255).toString(16).padStart(2,"0");
    }
    return `#${hex}`;
  }
  a(value){
    this.a=value;
    return this;
  }
  static transparent(){
    return Color.rgba(1,1,1,0);
  }
  
//This hue part is vibe coded please forgive me
  hue() {
  const r = this.r / 255;
  const g = this.g / 255;
  const b = this.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  if (delta === 0) return 0;

  let h;

  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  return ((h * 60) + 360) % 360;
}

hsl() {
  const r = this.r / 255;
  const g = this.g / 255;
  const b = this.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return {
      h: 0,
      s: 0,
      l: l
    };
  }

  const delta = max - min;
  const s = delta / (1 - Math.abs(2 * l - 1));

  let h;

  if (max === r) {
    h = ((g - b) / delta) % 6;
  } else if (max === g) {
    h = (b - r) / delta + 2;
  } else {
    h = (r - g) / delta + 4;
  }

  h *= 60;

  if (h < 0) h += 360;

  return {
    h,
    s: s,
    l: l
  };
}

rotateHue(degrees) {
  const hsl = this.hsl();

  return Color.fromHsl(
    (hsl.h + degrees) % 360,
    hsl.s,
    hsl.l,
    this.a
  );
}

static fromHsl(h, s, l, a = 1) {
  h = ((h % 360) + 360) % 360;
  s = Lib.clamp(s, 0, 1);
  l = Lib.clamp(l, 0, 1);

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let r = 0;
  let g = 0;
  let b = 0;

  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }

  return new Color(
    (r + m) * 255,
    (g + m) * 255,
    (b + m) * 255,
    a
  );
}

}