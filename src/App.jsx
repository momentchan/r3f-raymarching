import { OrbitControls } from "@react-three/drei";
import { Canvas } from '@react-three/fiber'
import Utilities from "./r3f-gist/utility/Utilities";
import { EffectComposer, ToneMapping } from "@react-three/postprocessing";
import RayMarching from "./Raymarching";

export default function App() {
    return <>
        <Canvas
            shadows
            camera={{
                fov: 45,
                near: 0.1,
                far: 200,
                position: [4, 2, 6]
            }}
            gl={{ preserveDrawingBuffer: true }}
        >

            <OrbitControls makeDefault />

            <EffectComposer>
                <RayMarching />
            </EffectComposer>

            <Utilities />
        </Canvas>
    </>
}