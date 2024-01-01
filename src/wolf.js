import * as THREE from "three";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const objLoader = new OBJLoader();
const mtlLoader = new MTLLoader();
const gltfLoader = new GLTFLoader();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // Active le zoom
controls.zoomSpeed = 1.0; // Ajuste la vitesse de zoom
controls.enableRotate = false;

// Grass

mtlLoader.load(
  "objects/grass/10450_Rectangular_Grass_Patch_v1_iterations-2.mtl",
  (materials) => {
    materials.preload();

    objLoader.setMaterials(materials);
    objLoader.load(
      "objects/grass/10450_Rectangular_Grass_Patch_v1_iterations-2.obj",
      (object) => {
        object.traverse((child) => {
          console.log(child.material);
          if (child instanceof THREE.Mesh && child.material.map) {
            child.material.map.repeat.set(0.5, 0.5);
            // child.material.map.needsUpdate = true;
          }
        });
        scene.add(object);
      }
    );
  }
);

// Wolf;
gltfLoader.load("objects/wolf/Wolf-Blender-2.82a.glb", (gltf) => {
  const wolf = gltf.scene;

  const desiredHeight = 20;

  // Calculez la hauteur actuelle du loup
  const box = new THREE.Box3().setFromObject(wolf);
  const currentHeight = box.max.y - box.min.y;

  const scale = desiredHeight / currentHeight;

  // Appliquez cette échelle au loup
  wolf.scale.set(scale, scale, scale);
  wolf.rotation.x = 900;
  wolf.rotation.y = 900;
  wolf.position.z = 0;

  scene.add(wolf);
});

// Light
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
light.intensity = 4;
scene.add(light);

camera.position.y = -400;
camera.position.z = 100;

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();
