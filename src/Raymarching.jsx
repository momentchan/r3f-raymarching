import { useEffect } from 'react';
import raymarching from './r3f-gist/shader/cginc/raymarching.glsl';
import utility from './r3f-gist/shader/cginc/utility.glsl';
import CustomEffectBase from './r3f-gist/effect/CustomEffectBase';
import fragmentShader from './fragment.glsl'

class RayMarchingEffect extends CustomEffectBase {
    constructor() {
        super(
            'Raymarching',
            {
                fragmentShader
            }
        )
    }
}

export default function RayMarching() {

    const effect = new RayMarchingEffect();

    useEffect(() => {
        window.addEventListener('mousemove', (event) => {
            effect.setMousePos(event.clientX, event.clientY);
        });

        window.addEventListener('mousedown', (event) => {
            effect.setMouseDown(1);
        });

        window.addEventListener('mouseup', () => {
            effect.setMouseDown(-1);
        });
    }, []);

    return <primitive object={effect} />
}