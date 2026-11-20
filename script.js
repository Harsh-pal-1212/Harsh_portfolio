// ===================================================
//  Harsh Pal - 3D Portfolio  (script.js)
// ===================================================

// ---------- 1. Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();

// ---------- 2. Mobile menu ----------
const menuBtn = document.getElementById("menuBtn");
const navLinks = document.getElementById("navLinks");
menuBtn.addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => navLinks.classList.remove("open"))
);

// ---------- 3. Typing effect ----------
const roles = ["Software Developer", "Web Developer", "C/C++ Programmer", "Problem Solver"];
const typingEl = document.getElementById("typing");
let roleIdx = 0;
let charIdx = roles[0].length;   // pehla role poora dikhta hai
let deleting = true;             // pehle usse mitayenge

function typeLoop() {

  if (deleting) {
    charIdx--;                                   // ek letter mitao
    if (charIdx === 0) {
      deleting = false;
      roleIdx = (roleIdx + 1) % roles.length;    // agla role
    }
  } else {
    charIdx++;                                   // ek letter likho
    if (charIdx === roles[roleIdx].length) {
      deleting = true;
      typingEl.textContent = roles[roleIdx];
      setTimeout(typeLoop, 1800);                // poora likh kar thoda ruko
      return;
    }
  }

  typingEl.textContent = roles[roleIdx].slice(0, charIdx) || " ";
  setTimeout(typeLoop, deleting ? 50 : 90);
}
setTimeout(typeLoop, 2000);

// ---------- 4. Scroll reveal + skill bars ----------
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("show");
      entry.target.querySelectorAll(".skill").forEach((s) => {
        s.querySelector(".bar div").style.width = s.dataset.level + "%";
      });
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ---------- 5. Active nav link while scrolling ----------
const sections = document.querySelectorAll("main section");
const links = document.querySelectorAll("#navLinks a");
window.addEventListener("scroll", () => {
  let current = "home";
  sections.forEach((sec) => {
    if (window.scrollY >= sec.offsetTop - 200) current = sec.id;
  });
  links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + current));
});

// ---------- 6. 3D tilt on cards ----------
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion) {
  document.querySelectorAll(".tilt").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;   // -0.5 .. 0.5
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform =
        `perspective(900px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(900px) rotateX(0) rotateY(0) scale(1)";
    });
  });

  // ---------- 7. 3D tilt on hero photo (follows the mouse) ----------
  const photo = document.getElementById("heroPhoto");
  window.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    photo.style.transform = `rotateY(${x * 28}deg) rotateX(${-y * 28}deg)`;
  });
}

// ---------- 8. Three.js 3D background ----------
(function initThree() {
  if (typeof THREE === "undefined") return;   // CDN load nahi hua to skip

  const canvas = document.getElementById("bg3d");
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 14;

  // Floating particles
  const COUNT = 700;
  const pos = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT * 3; i++) pos[i] = (Math.random() - 0.5) * 50;
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({ color: 0xff2a2a, size: 0.08, transparent: true, opacity: 0.8 })
  );
  scene.add(particles);

  // Wireframe shapes
  const shapes = [];
  const geos = [
    new THREE.IcosahedronGeometry(2.2, 0),
    new THREE.OctahedronGeometry(1.4, 0),
    new THREE.TorusGeometry(1.2, 0.3, 10, 40),
    new THREE.BoxGeometry(1.6, 1.6, 1.6),
  ];
  const spots = [[-9, 4, -4], [9, -3, -6], [-8, -6, -3], [8, 6, -8]];
  geos.forEach((g, i) => {
    const m = new THREE.Mesh(
      g,
      new THREE.MeshBasicMaterial({ color: 0xff2a2a, wireframe: true, transparent: true, opacity: 0.35 })
    );
    m.position.set(...spots[i]);
    scene.add(m);
    shapes.push(m);
  });

  // Mouse parallax
  let mx = 0, my = 0;
  window.addEventListener("mousemove", (e) => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // Scroll moves camera a little (depth feel)
  let scrollY = 0;
  window.addEventListener("scroll", () => (scrollY = window.scrollY));

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0007;
    particles.rotation.x += 0.0002;
    shapes.forEach((s, i) => {
      s.rotation.x += 0.004 + i * 0.001;
      s.rotation.y += 0.005 + i * 0.001;
    });
    camera.position.x += (mx * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (-my * 1.0 - scrollY * 0.002 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  if (!reduceMotion) animate(); else renderer.render(scene, camera);
})();
