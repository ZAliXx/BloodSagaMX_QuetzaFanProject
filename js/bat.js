const CHARACTERS = [
  { name: "Bat 1",      src: "../assets/img/bat/bat1.png" },
  { name: "Bat 2",      src: "../assets/img/bat/bat2.png" },
  { name: "Jake",       src: "../assets/img/bat/jake.png" },
  { name: "Jay",        src: "../assets/img/bat/jay.png" },
  { name: "Jungwon",    src: "../assets/img/bat/jungwon.png" },
  { name: "Niki",       src: "../assets/img/bat/niki.png" },
  { name: "Sunghoon",   src: "../assets/img/bat/sunghoon.png" },
  { name: "Sunoo",      src: "../assets/img/bat/sunoo.png" },
];

const ACCESSORY_CATEGORIES = {
  lentes: [
    { name: "Lentes 1", src: "assets/accesorios/lentes/lentes1.png" },
    { name: "Lentes 2", src: "assets/accesorios/lentes/lentes2.png" },
  ],
  monos: [
    { name: "Moño 1", src: "assets/accesorios/monos/mono1.png" },
    { name: "Moño 2", src: "assets/accesorios/monos/mono2.png" },
  ],
  flores: [
    { name: "Flor 1", src: "assets/accesorios/flores/flor1.png" },
    { name: "Flor 2", src: "assets/accesorios/flores/flor2.png" },
  ],
};

// Textos de la polaroid
const POLAROID_TITLE_LINES = ["BLOOD", "SAGA"];
const POLAROID_DATE = "11-07-2026";
const POLAROID_SIGNATURE = "Con cariño dear_myself_20";

let currentCategory = "lentes";
let accessories = []; // { id, el, img, xPercent, yPercent, widthPercent, aspect, rotation }
let accessoryIdCounter = 0;
let selectedAccessoryId = null;
let frameColor = "#7c1c1f";

const characterListEl = document.getElementById('character-list');
const characterUploadEl = document.getElementById('character-upload');
const baseImageEl = document.getElementById('base-image');

const accessoryListEl = document.getElementById('accessory-list');
const accessoryUploadEl = document.getElementById('accessory-upload');
const tabButtons = document.querySelectorAll('.tab-btn');

const stageEl = document.getElementById('stage');

const frameColorInput = document.getElementById('frame-color');
const presetButtons = document.querySelectorAll('.preset');
const generateBtn = document.getElementById('generate-btn');

const resultOverlay = document.getElementById('result-overlay');
const polaroidCanvas = document.getElementById('polaroid-canvas');
const downloadBtn = document.getElementById('download-btn');
const closeOverlayBtn = document.getElementById('close-overlay-btn');

function renderCharacterList(){
  characterListEl.innerHTML = '';
  CHARACTERS.forEach((char, index) => {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.title = char.name;
    const img = document.createElement('img');
    img.src = char.src;
    img.alt = char.name;
    img.onerror = () => { thumb.style.opacity = '0.3'; };
    thumb.appendChild(img);
    thumb.addEventListener('click', () => selectCharacter(char.src, thumb));
    characterListEl.appendChild(thumb);
    if(index === 0) selectCharacter(char.src, thumb);
  });
}

function selectCharacter(src, thumbEl){
  baseImageEl.src = src;
  document.querySelectorAll('#character-list .thumb').forEach(t => t.classList.remove('selected'));
  if(thumbEl) thumbEl.classList.add('selected');
}

characterUploadEl.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  selectCharacter(url, null);
  document.querySelectorAll('#character-list .thumb').forEach(t => t.classList.remove('selected'));
});

function renderAccessoryList(){
  accessoryListEl.innerHTML = '';
  const items = ACCESSORY_CATEGORIES[currentCategory] || [];
  items.forEach(acc => {
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.title = acc.name;
    const img = document.createElement('img');
    img.src = acc.src;
    img.alt = acc.name;
    img.onerror = () => { thumb.style.opacity = '0.3'; };
    thumb.appendChild(img);
    thumb.addEventListener('click', () => addAccessoryToStage(acc.src));
    accessoryListEl.appendChild(thumb);
  });
}

tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentCategory = btn.dataset.category;
    renderAccessoryList();
  });
});

accessoryUploadEl.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const url = URL.createObjectURL(file);
  ACCESSORY_CATEGORIES[currentCategory].push({ name: file.name, src: url });
  renderAccessoryList();
  addAccessoryToStage(url);
});

function addAccessoryToStage(src){
  const img = new Image();
  img.onload = () => {
    const id = 'acc-' + (accessoryIdCounter++);
    const el = document.createElement('div');
    el.className = 'accessory';
    el.dataset.id = id;

    const imgEl = document.createElement('img');
    imgEl.src = src;
    imgEl.draggable = false;
    el.appendChild(imgEl);

    const deleteHandle = document.createElement('div');
    deleteHandle.className = 'handle handle-delete';
    deleteHandle.textContent = '✕';
    el.appendChild(deleteHandle);

    const rotateHandle = document.createElement('div');
    rotateHandle.className = 'handle handle-rotate';
    rotateHandle.textContent = '⟳';
    el.appendChild(rotateHandle);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'handle handle-resize';
    resizeHandle.textContent = '⤡';
    el.appendChild(resizeHandle);

    stageEl.appendChild(el);

    const accessory = {
      id,
      el,
      img: imgEl,
      xPercent: 0.5,
      yPercent: 0.5,
      widthPercent: 0.4,
      aspect: img.naturalHeight / img.naturalWidth,
      rotation: 0
    };
    accessories.push(accessory);
    updateAccessoryStyle(accessory);
    selectAccessory(id);

    attachAccessoryEvents(accessory, deleteHandle, rotateHandle, resizeHandle);
  };
  img.src = src;
}

function updateAccessoryStyle(acc){
  const S = stageEl.clientWidth;
  const w = acc.widthPercent * S;
  const h = w * acc.aspect;
  const cx = acc.xPercent * S;
  const cy = acc.yPercent * S;
  acc.el.style.width = w + 'px';
  acc.el.style.height = h + 'px';
  acc.el.style.left = (cx - w / 2) + 'px';
  acc.el.style.top = (cy - h / 2) + 'px';
  acc.el.style.transform = `rotate(${acc.rotation}deg)`;
}

function selectAccessory(id){
  selectedAccessoryId = id;
  accessories.forEach(a => a.el.classList.toggle('selected', a.id === id));
}

function deselectAll(){
  selectedAccessoryId = null;
  accessories.forEach(a => a.el.classList.remove('selected'));
}

function removeAccessory(id){
  const acc = accessories.find(a => a.id === id);
  if(!acc) return;
  acc.el.remove();
  accessories = accessories.filter(a => a.id !== id);
  if(selectedAccessoryId === id) selectedAccessoryId = null;
}

stageEl.addEventListener('pointerdown', (e) => {
  if(e.target === stageEl || e.target === baseImageEl){
    deselectAll();
  }
});

function attachAccessoryEvents(acc, deleteHandle, rotateHandle, resizeHandle){

  acc.el.addEventListener('pointerdown', (e) => {
    if(e.target === deleteHandle || e.target === rotateHandle || e.target === resizeHandle) return;
    e.stopPropagation();
    selectAccessory(acc.id);

    const stageRect = stageEl.getBoundingClientRect();
    const S = stageEl.clientWidth;
    const startCx = acc.xPercent * S;
    const startCy = acc.yPercent * S;
    const startPointerX = e.clientX - stageRect.left;
    const startPointerY = e.clientY - stageRect.top;

    const pointerId = e.pointerId;
    acc.el.setPointerCapture(pointerId);

    function onMove(ev){
      const px = ev.clientX - stageRect.left;
      const py = ev.clientY - stageRect.top;
      const newCx = startCx + (px - startPointerX);
      const newCy = startCy + (py - startPointerY);
      acc.xPercent = Math.min(1, Math.max(0, newCx / S));
      acc.yPercent = Math.min(1, Math.max(0, newCy / S));
      updateAccessoryStyle(acc);
    }
    function onUp(){
      acc.el.removeEventListener('pointermove', onMove);
      acc.el.removeEventListener('pointerup', onUp);
    }
    acc.el.addEventListener('pointermove', onMove);
    acc.el.addEventListener('pointerup', onUp);
  });

  deleteHandle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    removeAccessory(acc.id);
  });

  rotateHandle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const stageRect = stageEl.getBoundingClientRect();
    const S = stageEl.clientWidth;
    const centerX = stageRect.left + acc.xPercent * S;
    const centerY = stageRect.top + acc.yPercent * S;
    const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    const startRotation = acc.rotation;

    const pointerId = e.pointerId;
    rotateHandle.setPointerCapture(pointerId);

    function onMove(ev){
      const angle = Math.atan2(ev.clientY - centerY, ev.clientX - centerX) * 180 / Math.PI;
      acc.rotation = startRotation + (angle - startAngle);
      updateAccessoryStyle(acc);
    }
    function onUp(){
      rotateHandle.removeEventListener('pointermove', onMove);
      rotateHandle.removeEventListener('pointerup', onUp);
    }
    rotateHandle.addEventListener('pointermove', onMove);
    rotateHandle.addEventListener('pointerup', onUp);
  });

  resizeHandle.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    const stageRect = stageEl.getBoundingClientRect();
    const S = stageEl.clientWidth;
    const centerX = stageRect.left + acc.xPercent * S;
    const centerY = stageRect.top + acc.yPercent * S;
    const startDist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
    const startWidthPercent = acc.widthPercent;

    const pointerId = e.pointerId;
    resizeHandle.setPointerCapture(pointerId);

    function onMove(ev){
      const dist = Math.hypot(ev.clientX - centerX, ev.clientY - centerY);
      const scale = dist / startDist;
      acc.widthPercent = Math.min(0.9, Math.max(0.08, startWidthPercent * scale));
      updateAccessoryStyle(acc);
    }
    function onUp(){
      resizeHandle.removeEventListener('pointermove', onMove);
      resizeHandle.removeEventListener('pointerup', onUp);
    }
    resizeHandle.addEventListener('pointermove', onMove);
    resizeHandle.addEventListener('pointerup', onUp);
  });
}

window.addEventListener('resize', () => {
  accessories.forEach(updateAccessoryStyle);
});

frameColorInput.addEventListener('input', (e) => {
  frameColor = e.target.value;
});

presetButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    frameColor = btn.dataset.color;
    frameColorInput.value = frameColor;
  });
});

function getReadableTextColor(hexColor){
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#1a0d0d' : '#f3e9de';
}

function drawCover(ctx, img, dx, dy, dw, dh){
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const imgRatio = iw / ih;
  const destRatio = dw / dh;
  let sx, sy, sw, sh;
  if(imgRatio > destRatio){
    sh = ih;
    sw = ih * destRatio;
    sx = (iw - sw) / 2;
    sy = 0;
  } else {
    sw = iw;
    sh = iw / destRatio;
    sx = 0;
    sy = (ih - sh) / 2;
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
}

function buildPolaroid(){
  const PHOTO_SIZE = 800;
  const PAD_SIDE = 60;
  const PAD_TOP = 170;
  const PAD_BOTTOM = 140;

  const canvasWidth = PHOTO_SIZE + PAD_SIDE * 2;
  const canvasHeight = PHOTO_SIZE + PAD_TOP + PAD_BOTTOM;

  polaroidCanvas.width = canvasWidth;
  polaroidCanvas.height = canvasHeight;
  const ctx = polaroidCanvas.getContext('2d');

  ctx.fillStyle = frameColor;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const photoCanvas = document.createElement('canvas');
  photoCanvas.width = PHOTO_SIZE;
  photoCanvas.height = PHOTO_SIZE;
  const pctx = photoCanvas.getContext('2d');

  pctx.fillStyle = '#111';
  pctx.fillRect(0, 0, PHOTO_SIZE, PHOTO_SIZE);
  if(baseImageEl.src){
    drawCover(pctx, baseImageEl, 0, 0, PHOTO_SIZE, PHOTO_SIZE);
  }

  accessories.forEach(acc => {
    const w = acc.widthPercent * PHOTO_SIZE;
    const h = w * acc.aspect;
    const cx = acc.xPercent * PHOTO_SIZE;
    const cy = acc.yPercent * PHOTO_SIZE;
    pctx.save();
    pctx.translate(cx, cy);
    pctx.rotate(acc.rotation * Math.PI / 180);
    pctx.drawImage(acc.img, -w / 2, -h / 2, w, h);
    pctx.restore();
  });

  ctx.drawImage(photoCanvas, PAD_SIDE, PAD_TOP, PHOTO_SIZE, PHOTO_SIZE);

  const textColor = getReadableTextColor(frameColor);
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.font = "700 66px 'Cinzel Decorative', Georgia, serif";
  ctx.fillText(POLAROID_TITLE_LINES[0], canvasWidth / 2, 68);
  ctx.fillText(POLAROID_TITLE_LINES[1], canvasWidth / 2, 135);

  ctx.font = "700 42px 'Dancing Script', cursive";
  ctx.fillText(POLAROID_DATE, canvasWidth / 2, PAD_TOP + PHOTO_SIZE + 65);

  ctx.font = "600 26px 'Dancing Script', cursive";
  ctx.globalAlpha = 0.9;

  ctx.save();
  ctx.translate(PAD_SIDE * 0.55, PAD_TOP + PHOTO_SIZE / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(POLAROID_SIGNATURE, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.translate(canvasWidth - PAD_SIDE * 0.55, PAD_TOP + PHOTO_SIZE / 2);
  ctx.rotate(Math.PI / 2);
  ctx.fillText(POLAROID_SIGNATURE, 0, 0);
  ctx.restore();

  ctx.globalAlpha = 1;
}

async function ensureFontsLoaded(){
  try{
    await Promise.all([
      document.fonts.load("700 66px 'Cinzel Decorative'"),
      document.fonts.load("700 42px 'Dancing Script'"),
      document.fonts.load("600 26px 'Dancing Script'")
    ]);
  }catch(e){
  }
}

generateBtn.addEventListener('click', async () => {
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generando...';
  await ensureFontsLoaded();
  buildPolaroid();
  resultOverlay.classList.remove('hidden');
  generateBtn.disabled = false;
  generateBtn.textContent = 'Generar Polaroid';
});

closeOverlayBtn.addEventListener('click', () => {
  resultOverlay.classList.add('hidden');
});

downloadBtn.addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'blood-saga-mexico-polaroid.png';
  link.href = polaroidCanvas.toDataURL('image/png');
  link.click();
});

renderCharacterList();
renderAccessoryList();