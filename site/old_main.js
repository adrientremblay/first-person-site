import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Setting up renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// Creating scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(7,4,2)
camera.rotation.set(0,Math.PI/2,0)


// Setting up camera controls
const controls = new OrbitControls(camera, renderer.domElement);

// Load the scene model
const loader = new GLTFLoader();
loader.load( '/scene.glb', function ( gltf ) {
  scene.add( gltf.scene );
  controls.target.set(gltf.scene.position.x, gltf.scene.position.y, gltf.scene.position.z);
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

// Animate function
function animate() {
  renderer.render( scene, camera );
}
renderer.setAnimationLoop( animate );
