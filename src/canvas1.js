import React, { useState } from 'react';
import Canvas from './canvas/app';

export default function App() {
    const [enable, setEnable] = useState(false);
    const [translateX, setTranslateX] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [rotate, setRotate] = useState(0);

    return (<div>
        <button onClick={() => setEnable(x => !x)}>toggle circle</button>

        translateX: <input type="number" value={translateX} onChange={(e) => setTranslateX(+e.target.value)} /> &nbsp;&nbsp;&nbsp;

        translateY: <input type="number" value={translateY} onChange={(e) => setTranslateY(+e.target.value)} /> &nbsp;&nbsp;&nbsp;

        rotate({rotate}): <input type="range" value={rotate} min={0} max={360} onChange={(e) => setRotate(+e.target.value)} />
        <Canvas width={600} height={400} >
            <container>
                <rect width={100} fill={"green"} height={100} x={0} y={50} />
                {/* <rect width={400} height={200} x={0} y={150} /> */}

                <container translate={[translateX, translateY]}>
                    <container fillStyle="green" scale={[1, 1]} rotate={(Math.PI / 180) * rotate}>

                        <rect fill width={400} height={200} x={0} y={150} />
                        {enable && <circle fill style={{ fillStyle: 'red' }} radius={90} x={80} y={200} />}
                    </container>
                </container>
            </container>
        </Canvas>
    </div>);
}