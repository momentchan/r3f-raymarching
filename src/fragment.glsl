#include './r3f-gist/shader/cginc/raymarching.glsl';
#include './r3f-gist/shader/cginc/utility.glsl';

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST 0.01

uniform float time;
uniform vec2 mousePos;
uniform float mouseDown;

float GetDist(vec3 p) {

    // Pattern 1
    // vec4 s = vec4(sin(time) * 3.0, 0, 0, 1);
    // float sphere = sdSphere(p - s.xyz, s.w);

    // vec3 q = p;  // input copy
    // q.xy = rotate2D(q.xy, time);

    // q.y -= time * .4;
    // q = fract(q) - .5;

    // float box = sdBox(q, vec3(.1));

    // float ground = p.y + .75;

    // return smin(ground, smin(sphere, box, 2.0), 1.0);



    // Pattern 2
     p.z += time * .4;

    // space repetition
    p.xy = fract(p.xy) - .5;        // spacing: 1
    p.z = mod(p.z, .25) - .125;     // spacing: .25

    float box = sdOctahedron(p, .15);
    return box;
}

vec3 GetNormal(vec3 p) {
    float d = GetDist(p);
    vec2 e = vec2(.01, 0);
    vec3 n = d - vec3(
        GetDist(p - e.xyy),
        GetDist(p - e.yxy),
        GetDist(p - e.yyx));

    return normalize(n);
}

float RayMarchCustom(vec3 ro, vec3 rd) {
    float dt = 0.0;  // total distance travelled

    vec2 m = mousePos;
    if(mouseDown<.0) m = vec2(cos(time*.2), sin(time*.2));
    
    // Raymarching
    int i;
    for(i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * dt;

        p.xy = rotate2D(p.xy, dt*.2 * m.x);
        p.y += sin(dt * (m.y + 1.0) * .5) * .35;

        float ds = GetDist(p);
        dt += ds;

        if(dt > MAX_DIST || ds < SURF_DIST) break;
    }

    return dt * .04 + float(i) * .005;
}

float RayMarch(vec3 ro, vec3 rd) {
    float ds = 0.0;  // total distance travelled

    // Raymarching
    for(int i = 0; i < MAX_STEPS; i++) {
        vec3 p = ro + rd * ds;

        float d = GetDist(p);
        ds += d;

        if(ds > MAX_DIST || d < SURF_DIST) break;
    }

    return ds;
}

float GetLight(vec3 p) {
    vec3 lightPos = vec3(.0, 5, 6);

    lightPos.xz += vec2(sin(time), cos(time)) * 2.0;

    vec3 l = normalize(lightPos - p);
    vec3 n = GetNormal(p);
    float dif = clamp(dot(n, l), 0., 1.);


    // shadow

    vec3 offset = n * SURF_DIST * 2.0;        // offset from the surface because p is very close to surface from 1st raymarch
    float d = RayMarch(p + offset, l);
    if(d < length(lightPos - p))        // dist to surface < dist to light
        dif *= .1;
        
    return dif;
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

    // float ds = RayMarchCustom(ro, rd);
    // col = palette(ds);
    float ds = RayMarch(ro, rd);

    vec3 p = ro + rd * ds;

    float dif = GetLight(p);

    col = vec3(dif);

    // Coloring
    outputColor = vec4(col, 1.0);
}
