/**
 * WebGL Liquid Glass Shader System
 * Provides realistic glass effects with refraction, caustics, and chromatic aberration
 */

export interface ShaderUniforms {
  u_time: number;
  u_resolution: [number, number];
  u_mouse: [number, number];
  u_themeIntensity: number;
  u_refraction: number;
  u_curlScale: number;
  u_curlSpeed: number;
  u_curlAmplitude: number;
  u_chromaticAberration: number;
  u_fresnelPower: number;
  u_lightDirection: [number, number, number];
}

// Fragment shader for liquid glass effect
export const liquidGlassFragmentShader = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_themeIntensity;
uniform float u_refraction;
uniform float u_curlScale;
uniform float u_curlSpeed;
uniform float u_curlAmplitude;
uniform float u_chromaticAberration;
uniform float u_fresnelPower;
uniform vec3 u_lightDirection;
uniform sampler2D u_bgTexture;
uniform sampler2D u_normalMap;

varying vec2 v_texCoord;

// Simplex noise for curl perturbation
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Curl noise for flow
vec2 curlNoise(vec2 p, float t) {
  float eps = 0.01;
  float n1 = snoise(p + vec2(0.0, eps) + t * u_curlSpeed);
  float n2 = snoise(p + vec2(eps, 0.0) + t * u_curlSpeed);
  float n3 = snoise(p - vec2(0.0, eps) + t * u_curlSpeed);
  float n4 = snoise(p - vec2(eps, 0.0) + t * u_curlSpeed);
  return vec2((n1 - n3) / (2.0 * eps), (n4 - n2) / (2.0 * eps)) * u_curlAmplitude;
}

// Fresnel effect
float fresnel(vec3 normal, vec3 viewDir, float power) {
  return pow(1.0 - max(dot(normal, viewDir), 0.0), power);
}

void main() {
  vec2 uv = v_texCoord;
  vec2 pixelCoord = uv * u_resolution;
  
  // Generate dynamic normal map using curl noise
  vec2 curlOffset = curlNoise(uv * u_curlScale, u_time);
  vec3 perturbedNormal = normalize(vec3(curlOffset * 0.5, 1.0));
  
  // Mouse-driven parallax offset
  vec2 mouseOffset = (u_mouse - 0.5) * 0.02;
  
  // Calculate view direction (camera looking at surface)
  vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
  
  // Fresnel for edge highlighting
  float fresnelTerm = fresnel(perturbedNormal, viewDir, u_fresnelPower);
  
  // Refraction with chromatic aberration
  vec2 refractionOffset = perturbedNormal.xy * u_refraction + mouseOffset;
  
  // Sample background with chromatic dispersion
  float aberration = u_chromaticAberration * fresnelTerm;
  vec2 uvR = uv + refractionOffset + vec2(aberration, 0.0);
  vec2 uvG = uv + refractionOffset;
  vec2 uvB = uv + refractionOffset - vec2(aberration, 0.0);
  
  // Clamp UVs to prevent edge artifacts
  uvR = clamp(uvR, 0.0, 1.0);
  uvG = clamp(uvG, 0.0, 1.0);
  uvB = clamp(uvB, 0.0, 1.0);
  
  // Sample background texture with chromatic aberration
  float r = texture2D(u_bgTexture, uvR).r;
  float g = texture2D(u_bgTexture, uvG).g;
  float b = texture2D(u_bgTexture, uvB).b;
  vec3 refractedColor = vec3(r, g, b);
  
  // Specular highlight based on light direction
  vec3 halfDir = normalize(u_lightDirection + viewDir);
  float specular = pow(max(dot(perturbedNormal, halfDir), 0.0), 32.0);
  
  // Edge rim light (Fresnel-based)
  vec3 rimLight = vec3(0.9, 0.95, 1.0) * fresnelTerm * 0.6;
  
  // Caustics effect using curl noise
  float caustics = snoise(uv * 4.0 + curlOffset + u_time * 0.2) * 0.5 + 0.5;
  caustics = pow(caustics, 2.0) * 0.15;
  
  // Theme-based tinting
  vec3 glassTint = mix(
    vec3(0.95, 0.97, 1.0),  // Light mode: cool white
    vec3(0.6, 0.7, 0.85),   // Dark mode: cool blue-gray
    u_themeIntensity
  );
  
  // Composite final color
  vec3 finalColor = refractedColor * glassTint;
  finalColor += rimLight;
  finalColor += vec3(specular) * 0.8;
  finalColor += vec3(caustics) * glassTint;
  
  // Apply subtle internal glow
  float internalGlow = (1.0 - length(uv - 0.5) * 0.8) * 0.15;
  finalColor += glassTint * internalGlow;
  
  // Output with alpha for blending
  float alpha = 0.85 + fresnelTerm * 0.15;
  gl_FragColor = vec4(finalColor, alpha);
}
`;

// Vertex shader (simple pass-through)
export const liquidGlassVertexShader = `
precision highp float;

attribute vec2 a_position;
attribute vec2 a_texCoord;

varying vec2 v_texCoord;

void main() {
  v_texCoord = a_texCoord;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Default uniform values
export const defaultUniforms: ShaderUniforms = {
  u_time: 0,
  u_resolution: [1920, 1080],
  u_mouse: [0.5, 0.5],
  u_themeIntensity: 0, // 0 = light, 1 = dark
  u_refraction: 0.04,
  u_curlScale: 3.0,
  u_curlSpeed: 0.15,
  u_curlAmplitude: 1.2,
  u_chromaticAberration: 0.003,
  u_fresnelPower: 3.5,
  u_lightDirection: [0.5, 0.8, 1.0],
};

/**
 * Creates and compiles a shader
 */
export function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  
  return shader;
}

/**
 * Creates a shader program
 */
export function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program linking error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  
  return program;
}
