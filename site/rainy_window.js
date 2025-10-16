import * as THREE from 'three';

export class RainyWindow extends THREE.Mesh {
   static vertexShader = `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    static fragmentShader = `
        uniform float u_time;
        uniform float u_noiseScale;
        uniform float u_streakIntensity;
        uniform float u_scrollSpeed;
        uniform float u_seed;
        varying vec2 vUv;

        float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1,311.7)) + u_seed) * 43758.5453);
        }

        float noise(vec2 p){
            // Extract the integer and float components of the vec p
            vec2 i = floor(p);
            vec2 f = fract(p);
            // Get the four points of the lattice
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f*f*(3.0-2.0*f); // smoothstep interpolation
            //vec2 u = f; // linear interpolation
            return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y; // billinear interpolation expanded and simplified formula
        }

        void main() {
            vec2 uv = vUv;
            float n = noise(vec2(uv.x * 100.0, uv.y * 40.0 + u_time * u_scrollSpeed));
            float streaks = smoothstep(0.4, 0.9, n);
            float alpha = streaks * u_streakIntensity;

            gl_FragColor = vec4(vec3(0.8, 0.9, 1.0) * alpha, alpha);
        }
    `;

  constructor() {

    // Creating the window geometry
    const windowGeometry = new THREE.PlaneGeometry(4,4);

    const rainyWindowMaterial = new THREE.ShaderMaterial({
        uniforms: {
            u_time: { value: 0 },
            u_noiseScale: { value: 20.0 },
            u_streakIntensity: { value: 0.5 },
            u_scrollSpeed: { value: 3.0},
            u_seed: { value: Math.random()},
        },
        transparent: true,
        vertexShader: RainyWindow.vertexShader,
        fragmentShader: RainyWindow.fragmentShader,
    });
    super(windowGeometry, rainyWindowMaterial);
    this.position.set(-4.1,4,4.6);
    this.rotateY(Math.PI/2);
    }
}