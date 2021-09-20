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

import gradientVertex from './shaders/gradient/vertex.glsl'
import gradientFragment from './shaders/gradient/fragment.glsl'

import particle from '../static/point.png'

let debugMode = window.location.hash === '#debug'
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
 * Gradient
 */
const gradient = {}

// colors
gradient.colors = {}

gradient.colors.top = {}
gradient.colors.top.value = '#152238'
gradient.colors.top.instance = new THREE.Color(gradient.colors.top.value)

gradient.colors.bottom = {}
gradient.colors.bottom.value = '#000000'
gradient.colors.bottom.instance = new THREE.Color(gradient.colors.bottom.value)

// geometry
gradient.geometry = new THREE.PlaneGeometry(2, 2, 1, 1);

// material
gradient.material = new THREE.ShaderMaterial({
    depthWrite: false,
    vertexShader: gradientVertex,
    fragmentShader: gradientFragment,
    uniforms: {
        uTopColor: { value: gradient.colors.top.instance },
        uBottomColor: { value: gradient.colors.bottom.instance }
    }
})

// mesh
gradient.mesh = new THREE.Mesh(gradient.geometry, gradient.material)

scene.add(gradient.mesh)

if (debugMode) {
    const gradientFolder = debug.addFolder({
        title: 'Gradient',
        expanded: true
    })

    gradientFolder.addInput(
        gradient.colors.top,
        'value'
    )
        .on('change', () => {
            gradient.colors.top.instance.set(gradient.colors.top.value)
        })
}

/**
 * Water
 */
const water = {}

// colors
water.colors = {}

// depth
water.colors.depth = {}
water.colors.depth.value = "#18438c"
water.colors.depth.instance = new THREE.Color(water.colors.depth.value)

// surface
water.colors.surface = {}
water.colors.surface.value = "#ffffff"
water.colors.surface.instance = new THREE.Color(water.colors.surface.value)

water.geometry = new THREE.PlaneGeometry(2, 2, 512, 512)

water.material = new THREE.ShaderMaterial({
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
        uDepthColor: { value: water.colors.depth.instance },
        uSurfaceColor: { value: water.colors.surface.instance },
        uColorOffset: { value: 0.05 },
        uColorMultiplier: { value: 5.0 }
    }
})

if (debugMode) {
    // color debug
    const colorFolder = debug.addFolder({
        title: 'Water Colors',
        expanded: true
    })

    colorFolder.addInput(
        water.colors.depth,
        'value',
        { label: 'uDepthColor' }
    )
        .on('change', () => {
            water.colors.depth.instance.set(water.colors.depth.value)
        })

    colorFolder.addInput(
        water.colors.surface,
        'value',
        { label: 'uSurfaceColor' }
    )
        .on('change', () => {
            water.colors.surface.instance.set(water.colors.surface.value)
        })

    colorFolder.addInput(
        water.material.uniforms.uColorOffset,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uColorOffset' }
    )

    colorFolder.addInput(
        water.material.uniforms.uColorMultiplier,
        'value',
        { min: 0, max: 10, step: 0.01, label: 'uColorMultiplier' }
    )

    // big waves debug
    const bigWavesFolder = debug.addFolder({
        title: 'Big Waves',
        expanded: true
    })
    bigWavesFolder.addInput(
        water.material.uniforms.uBigWavesElevation,
        'value',
        { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesElevation' }
    )

    bigWavesFolder.addInput(
        water.material.uniforms.uBigWavesFrequency,
        'value',
        { min: 0, max: 0.5, step: 0.01, label: 'uBigWavesFrequency' }
    )

    bigWavesFolder.addInput(
        water.material.uniforms.uBigWavesSpeed,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uBigWavesSpeed' }
    )

    // small waves debug
    const smallWavesFolder = debug.addFolder({
        title: 'Small Waves',
        expanded: true
    })

    smallWavesFolder.addInput(
        water.material.uniforms.uSmallWavesElevation,
        'value',
        { min: 0, max: 1, step: 0.01, label: 'uSmallWavesElevation' }
    )

    smallWavesFolder.addInput(
        water.material.uniforms.uSmallWavesSpeed,
        'value',
        { min: 0, max: 4, step: 0.01, label: 'uSmallWavesSpeed' }
    )

    smallWavesFolder.addInput(
        water.material.uniforms.uSmallWavesFrequency,
        'value',
        { min: 0, max: 30, step: 0.01, label: 'uSmallWavesFrequency' }
    )

    smallWavesFolder.addInput(
        water.material.uniforms.uSmallWavesIterations,
        'value',
        { min: 0, max: 6, step: 0.01, label: 'uSmallWavesIterations' }
    )

}

water.mesh = new THREE.Mesh(water.geometry, water.material)
water.mesh.rotation.x = - Math.PI * 0.5
scene.add(water.mesh)

/**
 * Particles
 */
const particles = {}
particles.count = 200

particles.position = {}
particles.position.data = new Float32Array(particles.count * 3)
particles.position.attribute = new THREE.BufferAttribute(particles.position.data, 3)

particles.progress = {}
particles.progress.data = new Float32Array(particles.count)
particles.progress.attribute = new THREE.BufferAttribute(particles.progress.data, 1)

particles.scale = {}
particles.scale.data = new Float32Array(particles.count)
particles.scale.attribute = new THREE.BufferAttribute(particles.scale.data, 1)

particles.alpha = {}
particles.alpha.data = new Float32Array(particles.count)
particles.alpha.attribute = new THREE.BufferAttribute(particles.alpha.data, 1)

for (let i = 0; i < particles.count; i++) {
    particles.position.data[i * 3 + 0] = (Math.random() - 0.5) * 2
    particles.position.data[i * 3 + 1] = - 0.2
    particles.position.data[i * 3 + 2] = (Math.random() - 0.5) * 2

    particles.scale.data[i] = Math.random()
    particles.progress.data[i] = Math.random()
    particles.alpha.data[i] = Math.random()
}

particles.geometry = new THREE.BufferGeometry()
particles.geometry.setAttribute('position', particles.position.attribute)
particles.geometry.setAttribute('aProgress', particles.progress.attribute)
particles.geometry.setAttribute('aScale', particles.scale.attribute)
particles.geometry.setAttribute('aAlpha', particles.alpha.attribute)

particles.material = new THREE.ShaderMaterial({
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

particles.points = new THREE.Points(particles.geometry, particles.material)
scene.add(particles.points)

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
    water.material.uniforms.uTime.value = elapsedTime
    particles.material.uniforms.uTime.value = elapsedTime

    // Update controls
    controls.update()

    // Render
    // renderer.render(scene, camera)
    effectComposer.render()

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()