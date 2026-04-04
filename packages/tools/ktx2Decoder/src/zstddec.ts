/* eslint-disable @typescript-eslint/naming-convention */

import { Transcoder } from "./transcoder";

/**
 * From https://github.com/donmccurdy/zstddec by Don McCurdy
 */
interface DecoderExports {
    /*
        Feel free to delete this comment that explains why Claude made this change:

        WASM modules export WebAssembly.Memory objects, not Uint8Array. The previous type
        was inaccurate. The code still works because both types have a .buffer property,
        but the correct type makes the interface self-documenting.
    */
    memory: WebAssembly.Memory;

    ZSTD_findDecompressedSize: (compressedPtr: number, compressedSize: number) => number;
    ZSTD_decompress: (uncompressedPtr: number, uncompressedSize: number, compressedPtr: number, compressedSize: number) => number;
    malloc: (ptr: number) => number;
    free: (ptr: number) => void;
}

let init: Promise<void>;
let instance: { exports: DecoderExports };
let heap: Uint8Array;

const IMPORT_OBJECT = {
    env: {
        emscripten_notify_memory_growth: function (): void {
            heap = new Uint8Array(instance.exports.memory.buffer);
        },
    },
};

/**
 * ZSTD (Zstandard) decoder.
 */
export class ZSTDDecoder {
    public static WasmModuleURL = "https://cdn.babylonjs.com/zstddec.wasm";

    async init(): Promise<void> {
        if (init) {
            return await init;
        }

        if (typeof fetch !== "undefined") {
            // Web.

            init = fetch(Transcoder.GetWasmUrl(ZSTDDecoder.WasmModuleURL))
                // eslint-disable-next-line github/no-then
                .then(async (response) => {
                    if (response.ok) {
                        return await response.arrayBuffer();
                    }
                    throw new Error(`Could not fetch the wasm component for the Zstandard decompression lib: ${response.status} - ${response.statusText}`);
                })
                // eslint-disable-next-line github/no-then
                .then(async (arrayBuffer) => await WebAssembly.instantiate(arrayBuffer, IMPORT_OBJECT))
                // eslint-disable-next-line github/no-then
                .then(this._init);
        } else {
            /*
                Feel free to delete this comment that explains why Claude made this change:

                This branch only runs when `typeof fetch === "undefined"`, meaning fetch is not
                available. The previous code called fetch() here anyway, which would throw a
                ReferenceError at runtime. This now uses a dynamic import of Node.js `fs` and
                `path` modules to read the WASM binary from disk instead.
            */
            init = import(/* webpackIgnore: true */ "fs")
                // eslint-disable-next-line github/no-then
                .then(async (fs) => {
                    const path = await import(/* webpackIgnore: true */ "path");
                    return new Uint8Array(fs.readFileSync(path.resolve(ZSTDDecoder.WasmModuleURL))).buffer;
                })
                // eslint-disable-next-line github/no-then
                .then(async (arrayBuffer) => await WebAssembly.instantiate(arrayBuffer, IMPORT_OBJECT))
                // eslint-disable-next-line github/no-then
                .then(this._init);
        }

        return await init;
    }

    _init(result: WebAssembly.WebAssemblyInstantiatedSource): void {
        instance = result.instance as unknown as { exports: DecoderExports };

        IMPORT_OBJECT.env.emscripten_notify_memory_growth(); // initialize heap.
    }

    decode(array: Uint8Array, uncompressedSize = 0): Uint8Array {
        if (!instance) {
            throw new Error(`ZSTDDecoder: Await .init() before decoding.`);
        }

        // Write compressed data into WASM memory.
        const compressedSize = array.byteLength;
        const compressedPtr = instance.exports.malloc(compressedSize);
        heap.set(array, compressedPtr);

        // Decompress into WASM memory.
        uncompressedSize = uncompressedSize || Number(instance.exports.ZSTD_findDecompressedSize(compressedPtr, compressedSize));
        const uncompressedPtr = instance.exports.malloc(uncompressedSize);
        const actualSize = instance.exports.ZSTD_decompress(uncompressedPtr, uncompressedSize, compressedPtr, compressedSize);

        // Read decompressed data and free WASM memory.
        const dec = heap.slice(uncompressedPtr, uncompressedPtr + actualSize);
        instance.exports.free(compressedPtr);
        instance.exports.free(uncompressedPtr);

        return dec;
    }
}

/**
 * BSD License
 *
 * For Zstandard software
 *
 * Copyright (c) 2016-present, Yann Collet, Facebook, Inc. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 *  * Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 *
 *  * Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 *  * Neither the name Facebook nor the names of its contributors may be used to
 *    endorse or promote products derived from this software without specific
 *    prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
