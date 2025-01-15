
import { Effect } from 'postprocessing'
import { Uniform } from 'three';

const fragmentShader = /* glsl */`
    #define MAX_STEPS 100
    #define MAX_DIST 100.
    #define SURF_DIST 0.01

    uniform float time;

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


    float GetDist(vec3 p) {
        vec4 s = vec4(sin(time) * 3.0, 0, 0, 1);
        float sphere = sdSphere(p - s.xyz, s.w);

        vec3 q = p;  // input copy
        q.xy *= rot2D(time);

        float box = sdBox(q, vec3(.75));

        float ground = p.y + .75;


        return smin(ground, smin(sphere, box, 2.0), 1.0);
    }

    float RayMarch(vec3 ro, vec3 rd) {
        float dt = 0.0;  // total distance travelled

        // Raymarching
        for(int i = 0; i < MAX_STEPS; i++) {
            vec3 p = ro + rd * dt;
            float ds = GetDist(p);
            dt += ds;

            if(dt > MAX_DIST || ds < SURF_DIST) break;
        }

        return dt;
    }


    void mainImage(const in vec4 inputColor, in vec2 uv, out vec4 outputColor)
    {
        uv -= 0.5;
        uv *= 2.0;
        // Initialization
        vec3 ro = vec3(0.0, 0.0, -3.0);
        vec3 rd = normalize(vec3(uv, 1.0));
        vec3 col = vec3(0.0);

        float dt = RayMarch(ro, rd);

        // Coloring
        col = vec3(dt * 0.2);
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
                    ['time', { value: 0}]
                ])
            }
        )
    }

    update(renderer, inputBuffer, deltaTime) 
    {
        this.uniforms.get('time').value += deltaTime
    }
}

export default function RayMarching() {

    const effect = new RayMarchingEffect();

    return <primitive object={effect}>

    </primitive>
}