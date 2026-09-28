const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

// Loader
window.addEventListener('load', () => setTimeout(() => $('#loader')?.classList.add('hidden'), 1200));

// Header + mobile navigation
const header = $('#siteHeader');
const menuToggle = $('#menuToggle');
const nav = $('#siteNav');
menuToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('menu-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
$$('.nav-link').forEach(link => link.addEventListener('click', () => {
  header.classList.remove('menu-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 60), {passive:true});

// Smooth anchors with header offset for browsers that ignore scroll-margin on nested containers
$$('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = $(link.getAttribute('href'));
  if (!target) return;
  event.preventDefault();
  const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 76) - 18;
  window.scrollTo({top, behavior:'smooth'});
}));

// Reveal animations
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, {threshold:0.08});
$$('.reveal').forEach(el => revealObserver.observe(el));

// Active nav
const navLinks = $$('.nav-link');
const sections = $$('main section[id]');
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, {rootMargin:'-45% 0px -45% 0px', threshold:0});
sections.forEach(section => sectionObserver.observe(section));

// Hero pointer motion — intentionally subtle
const heroPortrait = $('#heroPortrait');
window.addEventListener('pointermove', event => {
  if (!heroPortrait || window.innerWidth < 950) return;
  const rect = heroPortrait.getBoundingClientRect();
  if (event.clientX < rect.left - 100 || event.clientX > rect.right + 100 || event.clientY < rect.top - 100 || event.clientY > rect.bottom + 100) return;
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  heroPortrait.style.transform = `translate3d(${x*7}px, ${y*5}px, 0)`;
}, {passive:true});
heroPortrait?.addEventListener('pointerleave', () => heroPortrait.style.transform = '');

// Project filters
const filterButtons = $$('.filter-btn');
const projectCards = $$('.project-card[data-project]');
const projectCount = $('#projectCount');
const filterEmpty = $('#filterEmpty');
function applyFilter(filter){
  let visible = 0;
  projectCards.forEach(card => {
    const categories = (card.dataset.category || '').split(/\s+/);
    const match = filter === 'all' || categories.includes(filter);
    card.classList.toggle('hidden', !match);
    if (match) visible += 1;
  });
  projectCount.textContent = `${visible} ${visible === 1 ? 'project' : 'projects'}`;
  filterEmpty.hidden = visible > 0;
}
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  applyFilter(btn.dataset.filter);
}));

// Project data + modal
const projectData = {
  neural:{title:'Neural Network Layers from Scratch',type:'Deep Learning · Foundations',description:'Implemented fundamental neural-network layers from scratch to develop a deeper understanding of how neural networks operate internally.',status:'Personal learning project',tags:['Python','NumPy','Neural Networks','Deep Learning'],features:['Implemented fundamental neural-network layers from scratch.','Explored the structure and behaviour of individual layers and how data flows through a neural network.','Used the implementation to strengthen understanding of higher-level deep-learning frameworks.'],specs:{Language:'Python','Core library':'NumPy','Focus':'Neural network fundamentals','Goal':'Deeper conceptual understanding'},metrics:{Focus:'Foundations',Style:'From scratch',Outcome:'Deeper understanding'},code:'output = x @ weights + bias\nactivated = relu(output)'} ,
  'vision-guard':{title:'Vision Guard',type:'Computer Vision · Embedded Alerts',description:'Built a real-time computer-vision system using facial tracking and YOLO object detection to identify driver fatigue and micro-sleep events.',status:'Prototype / project',tags:['Python','YOLO','Computer Vision','Real-time','Embedded'],features:['Facial tracking and YOLO-based detection.','Camera-based monitoring for fatigue / micro-sleep events.','Adaptive visual, auditory and haptic alerting.'],specs:{Model:'YOLO',Processing:'Real-time vision',Input:'Camera stream',Alerts:'Visual · Audio · Haptic'},metrics:{Domain:'Driver safety',Mode:'Real-time',Output:'Multi-channel alerts'}},
  spider:{title:'Spider Robot',type:'Robotics · Embedded Control',description:'Designed and built a multi-legged robot using Arduino, a motor driver shield and servo mechanisms.',status:'Built / tested',tags:['Arduino','C/C++','Servo control','Bluetooth','Robotics'],features:['Multi-legged mechanical platform.','Autonomous and Bluetooth-controlled movement.','Iterative debugging of mechanical and control-logic faults.'],specs:{Controller:'Arduino',Actuation:'Servo motors',Control:'Autonomous + Bluetooth',Debugging:'Hardware + control logic'},metrics:{Domain:'Robotics',Control:'Servo + Bluetooth',Focus:'Physical systems'}},
  drone:{title:'Drone Development & Configuration',type:'Robotics · Flight Control',description:'Configured flight-control systems in Betaflight and tuned PID parameters for stability and control accuracy across multiple drone platforms.',status:'Built / field tested',tags:['Betaflight','PID tuning','Flight controllers','Diagnostics'],features:['Configured flight-control systems in Betaflight.','Tuned PID parameters for stability and control.','Field-tested multiple platforms and diagnosed real-world flight issues.'],specs:{Firmware:'Betaflight',Control:'PID tuning',Testing:'Field testing',Focus:'Stability + control'},metrics:{Domain:'UAV systems',Mode:'Real-world testing',Focus:'Flight control'}},
  wifi:{title:'Wi-Fi Network Analyzer',type:'Embedded Systems · Networking',description:'Developed a compact embedded tool using ESP32-C6 and an OLED display to scan and visualise nearby Wi-Fi networks in real time.',status:'Embedded prototype',tags:['ESP32-C6','Embedded C/C++','OLED','Wi-Fi'],features:['Real-time scanning of nearby Wi-Fi networks.','OLED display integration for local visualisation.','Compact embedded implementation.'],specs:{MCU:'ESP32-C6',Language:'Embedded C/C++',Display:'OLED',Use:'Network scanning'},metrics:{Mode:'Real-time',Domain:'Embedded',Output:'Local OLED view'}},
  traffic:{title:'IoT-Based Smart Traffic Management System',type:'IoT · Graph Algorithms · Simulation',description:'Implemented graph algorithms such as Prim’s, Kruskal’s and Dijkstra’s for route optimisation and intelligent traffic control.',status:'Academic / project',tags:['Python','Prim’s','Kruskal’s','Dijkstra','IoT'],features:['Route optimisation using graph algorithms.','Real-time traffic-flow monitoring simulation.','Adaptive signal-control logic.'],specs:{Language:'Python',Algorithms:'Prim’s · Kruskal’s · Dijkstra',Domain:'IoT simulation',Goal:'Route + traffic optimisation'},metrics:{Domain:'Smart transport',Mode:'Simulation',Core:'Graph algorithms'}},
  banking:{title:'Enterprise Banking ERP System',type:'Full-stack Software · Databases',description:'Built a full-stack ERP system with user/admin dashboards, secure authentication, payment gateway integration, audit logging and database security layers.',status:'Software project',tags:['Full-stack','MySQL','Authentication','Audit logging'],features:['User and admin dashboards.','Secure authentication and payment gateway integration.','Audit logging and database security layers.'],specs:{Frontend:'HTML / web stack',Database:'MySQL',Security:'Authentication + audit logging',Focus:'Enterprise workflows'},metrics:{Domain:'Enterprise software',Focus:'Security + workflows',Architecture:'Full-stack'}}
};
const modal = $('#projectModal');
const modalTitle = $('#modalTitle');
const modalType = $('#modalType');
const modalDescription = $('#modalDescription');
const modalBody = $('#modalBody');
const modalClose = $('#modalClose');
function esc(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[c]));}
function openProject(key){
  const p = projectData[key];
  if(!p) return;
  modalTitle.textContent = p.title;
  modalType.textContent = p.type;
  modalDescription.textContent = p.description;
  modalBody.innerHTML = `<div class="modal-tags">${p.tags.map(tag=>`<span class="modal-tag">${esc(tag)}</span>`).join('')}</div><div class="modal-grid"><article class="detail-card"><h3>Project overview</h3><p>${esc(p.description)}</p><p><strong>Status:</strong> ${esc(p.status)}</p></article><article class="detail-card"><h3>What I built / explored</h3><ul>${p.features.map(item=>`<li>${esc(item)}</li>`).join('')}</ul></article></div><article class="detail-card"><h3>Technical specification</h3><ul class="detail-list">${Object.entries(p.specs).map(([k,v])=>`<li><span>${esc(k)}</span><strong>${esc(v)}</strong></li>`).join('')}</ul></article><article class="detail-card"><h3>At a glance</h3><div class="metric-row">${Object.entries(p.metrics).map(([k,v])=>`<div class="metric"><strong>${esc(v)}</strong><span>${esc(k)}</span></div>`).join('')}</div></article>${p.code?`<article class="detail-card"><h3>Technical snapshot</h3><pre class="code-block">${esc(p.code)}</pre></article>`:''}`;
  modal.classList.add('active');
  modal.setAttribute('aria-hidden','false');
  document.body.classList.add('modal-open');
  modalClose?.focus();
}
function closeProject(){modal?.classList.remove('active');modal?.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open');}
projectCards.forEach(card => card.addEventListener('click', e => { if(e.target.closest('button')) return; openProject(card.dataset.project); }));
$$('.project-open').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); const card = e.currentTarget.closest('[data-project]'); openProject(card?.dataset.project); }));
modalClose?.addEventListener('click', closeProject);
modal?.addEventListener('click', e => { if(e.target.matches('[data-modal-close]')) closeProject(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape' && modal?.classList.contains('active')) closeProject(); });

// Contact form
const form = $('#contactForm');
const status = $('#formStatus');
const submitBtn = $('#submitBtn');
form?.addEventListener('submit', async e => {
  e.preventDefault();
  const data = new FormData(form);
  if(String(data.get('_gotcha') || '').trim()) return;
  status.textContent = '';
  status.className = 'form-status';
  submitBtn.disabled = true;
  submitBtn.style.opacity = '.65';
  $('#submitText').textContent = 'Sending';
  $('#submitIcon').textContent = '…';
  try{
    const response = await fetch(form.action,{method:'POST',body:data,headers:{Accept:'application/json'}});
    if(!response.ok) throw new Error('Request failed');
    form.reset();
    status.textContent = 'Message sent — thanks. I’ll get back to you by email.';
    status.classList.add('success');
    $('#submitText').textContent='Sent';
    $('#submitIcon').textContent='✓';
  }catch(err){
    console.error(err);
    status.textContent = 'Couldn’t send from the site. Please email md263401@gmail.com directly.';
    status.classList.add('error');
    $('#submitText').textContent='Send message';
    $('#submitIcon').textContent='↗';
  }finally{
    setTimeout(()=>{submitBtn.disabled=false;submitBtn.style.opacity='1';if(!status.classList.contains('success')){$('#submitText').textContent='Send message';$('#submitIcon').textContent='↗';}},2200);
  }
});

// Footer year + console helpers
$('#year').textContent = new Date().getFullYear();
window.viewProjects = () => $('#projects')?.scrollIntoView({behavior:'smooth'});
window.contactEngineer = () => $('#contact')?.scrollIntoView({behavior:'smooth'});
window.getSpecs = () => console.table({Frontend:'HTML + CSS + JavaScript',Responsive:'Yes',ProjectFilters:'Yes',ProjectModals:'Yes',Form:'Formspree'});
console.log('%cSHAUN DIAS · ENGINEERING PORTFOLIO','color:#ff6229;font-weight:800;font-size:13px');
console.log('%cTry viewProjects(), getSpecs(), contactEngineer()','color:#777');
