import { useEffect, useRef } from "react"

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl")
    if (!gl) return

    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `

    // Fragment shader - warm branded gradient with subtle flow
    const fragmentShaderSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float noise(vec2 p) {
        return sin(p.x) * sin(p.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        uv = uv * 2.0 - 1.0;
        uv.x *= u_resolution.x / u_resolution.y;

        vec3 base = vec3(0.02, 0.06, 0.04);
        vec3 warm = vec3(0.34, 0.82, 0.56);
        vec3 rich = vec3(0.04, 0.28, 0.16);

        float flow = cos(uv.x * 1.5 + u_time * 0.7) * 0.25;
        float pulse = sin(uv.y * 2.0 - u_time * 0.9) * 0.25;
        float mask = smoothstep(0.1, 0.6, length(uv + vec2(flow * 0.75, pulse * 0.5)));

        vec3 color = mix(rich, warm, mask);
        color = mix(base, color, 0.8);

        float detail = noise(vec2(uv.x * 6.0 + u_time * 0.35, uv.y * 6.0 - u_time * 0.25)) * 0.045;
        color += vec3(detail * 0.6, detail * 0.3, detail * 0.7);

        float glow = smoothstep(0.0, 0.7, sin(uv.x * 3.5 + u_time * 0.8) + cos(uv.y * 3.0 - u_time * 1.1));
        color += vec3(0.18, 0.08, 0.25) * glow * 0.18;

        color = pow(color, vec3(0.92));
        gl_FragColor = vec4(color, 1.0);
      }
    `

    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) return
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragmentShader) return
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    // Create program
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Set up geometry
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position"
    )
    gl.enableVertexAttribArray(positionAttributeLocation)
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)

    // Get uniform locations
    const timeUniformLocation = gl.getUniformLocation(program, "u_time")
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    )

    // Animation loop
    let startTime = Date.now()
    const animate = () => {
      const currentTime = (Date.now() - startTime) / 1000
      gl.uniform1f(timeUniformLocation, currentTime)
      gl.uniform2f(resolutionUniformLocation, canvas.width, canvas.height)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      requestAnimationFrame(animate)
    }
    animate()

    // Resize canvas
    const resizeCanvas = () => {
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{
        background:
          "linear-gradient(135deg, #051810 0%, #1a5a3a 45%, #2d9e6f 100%)",
      }}
    />
  )
}

export default ShaderBackground
