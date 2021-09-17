attribute float aScale;
attribute float aAlpha;
attribute float aProgress;

uniform float uSize;
uniform float uTime;
uniform float uProgressSpeed;
uniform float uPixelRatio;

varying float vAlpha;

#pragma glslify:  cnoise = require('../partials/perlinNoise3d.glsl')

void main() {

  float progress = mod(aProgress  + uTime * uProgressSpeed, 1.0);

  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  modelPosition.y += progress * 1.3;
  modelPosition.x += cnoise(modelPosition.xyz) * 2.0;
  modelPosition.z += cnoise(modelPosition.xyz) * 1.0;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectionPosition = projectionMatrix * viewPosition;

  gl_Position = projectionPosition;
  gl_PointSize = uSize * aScale * uPixelRatio;
  gl_PointSize *= 1.0 / -viewPosition.z;

  // varyings
  vAlpha = aAlpha;
}