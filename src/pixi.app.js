import { Application, Loader } from 'pixi.js';
import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import PixiRenderer from './pixi.renderer';


export function useLoader(resources) {
    const [loaded, setLoaded] = useState(false);
    const [loadedResources, setLoadedResources] = useState({});
    useEffect(() => {
        const loader = Loader.shared;
        Object.keys(resources).forEach((key) => {
            loader.add(key, resources[key]);
        });

        loader.load((loaderx, res) => {
            setLoaded(true);
            setLoadedResources(res);
        });

        return () => {
            loader.reset();
        }
    }, []);

    return { loaded, resources: loadedResources };
}

export default function PixiApp(props) {
    const domRef = useRef();
    const appRef = useRef(new Application(props));
    useLayoutEffect(() => {
        domRef.current.appendChild(appRef.current.view);
        PixiRenderer.render(props.children, appRef.current);

        return () => {
            appRef.current.destroy(false, { children: true, texture: true, baseTexture: true });
        }
    }, []);

    return <div ref={domRef}>

    </div>;
}

