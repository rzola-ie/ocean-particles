import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { Pane } from 'tweakpane'

import vertex from './shaders/water/vertex.glsl'
import fragment from './shaders/water/fragment.glsl'

/**
 * Debug
 */
const debug = new Pane()
debug.containerElem_.style.width = '320px'


/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Water
 */
const colors = {}
// depth
colors.depth = {}
colors.depth.value = "#18438c"
colors.depth.instance = new THREE.Color(colors.depth.value)

// surface
colors.surface = {}
colors.surface.value = "#ffffff"
colors.surface.instance = new THREE.Color(colors.surface.value)

debug.addInput(
    colors.depth,
    'value',
    { label: 'uDepthColor' }
)
    .on('change', () => {
        colors.depth.instance.set(colors.depth.value)
    })

debug.addInput(
    colors.surface,
    'value',
    { label: 'uSurfaceColor' }
)
    .on('change', () => {
        colors.surface.instance.set(colors.surface.value)
    })

const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

const waterMaterial = new THREE.ShaderMaterial({
    vertexShader: vertex,
    fragmentShader: fragment,
    uniforms: {
        uTime: { value: 0 },
        // big waves
        uBigWavesElevation: { value: 0.2 },
        uBigWavesFrequency: { value: new THREE.Vector2(3.5, 2) },
        uBigWavesSpeed: { value: 0.5 },
        // small waves
        uSmallWavesElevation: { value: 0.1 },
        uSmallWavesSpeed: { value: 0.2 },
        uSmallWavesFrequency: { value: 3.0 },
        uSmallWavesIterations: { value: 4.0 },
        // color
        uDepthColor: { value: colors.depth.instance },
        uSurfaceColor: { value: colors.surface.instance },
        uColorOffset: { value: 0.05 },
        uColorMultiplier: { value: 5.0 }
    }
})

debug.addInput(
    waterMaterial.uniforms.uColorOffset,
    'value',
    { min: 0, max: 1, step: 0.01, label: 'uColorOffset' }
)

debug.addInput(
    waterMaterial.uniforms.uColorMultiplier,
    'value',
    { min: 0, max: 10, step: 0.01, label: 'uColorMultiplier' }
)

debug.addInput(
    waterMaterial.uniforms.uBigWavesElevation,
    'value',
    { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesElevation' }
)
debug.addInput(
    waterMaterial.uniforms.uBigWavesFrequency,
    'value',
    { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesFrequency' }
)

debug.addInput(
    waterMaterial.uniforms.uBigWavesSpeed,
    'value',
    { min: 0, max: 1, step: 0.01, label: 'uBigWavesSpeed' }
)

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

const count = 500;

const position = new Float32Array(count * 3)

for (let i = 0; i < count; i++) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 2
    position[i * 3 + 1] = ((Math.random() - 0.5) * 1) + 0.5
    position[i * 3 + 2] = (Math.random() - 0.5) * 2
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))

const particleMaterial = new THREE.PointsMaterial({
    sizeAttenuation: true,
    size: 0.01
})

const particles = new THREE.Points(particleGeometry, particleMaterial)
scene.add(particles)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()
let lastElapsedTime = 0

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    const deltaTime = elapsedTime - lastElapsedTime
    lastElapsedTime = elapsedTime

    // update material
    waterMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()