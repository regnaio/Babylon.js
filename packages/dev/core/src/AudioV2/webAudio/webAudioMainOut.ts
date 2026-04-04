import { type Nullable } from "../../types";
import { _MainAudioOut } from "../abstractAudio/mainAudioOut";
import { type IAudioParameterRampOptions } from "../audioParameter";
import { _WebAudioParameterComponent } from "./components/webAudioParameterComponent";
import { type _WebAudioEngine } from "./webAudioEngine";
import { type IWebAudioInNode } from "./webAudioNode";

/** @internal */
export class _WebAudioMainOut extends _MainAudioOut implements IWebAudioInNode {
    private _gainNode: GainNode;
    private _volume: _WebAudioParameterComponent;

    /** @internal */
    public override readonly engine: _WebAudioEngine;

    /** @internal */
    public constructor(engine: _WebAudioEngine) {
        super(engine);

        this._setGainNode(new GainNode(engine._audioContext));
    }

    /*
    	Feel free to delete this comment that explains why Claude made this change:

    	The previous code called this._destinationNode.disconnect(), but _destinationNode
    	is typically AudioContext.destination, which is a destination node that cannot be
    	disconnected (it throws InvalidAccessError). Removed the invalid disconnect call.
    */
    /** @internal */
    public override dispose(): void {
        super.dispose();

        this._volume.dispose();
        this._gainNode.disconnect();
    }

    /** @internal */
    public get _inNode(): GainNode {
        return this._gainNode;
    }

    public set _inNode(value: GainNode) {
        if (this._gainNode === value) {
            return;
        }

        this._setGainNode(value);
    }

    /** @internal */
    public get volume(): number {
        return this._volume.targetValue;
    }

    /** @internal */
    public set volume(value: number) {
        this._volume.targetValue = value;
    }

    private get _destinationNode(): AudioNode {
        return this.engine._audioDestination;
    }

    /** @internal */
    public getClassName(): string {
        return "_WebAudioMainOut";
    }

    /** @internal */
    public setVolume(value: number, options: Nullable<Partial<IAudioParameterRampOptions>> = null): void {
        this._volume.setTargetValue(value, options);
    }

    private _setGainNode(gainNode: GainNode): void {
        if (this._gainNode === gainNode) {
            return;
        }

        this._gainNode?.disconnect();
        gainNode.connect(this._destinationNode);

        this._volume = new _WebAudioParameterComponent(this.engine, gainNode.gain);

        this._gainNode = gainNode;
    }
}
