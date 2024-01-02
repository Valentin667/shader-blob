import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import bigsphereVertexShader from "./shader/bigsphere/vertex.glsl";
import bigsphereFragmentShader from "./shader/bigsphere/fragment.glsl";
import littlesphereVertexShader from "./shader/littlesphere/vertex.glsl";
import littlesphereFragmentShader from "./shader/littlesphere/fragment.glsl";
import { DotScreenShader } from "./CustomShader";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/**
 * Base
 */
// Debug
const gui = new GUI({ width: 340 });
const debugObject = {};

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Button
 */
document.querySelectorAll('.gravityButton').forEach(btn => {
  let animationFrameId;

  btn.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(animationFrameId);

    animationFrameId = requestAnimationFrame(() => {
      const rect = btn.getBoundingClientRect();    
      const h = rect.width / 2;

      const x = e.clientX - rect.left - h;
      const y = e.clientY - rect.top - h;

      const r1 = Math.sqrt(x*x + y*y);
      const r2 = (1 - (r1 / h)) * r1;

      const angle = Math.atan2(y, x);
      const tx = Math.round(Math.cos(angle) * r2 * 100) / 100;
      const ty = Math.round(Math.sin(angle) * r2 * 100) / 100;

      const op = (r2 / r1) + 0.25;

      btn.style.setProperty('--tx', `${tx}px`);
      btn.style.setProperty('--ty', `${ty}px`);
      btn.style.setProperty('--opacity', `${op}`);
    });
  });

  btn.addEventListener('mouseleave', () => {
    cancelAnimationFrame(animationFrameId);

    btn.style.setProperty('--tx', '0px');
    btn.style.setProperty('--ty', '0px');
    btn.style.setProperty('--opacity', `${0.25}`);
  });
});

/**
 * Objects
 */
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipMapLinearFilter,
  //   encoding: THREE.sRGBEncoding,
});

const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);

// Color
debugObject.firstColor = '#ffffe5';
debugObject.secondColor = "#e8e178";
debugObject.accentColor = "#8a7fd2";

// Big Sphere
const bigSphereMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: {
      value: 0
    },
    effectSpeed: {
      value: 0.25
    },
    uStripes: {
      value: 0.1
    },
    uBasePattern: {
      value: 0.5
    },
    uPatternValue: {
      value: 0.1
    },
    uFirstColor: {
      value: new THREE.Color(debugObject.firstColor)
    },
    uSecondColor: {
      value: new THREE.Color(debugObject.secondColor)
    },
    uAccentColor: {
      value: new THREE.Color(debugObject.accentColor)
    },
    resolution: {
      value: new THREE.Vector4()
    },
  },
  vertexShader: bigsphereVertexShader,
  fragmentShader: bigsphereFragmentShader,
});

const bigSphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);

const bigSphereMesh = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);

scene.add(bigSphereMesh);

/**
 * Debug
 */
gui
  .add(bigSphereMaterial.uniforms.effectSpeed, "value")
  .min(0)
  .max(3)
  .step(0.01)
  .name("Effect Speed")

gui
  .add(bigSphereMaterial.uniforms.uStripes, "value")
  .min(0.01)
  .max(0.5)
  .step(0.01)
  .name("Stripes")

gui
  .add(bigSphereMaterial.uniforms.uBasePattern, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Base Pattern")

gui
  .add(bigSphereMaterial.uniforms.uPatternValue, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("Second Pattern")

const background = gui.addFolder('Background');
background.close()

gui
background.addColor(debugObject, 'firstColor')
  .name("First Color")
  .onChange(() => {
    bigSphereMaterial.uniforms.uFirstColor.value.set(debugObject.firstColor);
  });

gui
background.addColor(debugObject, "secondColor")
  .name("Second Color")
  .onChange(() => {
    bigSphereMaterial.uniforms.uSecondColor.value.set(debugObject.secondColor);
  });

gui
background.addColor(debugObject, "accentColor")
  .name("Accent Color")
  .onChange(() => {
    bigSphereMaterial.uniforms.uAccentColor.value.set(debugObject.accentColor);
  });

/**
 * Little Sphere
 */
// Geometry
const littleSphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);

// Little Shere
const littleSphereMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: {
      value: 0
    },
    tCube: {
      value: 0
    },
    resolution: {
      value: new THREE.Vector4()
    },
    mRefractionRatio: {
      value: 1.02
    },
    mFresnelBias: {
      value: 0.1
    },
    mFresnelScale: {
      value: 2
    },
    mFresnelPower: {
      value: 1
    },
  },
  vertexShader: littlesphereVertexShader,
  fragmentShader: littlesphereFragmentShader,
});

/**
 * Debug
 */
const blobFresnel = gui.addFolder('Blob Fresnel');
blobFresnel.close();

gui
blobFresnel.add(littleSphereMaterial.uniforms.mRefractionRatio, "value")
  .min(0)
  .max(1.2)
  .step(0.01)
  .name("mRefractionRatio")
gui
blobFresnel.add(littleSphereMaterial.uniforms.mFresnelBias, "value")
  .min(0)
  .max(1)
  .step(0.01)
  .name("mFresnelBias")
gui
blobFresnel.add(littleSphereMaterial.uniforms.mFresnelScale, "value")
  .min(0)
  .max(4)
  .step(0.01)
  .name("mFresnelScale")
gui

blobFresnel.add(littleSphereMaterial.uniforms.mFresnelPower, "value")
  .min(0)
  .max(5)
  .step(0.01)
  .name("mFresnelPower")

// Mesh
const littleSphereMesh = new THREE.Mesh(
  littleSphereGeometry,
  littleSphereMaterial
);
scene.add(littleSphereMesh);

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

  composer.setSize(sizes.width, sizes.height);
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 1.1;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);

controls.enableDamping = true;
controls.dampingFactor = 0.05;

controls.minDistance = 0.7;
controls.maxDistance = 1.5;

controls.enablePan = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Click & Drag to interact
const instructionsElement = document.getElementById('instructions');

renderer.domElement.addEventListener('click', () => {
  instructionsElement.classList.add('fade-out');

  instructionsElement.addEventListener('transitionend', () => {
    instructionsElement.remove();
  });
});

/**
 * Animate
 */
const clock = new THREE.Clock();

let composer;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  littleSphereMesh.visible = false;
  bigSphereMaterial.uniforms.time.value = elapsedTime;
  littleSphereMaterial.uniforms.time.value = elapsedTime;
  cubeCamera.update(renderer, scene);
  littleSphereMesh.visible = true;
  littleSphereMaterial.uniforms.tCube.value = cubeRenderTarget.texture;

  // Update controls
  controls.update();

  // Render
  //   renderer.render(scene, camera);
  composer.render();

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const effect1 = new ShaderPass(DotScreenShader);
effect1.uniforms["scale"].value = 4;
composer.addPass(effect1);

tick();