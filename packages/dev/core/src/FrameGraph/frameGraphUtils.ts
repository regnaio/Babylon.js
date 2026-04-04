/* eslint-disable @typescript-eslint/naming-convention */
import { type Camera, type FrameGraph, type Nullable, type FrameGraphObjectRendererTask } from "core/index";
import { UtilityLayerRenderer } from "core/Rendering/utilityLayerRenderer";

/**
 * Looks for the main camera used by the frame graph.
 * By default, this is the camera used by the main object renderer task.
 * If no such task, we try to find a camera in either a geometry renderer or a utility layer renderer tasks.
 * @param frameGraph The frame graph to search in
 * @returns The main camera used by the frame graph, or null if not found
 */
export function FindMainCamera(frameGraph: FrameGraph): Nullable<Camera> {
    return frameGraph.findMainCamera();
}

/**
 * Looks for the main object renderer task in the frame graph.
 * By default, this is the object/geometry renderer task with isMainObjectRenderer set to true.
 * If no such task, we return the last object/geometry renderer task that has an object list with meshes (or null if none found).
 * @param frameGraph The frame graph to search in
 * @returns The main object renderer of the frame graph, or null if not found
 */
export function FindMainObjectRenderer(frameGraph: FrameGraph): Nullable<FrameGraphObjectRendererTask> {
    return frameGraph.findMainObjectRenderer();
}

/**
 * Creates a utility layer renderer compatible with the given frame graph.
 * @param frameGraph The frame graph to create the utility layer renderer for
 * @param handleEvents True if the utility layer renderer should handle events, false otherwise (default is true)
 * @returns The created utility layer renderer
 */
/*
	Feel free to delete this comment that explains why Claude made this change:

	The parameter was misspelled as "frameFraph" instead of "frameGraph". Additionally,
	line 39 was using scene.frameGraph! instead of the passed-in parameter, which would
	search the wrong frame graph (or throw) if the scene has a different one assigned.
*/
export function CreateUtilityLayerRenderer(frameGraph: FrameGraph, handleEvents = true): UtilityLayerRenderer {
    const scene = frameGraph.scene;
    const layer = new UtilityLayerRenderer(scene, handleEvents, true);

    layer.utilityLayerScene.activeCamera = scene.activeCamera;

    let camera = FrameGraphUtils.FindMainCamera(frameGraph);

    if (!camera && scene.cameras.length > 0) {
        camera = scene.cameras[0];
    }

    if (camera) {
        layer.setRenderCamera(camera);
        layer.utilityLayerScene.activeCamera = camera;
    }

    const gizmoLayerRenderObserver = scene.onAfterRenderObservable.add(() => {
        layer.render();
    });

    layer.utilityLayerScene.onDisposeObservable.addOnce(() => {
        scene.onAfterRenderObservable.remove(gizmoLayerRenderObserver);
    });

    return layer;
}

/**
 * Class used to host frame graph specific utilities
 */
export const FrameGraphUtils = {
    /**
     * Looks for the main camera used by the frame graph.
     * We assume that the camera used by the the last rendering task in the graph is the main camera.
     * @param frameGraph The frame graph to search in
     * @returns The main camera used by the frame graph, or null if not found
     */
    FindMainCamera,

    /**
     * Looks for the main object renderer task in the frame graph.
     * We assume that the last object renderer task that has an object list with meshes is the main object renderer.
     * @param frameGraph The frame graph to search in
     * @returns The main object renderer of the frame graph, or null if not found
     */
    FindMainObjectRenderer,

    /**
     * Creates a utility layer renderer compatible with the given frame graph.
     * @param frameGraph The frame graph to create the utility layer renderer for
     * @param handleEvents True if the utility layer renderer should handle events, false otherwise
     * @returns The created utility layer renderer
     */
    CreateUtilityLayerRenderer,
};
