varying vec2 vUv;

uniform vec3 uBottomColor;
uniform vec3 uTopColor;

void main() {
  vec3 color = mix(uTopColor, uBottomColor, vUv.y) * 2.0;

  gl_FragColor = vec4(color, 1.0);
}