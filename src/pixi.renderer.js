import ReactReconciler from "react-reconciler";
import { Container, Texture, Sprite, AnimatedSprite } from "pixi.js";

function createElement(
    type,
    props,
    rootContainerInstance,
    _currentHostContext,
    workInProgress
) {
    let inst = { host: null };
    const { children, ...newProps } = props;
    let otherProps;
    switch (type) {
        case "container":
            inst.host = new Container();
            otherProps = newProps;
            break;
        case "texture": {
            const { src, from, options, ...restProps } = newProps;
            inst.host = Texture.from(src || from, options);
            otherProps = restProps;
            break;
        }
        case "sprite": {
            const { src, from, options, ...restProps } = newProps;
            inst.host = Sprite.from(src || from);
            otherProps = restProps;
            break;
        }
        case "animatedsprite": {
            const { textures, autoUpdate = true, ...restProps } = newProps;
            if (textures) {
                inst.host = new AnimatedSprite(textures, autoUpdate);
            } else {
                throw new Error("animated sprtie needs textures props")
            }
            otherProps = restProps;
            break;
        }
        default:
            throw new Error(`Unknown type ${type}`);
    }

    Object.assign(inst.host, otherProps);
    return inst;
}

function appendChild(parent, child) {
    console.log('appendChild', { parent, child });
    if (!parent.host) {
        if (parent.stage) {
            parent.stage.addChild(child.host);
            return;
        } else {
            console.warn('without host', { parent, child });
            throw new Error("prent doesn't have host");
        }
    }
    if (parent.host.addChild) {
        parent.host.addChild(child.host);
    } else {
        console.warn('parent child error', { parent, child });
        throw new Error("parent child exception");
    }
}

const hostConfig = {
    now: Date.now,
    supportsMutation: true,
    isPrimaryRenderer: false,
    getRootHostContext: () => ({}),
    scheduleTimeout: typeof setTimeout === 'function' ? setTimeout : undefined,
    cancelTimeout: typeof clearTimeout === 'function' ? clearTimeout : undefined,
    noTimeout: -1,
    prepareForCommit: () => { },//noop
    getChildHostContext: () => { },
    shouldSetTextContent: function (type, props) {
        //determining what constitutes a text node
        return (
            typeof props.children === "string" || typeof props.children === "number"
        );
    },
    createInstance: function (
        type,
        newProps,
        rootContainerInstance,
        _currentHostContext,
        workInProgress
    ) {
        return createElement(
            type,
            newProps,
            rootContainerInstance,
            _currentHostContext,
            workInProgress
        );
    },
    appendInitialChild: appendChild,
    finalizeInitialChildren: function (element, type, props) {

    },

    appendChildToContainer: appendChild,
    prepareUpdate: function (element, type, _oldProps, _newProps) {
        return {};
    },
    commitUpdate: function (element, updatePayload, type, oldProps, newProps) {
        const { children, ...otherProps } = newProps;
        Object.assign(element.host, otherProps);
    },
    commitTextUpdate: function (textInstance, oldText, newText) {
        console.log("commitTextUpdate", { textInstance, oldText, newText });
    },
    resetAfterCommit: () => {
        //noop
    },
    removeChild: function (parent, child) {
        if (parent.host.removeChild) {
            parent.host.removeChild(child.host);
        }
        if (child.host.destroy) {
            if (child.host.children) {
                child.host.destroy({ children: true, texture: true, baseTexture: true });
            } else {
                child.host.destroy();
            }
        }
    },

    getPublicInstance: function (instance) {
        return instance
    },

};

const ReactReconcilerInst = ReactReconciler(hostConfig);

ReactReconcilerInst.injectIntoDevTools({
    bundleType: process.env.NODE_ENV === "production" ? 0 : 1,
    version: "0.0.1",
    rendererPackageName: "react-custom",
    findHostInstanceByFiber: ReactReconcilerInst.findHostInstance
});

export default {
    //public render method for your renderer
    render: (reactElement, pixiApp) => {
        //kind of like a boilerplate code creating root container if it  hasn't been created otherwise just put the element inside the container
        if (!pixiApp._rootContainer) {
            pixiApp._rootContainer = ReactReconcilerInst.createContainer(pixiApp, false);
        }

        // update the root Container
        return ReactReconcilerInst.updateContainer(reactElement, pixiApp._rootContainer, null, () => null);
    }
}
