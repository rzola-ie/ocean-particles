varying float vElevation;

uniform float uTime;

uniform float uBigWavesElevation;
uniform float uBigWavesSpeed;
uniform vec2 uBigWavesFrequency;

uniform float uSmallWavesElevation;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesIterations;

#pragma glslify:  cnoise = require('../partials/perlinNoise3d.glsl')

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  float elevation = sin(modelPosition.x * uBigWavesFrequency.x + uTime * uBigWavesSpeed) * sin(modelPosition.z * uBigWavesFrequency.y + uTime * uBigWavesSpeed) * uBigWavesElevation;

  for(float i = 1.0; i < uSmallWavesIterations; i++) {
    elevation -= abs(cnoise(vec3(modelPosition.xz * uSmallWavesFrequency * i, uTime * uSmallWavesSpeed)) * uSmallWavesElevation / i);
  }

  // modelPosition.y = elevation;

  modelPosition.y += elevation;

  vec4 viewPosition = viewMatrix * modelPosition;

  vec4 projectionPosition = projectionMatrix * viewPosition;


  gl_Position = projectionPosition;

  // varyings
  vElevation = elevation;
}