// Importation de Three.js
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// TOGGLE
const useAxesHelper = false;

// SCENE
const scene = new THREE.Scene();

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
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

// LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.castShadow = true;
directionalLight.position.set(100, 100, 200);
scene.add(ambientLight, directionalLight);

// Particles
const particleCount = 10000;
const radius = 5;
const boundary = radius + 0.5; // Limite autour de la sphère (5 cm en plus)
const particlesGeometry = new THREE.BufferGeometry();
const positions = [];
const velocities = [];

for (let i = 0; i < particleCount; i++) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  positions.push(x, y, z);
  velocities.push(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.02
  );
}

const opacities = new Float32Array(particleCount); // Opacité pour chaque particule
for (let i = 0; i < particleCount; i++) {
  opacities[i] = 1.0; // Opacité initiale complète
}
particlesGeometry.setAttribute(
  "opacity",
  new THREE.BufferAttribute(opacities, 1)
);

particlesGeometry.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(positions, 3)
);

const particlesMaterial = new THREE.PointsMaterial({
  color: 0xf7e16b,
  size: 0.07,
});
const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particleSystem);

// Core
const coreGeometry = new THREE.SphereGeometry(1.3, 60, 60);
const coreVertexShader = `
varying vec3 vNormal;
uniform float time;

void main() {
  vNormal = normal;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const coreFragmentShader = `
varying vec3 vNormal;
uniform vec3 lightDirection;

void main() {
  vec3 normalizedNormal = normalize(vNormal);
  vec3 normLightDir = normalize(lightDirection - vec3(0.0, 0.0, 0.0)); // Normalisation de la direction de la lumière

  float lightIntensity = dot(normalizedNormal, normLightDir);
  lightIntensity = clamp(lightIntensity, 0.0, 1.0);

  vec4 yellowColor = vec4(0.9686, 0.7824, 0.5196, 0.9); 
  vec4 shadowColor = vec4(0.0, 0.0, 0.0, 0.3); 

  gl_FragColor = mix(shadowColor, yellowColor, lightIntensity);
}
`;

const coreMaterial = new THREE.ShaderMaterial({
  vertexShader: coreVertexShader,
  fragmentShader: coreFragmentShader,
  uniforms: {
    time: { value: 0 },
    lightDirection: { value: directionalLight.position }, // Ajouter la direction de la lumière
  },
});
const core = new THREE.Mesh(coreGeometry, coreMaterial);
core.castShadow = true; // Permettre au noyau de projeter des ombres
core.receiveShadow = true; // Permettre au noyau de recevoir des ombres
scene.add(core);
scene.add(core);

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

  const positions = particleSystem.geometry.attributes.position.array;
  const opacities = particleSystem.geometry.attributes.opacity.array;

  for (let i = 0; i < positions.length; i += 3) {
    const slowFactor = 0.3; // Plus la valeur est petite, plus l'animation est lente

    positions[i] += velocities[(i / 3) * 3] * slowFactor;
    positions[i + 1] += velocities[(i / 3) * 3 + 1] * slowFactor;
    positions[i + 2] += velocities[(i / 3) * 3 + 2] * slowFactor;

    const distance = Math.sqrt(
      positions[i] * positions[i] +
        positions[i + 1] * positions[i + 1] +
        positions[i + 2] * positions[i + 2]
    );
    if (distance > boundary) {
      opacities[i / 3] -= 0.01; // Réduire l'opacité
      if (opacities[i / 3] <= 0) {
        // Réinitialiser la particule
        opacities[i / 3] = 1.0;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
      }
    }
  }

  particleSystem.geometry.attributes.position.needsUpdate = true;
  particleSystem.geometry.attributes.opacity.needsUpdate = true;

  renderer.render(scene, camera);
};

render();
