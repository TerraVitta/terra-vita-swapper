/**
 * GPU-Accelerated Fluid Simulation
 * Implements 2D Navier-Stokes equations with:
 * - Advection (semi-Lagrangian)
 * - Divergence computation
 * - Pressure solve (Jacobi iterations)
 * - Vorticity confinement
 * - Dye advection with decay
 */

export interface FluidSimConfig {
  // Simulation parameters
  viscosity: number;           // 0.0001–0.02, default 0.001
  diffusion: number;           // 0.0–1.0, default 0.0
  vorticityStrength: number;   // 0–50, default 20
  pressureIterations: number;  // 10–40, default 20
  dyeDecay: number;           // 0.95–0.999, default 0.98
  dt: number;                 // timestep, default 0.016
  
  // Resolution
  simWidth: number;
  simHeight: number;
  dyeResolution: number;      // multiplier for dye texture, default 1.0
  
  // Rendering
  curl: number;               // 0–50, default 30
  bloomIntensity: number;     // 0–1, default 0.8
  splatRadius: number;        // 0.001–0.01, default 0.005
}

export interface PointerData {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  down: boolean;
  moved: boolean;
  color: [number, number, number];
}

export class FluidSimulation {
  private gl: WebGL2RenderingContext;
  private config: FluidSimConfig;
  
  // Framebuffers for ping-pong rendering
  private velocity: DoubleFBO;
  private density: DoubleFBO;
  private pressure: DoubleFBO;
  private divergence: SingleFBO;
  private curl: SingleFBO;
  
  // Shader programs
  private advectionProgram!: WebGLProgram;
  private divergenceProgram!: WebGLProgram;
  private pressureProgram!: WebGLProgram;
  private gradientSubtractProgram!: WebGLProgram;
  private curlProgram!: WebGLProgram;
  private vorticityProgram!: WebGLProgram;
  private splatProgram!: WebGLProgram;
  private displayProgram!: WebGLProgram;
  
  private quadVAO!: WebGLVertexArrayObject;
  private pointers: PointerData[] = [];
  private lastTime = 0;

  constructor(canvas: HTMLCanvasElement, config: Partial<FluidSimConfig> = {}) {
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      antialias: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
    
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;
    
    // Default config
    this.config = {
      viscosity: 0.001,
      diffusion: 0.0,
      vorticityStrength: 20,
      pressureIterations: 20,
      dyeDecay: 0.98,
      dt: 0.016,
      simWidth: 512,
      simHeight: 512,
      dyeResolution: 1.0,
      curl: 30,
      bloomIntensity: 0.8,
      splatRadius: 0.005,
      ...config,
    };
    
    this.init();
  }
  
  private init() {
    const { gl, config } = this;
    
    // Enable extensions
    gl.getExtension('EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    
    // Create framebuffers
    this.velocity = new DoubleFBO(gl, config.simWidth, config.simHeight, gl.RG16F, gl.RG, gl.HALF_FLOAT);
    this.density = new DoubleFBO(gl, Math.floor(config.simWidth * config.dyeResolution), Math.floor(config.simHeight * config.dyeResolution), gl.RGBA16F, gl.RGBA, gl.HALF_FLOAT);
    this.pressure = new DoubleFBO(gl, config.simWidth, config.simHeight, gl.R16F, gl.RED, gl.HALF_FLOAT);
    this.divergence = new SingleFBO(gl, config.simWidth, config.simHeight, gl.R16F, gl.RED, gl.HALF_FLOAT);
    this.curl = new SingleFBO(gl, config.simWidth, config.simHeight, gl.R16F, gl.RED, gl.HALF_FLOAT);
    
    // Create shaders
    this.compileShaders();
    
    // Create full-screen quad
    this.createQuad();
  }
  
  private compileShaders() {
    const { gl } = this;
    
    // Vertex shader (shared)
    const vertexShader = this.compileShader(gl.VERTEX_SHADER, baseVertexShader);
    
    // Compile all fragment shaders
    this.advectionProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, advectionShader));
    this.divergenceProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, divergenceShader));
    this.pressureProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, pressureShader));
    this.gradientSubtractProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, gradientSubtractShader));
    this.curlProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, curlShader));
    this.vorticityProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, vorticityShader));
    this.splatProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, splatShader));
    this.displayProgram = this.createProgram(vertexShader, this.compileShader(gl.FRAGMENT_SHADER, displayShader));
  }
  
  private compileShader(type: number, source: string): WebGLShader {
    const { gl } = this;
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      throw new Error('Shader compilation failed');
    }
    
    return shader;
  }
  
  private createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
    const { gl } = this;
    const program = gl.createProgram()!;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      throw new Error('Program linking failed');
    }
    
    return program;
  }
  
  private createQuad() {
    const { gl } = this;
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    
    this.quadVAO = gl.createVertexArray()!;
    gl.bindVertexArray(this.quadVAO);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  }
  
  public update(time: number) {
    const dt = Math.min((time - this.lastTime) / 1000, 0.016);
    this.lastTime = time;
    
    const { gl } = this;
    gl.disable(gl.BLEND);
    
    // Apply pointer splats
    this.applyInputs();
    
    // Compute curl
    this.computeCurl(this.velocity.read);
    
    // Apply vorticity confinement
    this.applyVorticity(this.velocity.read, this.curl.fbo);
    
    // Advect velocity
    this.advect(this.velocity.read, this.velocity.read, this.velocity.write, dt, this.config.viscosity);
    this.velocity.swap();
    
    // Advect dye
    this.advect(this.velocity.read, this.density.read, this.density.write, dt, this.config.diffusion);
    this.density.swap();
    
    // Apply dye decay
    this.applyDecay(this.density);
    
    // Compute divergence
    this.computeDivergence(this.velocity.read);
    
    // Clear pressure
    this.clearFBO(this.pressure.read);
    
    // Solve pressure (Jacobi iterations)
    for (let i = 0; i < this.config.pressureIterations; i++) {
      this.solvePressure(this.pressure.read, this.divergence.fbo, this.pressure.write);
      this.pressure.swap();
    }
    
    // Subtract pressure gradient
    this.subtractGradient(this.velocity.read, this.pressure.read, this.velocity.write);
    this.velocity.swap();
  }
  
  private applyInputs() {
    for (const pointer of this.pointers) {
      if (pointer.moved) {
        this.splat(this.velocity, pointer.x, pointer.y, pointer.dx, pointer.dy);
        this.splat(this.density, pointer.x, pointer.y, pointer.dx * 2, pointer.dy * 2, pointer.color);
        pointer.moved = false;
      }
    }
  }
  
  private splat(target: DoubleFBO, x: number, y: number, dx: number, dy: number, color: [number, number, number] = [dx, dy, 0]) {
    const { gl, splatProgram, config } = this;
    
    gl.useProgram(splatProgram);
    gl.uniform1i(gl.getUniformLocation(splatProgram, 'uTarget'), target.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(splatProgram, 'aspectRatio'), gl.canvas.width / gl.canvas.height);
    gl.uniform2f(gl.getUniformLocation(splatProgram, 'point'), x, y);
    gl.uniform3f(gl.getUniformLocation(splatProgram, 'color'), color[0], color[1], color[2]);
    gl.uniform1f(gl.getUniformLocation(splatProgram, 'radius'), config.splatRadius);
    
    this.blit(target.write);
    target.swap();
  }
  
  private advect(velocity: FBO, source: FBO, target: FBO, dt: number, dissipation: number) {
    const { gl, advectionProgram, config } = this;
    
    gl.useProgram(advectionProgram);
    gl.uniform1i(gl.getUniformLocation(advectionProgram, 'uVelocity'), velocity.attach(0));
    gl.uniform1i(gl.getUniformLocation(advectionProgram, 'uSource'), source.attach(1));
    gl.uniform2f(gl.getUniformLocation(advectionProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, 'dt'), dt);
    gl.uniform1f(gl.getUniformLocation(advectionProgram, 'dissipation'), 1.0 - dissipation);
    
    this.blit(target);
  }
  
  private computeDivergence(velocity: FBO) {
    const { gl, divergenceProgram, config, divergence } = this;
    
    gl.useProgram(divergenceProgram);
    gl.uniform1i(gl.getUniformLocation(divergenceProgram, 'uVelocity'), velocity.attach(0));
    gl.uniform2f(gl.getUniformLocation(divergenceProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    
    this.blit(divergence.fbo);
  }
  
  private solvePressure(pressure: FBO, divergence: FBO, target: FBO) {
    const { gl, pressureProgram, config } = this;
    
    gl.useProgram(pressureProgram);
    gl.uniform1i(gl.getUniformLocation(pressureProgram, 'uPressure'), pressure.attach(0));
    gl.uniform1i(gl.getUniformLocation(pressureProgram, 'uDivergence'), divergence.attach(1));
    gl.uniform2f(gl.getUniformLocation(pressureProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    
    this.blit(target);
  }
  
  private subtractGradient(velocity: FBO, pressure: FBO, target: FBO) {
    const { gl, gradientSubtractProgram, config } = this;
    
    gl.useProgram(gradientSubtractProgram);
    gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, 'uVelocity'), velocity.attach(0));
    gl.uniform1i(gl.getUniformLocation(gradientSubtractProgram, 'uPressure'), pressure.attach(1));
    gl.uniform2f(gl.getUniformLocation(gradientSubtractProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    
    this.blit(target);
  }
  
  private computeCurl(velocity: FBO) {
    const { gl, curlProgram, config, curl } = this;
    
    gl.useProgram(curlProgram);
    gl.uniform1i(gl.getUniformLocation(curlProgram, 'uVelocity'), velocity.attach(0));
    gl.uniform2f(gl.getUniformLocation(curlProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    
    this.blit(curl.fbo);
  }
  
  private applyVorticity(velocity: FBO, curl: FBO) {
    const { gl, vorticityProgram, config } = this;
    
    gl.useProgram(vorticityProgram);
    gl.uniform1i(gl.getUniformLocation(vorticityProgram, 'uVelocity'), velocity.attach(0));
    gl.uniform1i(gl.getUniformLocation(vorticityProgram, 'uCurl'), curl.attach(1));
    gl.uniform2f(gl.getUniformLocation(vorticityProgram, 'texelSize'), 1.0 / config.simWidth, 1.0 / config.simHeight);
    gl.uniform1f(gl.getUniformLocation(vorticityProgram, 'curl'), config.vorticityStrength);
    gl.uniform1f(gl.getUniformLocation(vorticityProgram, 'dt'), config.dt);
    
    this.blit(velocity);
  }
  
  private applyDecay(target: DoubleFBO) {
    const { gl, config } = this;
    
    // Simple decay by blending
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.blendEquation(gl.FUNC_ADD);
    
    // Use display shader with alpha for decay
    gl.useProgram(this.displayProgram);
    gl.uniform1i(gl.getUniformLocation(this.displayProgram, 'uTexture'), target.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(this.displayProgram, 'alpha'), config.dyeDecay);
    
    this.blit(target.write);
    target.swap();
    
    gl.disable(gl.BLEND);
  }
  
  private clearFBO(fbo: FBO) {
    const { gl } = this;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.framebuffer);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  
  private blit(target: FBO | null) {
    const { gl, quadVAO } = this;
    
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
    
    gl.bindVertexArray(quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  public render(target: WebGLFramebuffer | null = null) {
    const { gl, displayProgram, density } = this;
    
    gl.useProgram(displayProgram);
    gl.uniform1i(gl.getUniformLocation(displayProgram, 'uTexture'), density.read.attach(0));
    gl.uniform1f(gl.getUniformLocation(displayProgram, 'alpha'), 1.0);
    
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    
    gl.bindVertexArray(this.quadVAO);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }
  
  public addPointer(pointer: PointerData) {
    this.pointers.push(pointer);
  }
  
  public updatePointer(id: number, x: number, y: number) {
    const pointer = this.pointers.find(p => p.id === id);
    if (pointer) {
      pointer.dx = x - pointer.x;
      pointer.dy = y - pointer.y;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = Math.abs(pointer.dx) > 0 || Math.abs(pointer.dy) > 0;
    }
  }
  
  public removePointer(id: number) {
    this.pointers = this.pointers.filter(p => p.id !== id);
  }
  
  public getDensityTexture(): WebGLTexture {
    return this.density.read.texture;
  }
  
  public getVelocityTexture(): WebGLTexture {
    return this.velocity.read.texture;
  }
  
  public resize(width: number, height: number) {
    this.gl.canvas.width = width;
    this.gl.canvas.height = height;
  }
  
  public destroy() {
    // Clean up resources
    this.velocity.destroy();
    this.density.destroy();
    this.pressure.destroy();
    this.divergence.destroy();
    this.curl.destroy();
  }
}

// Framebuffer classes
class FBO {
  constructor(
    public gl: WebGL2RenderingContext,
    public width: number,
    public height: number,
    public internalFormat: number,
    public format: number,
    public type: number
  ) {
    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);
    
    this.framebuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.viewport(0, 0, width, height);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }
  
  public texture: WebGLTexture;
  public framebuffer: WebGLFramebuffer;
  
  public attach(id: number): number {
    this.gl.activeTexture(this.gl.TEXTURE0 + id);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    return id;
  }
  
  public destroy() {
    this.gl.deleteTexture(this.texture);
    this.gl.deleteFramebuffer(this.framebuffer);
  }
}

class SingleFBO {
  public fbo: FBO;
  
  constructor(gl: WebGL2RenderingContext, width: number, height: number, internalFormat: number, format: number, type: number) {
    this.fbo = new FBO(gl, width, height, internalFormat, format, type);
  }
  
  public destroy() {
    this.fbo.destroy();
  }
}

class DoubleFBO {
  public read: FBO;
  public write: FBO;
  
  constructor(gl: WebGL2RenderingContext, width: number, height: number, internalFormat: number, format: number, type: number) {
    this.read = new FBO(gl, width, height, internalFormat, format, type);
    this.write = new FBO(gl, width, height, internalFormat, format, type);
  }
  
  public swap() {
    const temp = this.read;
    this.read = this.write;
    this.write = temp;
  }
  
  public destroy() {
    this.read.destroy();
    this.write.destroy();
  }
}

// Shader sources
const baseVertexShader = `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const advectionShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform float dt;
uniform float dissipation;

void main() {
  vec2 coord = vUv - dt * texture(uVelocity, vUv).xy * texelSize;
  fragColor = dissipation * texture(uSource, coord);
}
`;

const divergenceShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 texelSize;

void main() {
  float L = texture(uVelocity, vUv - vec2(texelSize.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(texelSize.x, 0.0)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, texelSize.y)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, texelSize.y)).y;
  
  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const pressureShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 texelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, texelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, texelSize.y)).x;
  float C = texture(uPressure, vUv).x;
  float divergence = texture(uDivergence, vUv).x;
  
  float pressure = (L + R + B + T - divergence) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const gradientSubtractShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 texelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(texelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(texelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, texelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, texelSize.y)).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  
  velocity -= vec2(R - L, T - B) * 0.5;
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

const curlShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 texelSize;

void main() {
  float L = texture(uVelocity, vUv - vec2(texelSize.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(texelSize.x, 0.0)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, texelSize.y)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, texelSize.y)).x;
  
  float vorticity = R - L - T + B;
  fragColor = vec4(vorticity * 0.5, 0.0, 0.0, 1.0);
}
`;

const vorticityShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 texelSize;
uniform float curl;
uniform float dt;

void main() {
  float L = texture(uCurl, vUv - vec2(texelSize.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(texelSize.x, 0.0)).x;
  float T = texture(uCurl, vUv + vec2(0.0, texelSize.y)).x;
  float B = texture(uCurl, vUv - vec2(0.0, texelSize.y)).x;
  float C = texture(uCurl, vUv).x;
  
  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= curl * C;
  force.y *= -1.0;
  
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * dt;
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

const splatShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec2 point;
uniform vec3 color;
uniform float radius;

void main() {
  vec2 p = vUv - point;
  p.x *= aspectRatio;
  
  vec3 splat = exp(-dot(p, p) / radius) * color;
  vec3 base = texture(uTarget, vUv).xyz;
  
  fragColor = vec4(base + splat, 1.0);
}
`;

const displayShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float alpha;

void main() {
  fragColor = texture(uTexture, vUv);
  fragColor.a = alpha;
}
`;
