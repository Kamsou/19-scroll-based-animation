import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const loaderElement = document.createElement("div");
loaderElement.style.position = "absolute";
loaderElement.style.top = "0";
loaderElement.style.left = "0";
loaderElement.style.width = "100%";
loaderElement.style.height = "100%";
loaderElement.style.display = "flex";
loaderElement.style.justifyContent = "center";
loaderElement.style.alignItems = "center";
loaderElement.style.backgroundColor = "rgba(0, 0, 0, 1)"; // Fond semi-transparent
loaderElement.style.color = "white";
loaderElement.style.fontSize = "2em";
document.body.appendChild(loaderElement);

// 1. Initialisation du LoadingManager
const manager = new THREE.LoadingManager();

manager.onStart = function (url, itemsLoaded, itemsTotal) {
  console.log("Le chargement a commencé.");
  loaderElement.style.display = "block";
};

manager.onLoad = function () {
  console.log("Toutes les ressources sont chargées.");
  loaderElement.style.display = "none";
  // Ici, masquez votre indicateur de chargement
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
  console.log(
    "Chargement en cours: " + url + " (" + itemsLoaded + "/" + itemsTotal + ")"
  );
  loaderElement.innerText = `Le loup dans le désert...`;
  // Ici, mettez à jour votre indicateur de chargement si nécessaire
};

const scene = new THREE.Scene();
const gltfLoader = new GLTFLoader(manager);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.setClearColor(0x87ceeb);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true; // Active le zoom
controls.zoomSpeed = 1.0; // Ajuste la vitesse de zoom
controls.enableRotate = true;

// Scene background
const textureLoader = new THREE.TextureLoader();

gltfLoader.load("objects/desert-field/desert-field.glb", (gltf) => {
  const landscape = gltf.scene;

  // position
  landscape.position.set(-50, -10, -1);
  landscape.rotateY(THREE.MathUtils.degToRad(90));

  scene.add(landscape);
});

// Wolf;

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

let mixer;
let wolf;
let runAction, idleAction;
let currentAction;
let cameraOffset;

gltfLoader.load("objects/wolf/Wolf-Blender-2.82a.glb", (gltf) => {
  wolf = gltf.scene;

  wolf.position.set(0, 6.635, 8);

  // add texture
  wolf.traverse((object) => {
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

  // Créez un AnimationMixer et associez-le au loup
  mixer = new THREE.AnimationMixer(wolf);

  // Si des animations sont disponibles, jouez la première
  runAction = mixer.clipAction(gltf.animations[0]);
  idleAction = mixer.clipAction(gltf.animations[4]);
  currentAction = idleAction.play();

  scene.add(wolf);

  cameraOffset = new THREE.Vector3(0, -5, 10);
  cameraOffset.applyQuaternion(wolf.quaternion);
  cameraOffset.add(wolf.position);
});

camera.fov = 20;
camera.updateProjectionMatrix();

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

function animate() {
  requestAnimationFrame(animate);

  if (wolf) {
    // Calculez la direction vers laquelle le loup fait face
    const direction = new THREE.Vector3();
    wolf.getWorldDirection(direction);

    // Mise à jour de la position du loup en fonction de la direction
    if (moveForward) {
      wolf.position.addScaledVector(direction, wolfSpeed);
    }
    if (moveBackward) {
      wolf.position.addScaledVector(direction, -wolfSpeed);
    }

    // Rotation du loup
    if (rotateLeft) wolf.rotation.y += wolfRotationSpeed;
    if (rotateRight) wolf.rotation.y -= wolfRotationSpeed;

    // Mettre à jour la position de la caméra pour maintenir l'offset
    const cameraPosition = wolf.position.clone().add(cameraOffset);
    camera.position.copy(cameraPosition);

    // Faire en sorte que la caméra regarde toujours le loup
    camera.lookAt(wolf.position);
  }

  // Mise à jour de l'AnimationMixer
  const delta = clock.getDelta(); // Assurez-vous d'avoir une instance de THREE.Clock
  if (mixer) mixer.update(delta);

  renderer.render(scene, camera);
}

const clock = new THREE.Clock();

animate();
