import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';

// Constants
var baseWidth = 1440;
var baseHeight = 900;
var baseScale = 0.0015;
var factor = 0.5;
var screenWidth = baseWidth * factor;
var screenHeight = baseHeight * factor;
var screenScale = baseScale / factor;

// Setting up web GL renderer
const webGlRenderer = new THREE.WebGLRenderer();
webGlRenderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( webGlRenderer.domElement );

// Creating scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(7,4,2)
camera.rotation.set(0,Math.PI/2,0)


// Setting up camera controls
const controls = new OrbitControls(camera, webGlRenderer.domElement);


// Load the scene model
const loader = new GLTFLoader();
loader.load( '/scene.glb', function ( gltf ) {
  scene.add( gltf.scene );
  controls.target.set(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
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
iframe.style.width = screenWidth+'px';
iframe.style.height = screenHeight+'px';
iframe.style.border = '0';
iframe.allow='autoplay';
iframe.autoplay=1;

const cssObject = new CSS3DObject(iframe);
cssObject.position.set(0, 3.4, 1); // position it on your monitor
cssObject.scale.set(screenScale,screenScale,screenScale); // scale down large iframe
cssObject.rotation.set(0,Math.PI/2,0)
scene.add(cssObject);


// Setting up a plane for detecting when the mouse is over the screen
const planeGeometry = new THREE.PlaneGeometry(screenScale * baseWidth * factor,screenScale * baseHeight * factor);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, visible: true });
const hoverPlane = new THREE.Mesh(planeGeometry, planeMaterial);
hoverPlane.position.copy(cssObject.position);
hoverPlane.rotation.copy(cssObject.rotation);
scene.add(hoverPlane);

const raycaster = new THREE.Raycaster();

function onMouseMove(event) {
    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = - (event.clientY / window.innerHeight) * 2 + 1;
    const mouse = new THREE.Vector2(mouseX, mouseY);

    // Raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(hoverPlane);
    const hovering = intersects.length > 0;
    console.log(hovering)
}
window.addEventListener('mousemove', onMouseMove);

// Animate function
function animate() {
  requestAnimationFrame(animate);
  webGlRenderer.render( scene, camera );
  cssRenderer.render(scene, camera);   // iframe //scene.rotation.x += 0.01
}
//webGlRenderer.setAnimationLoop( animate );
controls.addEventListener('change', animate); // only re-render when camera moves
animate()