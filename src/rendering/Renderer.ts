export class Renderer {
  constructor(canvas: HTMLCanvasElement) {
    console.log(this)
    console.log(canvas)
  }

  public addObject(object: THREE.Object3D) {
    console.log(this)
    console.log(object)
  }

  public render() {
    console.log(this)
    console.log('render')
  }
}
