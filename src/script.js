// Importation de Three.js
import * as THREE from "three";

// Initialisation de la scène, de la caméra et du rendu
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Charger une texture pour le bump map
const textureLoader = new THREE.TextureLoader();
const bumpTexture = textureLoader.load("textures/2k_venus_surface.jpg"); // Remplacer par le chemin d'accès à votre texture

// Création de la sphère avec un matériau détaillé
const sphereGeometry = new THREE.SphereGeometry(5, 32, 32);
const sphereMaterial = new THREE.MeshStandardMaterial({
  bumpMap: bumpTexture,
  bumpScale: 0.5,
});
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphere);

// Ajouter une source de lumière pour mettre en évidence le bump map
const light = new THREE.PointLight(0xffffff, 90);
light.position.set(1, 1, 10);
scene.add(light);

// Position de la caméra
camera.position.z = 15;

// Fonction d'animation
function animate() {
  requestAnimationFrame(animate);

  // Rotation de la sphère
  sphere.rotation.x += 0.005;
  sphere.rotation.y += 0.005;

  // Rendu de la scène
  renderer.render(scene, camera);
}

// Lancement de l'animation
animate();
