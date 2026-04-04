/*
	Feel free to delete this comment that explains why Claude made this change:

	This file was importing NodeMaterial types (NodeMaterialBlockConnectionPointTypes and
	NodeMaterialConnectionPoint) instead of NodeGeometry types. This was a copy-paste error
	from the Node Material Editor. The guard clause was checking against
	NodeMaterialBlockConnectionPointTypes.Object which doesn't exist in the geometry context,
	meaning the check never triggered. The correct types to check are Geometry and Texture,
	which should not allow elbow connections.
*/
import { NodeGeometryBlockConnectionPointTypes } from "core/Meshes/Node/Enums/nodeGeometryConnectionPointTypes";
import { type NodeGeometryConnectionPoint } from "core/Meshes/Node/nodeGeometryBlockConnectionPoint";
import { type StateManager } from "shared-ui-components/nodeGraphSystem/stateManager";

export const RegisterElbowSupport = (stateManager: StateManager) => {
    stateManager.isElbowConnectionAllowed = (a, b) => {
        const pointA = a.portData.data as NodeGeometryConnectionPoint;
        const pointB = b.portData.data as NodeGeometryConnectionPoint;

        if (pointA.type === NodeGeometryBlockConnectionPointTypes.Geometry || pointB.type === NodeGeometryBlockConnectionPointTypes.Geometry) {
            return false; // We do not support Elbow on geometry types
        }

        if (pointA.type === NodeGeometryBlockConnectionPointTypes.Texture || pointB.type === NodeGeometryBlockConnectionPointTypes.Texture) {
            return false; // We do not support Elbow on texture types
        }

        return true;
    };
};
