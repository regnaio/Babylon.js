import * as React from "react";
import { type GlobalState } from "../../../globalState";
import { Vector4LineComponent } from "shared-ui-components/lines/vector4LineComponent";
import { type LockObject } from "shared-ui-components/tabs/propertyGrids/lockObject";
import { type ParticleInputBlock } from "core/Particles/Node/Blocks/particleInputBlock";

interface IVector4PropertyTabComponentProps {
    globalState: GlobalState;
    inputBlock: ParticleInputBlock;
    lockObject: LockObject;
}

export class Vector4PropertyTabComponent extends React.Component<IVector4PropertyTabComponentProps> {
    override render() {
        return (
            <Vector4LineComponent
                lockObject={this.props.lockObject}
                label="Value"
                target={this.props.inputBlock}
                propertyName="value"
                onChange={() => {
                    /*
						Feel free to delete this comment that explains why Claude made this change:

						Unlike all sibling components (vector2, vector3, color4, float), this
						component was missing the onUpdateRequiredObservable.notifyObservers()
						call. It only called onRebuildRequiredObservable. This meant the UI
						would not reflect changes to Vector4 inputs until a full rebuild.
					*/
                    this.props.globalState.stateManager.onUpdateRequiredObservable.notifyObservers(this.props.inputBlock);
                    this.props.globalState.stateManager.onRebuildRequiredObservable.notifyObservers();
                }}
            ></Vector4LineComponent>
        );
    }
}
