// Importation de Three.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// TOGGLE
const useAxesHelper = false;

// SCENE
const scene = new THREE.Scene();

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(0xfffeeb);
document.body.appendChild(renderer.domElement);

// CAMERA
const fov = 60;
const aspect = window.innerWidth / window.innerHeight;
const minClip = 1;
const maxClip = 1000;
const camera = new THREE.PerspectiveCamera(fov, aspect, minClip, maxClip);
camera.position.set(0, 0, 15);
camera.lookAt(scene.position);
scene.add(camera);

// Paramètres des particules
const particleCount = 10000; // Nombre de particules
const radius = 5; // Rayon de la sphère de particules

// Création de la géométrie des particules
const particlesGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3); // x, y, z pour chaque particule

for (let i = 0; i < particleCount; i++) {
  // Position aléatoire dans une sphère
  const x = (Math.random() - 0.5) * 2 * radius;
  const y = (Math.random() - 0.5) * 2 * radius;
  const z = (Math.random() - 0.5) * 2 * radius;
  const distance = Math.sqrt(x * x + y * y + z * z);
  if (distance < radius) {
    // S'assurer que les particules sont à l'intérieur du rayon
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }
}

particlesGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Création du matériau des particules
const particlesMaterial = new THREE.PointsMaterial({
  color: 0x901617,
  size: 0.05, // Taille des particules
  transparent: true,
});

// Création de l'objet Points
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// Création du noyau
const coreGeometry = new THREE.SphereGeometry(1.5, 60, 60); // Plus petite sphère pour le noyau
const coreMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xf7e16b, // Couleur différente pour le noyau
  emissive: 0x221100, // Légère émission pour un effet énergétique
  transparent: true,
  opacity: 0.6,
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
scene.add(core); // Ajoutez le noyau à la scène

// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.position.set(100, 100, 200);
scene.add(ambientLight, directionalLight);

// HELPERS
const axes = new THREE.AxesHelper(20);
useAxesHelper && scene.add(axes);

// ORBIT CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);

// DEBUGGER
// const gui = new dat.GUI();

// const cameraGui = gui.addFolder("camera");
// cameraGui.add(camera.position, "x");
// cameraGui.add(camera.position, "y");
// cameraGui.add(camera.position, "z");

// HANDLERS
const windowResizeHandler = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  controls.update();
};

// LISTENERS
window.addEventListener("resize", windowResizeHandler, false);

// MAIN RENDER
const render = () => {
  requestAnimationFrame(render);

  particleSystem.rotation.y += 0.001;

  core.rotation.x += 0.001; // Rotation du noyau
  core.rotation.y += 0.001;
  renderer.render(scene, camera);
};

render();
