import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RGBELoader } from "three/addons/loaders/RGBELoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

let camera, scene, renderer, controls;

function init() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    50
  );
  camera.position.set(0, 0, 5);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 0.1;
  controls.maxDistance = 10000;

  new RGBELoader().load("textures/studio.hdr", function (texture) {
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.background = envMap;
  });

  scene.add(new THREE.AxesHelper(2));
  camera.position.set(20, 15, 15);

  loadModel("jembatan/1.glb", 40);

  const radioButtons = document.querySelectorAll('input[type="radio"]');
  radioButtons.forEach((button) => {
    button.addEventListener("click", function () {
      document.getElementById("elems_loading").classList.remove("hidden");
      document.getElementById("bawah").classList.add("hidden");

      let pathModel = "";
      let scale = 1;

      if (this.id === "jembatan1") {
        pathModel = "jembatan/1.glb";
        scale = 40;
      } else if (this.id === "jembatan2") {
        pathModel = "jembatan/2.glb";
        scale = 0.5;
      } else if (this.id === "jembatan3") {
        pathModel = "jembatan/3.glb";
        scale = 0.5;
      }

      loadModel(pathModel, scale);

      new RGBELoader().load("textures/studio.hdr", function (texture) {
        const pmremGenerator = new THREE.PMREMGenerator(renderer);
        pmremGenerator.compileEquirectangularShader();
        const envMap = pmremGenerator.fromEquirectangular(texture).texture;
        scene.background = envMap;
      });
    });
  });

  const hemis = new THREE.HemisphereLight(0x3b82f6, 0x080820, 1);
  const dirlight = new THREE.DirectionalLight(0xdddddd, 5);
  const ambilight = new THREE.AmbientLight(0xababab, 4);
  dirlight.position.set(0, 20, 100);
  dirlight.target.position.set(0, 0, 0);

  scene.add(dirlight);
  scene.add(ambilight);
  scene.add(hemis);

  document
    .getElementById("ambientToggle")
    .addEventListener("change", function (e) {
      e.target.checked ? scene.add(ambilight) : scene.remove(ambilight);
    });

  document
    .getElementById("directionalToggle")
    .addEventListener("change", function (e) {
      e.target.checked ? scene.add(dirlight) : scene.remove(dirlight);
    });

  document
    .getElementById("hemisphereToggle")
    .addEventListener("change", function (e) {
      e.target.checked ? scene.add(hemis) : scene.remove(hemis);
    });

  animate();
  window.addEventListener("resize", onWindowResize, false);
}

function loadModel(pathModel, scale) {
  new GLTFLoader().load(pathModel, function (gltf) {
    // Hapus model lama
    scene.children = scene.children.filter((child) => child.type !== "Group");
    gltf.scene.scale.set(scale, scale, scale);
    scene.add(gltf.scene);
    document.getElementById("elems_loading").classList.add("hidden");
    document.getElementById("bawah").classList.remove("hidden");
  });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.update();
}

function animate() {
  requestAnimationFrame(animate);
  controls.autoRotate = false;
  controls.autoRotateSpeed = 1;
  controls.update();
  renderer.render(scene, camera);
}

init();
