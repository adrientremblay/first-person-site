// Imports
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import CameraControls from 'camera-controls';
CameraControls.install( { THREE: THREE } );

// Constants
const CLOCK = new THREE.Clock();
const VIRTUAL_SCREEN_WIDTH = 1440;
const VIRTUAL_SCREEN_HEIGHT = 900;
const VIRTUAL_SCREEN_SCALE = 0.0013;
const CAMERA_BASE_POSITION = new THREE.Vector3(3,4,0);

// Animation variables
var animating = false;
var raycaster;
var screenNormal;
var camera;
var controls;
var cssObject;
var div;
// For looking at the screen
var viewScreenPosition = new THREE.Vector3();
var viewScreenQuat;
// For returning back to orginal camera position
var originalCameraPosition = new THREE.Vector3();
var originalCameraQuat = new THREE.Quaternion();

// Renderers
var cssRenderer;
var webGlRenderer
var scene;
var hoverPlane;

const init = () => {
  // Setting up cssRenderer
  cssRenderer = new CSS3DRenderer();
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.domElement.style.position = 'absolute';
  cssRenderer.domElement.style.top = '0px';
  cssRenderer.domElement.style.pointerEvents = 'auto';
  document.body.appendChild(cssRenderer.domElement);

  // Setting up web GL renderer
  webGlRenderer = new THREE.WebGLRenderer();
  webGlRenderer.setSize( window.innerWidth, window.innerHeight );
  webGlRenderer.domElement.style.pointerEvents = 'none';
  document.body.appendChild( webGlRenderer.domElement );

  // Creating scene
  scene = new THREE.Scene();

  // Creating Camera
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  camera.position.set(0, 0, 1e-5);

  // Creating Camera Controls
  controls = new CameraControls( camera, cssRenderer.domElement);
  //controls.minDistance = controls.maxDistance = 1;
  controls.azimuthRotateSpeed = - 0.3; // negative value to invert rotation direction
  controls.polarRotateSpeed   = - 0.3; // negative value to invert rotation direction
  controls.truckSpeed = 10;
  controls.mouseButtons.wheel = CameraControls.ACTION.ZOOM;
  controls.moveTo(CAMERA_BASE_POSITION.x, CAMERA_BASE_POSITION.y, CAMERA_BASE_POSITION.z);
  controls.rotate(Math.PI/2,0,0);

  controls.addEventListener( 'sleep', () => {
    animating = false;
  } );

  // Load the GLTF model
  const loader = new GLTFLoader();
  loader.load( '/scene.glb', (gltf) => {
    scene.add( gltf.scene );
  }, undefined, function ( error ) {
    console.error( error );
  });

  // Adding a light to the scene
  const light = new THREE.PointLight(0xffff00, 2)
  light.position.x = 1.0
  light.position.y = 3.0
  light.position.z = -1.0
  light.castShadow = false
  light.decay = 0.5
  scene.add(light)

  // Setting up the screen parent div and iframe DOM elements
  div = document.createElement("div");
  div.style.width = VIRTUAL_SCREEN_WIDTH+'px';
  div.style.height = VIRTUAL_SCREEN_HEIGHT+'px';

  const iframe = document.createElement('iframe');
  //iframe.src="https://www.youtube.com/embed/ck_ngTil_jQ?rel=0";
  iframe.src="https://adrientremblay.com";
  iframe.style.width = VIRTUAL_SCREEN_WIDTH+'px';
  iframe.style.height = VIRTUAL_SCREEN_HEIGHT+'px';
  iframe.style.border = '0';
  div.appendChild(iframe);

  // Creating the CSS3dObject
  cssObject = new CSS3DObject(div);
  cssObject.scale.set(VIRTUAL_SCREEN_SCALE, VIRTUAL_SCREEN_SCALE, VIRTUAL_SCREEN_SCALE);
  cssObject.position.set(0.13, 3.3, 0.9); // position it on your monitor
  cssObject.rotation.set(0,Math.PI/2,0)
  scene.add(cssObject);
  screenNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(cssObject.quaternion); // used for screen visibility

  // Setting up a plane for detecting when the mouse is over the screen
  const planeGeometry = new THREE.PlaneGeometry(VIRTUAL_SCREEN_SCALE * VIRTUAL_SCREEN_WIDTH,VIRTUAL_SCREEN_SCALE * VIRTUAL_SCREEN_HEIGHT);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: true });
  planeMaterial.visible = false;
  hoverPlane = new THREE.Mesh(planeGeometry, planeMaterial);
  hoverPlane.position.copy(cssObject.position);
  hoverPlane.position.x += 0.1;
  hoverPlane.rotation.copy(cssObject.rotation);
  scene.add(hoverPlane);
  viewScreenPosition.copy(hoverPlane.position);
  viewScreenPosition.x += 1.0;
  raycaster = new THREE.Raycaster();
  window.addEventListener('mousemove', onMouseMove);

  // Setting up target camera (for looking at the monitor animation)
  const targetCamera = new THREE.Object3D();
  targetCamera.position.copy(hoverPlane.position); // optional if camera moves
  targetCamera.position.x -= 2;
  targetCamera.lookAt(hoverPlane.position);     // rotate to look at iframe
  viewScreenQuat = targetCamera.quaternion.clone();

  // Hooking up the animate function
  webGlRenderer.setAnimationLoop(animate);

  // Hooking up on resize
  window.addEventListener('resize', onResize);

  // Play ambient rain audio
  let rainAudio = new Audio('rain_on_window.mp3'); 
  rainAudio.loop = true;
  rainAudio.play(); 
};

// On mouse move event for zooming into the screen
const onMouseMove = (event) => {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY);

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hoverPlane);
    if (intersects.length > 0 && !animating) {
      start_fly_to_screen();
    } else {
      if (!animating && camera.position.distanceTo(viewScreenPosition) < 0.05 && camera.quaternion.dot(viewScreenQuat) > 0.99999) {
        start_fly_away();
      }
    }
};

const start_fly_to_screen = async () => {
  animating = true;
  await controls.moveTo(viewScreenPosition.x, viewScreenPosition.y, viewScreenPosition.z, true);
  await controls.setLookAt(viewScreenPosition.x, viewScreenPosition.y, viewScreenPosition.z,
     viewScreenPosition.x-1, viewScreenPosition.y, viewScreenPosition.z, true);
  //controls.lookAt(viewScreenPosition);
  console.log("Move to screen");
};

const start_fly_away = async () => {
  animating = true;
  await controls.moveTo(CAMERA_BASE_POSITION.x, CAMERA_BASE_POSITION.y, CAMERA_BASE_POSITION.z, true);
  console.log("Move back to chair");
};

const updateScreenVisibility = () => {
  const camDir = new THREE.Vector3().subVectors(camera.position, cssObject.position).normalize();
  const dot = screenNormal.dot(camDir); // 1 = front, -1 = back
  div.style.opacity = THREE.MathUtils.clamp((dot + 0.1) / 1.1, 0, 1); // fade near back
};

// TODO: Fix this
const onResize = () => {
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
  webGlRenderer.setSize( window.innerWidth, window.innerHeight );
  //camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
};

// Animate function
const animate = () => {
  const delta = CLOCK.getDelta();

  updateScreenVisibility();

  //requestAnimationFrame(animate);
  const hasControlsUpdated = controls.update( delta )
  if (hasControlsUpdated) {
  }
    webGlRenderer.render( scene, camera );
    cssRenderer.render(scene, camera);   // iframe //scene.rotation.x += 0.01
};
//controls.addEventListener('change', animate); // only re-render when camera moves
//animate() // Animate the first frame

init();