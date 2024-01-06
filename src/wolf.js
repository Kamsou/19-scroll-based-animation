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
renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // Active le zoom
controls.zoomSpeed = 1.0; // Ajuste la vitesse de zoom
controls.enableRotate = false;

// Wolf;

const textureLoader = new THREE.TextureLoader();
const myTexture = textureLoader.load(
  "objects/wolf/Material__wolf_col_tga_diffuse_jpeg.jpg",
  function (texture) {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(1, -1); // Inverser la texture sur l'axe Y
  }
);
const eyes = textureLoader.load("objects/wolf/eyes_diffuse_jpeg.jpg");
const fur = textureLoader.load("objects/wolf/fella3_Kopie_7.png");
const furAlpha = textureLoader.load("objects/wolf/Fur_Alpha_3.png");
const furNormal = textureLoader.load("objects/wolf/Fur_2.png");

let mixer;
let wolf;
let runAction, idleAction;
let currentAction;

gltfLoader.load("objects/wolf/Wolf-Blender-2.82a.glb", (gltf) => {
  wolf = gltf.scene;

  const desiredHeight = 40;

  // add texture
  wolf.traverse((object) => {
    console.log(object);
    if (object.name === "Wolf1_Material__wolf_col_tga_0") {
      object.material.map = myTexture;
      object.material.needsUpdate = true;
    }

    if (object.name === "Wolf3_eyes_0") {
      object.material.map = eyes;
      object.material.needsUpdate = true;
    }

    if (object.name === "Wolf2_fur__fella3_jpg_001_0") {
      object.material.map = fur;
      object.material.alphaMap = furAlpha;
      object.material.transparent = true;
      object.material.needsUpdate = true;
    }
  });

  // Calculez la hauteur actuelle du loup
  const box = new THREE.Box3().setFromObject(wolf);
  const currentHeight = box.max.y - box.min.y;

  const scale = desiredHeight / currentHeight;

  console.log(wolf);

  // Appliquez cette échelle au loup
  wolf.scale.set(scale, scale, scale);
  wolf.rotation.x = 850;
  wolf.rotation.y = 900;
  wolf.position.z = 0;

  // Créez un AnimationMixer et associez-le au loup
  mixer = new THREE.AnimationMixer(wolf);

  // Si des animations sont disponibles, jouez la première
  runAction = mixer.clipAction(gltf.animations[0]);
  idleAction = mixer.clipAction(gltf.animations[4]);
  currentAction = idleAction.play();

  scene.add(wolf);
});

function switchAnimation() {
  // Jouer l'animation de course si l'une des touches de mouvement est enfoncée
  if (moveForward || moveBackward || rotateLeft || rotateRight) {
    if (currentAction !== runAction) {
      currentAction.fadeOut(0.5);
      runAction.reset().fadeIn(0.5).play();
      currentAction = runAction;
    }
  } else {
    // Revenir à l'animation d'inactivité si aucune touche de mouvement n'est enfoncée
    if (currentAction !== idleAction) {
      currentAction.fadeOut(0.5);
      idleAction.reset().fadeIn(0.5).play();
      currentAction = idleAction;
    }
  }
}

// Variables pour le contrôle du mouvement
let moveForward = false;
let moveBackward = false;
let rotateLeft = false;
let rotateRight = false;

// Vitesse et rotation
const wolfSpeed = 0.1;
const wolfRotationSpeed = 0.05;

// Gestionnaire d'événements pour les touches
document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

function onKeyDown(event) {
  let somethingChanged = false;
  switch (event.code) {
    case "ArrowUp":
      moveForward = true;
      somethingChanged = true;
      break;
    case "ArrowDown":
      moveBackward = true;
      somethingChanged = true;
      break;
    case "ArrowLeft":
      rotateLeft = true;
      somethingChanged = true;
      break;
    case "ArrowRight":
      rotateRight = true;
      somethingChanged = true;
      break;
  }

  if (somethingChanged) switchAnimation();
}

function onKeyUp(event) {
  let somethingChanged = false;
  switch (event.code) {
    case "ArrowUp":
      moveForward = false;
      somethingChanged = true;
      break;
    case "ArrowDown":
      moveBackward = false;
      somethingChanged = true;
      break;
    case "ArrowLeft":
      rotateLeft = false;
      somethingChanged = true;
      break;
    case "ArrowRight":
      rotateRight = false;
      somethingChanged = true;
      break;
  }

  if (somethingChanged) switchAnimation();
}

// Light
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
light.intensity = 4;
scene.add(light);

// Ajustement de la caméra
camera.position.set(0, -290, 100); // Ajustez la position de la caméra
camera.lookAt(scene.position);

function animate() {
  requestAnimationFrame(animate);

  if (wolf) {
    // Mise à jour de la position et de l'orientation du loup
    if (moveForward) wolf.position.z -= wolfSpeed;
    if (moveBackward) wolf.position.z += wolfSpeed;
    if (rotateLeft) wolf.rotation.y += wolfRotationSpeed;
    if (rotateRight) wolf.rotation.y -= wolfRotationSpeed;
  }

  // Mise à jour de l'AnimationMixer
  const delta = clock.getDelta(); // Assurez-vous d'avoir une instance de THREE.Clock
  if (mixer) mixer.update(delta);

  controls.update();
  renderer.render(scene, camera);
}

const clock = new THREE.Clock();

animate();
