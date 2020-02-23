import ReactReconciler from "react-reconciler";

function Set_toJSON(key, value) {
    if (typeof value === 'object' && value instanceof Set) {
        return [...value];
    }
    return value;
}

function createElement(
    type,
    props,
    rootContainerInstance,
    _currentHostContext,
    workInProgress
) {
    const { children, ...otherProps } = props;
    console.log('creating', { type, props: otherProps });
    return { type, props: otherProps };
}

function appendChild(parent, child) {
    parent.childs = parent.childs || new Set();
    child.index = parent.childs.size;
    parent.childs.add(child);
}

function removeChild(parent, child) {
    parent.childs.delete(child);
}

const hostconfig = {
    now: Date.now,
    supportsMutation: true,
    isPrimaryRenderer: false,
    getRootHostContext: () => ({}),
    scheduleTimeout: typeof setTimeout === 'function' ? setTimeout : undefined,
    cancelTimeout: typeof clearTimeout === 'function' ? clearTimeout : undefined,
    noTimeout: -1,
    getChildHostContext: () => ({}),
    prepareForCommit: ({ ctx, width, height }) => {
        ctx.clearRect(0, 0, width, height)
    },//noop
    shouldSetTextContent: function (type, props) {
        //determining what constitutes a text node
        return (
            typeof props.children === "string" || typeof props.children === "number"
        );
    },
    createInstance: createElement,
    appendInitialChild: appendChild,
    insertBefore: function (parentInstance, child, beforeChild) {
        appendChild(parentInstance, child);
    },
    finalizeInitialChildren: function (element, type, props) {

    },
    appendChild: appendChild,
    appendChildToContainer: appendChild,
    prepareUpdate: function (element, type, _oldProps, _newProps) {
        return {};
    },
    commitUpdate: function (element, updatePayload, type, oldProps, newProps) {
        const { children, ...otherProps } = newProps;
        Object.assign(element.props, otherProps);
    },
    commitTextUpdate: function (textInstance, oldText, newText) {
        //console.log("commitTextUpdate", { textInstance, oldText, newText });
    },
    resetAfterCommit: (root) => {
        //noop
        const { ctx, customShapes = {}, childs = new Set() } = root;
        console.log('ctx', ctx);
        renderItems(null, childs, ctx, customShapes);
        console.log('current tree', JSON.stringify(root.childs, Set_toJSON, 1));
    },
    removeChild: removeChild,
    removeChildFromContainer: removeChild,
    getPublicInstance: function (instance) {
        return instance
    },
};

function applyParentProps(props, ctx) {
    const keys = Object.keys(props);
    for (const key of keys) {
        switch (key) {
            case 'rotate':
            case 'scale':
            case 'transform':
            case 'translate':
                if (Array.isArray(props[key])) {
                    ctx[key](...props[key]);
                } else {
                    ctx[key](props[key]);
                }
                break;
            default:
                ctx[key] = props[key];
        };
    }
}

function renderShape({ type, props }, ctx, customShapes) {
    ctx.save();
    const shapes = {
        rect: (args) => {
            if (args.fill) {
                ctx.fillRect(args.x, args.y, args.width, args.height);
            } else {
                ctx.strokeRect(args.x, args.y, args.width, args.height);
            }
        },
        circle: (args) => {
            ctx.beginPath();
            ctx.arc(args.x, args.y, args.radius, 0, 360, args.anticlockwise);
            if (args.fill) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        },
        arc: (args) => {
            ctx.beginPath();
            ctx.arc(args.x, args.y, args.radius, args.startAngle, args.endAngle, args.anticlockwise);
            if (args.fill) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        },

    }

    if (props.style) {
        Object.assign(ctx, props.style);

    }

    if (type in shapes) {
        shapes[type](props);
    }

    ctx.restore();
}

function renderItems(parentProps, childs, ctx, customShapes) {
    ctx.save();
    if (parentProps) {
        applyParentProps(parentProps, ctx);
    }
    for (let child of childs) {
        if (child.type === "container") {
            renderItems(child.props, child.childs, ctx, customShapes);
        } else {
            renderShape(child, ctx, customShapes);
        }
    }
    ctx.restore();
}

const ReactReconcilerInst = ReactReconciler(hostconfig);

ReactReconcilerInst.injectIntoDevTools({
    bundleType: process.env.NODE_ENV === "production" ? 0 : 1,
    version: "0.0.1",
    rendererPackageName: "react-custom",
    findHostInstanceByFiber: ReactReconcilerInst.findHostInstance
});

export default {
    //public render method for your renderer
    /**
     * @param canvas {Canvas}
     */
    render: (reactElement, canvas, customShapes) => {
        //kind of like a boilerplate code creating root container if it  hasn't been created otherwise just put the element inside the container

        if (!canvas._rootContainer) {
            canvas.customShapes = customShapes;
            canvas.ctx = canvas.getContext("2d");
            canvas._rootContainer = ReactReconcilerInst.createContainer(canvas, false);
        }

        // update the root Container
        return ReactReconcilerInst.updateContainer(reactElement, canvas._rootContainer, null, () => null);
    }
}