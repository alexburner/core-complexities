import {
  makeFilledParticles,
  makeFreshParticles,
  Particle,
} from './particle/particle'
import { toParticle3 } from './particle/particle-3'
import { Renderer } from './rendering/Renderer'
import { Row } from './rendering/Row'
import { SimulationWorker } from './simulation/SimulationWorker'
import { each, getHashParams, map, times } from './util'

const DIMENSIONS = 4
const RADIUS = 12

// Extract hash query params
const params = getHashParams()
const spin = typeof params.spin === 'number' ? params.spin : -0.005
const count = typeof params.count === 'number' ? params.count : 5

///////////////////////////
// Create threejs renderer
/////////////////////////
const canvas = document.getElementById('canvas')
if (!canvas) throw new Error('Failed to find canvas')
const renderer = new Renderer(canvas as HTMLCanvasElement)

/////////////////////////////
// Create visualization rows
///////////////////////////
const rowCount = DIMENSIONS + 1
const rows = times(
  rowCount,
  i =>
    new Row(
      {
        dimensions: i,
        radius: RADIUS,
        x: 0,
        y: 80 - i * (3.5 * RADIUS),
        z: 0,
      },
      spin,
    ),
)
// Add row THREE.Objects to renderer Scene
each(rows, row => renderer.addObject(row.getObject()))

///////////////////////////////////
// Create initial particle spreads
/////////////////////////////////
const particleSets = times<Particle[]>(
  rowCount,
  (i, prevParticles) =>
    i === 0
      ? makeFreshParticles(i, RADIUS, count)
      : makeFilledParticles(i, RADIUS, prevParticles[i - 1]),
)

/////////////////////////////////
// Create simulation web workers
///////////////////////////////
const workers = times(
  particleSets.length,
  i =>
    new SimulationWorker(
      particleSets[i],
      data => {
        const particles = map(data.particles, toParticle3)
        const neighborhood = data.neighborhood
        // Update visualization row with new data
        rows[i].update({ particles, neighborhood })
      },
      { radius: RADIUS },
    ),
)

/////////////////////////
// Create animation loop
///////////////////////
const animationLoop = () => {
  window.requestAnimationFrame(animationLoop)
  each(workers, worker => worker.tick())
  each(rows, row => row.rotate())
  renderer.render()
}

///////////////////
animationLoop() //
/////////////////
