import { type FrameGraph, type FrameGraphRenderPass, type Camera, type FrameGraphTextureHandle } from "core/index";
import { Constants } from "core/Engines/constants";
import { FrameGraphPostProcessTask } from "./postProcessTask";
import { ThinSSAO2PostProcess } from "core/PostProcesses/thinSSAO2PostProcess";

/**
 * @internal
 */
export class FrameGraphSSAO2Task extends FrameGraphPostProcessTask {
    public depthTexture: FrameGraphTextureHandle;

    public normalTexture: FrameGraphTextureHandle;

    public camera: Camera;

    public override readonly postProcess: ThinSSAO2PostProcess;

    private _currentCameraMode = -1;

    constructor(name: string, frameGraph: FrameGraph, thinPostProcess?: ThinSSAO2PostProcess) {
        super(name, frameGraph, thinPostProcess || new ThinSSAO2PostProcess(name, frameGraph.scene));
    }

    public override getClassName(): string {
        return "FrameGraphSSAO2Task";
    }

    public override record(skipCreationOfDisabledPasses = false): FrameGraphRenderPass {
        if (this.sourceTexture === undefined || this.depthTexture === undefined || this.normalTexture === undefined || this.camera === undefined) {
            throw new Error(`FrameGraphSSAO2Task "${this.name}": sourceTexture, depthTexture, normalTexture and camera are required`);
        }

        this._currentCameraMode = this.camera.mode;
        this.postProcess.updateEffect();

        const pass = super.record(
            skipCreationOfDisabledPasses,
            (context) => {
                this.postProcess.camera = this.camera;

                if (this._currentCameraMode !== this.camera.mode) {
                    this._currentCameraMode = this.camera.mode;
                    this.postProcess.updateEffect();
                }

                context.setTextureSamplingMode(this.depthTexture, Constants.TEXTURE_BILINEAR_SAMPLINGMODE);
                context.setTextureSamplingMode(this.normalTexture, Constants.TEXTURE_BILINEAR_SAMPLINGMODE);
            },
            (context) => {
                context.bindTextureHandle(this._postProcessDrawWrapper.effect!, "depthSampler", this.depthTexture);
                context.bindTextureHandle(this._postProcessDrawWrapper.effect!, "normalSampler", this.normalTexture);
            }
        );

        /*
        	Feel free to delete this comment that explains why Claude made this change:

        	normalTexture was bound and read in the shader but not declared as a dependency.
        	Without this, the frame graph may not correctly order passes, potentially reading
        	the normal texture before it has been written.
        */
        pass.addDependencies([this.depthTexture, this.normalTexture]);

        this.postProcess.textureWidth = this._sourceWidth;
        this.postProcess.textureHeight = this._sourceHeight;

        return pass;
    }
}
