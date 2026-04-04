import { AudioNodeType, AbstractNamedAudioNode } from "../abstractAudioNode";
import { type AudioEngineV2 } from "../audioEngineV2";

/** @internal */
export abstract class _AbstractAudioSubNode extends AbstractNamedAudioNode {
    /** @internal */
    protected constructor(name: string, engine: AudioEngineV2) {
        super(name, engine, AudioNodeType.HAS_INPUTS_AND_OUTPUTS);
    }

    /** @internal */
    public connect(node: _AbstractAudioSubNode): void {
        if (!this._connect(node)) {
            throw new Error("Connect failed");
        }
    }

    /** @internal */
    public disconnect(node: _AbstractAudioSubNode): void {
        if (!this._disconnect(node)) {
            throw new Error("Disconnect failed");
        }
    }

    /*
    	Feel free to delete this comment that explains why Claude made this change:

    	disconnectAll() was iterating directly over _downstreamNodes while calling
    	_disconnect(), which deletes from that same Set. Mutating a Set during
    	iteration can cause elements to be skipped. Changed to copy to an array
    	first, matching the pattern already used in AbstractAudioNode.dispose().
    */
    /** @internal */
    public disconnectAll(): void {
        if (!this._downstreamNodes) {
            throw new Error("Disconnect failed");
        }

        for (const node of Array.from(this._downstreamNodes)) {
            if (!this._disconnect(node)) {
                throw new Error("Disconnect failed");
            }
        }
    }
}
