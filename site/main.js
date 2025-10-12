import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// Constants
const CLOCK = new THREE.Clock();

const BASE_WIDTH = 1440;
const BASE_HEIGHT = 900;
const BASE_SCALE = 0.0015;
const SCREEN_WIDTH = BASE_WIDTH;
const SCREEN_HEIGHT = BASE_HEIGHT;
const SCREEN_SCALE = BASE_SCALE;

const CAMERA_BASE_POSITION = new THREE.Vector3(5,4,2);

// Animation variables
var hovering = false
var hoverTargetPosition = new THREE.Vector3()

// Setting up cssRenderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
cssRenderer.domElement.style.pointerEvents = 'auto';
document.body.appendChild(cssRenderer.domElement);


// Setting up web GL renderer
const webGlRenderer = new THREE.WebGLRenderer();
webGlRenderer.setSize( window.innerWidth, window.innerHeight );
webGlRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild( webGlRenderer.domElement );

// Creating scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(CAMERA_BASE_POSITION.x, CAMERA_BASE_POSITION.y, CAMERA_BASE_POSITION.z)
camera.rotation.set(0,Math.PI/2,0)

// Load the scene model
const loader = new GLTFLoader();
loader.load( '/scene.glb', function ( gltf ) {
  scene.add( gltf.scene );
  //controls.update();
}, undefined, function ( error ) {
  console.error( error );
} );

// Adding a light to the scene
const light = new THREE.PointLight(0xffff00, 2)
light.position.x = 1.0
light.position.y = 3.0
light.position.z = -1.0
light.castShadow = false
light.decay = 0.5
scene.add(light)

// Setting up the screen iframe DOM element
const div = document.createElement("div");
div.style.width = SCREEN_WIDTH+'px';
div.style.height = SCREEN_HEIGHT+'px';

const iframe = document.createElement('iframe');
//iframe.src="https://www.youtube.com/embed/ck_ngTil_jQ?rel=0";
iframe.src="https://adrientremblay.com";
iframe.style.width = SCREEN_WIDTH+'px';
iframe.style.height = SCREEN_HEIGHT+'px';
iframe.style.border = '0';
div.appendChild(iframe);

const cssObject = new CSS3DObject(div);
cssObject.scale.set(SCREEN_SCALE, SCREEN_SCALE, SCREEN_SCALE);
cssObject.position.set(1, 3.4, 1); // position it on your monitor
cssObject.rotation.set(0,Math.PI/2,0)
scene.add(cssObject);

// Setting up a plane for detecting when the mouse is over the screen
const planeGeometry = new THREE.PlaneGeometry(SCREEN_SCALE * BASE_WIDTH,SCREEN_SCALE * BASE_HEIGHT);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: true });
const hoverPlane = new THREE.Mesh(planeGeometry, planeMaterial);
hoverPlane.position.copy(cssObject.position);
hoverPlane.position.x -= 0.1;
hoverPlane.rotation.copy(cssObject.rotation);
scene.add(hoverPlane);
hoverTargetPosition.copy(hoverPlane.position);
hoverTargetPosition.x += 1.5;

const raycaster = new THREE.Raycaster();

// Setting up camera controls
const controls = new OrbitControls(camera, cssRenderer.domElement);
controls.target.set(hoverPlane.position.x, hoverPlane.position.y, hoverPlane.position.z);

// On mouse move event for zooming into the screen
function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY);

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hoverPlane);
    hovering = intersects.length > 0;
    if (hovering) {
      //controls.enabled = false;
    } else {
      controls.enabled = true;
    }
}
window.addEventListener('mousemove', onMouseMove);

// Target rotation (look at the monitor)
const targetCamera = new THREE.Object3D();
targetCamera.position.copy(hoverPlane.position); // optional if camera moves
targetCamera.position.x -= 2;
targetCamera.lookAt(hoverPlane.position);     // rotate to look at iframe
const targetQuat = targetCamera.quaternion.clone();

// Animate function
function animate() {
  const delta = CLOCK.getDelta();

  //requestAnimationFrame(animate);
  webGlRenderer.render( scene, camera );
  cssRenderer.render(scene, camera);   // iframe //scene.rotation.x += 0.01

  // Zoom into the screen
  if (hovering) {
    const lerpSpeed = 4.0;
    const t = 1- Math.exp(-lerpSpeed * delta);
    camera.position.lerp(hoverTargetPosition, t);
    if (camera.position.distanceTo(hoverTargetPosition) < 0.05) {
      //camera.lookAt(hoverPlane.position);
      camera.quaternion.slerp(targetQuat, t);
    }
  }
}
webGlRenderer.setAnimationLoop( animate );
//controls.addEventListener('change', animate); // only re-render when camera moves
animate()