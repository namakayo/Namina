import {Lib,Drawer,Draw,Drawv,Vec,Color,Map2,Pointer,Raf} from "./lib.js";

//HTML references
const canv=document.getElementById("main");
const ccanv=document.getElementById("color");
const colori=document.getElementById("colori");
const hcanv=document.getElementById("hue");
const ctx=canv.getContext("2d");
const paldiv=document.getElementById("paldiv");

//Drawers
const drawer=new Drawer(canv);
drawer.resizeCanvas();
const cdrawer=new Drawer(ccanv,1);
cdrawer.h=160;
cdrawer.w=cdrawer.h;
const hdrawer=new Drawer(hcanv,2);
hdrawer.h=cdrawer.h;
hdrawer.w=30;

//Internal constants
const cssPal=Lib.getCSSColors();
const tilesize=4;
const tiles=8;
const pxs=tilesize*tiles;
const bitmaps=[];
const pxSize=drawer.w/pxs;
const pxTile=pxSize*tilesize;

//Player variables
const colorPicker={
  h:0,
  s:0.5,
  l:0.5,
  editing:false
}
const meshBitmask={};
const pal=[];
const palel=[];
const palelPointer=[];
let palSelected=0;
let drawing=true;

//Pointers (touch handler)
const pointer=new Pointer(canv,true);
pointer.move=(pos,d)=>{
  bitmaps[palSelected].set(pos.divInPlace(drawer.w).mulInPlace(tiles).floorInPlace(),drawing);
  drawCanvas();
};
pointer.start=(pos)=>{
  if(bitmaps[palSelected].get(Vec.floor(Vec.mul(Vec.div(pos,drawer.w),tiles)))){
    drawing=false;
  }else{
    drawing=true;
  }
  pointer.move(pos);
}
const cpointer=new Pointer(ccanv,true);
cpointer.move=(pos,d)=>{
  colorPicker.s=pos.x/cdrawer.w;
  colorPicker.l=1-pos.y/cdrawer.h;
  if(colorPicker.editing){
    palSet(palSelected,getColorPicker());
    drawCanvas();
  }
  drawColorPicker();
};
cpointer.start=cpointer.move;
const hpointer=new Pointer(hcanv,true);
hpointer.move=(pos,d)=>{
  colorPicker.h=pos.y/cdrawer.h;
  if(colorPicker.editing){
    palSet(palSelected,getColorPicker());
    drawCanvas();
  }
  drawColorPicker();
};
hpointer.start=hpointer.move;

//Buttons
{const b=document.getElementById("bCopy");
  b.addEventListener("click",()=>{
    pickColor(Color.hex(pal[palSelected]));
    drawColorPicker()
  });}
{const b=document.getElementById("bSet");
  b.addEventListener("click",()=>{
    palSet(palSelected,getColorPicker());
    drawCanvas();
  });}
{const b=document.getElementById("bEdit");
  b.addEventListener("click",()=>{
    if(colorPicker.editing){
      b.style.backgroundColor=cssPal.btn;
      colorPicker.editing=false;
    }else{
      pickColor(Color.hex(pal[palSelected]));
      drawColorPicker()
      b.style.backgroundColor=cssPal.btnon;
      colorPicker.editing=true;
    }
  });}
{const b=document.getElementById("bLeft");
  b.addEventListener("click",()=>{
    if(palSelected>0){
      palSwap(palSelected,palSelected-1);
      palSelected--;
      palSelect(palSelected);
      drawCanvas();
    }
  });}
{const b=document.getElementById("bRight");
  b.addEventListener("click",()=>{
    if(palSelected<pal.length-1){
      palSwap(palSelected,palSelected+1);
      palSelected++;
      palSelect(palSelected);
      drawCanvas();
    }
  });}
{const b=document.getElementById("bAdd");
  b.addEventListener("click",()=>{
    palAdd(getColorPicker());
  });}
{const b=document.getElementById("bRemove");
  b.addEventListener("click",()=>{
    if(pal.length>1){
      palRemove(palSelected);
      if(colorPicker.editing){
        pickColor(Color.hex(pal[palSelected]));
        drawColorPicker();
      }
      drawCanvas();
    }
  });}
{const b=document.getElementById("bDownload");
  b.addEventListener("click",async ()=>{
    const dcanv=document.createElement("canvas");
    const ddrawer=new Drawer(dcanv,3);
    ddrawer.w=pxs;
    ddrawer.h=ddrawer.w;
    drawCanvas(true);
    dcanv.toBlob((blob)=>{
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");
      link.download="namina.png";
      link.href=url;
      link.click();
      URL.revokeObjectURL(url);
    },"image/png");
  });}
  
//Color input
colori.addEventListener("input",()=>{
  if("#"+Color.validHex(colori.value)){
    pickColor(Color.hex(colori.value));
    drawColorPicker(true);
  }
});

function fillMesh(origin,regions){
  const thalf=pxTile/2;
  if(regions[0]&&regions[1]&&regions[2]&&regions[3]&&regions[4]){
    Draw.fillRect(origin.x-thalf,origin.y-thalf,pxTile,pxTile);
    return;
  }
  if(regions[0]){
    Draw.moveTo(origin.x+thalf,origin.y);
    Draw.lineTo(origin.x,origin.y+thalf);
    Draw.lineTo(origin.x-thalf,origin.y);
    Draw.lineTo(origin.x,origin.y-thalf);
    Draw.fill();
  }
  if(regions[1]){
    Draw.moveTo(origin.x+thalf,origin.y);
    Draw.lineTo(origin.x+thalf,origin.y+thalf);
    Draw.lineTo(origin.x,origin.y+thalf);
    Draw.fill();
  }
  if(regions[2]){
    Draw.moveTo(origin.x,origin.y+thalf);
    Draw.lineTo(origin.x-thalf,origin.y+thalf);
    Draw.lineTo(origin.x-thalf,origin.y);
    Draw.fill();
  }
  if(regions[3]){
    Draw.moveTo(origin.x-thalf,origin.y);
    Draw.lineTo(origin.x-thalf,origin.y-thalf);
    Draw.lineTo(origin.x,origin.y-thalf);
    Draw.fill();
  }
  if(regions[4]){
    Draw.moveTo(origin.x,origin.y-thalf);
    Draw.lineTo(origin.x+thalf,origin.y-thalf);
    Draw.lineTo(origin.x+thalf,origin.y);
    Draw.fill();
  }
}
function pxMesh(origin,regions){
  if(regions[0]&&regions[1]&&regions[2]&&regions[3]&&regions[4]){
    Draw.fillRect(origin.x-2,origin.y-2,4,4);
    return;
  }
  if(regions[0]){
    Draw.fillRect(origin.x-1,origin.y-2,2,4);
    Draw.fillRect(origin.x-2,origin.y-1,4,2);
  }
  if(regions[1]){
    Draw.fillRect(origin.x+2,origin.y+2,-2,-1);
    Draw.fillRect(origin.x+2,origin.y+2,-1,-2);
  }
  if(regions[2]){
    Draw.fillRect(origin.x-2,origin.y+2,2,-1);
    Draw.fillRect(origin.x-2,origin.y+2,1,-2);
  }
  if(regions[3]){
    Draw.fillRect(origin.x-2,origin.y-2,2,1);
    Draw.fillRect(origin.x-2,origin.y-2,1,2);
  }
  if(regions[4]){
    Draw.fillRect(origin.x+2,origin.y-2,-2,1);
    Draw.fillRect(origin.x+2,origin.y-2,-1,2);
  }
}
function getMeshBitmask(){
  for(let i=0;i<Math.pow(2,9);i++){
    const c=[];
    const out=[false,false,false,false,false];
    for(let j=0;j<9;j++){
      c[j]=Lib.getBit(i,j);
    }
    c.forEach(()=>{
      if(c[0]){out[0]=true;}
      //orthogonals
      if(c[1]&&c[0]){out[1]=true;out[4]=true;}
      if(c[3]&&c[0]){out[1]=true;out[2]=true;}
      if(c[5]&&c[0]){out[2]=true;out[3]=true;}
      if(c[7]&&c[0]){out[3]=true;out[4]=true;}
      //corners
      if(c[2]&&c[1]&&c[3]){out[1]=true;}
      if(c[4]&&c[3]&&c[5]){out[2]=true;}
      if(c[6]&&c[5]&&c[7]){out[3]=true;}
      if(c[8]&&c[7]&&c[1]){out[4]=true;}
    });
    meshBitmask[c.join(",")]=out;
  }
}
getMeshBitmask();
function drawCanvas(px=false){
  Draw.channel(px?3:0);
  Draw.clear();
  if(!px){
    Draw.set("fillStyle",cssPal.canvasbg);
    Drawv.fillRect(new Vec(0,0),new Vec(canv.width,canv.height));
    Draw.set("lineWidth",1);
    Draw.set("strokeStyle",cssPal.canvasline);
    for(let i=1;i<tiles;i++){
      Draw.moveTo(i*pxTile,0);
      Draw.lineTo(i*pxTile,drawer.h);
      Draw.stroke();
    }
    for(let i=1;i<tiles;i++){
      Draw.moveTo(0,i*pxTile);
      Draw.lineTo(drawer.w,i*pxTile);
      Draw.stroke();
    }
  }
  for(let i=0;i<pal.length;i++){
    const col=pal[i];
    const bitmap=bitmaps[i]
    bitmap.iterate((x,y,th)=>{
      const tsize=new Vec(px?4:pxTile,px?4:pxTile);
      const thalf=Vec.div(tsize,2);
      const pos=new Vec(x,y).mulInPlace(px?4:pxTile).addInPlace(thalf);
      let nearby=[th?1:0];
      for(const p of Lib.d8){
        const next=bitmap.get(x+p.x,y+p.y);
        nearby.push(next?1:0);
      }
      Draw.set("fillStyle",col);
      if(px){
        pxMesh(pos,meshBitmask[nearby.join(",")]);
      }else{
        fillMesh(pos,meshBitmask[nearby.join(",")]);
      }
    });
  }
}
function getColorPicker(){
  return Color.fromHsl(colorPicker.h*360,colorPicker.s,colorPicker.l*(1-colorPicker.s*0.5));
}
function drawColorPicker(keepInput=false){
  //The square thing
  Draw.channel(1);
  const gradientX=ctx.createLinearGradient(0,0,cdrawer.w,0);
  gradientX.addColorStop(0,"white");
  gradientX.addColorStop(1,Color.fromHsl(colorPicker.h*360,1,0.5).toHex());
  Draw.set("fillStyle",gradientX);
  Draw.fillRect(0,0,cdrawer.w,cdrawer.h);
  const gradientY=ctx.createLinearGradient(0,0,0,cdrawer.h);
  for(let i=0;i<=10;i++){
    gradientY.addColorStop(i/10,Color.fromHsl(0,0,0,i/10).toHex());
  }
  Draw.set("fillStyle",gradientY);
  Draw.fillRect(0,0,cdrawer.w,cdrawer.h);
  
  Draw.circle(colorPicker.s*cdrawer.w,(1-colorPicker.l)*cdrawer.h,10);
  Draw.set("strokeStyle",cssPal.bg);
  Draw.set("lineWidth",2);
  Draw.set("fillStyle",getColorPicker().toHex());
  Draw.fill();
  Draw.stroke();
  
  //Hue slider
  Draw.channel(2);
  const gradient=ctx.createLinearGradient(0,0,0,hdrawer.h);
  for(let i=0;i<=10;i++){
    gradient.addColorStop(i/10,Color.fromHsl(i/10*360,1,0.5).toHex());
  }
  Draw.set("fillStyle",gradient);
  Draw.fillRect(0,0,hdrawer.w,hdrawer.h);
  
  {
    const size=6;
    Draw.set("fillStyle",cssPal.bg);
    Draw.fillRect(0,colorPicker.h*hdrawer.h-size,hdrawer.w,size*2);
  }
  {
    const size=3;
    Draw.set("fillStyle",Color.fromHsl(colorPicker.h*360,1,0.5).toHex());
    Draw.fillRect(0,colorPicker.h*hdrawer.h-size,hdrawer.w,size*2);
  }
  
  if(!keepInput){
    colori.value=getColorPicker().toHex().slice(1);
  }
}

function palAdd(col){
  const thisi=pal.length;
  pal.push(col.toHex());
  const csquare=document.createElement("div");
  csquare.className="csquare";
  csquare.style.backgroundColor=col.toHex();
  csquare.style.borderColor=cssPal.square;
  const cspointer=new Pointer(csquare);
  cspointer.start=()=>{
    if(colorPicker.editing){
      pickColor(Color.hex(pal[thisi]));
      drawColorPicker();
    }
    palSelect(thisi);
  }
  paldiv.appendChild(csquare);
  updatePaldivWidth();
  palel.push(csquare);
  palelPointer.push(cspointer);
  bitmaps.push(new Map2(tiles,tiles,()=>{return false}));
}
function updateColorPickerPointer(){
  palelPointer.forEach((p,i)=>{
    p.start=()=>{
      if(colorPicker.editing){
        pickColor(Color.hex(pal[i]));
        drawColorPicker();
      }
      palSelect(i);
    }
  });
}
function updatePaldivWidth(){
  paldiv.style.width=`${Math.min(350,pal.length*50)}px`;
}
function palRemove(i){
  pal.splice(i,1);
  bitmaps.splice(i,1);
  palel[i].remove();
  palel.splice(i,1);
  palelPointer.splice(i,1);
  updatePaldivWidth();
  if(palSelected>=pal.length){
    palSelected--;
  }
  palel[palSelected].style.borderColor=cssPal.squarelight;
  updateColorPickerPointer();
}
function palSet(i,col){
  pal[i]=col.toHex();
  palel[i].style.backgroundColor=col.toHex();
}
function palSelect(i){
  palSelected=i;
  palel.forEach((p)=>{
    p.style.borderColor=cssPal.square;
  });
  palel[i].style.borderColor=cssPal.squarelight;
}
function palSwap(a,b){
  const abitmap=Lib.cloneObject(bitmaps[a]);
  const acolor=structuredClone(pal[a]);
  pal[a]=structuredClone(pal[b]);
  pal[b]=acolor;
  bitmaps[a]=Lib.cloneObject(bitmaps[b]);
  bitmaps[b]=abitmap;
  
  palel[a].style.backgroundColor=pal[a];
  palel[b].style.backgroundColor=pal[b];
}
function pickColor(col){
  const hsl=col.hsl();
  colorPicker.h=hsl.h/360;
  colorPicker.s=hsl.s;
  colorPicker.l=hsl.l/(1-hsl.s*0.5);
}

palAdd(Color.rgb(0,0,255));
palAdd(Color.rgb(255,255,0));
palAdd(Color.rgb(255,0,0));
palAdd(Color.rgb(255,0,200));
palSelect(0);
pickColor(Color.hex(pal[0]));
drawColorPicker();

drawCanvas();

function foo(){
  console.log(Lib.mapToObj(bitmap.map));
}
window.foo=foo;