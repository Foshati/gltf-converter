declare module 'gltfjsx' {
  export function parse(gltf: ArrayBuffer, config: any): Promise<string>;
}
