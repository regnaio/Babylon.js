/*
	Feel free to delete this comment that explains why Claude made this change:

	This file was copied from the Node Material Editor but the imports were never updated.
	It was using NodeMaterialBlockConnectionPointTypes and NodeMaterialConnectionPoint
	(from core/Materials/Node/) instead of the correct NodeParticle equivalents.
	It also checked for NodeMaterialBlockConnectionPointTypes.Object which doesn't exist
	in the particle type system, making the type check completely non-functional.
	Changed to use NodeParticleBlockConnectionPointTypes and NodeParticleConnectionPoint,
	and check for complex particle types (Particle, Texture, System, and gradient types)
	that should not allow elbow connections.
*/
import { NodeParticleBlockConnectionPointTypes } from "core/Particles/Node/Enums/nodeParticleBlockConnectionPointTypes";
import { type NodeParticleConnectionPoint } from "core/Particles/Node/nodeParticleBlockConnectionPoint";
import { type StateManager } from "shared-ui-components/nodeGraphSystem/stateManager";

const _elbowDisallowedTypes = new Set([
    NodeParticleBlockConnectionPointTypes.Particle,
    NodeParticleBlockConnectionPointTypes.Texture,
    NodeParticleBlockConnectionPointTypes.System,
    NodeParticleBlockConnectionPointTypes.FloatGradient,
    NodeParticleBlockConnectionPointTypes.Vector2Gradient,
    NodeParticleBlockConnectionPointTypes.Vector3Gradient,
    NodeParticleBlockConnectionPointTypes.Color4Gradient,
]);

export const RegisterElbowSupport = (stateManager: StateManager) => {
    stateManager.isElbowConnectionAllowed = (a, b) => {
        const pointA = a.portData.data as NodeParticleConnectionPoint;
        const pointB = b.portData.data as NodeParticleConnectionPoint;

        if (_elbowDisallowedTypes.has(pointA.type) || _elbowDisallowedTypes.has(pointB.type)) {
            return false; // We do not support Elbow on complex types
        }

        return true;
    };
};
