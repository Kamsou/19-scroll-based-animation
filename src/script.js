import * as THREE from "three";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import GUI from "lil-gui";
import gsap from "gsap";

/**
 * Debug
 */
const gui = new GUI();

const parameters = {
  materialColor: "#ffeded",
};

gui.addColor(parameters, "materialColor");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */

// Texture
const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load("textures/gradients/3.jpg");
gradientTexture.magFilter = THREE.NearestFilter;

// Materials
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
});

// Meshes
// const objectsDistance = 4;
// const mesh1 = new THREE.Mesh(
//   new THREE.TorusGeometry(0.5, 0.2, 16, 100),
//   material
// );

// const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 16, 100), material);

// const mesh3 = new THREE.Mesh(
//   new THREE.TorusGeometry(0.5, 0.2, 16, 100),
//   material
// );

// mesh1.position.y = -objectsDistance * 0;
// mesh2.position.y = -objectsDistance * 1;
// mesh3.position.y = -objectsDistance * 2;

// mesh1.position.x = 1;
// mesh2.position.x = -1;
// mesh3.position.x = 1;

// scene.add(mesh1, mesh2, mesh3);
// const sectionMeshes = [mesh1, mesh2, mesh3];

// Objects
const objectsDistance = 4;
const objLoader = new OBJLoader();
const greenMaterial = new THREE.MeshStandardMaterial({ color: 0x0b6623 });
const redMaterial = new THREE.MeshStandardMaterial({ color: 0x8b0000 });
const yellowMaterial = new THREE.MeshStandardMaterial({ color: 0xffd700 });
let sectionMeshes = [];

function adjustObjectPositionX(obj, position, mobilePosition) {
  if (window.innerWidth < 500) {
    obj.position.x = mobilePosition;
  } else {
    obj.position.x = position;
  }
}

objLoader.load("objects/christmas-tree-1.obj", (obj) => {
  if (obj.isGroup) {
    obj.children.forEach((child) => {
      child.material = greenMaterial;
    });
  } else {
    obj.material = greenMaterial;
  }

  obj.position.y = -objectsDistance * 0.2;
  obj.rotation.x = THREE.MathUtils.degToRad(-90);
  obj.scale.set(0.17, 0.17, 0.17);
  scene.add(obj);
  sectionMeshes[0] = obj;

  adjustObjectPositionX(obj, 1.5, 0.2);
});

objLoader.load("objects/christmas-tree-2.obj", (obj) => {
  if (obj.isGroup) {
    obj.children.forEach((child) => {
      child.material = redMaterial;
    });
  } else {
    obj.material = redMaterial;
  }
  obj.position.y = -objectsDistance * 1.1;
  obj.rotation.x = THREE.MathUtils.degToRad(-90);
  obj.scale.set(0.2, 0.2, 0.2);
  scene.add(obj);
  sectionMeshes[1] = obj;

  adjustObjectPositionX(obj, -1, -0.2);
});

objLoader.load("objects/christmas-tree-3.obj", (obj) => {
  if (obj.isGroup) {
    obj.children.forEach((child) => {
      child.material = yellowMaterial;
    });
  } else {
    obj.material = yellowMaterial;
  }

  obj.position.y = -objectsDistance * 2.1;
  obj.rotation.x = THREE.MathUtils.degToRad(-110);
  obj.scale.set(0.1, 0.1, 0.1);
  scene.add(obj);
  sectionMeshes[2] = obj;

  adjustObjectPositionX(obj, 1, 0.3);
});

function onWindowResize() {
  adjustObjectPositionX(sectionMeshes[0], 1.5, 0);
  adjustObjectPositionX(sectionMeshes[1], -1, 0);
  adjustObjectPositionX(sectionMeshes[2], 1, 0);
}

window.addEventListener("resize", onWindowResize);

/**
 * Particles
 */

// Geometry
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] =
    objectsDistance * 0.5 - Math.random() * objectsDistance * 3;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute(
  "position",
  new THREE.BufferAttribute(positions, 3)
);

// Material
const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
});

// Points
const particles = new THREE.Points(particleGeometry, particlesMaterial);
scene.add(particles);

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight("#ffffff", 5);
directionalLight.position.set(2, 2, 2);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Group camera
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 6;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/*
 * Scroll
 */

let scrollY = window.scrollY;
let currentSection = 0;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;

  const newSection = Math.round(scrollY / sizes.height);

  //   if (newSection !== currentSection) {
  //     currentSection = newSection;

  //     gsap.to(sectionMeshes[currentSection].rotation, {
  //       duration: 1.5,
  //       ease: "power2.inOut",
  //       x: "+=6",
  //       y: "+=3",
  //       z: "+=1.5",
  //     });
  //   }
});

/**
 * Cursor
 */

const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener("mousemove", (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = -(event.clientY / sizes.height - 0.5);
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate camera
  camera.position.y = (-scrollY / sizes.height) * objectsDistance;

  const parallaxX = cursor.x * 0.5;
  const parallaxY = cursor.y * 0.5;

  cameraGroup.position.x +=
    (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y +=
    (parallaxY - cameraGroup.position.y) * 5 * deltaTime;

  // Animate meshes
  sectionMeshes.forEach((mesh) => {
    mesh.rotation.z = Math.sin(elapsedTime) * 0.05;
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();