# Culling Directory Analysis

## Files Analyzed

### Core Geometry
- **boundingSphere.ts** — Defines `BoundingSphere` with local/world center+radius, frustum/point/sphere intersection tests, and a static `CreateFromCenterAndRadius` factory.
- **boundingBox.ts** — Defines `BoundingBox` with 8 corner vectors in local/world space, OBB directions, frustum/point/sphere/AABB intersection tests. Implements `ICullable`.
- **boundingInfo.ts** — Combines `BoundingBox` and `BoundingSphere` into `BoundingInfo`. Provides multi-strategy frustum culling (standard, bounding-sphere-only, optimistic inclusion), precise OBB intersection via SAT (Separating Axis Theorem), encapsulation, and scaling. Also defines `ICullable` interface and module-level helpers `ComputeBoxExtents` and `AxisOverlap`.

### Ray / Picking
- **ray.core.ts** — Defines the `Ray` class with intersection tests (box, sphere, triangle, plane, axis, segment, mesh). Also contains all scene picking functions (`Pick`, `MultiPick`, `PickWithRay`, `PickWithBoundingInfo`, etc.) and the `PickingCustomization` hook.
- **ray.ts** — Thin wrapper that imports from `ray.core.ts`, calls `AddRayExtensions` to monkey-patch `Scene` and `Camera` prototypes with picking methods, and re-exports everything.

### Bounding Info Helpers (GPU-accelerated)
- **Helper/IBoundingInfoHelperPlatform.ts** — Interface for GPU bounding info computation backends.
- **Helper/boundingInfoHelper.ts** — Facade that lazily initializes either the compute-shader or transform-feedback backend depending on engine capabilities.
- **Helper/computeShaderBoundingHelper.ts** — WebGPU compute shader backend. Dispatches compute shaders to calculate min/max from vertex positions with bone/morph support.
- **Helper/transformFeedbackBoundingHelper.ts** — WebGL transform feedback backend. Uses vertex shader + transform feedback to compute bounding info.

### Octree
- **Octrees/octree.ts** — Generic `Octree<T>` spatial partitioning structure with frustum selection, sphere intersection, and ray intersection queries.
- **Octrees/octreeBlock.ts** — Individual octree cell. Recursively subdivides when capacity is exceeded. Contains the static `_CreateBlocks` factory.
- **Octrees/octreeSceneComponent.ts** — Scene component that wires the octree into the scene's mesh selection, submesh picking, and collision candidate pipelines.
- **Octrees/index.ts** — Barrel export for the octree module.
- **index.ts** — Barrel export for the entire Culling directory.

---

## Issues Found and Fixed

### 1. BUG: `ComputeShaderBoundingHelper.dispose()` leaks GPU buffers
**File:** `computeShaderBoundingHelper.ts`
**Severity:** Medium (resource leak)

The `dispose()` method cleans up `_positionBuffers`, `_indexBuffers`, `_weightBuffers`, `_morphTargetInfluenceBuffers`, and `_morphTargetTextureIndexBuffers`, but never disposes `_indexExtraBuffers` or `_weightExtraBuffers`. These are allocated in `_extractDataAndLink` when a mesh has more than 4 bone influencers. This causes GPU storage buffer leaks.

### 2. BUG: `BoundingSphere.CreateFromCenterAndRadius()` sets minimum/maximum incorrectly
**File:** `boundingSphere.ts`
**Severity:** Low (min/max metadata wrong, core sphere logic unaffected)

The factory method passes `center + (0,0,radius)` as `min` and `center - (0,0,radius)` as `max` to the constructor. This means `minimum.z > maximum.z`, which is semantically inverted. The center and radius computations still produce correct values (since `Distance` is symmetric), but any code reading `.minimum` or `.maximum` from a sphere created via this factory gets incorrect bounds.

### 3. BUG: `BoundingInfoHelper.batchProcess()` null check doesn't match initialization
**File:** `boundingInfoHelper.ts`
**Severity:** Low

`batchProcess()` checks `this._platform === null`, but `_platform` is declared without an initializer (i.e., `undefined`). It's never set to `null` in the `BoundingInfoHelper` class. The check should be a falsy check to handle both `undefined` and `null`.

### 4. OPTIMIZATION: OBB intersection allocates 9 temporary Vector3 objects per call
**File:** `boundingInfo.ts`
**Severity:** Medium (performance on hot path)

The precise OBB intersection test in `BoundingInfo.intersects()` calls `Vector3.Cross()` 9 times, each creating a new `Vector3`. For scenes with many precise collision checks, this creates significant GC pressure. Fixed by using `Vector3.CrossToRef()` with a module-level reusable vector.

### 5. OPTIMIZATION: `CreatePickingRayInCameraSpaceToRef` allocates unnecessary Matrix
**File:** `ray.core.ts`
**Severity:** Low (allocation on each camera-space pick)

Creates a new `Matrix.Identity()` on every call. Since the matrix is only used as a read-only parameter, `Matrix.IdentityReadOnly` avoids the allocation.

### 6. DOC: JSDoc typo in `BoundingSphere.scale()`
**File:** `boundingSphere.ts`
`@returns the current bounding box` should be `@returns the current bounding sphere`.

### 7. DOC: JSDoc typo in `Ray.intersectsTriangle()`
**File:** `ray.core.ts`
"If the ray hits a triange" should be "If the ray hits a triangle".

### 8. DOC: JSDoc typo in `octreeSceneComponent.ts`
**File:** `octreeSceneComponent.ts`
"Backing Filed" should be "Backing Field".
