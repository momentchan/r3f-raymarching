
import { Effect } from 'postprocessing'
import { useEffect } from 'react';
import { Uniform } from 'three';

const fragmentShader = /* glsl */`
    #define MAX_STEPS 100
    #define MAX_DIST 100.
    #define SURF_DIST 0.01

    uniform float time;
    uniform vec2 mouse;
    uniform float mouseDown;

    vec3 rot3D(vec3 p, vec3 axis, float angle){
        return mix(dot(axis, p) * axis, p, cos(angle))
               + cross(axis, p) * sin(angle);
    }

    mat2 rot2D(float angle) {
        float s = sin(angle);
        float c = cos(angle);
        return mat2(c, -s, s, c);
    }

    float smin(float a, float b, float k) {
        float h = max(k-abs(a-b), 0.0) / k;
        return min(a, b) - h*h*h*k * (1.0/6.0);
    }

    float sdSphere(vec3 p, float s) {
        return length(p) - s;
    }

    float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0); 
    }

    // Octahedron SDF - https://iquilezles.org/articles/distfunctions/
    float sdOctahedron(vec3 p, float s) {
        p = abs(p);
        return (p.x+p.y+p.z-s)*0.57735027;
    }


    float GetDist(vec3 p) {
        vec4 s = vec4(sin(time) * 3.0, 0, 0, 1);
        float sphere = sdSphere(p - s.xyz, s.w);

        vec3 q = p;  // input copy
        q.xy *= rot2D(time);

        q.y -= time * .4;
        q = fract(q) - .5;

        float box = sdBox(q, vec3(.1));

        float ground = p.y + .75;


        return smin(ground, smin(sphere, box, 2.0), 1.0);
    }

    // Custom gradient - https://iquilezles.org/articles/palettes/
    vec3 palette(float t) {
        return .5+.5*cos(6.28318*(t+vec3(.3,.416,.557)));
    }

    float GetDist2(vec3 p) {
        p.z += time * .4;

        // space repetition
        p.xy = fract(p.xy) - .5;        // spacing: 1
        p.z = mod(p.z, .25) - .125;     // spacing: .25

        float box = sdOctahedron(p, .15);
        return box;
    }

    float RayMarch(vec3 ro, vec3 rd) {
        float dt = 0.0;  // total distance travelled

        vec2 m = mouse;
        if(mouseDown<.0) m = vec2(cos(time*.2), sin(time*.2));
        
        // Raymarching
        int i;
        for(i = 0; i < MAX_STEPS; i++) {
            vec3 p = ro + rd * dt;

            p.xy *= rot2D(dt*.2 * m.x);
            p.y += sin(dt * (m.y + 1.0) * .5) * .35;

            float ds = GetDist2(p);
            dt += ds;

            if(dt > MAX_DIST || ds < SURF_DIST) break;
        }

        return dt * .04 + float(i) * .005;
    }


    void mainImage(const in vec4 inputColor, in vec2 uv, out vec4 outputColor)
    {
        uv -= 0.5;
        uv *= 2.0;
        // Initialization
        vec3 ro = vec3(0.0, 0.0, -3.0);
        vec3 rd = normalize(vec3(uv, 1.0));
        vec3 col = vec3(0.0);

        // Camera Rotation
        // ro.yz *= rot2D(-mouse.y);
        // rd.yz *= rot2D(-mouse.y);

        // ro.xz *= rot2D(-mouse.x);
        // rd.xz *= rot2D(-mouse.x);

        float dt = RayMarch(ro, rd);

        // Coloring
        col = palette(dt);
        outputColor = vec4(col, 1.0);
    }
`

class RayMarchingEffect extends Effect {
    constructor() {
        super(
            'Raymarching',
            fragmentShader,
            {
                uniforms: new Map([
                    ['time', { value: 0 }],
                    ['mouse', { value: [0, 0] }],
                    ['mouseDown', { value: -1 }],
                ])
            }
        )
    }

    update(renderer, inputBuffer, deltaTime) {

        this.uniforms.get('time').value += deltaTime
    }

    setMousePosition(x, y) {
        // Normalize mouse coordinates to [-1, 1]
        const nx = (x / window.innerWidth) * 2 - 1;
        const ny = -((y / window.innerHeight) * 2 - 1); // Flip Y-axis

        this.mouseHoldPos = [nx, ny];
        this.uniforms.get('mouse').value = this.mouseHoldPos;
    }

    setMouseDown(down) {
        this.uniforms.get('mouseDown').value = down;
    }
}

export default function RayMarching() {

    const effect = new RayMarchingEffect();

    useEffect(() => {
        window.addEventListener('mousemove', (event) => {
            effect.setMousePosition(event.clientX, event.clientY);
        });

        window.addEventListener('mousedown', (event) => {
            effect.setMouseDown(1);
        });

        window.addEventListener('mouseup', () => {
            effect.setMouseDown(-1);
        });
    }, []);

    return <primitive object={effect}>

    </primitive>
}