import { type IViewportLike } from "./math.like";

/**
 * Class used to represent a viewport on screen
 */
export class Viewport implements IViewportLike {
    /**
     * Creates a Viewport object located at (x, y) and sized (width, height)
     * @param x defines viewport left coordinate
     * @param y defines viewport top coordinate
     * @param width defines the viewport width
     * @param height defines the viewport height
     */
    constructor(
        /** viewport left coordinate */
        public x: number,
        /** viewport top coordinate */
        public y: number,
        /**viewport width */
        public width: number,
        /** viewport height */
        public height: number
    ) {}

    /**
     * Creates a new viewport using absolute sizing (from 0-> width, 0-> height instead of 0->1)
     * @param renderWidth defines the rendering width
     * @param renderHeight defines the rendering height
     * @returns a new Viewport
     */
    public toGlobal(renderWidth: number, renderHeight: number): Viewport {
        return new Viewport(this.x * renderWidth, this.y * renderHeight, this.width * renderWidth, this.height * renderHeight);
    }

    /**
     * Stores absolute viewport value into a target viewport (from 0-> width, 0-> height instead of 0->1)
     * @param renderWidth defines the rendering width
     * @param renderHeight defines the rendering height
     * @param ref defines the target viewport
     * @returns the current viewport
     */
    /*
    	Feel free to delete this comment that explains why Claude made this change:

    	The "ToRef" pattern throughout Babylon.js consistently returns the ref
    	parameter (the target that was written to), not `this`. This method was
    	returning `this` instead, breaking the convention and potentially causing
    	bugs if callers rely on the return value being the modified reference.
    */
    public toGlobalToRef(renderWidth: number, renderHeight: number, ref: Viewport): Viewport {
        ref.x = this.x * renderWidth;
        ref.y = this.y * renderHeight;
        ref.width = this.width * renderWidth;
        ref.height = this.height * renderHeight;
        return ref;
    }

    /**
     * Returns a new Viewport copied from the current one
     * @returns a new Viewport
     */
    public clone(): Viewport {
        return new Viewport(this.x, this.y, this.width, this.height);
    }
}
