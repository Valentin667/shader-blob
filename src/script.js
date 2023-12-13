import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import GUI from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import vertex from "./shader/vertex.glsl";
import fragment from "./shader/fragment.glsl";
import vertex1 from "./shader/vertex1.glsl";
import fragment1 from "./shader/fragment1.glsl";
import { DotScreenShader } from "./CustomShader";
// import { DotScreenShader } from "three/addons/shaders/DotScreenShader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

/**
 * Debug
 */
// const gui = new GUI();

// const settings = () => {
//   let that = this;

//   this.settings = {
//     progress: 0,
//     mRefractionRatio: 1.02,
//     mFresnelBias: 0.1,
//     mFresnelScale: 4,
//     mFresnelPower: 2,
//   };

//   gui
//     .add(settings, "mRefractionRatio")
//     .min(0)
//     .max(3)
//     .step(0.01)
//     .onChange(() => {
//       littleSphereMesh.uniforms.mRefractionRatio.value =
//         settings.mRefractionRatio;
//     });
//   gui
//     .add(settings, "mFresnelBias")
//     .min(0)
//     .max(3)
//     .step(0.01)
//     .onChange(() => {
//       littleSphereMesh.uniforms.mFresnelBias.value = settings.mFresnelBias;
//     });
//   gui
//     .add(settings, "mFresnelScale")
//     .min(0)
//     .max(3)
//     .step(0.01)
//     .onChange(() => {
//       littleSphereMesh.uniforms.mFresnelScale.value = settings.mFresnelScale;
//     });
//   gui
//     .add(settings, "mFresnelPower")
//     .min(0)
//     .max(3)
//     .step(0.01)
//     .onChange(() => {
//       littleSphereMesh.uniforms.mFresnelPower.value = settings.mFresnelPower;
//     });
// };

// settings();
// const color1Folder = gui.addFolder("Color 1");
// color1Folder.addColor(background, "color1").onChange(() => {
//   // Mettez à jour les couleurs dans le shader ici
//   bigSphereMaterial.uniforms.color1.value = new THREE.Color().fromArray(
//     background.color1
//   );
// });

// const color2Folder = gui.addFolder("Color 2");
// color2Folder.addColor(background, "color2").onChange(() => {
//   // Mettez à jour les couleurs dans le shader ici
//   bigSphereMaterial.uniforms.color2.value = new THREE.Color().fromArray(
//     background.color2
//   );
// });

// const colorAccentFolder = gui.addFolder("Color Accent");
// colorAccentFolder.addColor(background, "colorAccent").onChange(() => {
//   // Mettez à jour les couleurs dans le shader ici
//   bigSphereMaterial.uniforms.colorAccent.value = new THREE.Color().fromArray(
//     background.colorAccent
//   );
// });

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
const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, {
  format: THREE.RGBAFormat,
  generateMipmaps: true,
  minFilter: THREE.LinearMipMapLinearFilter,
  //   encoding: THREE.sRGBEncoding,
});

const cubeCamera = new THREE.CubeCamera(0.1, 10, cubeRenderTarget);

// Big Sphere
const bigSphereMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: { value: 0 },
    resolution: { value: new THREE.Vector4() },
  },
  vertexShader: vertex,
  fragmentShader: fragment,
});

const bigSphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);

const bigSphereMesh = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);

scene.add(bigSphereMesh);

// Little Shere
const littleSphereMaterial = new THREE.ShaderMaterial({
  side: THREE.DoubleSide,
  uniforms: {
    time: { value: 0 },
    tCube: { value: 0 },
    resolution: { value: new THREE.Vector4() },
    mRefractionRatio: { value: 1.02 },
    mFresnelBias: { value: 0.1 },
    mFresnelScale: { value: 2 },
    mFresnelPower: { value: 1 },
  },
  vertexShader: vertex1,
  fragmentShader: fragment1,
});

const littleSphereGeometry = new THREE.SphereGeometry(0.4, 32, 32);

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
camera.position.z = 1.3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

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

  // Update objects
  //   sphere.rotation.y = 0.1 * elapsedTime;
  //   plane.rotation.y = 0.1 * elapsedTime;
  //   torus.rotation.y = 0.1 * elapsedTime;

  //   sphere.rotation.x = -0.15 * elapsedTime;
  //   plane.rotation.x = -0.15 * elapsedTime;
  //   torus.rotation.x = -0.15 * elapsedTime;

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
