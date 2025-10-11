import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// Constants
const BASE_WIDTH = 1440;
const BASE_HEIGHT = 900;
const BASE_SCALE = 0.0015;
const FACTOR = 0.5;
const SCREEN_WIDTH = BASE_WIDTH * FACTOR;
const SCREEN_HEIGHT = BASE_HEIGHT * FACTOR;
const SCREEN_SCALE = BASE_SCALE / FACTOR;

const CAMERA_BASE_POSITION = new THREE.Vector3(5,4,2);

// Animation variables
var hovering = false
var hoverTargetPosition = new THREE.Vector3()

// Setting up web GL renderer
const webGlRenderer = new THREE.WebGLRenderer();
webGlRenderer.setSize( window.innerWidth, window.innerHeight );
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

// Setting up cssRenderer
const cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(cssRenderer.domElement);

// Setting up the screen iframe DOM element
const iframe = document.createElement('iframe');
iframe.src="https://adrientremblay.com";
iframe.style.width = SCREEN_WIDTH+'px';
iframe.style.height = SCREEN_HEIGHT+'px';
iframe.style.border = '0';
iframe.allow='autoplay';
iframe.autoplay=1;

const cssObject = new CSS3DObject(iframe);
cssObject.position.set(0, 3.4, 1); // position it on your monitor
cssObject.scale.set(SCREEN_SCALE,SCREEN_SCALE,SCREEN_SCALE); // scale down large iframe
cssObject.rotation.set(0,Math.PI/2,0)
scene.add(cssObject);

// Setting up a plane for detecting when the mouse is over the screen
const planeGeometry = new THREE.PlaneGeometry(SCREEN_SCALE * BASE_WIDTH * FACTOR,SCREEN_SCALE * BASE_HEIGHT * FACTOR);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: true });
const hoverPlane = new THREE.Mesh(planeGeometry, planeMaterial);
hoverPlane.position.copy(cssObject.position);
hoverPlane.rotation.copy(cssObject.rotation);
scene.add(hoverPlane);
hoverTargetPosition.copy(hoverPlane.position);
hoverTargetPosition.x += 1.5;

const raycaster = new THREE.Raycaster();

function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY);

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hoverPlane);
    hovering = intersects.length > 0;
    // if (hovering) {
    //   camera.position.copy(hoverPlane.position);
    //   camera.position.x += 2;
    //   camera.lookAt(hoverPlane.position)
    // }
}
window.addEventListener('mousemove', onMouseMove);

// Setting up camera controls
const controls = new OrbitControls(camera, webGlRenderer.domElement);
controls.target.set(hoverPlane.position.x, hoverPlane.position.y, hoverPlane.position.z);

const targetCamera = new THREE.Object3D();
targetCamera.position.copy(hoverTargetPosition); // optional if camera moves
targetCamera.lookAt(hoverPlane.position);     // rotate to look at iframe
const targetQuat = targetCamera.quaternion.clone();

// Animate function
function animate() {
  requestAnimationFrame(animate);
  webGlRenderer.render( scene, camera );
  cssRenderer.render(scene, camera);   // iframe //scene.rotation.x += 0.01

  // Zoom into the screen
  if (hovering) {
    camera.position.lerp(hoverTargetPosition, 0.03);
    if (camera.position.distanceTo(hoverTargetPosition) < 0.05) {
      //camera.quaternion.slerp(targetQuat, 0.01);
    }
  }
}
//webGlRenderer.setAnimationLoop( animate );
controls.addEventListener('change', animate); // only re-render when camera moves
animate()