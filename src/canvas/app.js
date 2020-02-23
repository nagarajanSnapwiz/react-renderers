import renderer from './renderer';
import React, { useEffect, useRef } from 'react';

export default function CanvasApp(props) {
    const canvasRef = useRef();
    const { width, height } = props;

    useEffect(() => {
        renderer.render(props.children, canvasRef.current);
    }, [props]);

    return (<canvas ref={canvasRef} width={width} height={height}>

    </canvas>)
}