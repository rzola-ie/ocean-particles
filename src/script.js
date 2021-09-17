import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { GlitchPass } from 'three/examples/jsm/postprocessing/GlitchPass.js'
import { DotScreenPass } from 'three/examples/jsm/postprocessing/DotScreenPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { Pane } from 'tweakpane'

// water shader
import waterVertex from './shaders/water/vertex.glsl'
import waterFragment from './shaders/water/fragment.glsl'

import particleVertex from './shaders/particles/vertex.glsl'
import particleFragment from './shaders/particles/fragment.glsl'

import particle from '../static/point.png'

let debugMode = window.location.hash === '#debug'
console.log(debugMode)
/**
 * Debug
 */

let debug = null

if (debugMode) {
    debug = new Pane()
    debug.containerElem_.style.width = '350px'
}

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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load(particle)

/**
 * Water
 */

// colors
const colors = {}
// depth
colors.depth = {}
colors.depth.value = "#18438c"
colors.depth.instance = new THREE.Color(colors.depth.value)

// surface
colors.surface = {}
colors.surface.value = "#ffffff"
colors.surface.instance = new THREE.Color(colors.surface.value)

const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

const waterMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    vertexShader: waterVertex,
    fragmentShader: waterFragment,
    uniforms: {
        uTime: { value: 0 },
        // big waves
        uBigWavesElevation: { value: 0.13 },
        uBigWavesFrequency: { value: new THREE.Vector2(4, 2.5) },
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

if (debugMode) {
    // color debug
    const colorFolder = debug.addFolder({
        title: 'Colors',
        expanded: true
    })

    colorFolder.addInput(
        colors.depth,
        'value',
        { label: 'uDepthColor' }
    )
        .on('change', () => {
            colors.depth.instance.set(colors.depth.value)
        })

    colorFolder.addInput(
        colors.surface,
        'value',
        { label: 'uSurfaceColor' }
    )
        .on('change', () => {
            colors.surface.instance.set(colors.surface.value)
        })

    colorFolder.addInput(
        waterMaterial.uniforms.uColorOffset,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uColorOffset' }
    )

    colorFolder.addInput(
        waterMaterial.uniforms.uColorMultiplier,
        'value',
        { min: 0, max: 10, step: 0.01, label: 'uColorMultiplier' }
    )

    // big waves debug
    const bigWavesFolder = debug.addFolder({
        title: 'Big Waves',
        expanded: true
    })
    bigWavesFolder.addInput(
        waterMaterial.uniforms.uBigWavesElevation,
        'value',
        { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesElevation' }
    )

    bigWavesFolder.addInput(
        waterMaterial.uniforms.uBigWavesFrequency,
        'value',
        { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesFrequency' }
    )

    bigWavesFolder.addInput(
        waterMaterial.uniforms.uBigWavesSpeed,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uBigWavesSpeed' }
    )

    // small waves debug
    const smallWavesFolder = debug.addFolder({
        title: 'Small Waves',
        expanded: true
    })

    smallWavesFolder.addInput(
        waterMaterial.uniforms.uSmallWavesElevation,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uSmallWavesElevation' }
    )

    smallWavesFolder.addInput(
        waterMaterial.uniforms.uSmallWavesSpeed,
        'value',
        { min: 0, max: 4, step: 0.01, label: 'uSmallWavesSpeed' }
    )

    smallWavesFolder.addInput(
        waterMaterial.uniforms.uSmallWavesFrequency,
        'value',
        { min: 0, max: 30, step: 0.01, label: 'uSmallWavesFrequency' }
    )

    smallWavesFolder.addInput(
        waterMaterial.uniforms.uSmallWavesIterations,
        'value',
        { min: 0, max: 6, step: 0.01, label: 'uSmallWavesIterations' }
    )

}

const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = - Math.PI * 0.5
scene.add(water)

const count = 200;

const position = new Float32Array(count * 3)
const progress = new Float32Array(count)
const scale = new Float32Array(count)
const alpha = new Float32Array(count)

for (let i = 0; i < count; i++) {
    position[i * 3 + 0] = (Math.random() - 0.5) * 2
    position[i * 3 + 1] = - 0.2
    position[i * 3 + 2] = (Math.random() - 0.5) * 2

    scale[i] = Math.random()
    alpha[i] = Math.random()
    progress[i] = Math.random()
}

const particleGeometry = new THREE.BufferGeometry()
particleGeometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scale, 1))
particleGeometry.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1))
particleGeometry.setAttribute('aProgress', new THREE.BufferAttribute(progress, 1))

const particleMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: particleVertex,
    fragmentShader: particleFragment,
    uniforms: {
        uMask: { value: particleTexture },
        uTime: { value: 0 },
        uSize: { value: 25 },
        uProgressSpeed: { value: 0.1 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    }
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
 * Post processing
 */
// compser
const effectComposer = new EffectComposer(renderer)

// passes
const renderPass = new RenderPass(scene, camera)
effectComposer.addPass(renderPass)

const glitchPass = new GlitchPass()
glitchPass.goWild = false
glitchPass.enabled = false
effectComposer.addPass(glitchPass)

const dotScreenPass = new DotScreenPass()
dotScreenPass.enabled = false
effectComposer.addPass(dotScreenPass)

const rgbShiftPass = new ShaderPass(RGBShiftShader)
rgbShiftPass.enabled = true
effectComposer.addPass(rgbShiftPass)

const bloomPass = new UnrealBloomPass()
bloomPass.enabled = true
bloomPass.strength = 0.25
bloomPass.radius = 4
// bloomPass.threshold = 0.2
effectComposer.addPass(bloomPass)

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
    particleMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()