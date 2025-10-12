import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { TrackballControls } from "three/addons/controls/TrackballControls.js";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";

let camera, scene, renderer, webGlRenderer, cube;
let controls;

function Element(id, x, y, z, ry) {
  const div = document.createElement("div");
  div.style.width = "480px";
  div.style.height = "360px";
  div.style.backgroundColor = "#000";

  const iframe = document.createElement("iframe");
  iframe.style.width = "480px";
  iframe.style.height = "360px";
  iframe.style.border = "0px";
  iframe.src = ["https://www.youtube.com/embed/", id, "?rel=0"].join("");
  div.appendChild(iframe);

  const object = new CSS3DObject(div);
  object.position.set(x, y, z);
  object.rotation.y = ry;

  return object;
}

init();
animate();

function init() {
  const container = document.body;

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    5000,
  );
  //camera.position.set(0, 1, 10);
  camera.position.set(500, 350, 750);

  scene = new THREE.Scene();

  renderer = new CSS3DRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.pointerEvents = 'auto';
  container.appendChild(renderer.domElement);

  const group = new THREE.Group();
  group.add(new Element("SJOz3qjfQXU", 0, 0, 240, 0));
  group.add(new Element("Y2-xZ-1HE-Q", 240, 0, 0, Math.PI / 2));
  group.add(new Element("IrydklNpcFI", 0, 0, -240, Math.PI));
  group.add(new Element("9ubytEsCaS0", -240, 0, 0, -Math.PI / 2));
  scene.add(group);

  controls = new TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 4;

  window.addEventListener("resize", onWindowResize);


    // Setting up web GL renderer
    webGlRenderer = new THREE.WebGLRenderer();
    webGlRenderer.setSize( window.innerWidth, window.innerHeight );
    webGlRenderer.setAnimationLoop(animate);
    //webGlRenderer.domElement.style.pointerEvents = 'none';
    document.body.appendChild( webGlRenderer.domElement );

    const geometry = new THREE.BoxGeometry( 100, 100, 100 );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    cube = new THREE.Mesh( geometry, material );
    scene.add( cube );
   
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
  webGlRenderer.render( scene, camera );
}
