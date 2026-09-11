"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * A GLSL plasma rendered with a real WebGL context — falls back to a static
 * gradient if the browser refuses one.
 */
export function PlasmaShader({
  className,
  speed = 0.4,
  scale = 3.2,
  colorA = [0.35, 0.15, 0.95],
  colorB = [0.0, 0.85, 0.9],
}: {
  className?: string
  speed?: number
  scale?: number
  colorA?: [number, number, number] | number[]
  colorB?: [number, number, number] | number[]
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true })
    if (!gl) {
      setFailed(true)
      return
    }

    const vert = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`
    const frag = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform float u_scale;
      uniform vec3 u_a;
      uniform vec3 u_b;

      void main() {
        vec2 uv = (gl_FragCoord.xy / u_res.xy - 0.5) * vec2(u_res.x / u_res.y, 1.0) * u_scale;
        float t = u_time;
        float v = sin(uv.x + t)
                + sin(uv.y + t * 0.8)
                + sin((uv.x + uv.y + t) * 0.7)
                + sin(length(uv) * 2.0 - t * 1.2);
        v *= 0.25;
        vec3 col = mix(u_a, u_b, 0.5 + 0.5 * v);
        col += 0.12 * vec3(sin(v * 6.283), sin(v * 6.283 + 2.0), sin(v * 6.283 + 4.0));
        gl_FragColor = vec4(col, 1.0);
      }
    `

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vert))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, frag))
    gl.linkProgram(program)
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "p")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uScale = gl.getUniformLocation(program, "u_scale")
    const uA = gl.getUniformLocation(program, "u_a")
    const uB = gl.getUniformLocation(program, "u_b")

    let raf = 0
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, width * dpr)
      canvas.height = Math.max(1, height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const render = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, ((performance.now() - start) / 1000) * speed)
      gl.uniform1f(uScale, scale)
      gl.uniform3f(uA, colorA[0], colorA[1], colorA[2])
      gl.uniform3f(uB, colorB[0], colorB[1], colorB[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      raf = requestAnimationFrame(render)
    }
    render()

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [speed, scale, colorA, colorB])

  if (failed) {
    return (
      <div
        className={cn("size-full bg-[linear-gradient(120deg,#5b2cff,#00d4ff)]", className)}
        aria-hidden
      />
    )
  }

  return <canvas ref={ref} className={cn("size-full", className)} aria-hidden />
}
