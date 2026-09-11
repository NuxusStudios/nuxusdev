"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const VERT = `attribute vec2 p; void main() { gl_Position = vec4(p, 0.0, 1.0); }`

/**
 * Two crossing diagonal light fields — the X from the wordmark, animated.
 * Where the fields intersect the surface blooms; everything else falls off into
 * near-black, so the headline stays readable on top.
 */
const FRAG = `
precision highp float;

uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform float u_intensity;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float total = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    total += noise(p) * amp;
    p *= 2.03;
    amp *= 0.5;
  }
  return total;
}

/**
 * A family of thin diagonal streaks running in one direction. The power curve
 * turns the sine into narrow bright filaments instead of broad bands.
 */
float streaks(vec2 p, float dir, float t, float freq, float sharp) {
  float warp = fbm(p * 1.6 + vec2(t * 0.06, t * 0.04)) - 0.5;
  float d = (p.x * dir + p.y) * freq + warp * 1.3 + t;
  float band = 0.5 + 0.5 * sin(d);
  return pow(band, sharp);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = (uv - 0.5) * vec2(u_res.x / u_res.y, 1.0);

  p += u_mouse * 0.05;

  float t = u_time * 0.22;

  // two crossing families, at slightly different rates so the lattice drifts
  float a = streaks(p, 1.0, t, 9.0, 12.0)
          + streaks(p, 1.0, t * 1.31 + 2.0, 19.0, 18.0) * 0.4;
  float b = streaks(p, -1.0, -t * 0.83, 8.6, 12.0)
          + streaks(p, -1.0, -t * 1.17 - 1.0, 17.0, 18.0) * 0.4;

  // where the two families intersect, the surface blooms
  float crossing = a * b;

  float glow = a * 0.38 + b * 0.38 + crossing * 3.6;

  vec3 deep  = vec3(0.020, 0.024, 0.044);
  vec3 cool  = vec3(0.043, 0.180, 0.420);
  vec3 hot   = vec3(0.216, 0.612, 0.980);
  vec3 spark = vec3(0.88, 0.95, 1.0);

  vec3 col = deep;
  col = mix(col, cool, clamp(glow * 0.9, 0.0, 1.0));
  col = mix(col, hot, clamp(smoothstep(0.7, 1.7, glow), 0.0, 1.0));
  col = mix(col, spark, clamp(smoothstep(1.6, 2.9, glow), 0.0, 1.0) * 0.7);

  // the headline sits in the middle, so hollow out a dark ellipse behind it
  float safe = smoothstep(0.10, 0.78, length((p - vec2(0.0, 0.02)) * vec2(0.70, 1.7)));
  col *= 0.22 + 0.78 * safe;

  // let the edges fall away rather than filling the frame
  float radial = smoothstep(1.55, 0.25, length(p * vec2(0.68, 1.0)));
  col *= 0.52 + 0.60 * radial;

  // calm behind the nav, and fade into the page at the bottom
  col *= smoothstep(-0.35, 0.20, uv.y);
  col *= mix(1.0, 0.30, smoothstep(0.70, 1.0, uv.y));

  col *= 1.05;

  col += (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.018;

  gl_FragColor = vec4(col * u_intensity, 1.0);
}
`

export function HeroCanvas({ className }: { className?: string }) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const [failed, setFailed] = React.useState(false)

  React.useEffect(() => {
    const canvas = ref.current
    if (!canvas) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" })
    if (!gl) {
      setFailed(true)
      return
    }

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn(gl.getShaderInfoLog(shader))
      }
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      setFailed(true)
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const attr = gl.getAttribLocation(program, "p")
    gl.enableVertexAttribArray(attr)
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uMouse = gl.getUniformLocation(program, "u_mouse")
    const uIntensity = gl.getUniformLocation(program, "u_intensity")

    const mouse = { x: 0, y: 0 }
    const target = { x: 0, y: 0 }

    const onPointer = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth - 0.5) * 2
      target.y = (0.5 - event.clientY / window.innerHeight) * 2
    }
    window.addEventListener("pointermove", onPointer, { passive: true })

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const { width, height } = canvas.getBoundingClientRect()
      canvas.width = Math.max(1, Math.floor(width * dpr))
      canvas.height = Math.max(1, Math.floor(height * dpr))
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    let raf = 0
    let running = true
    const start = performance.now()

    const render = () => {
      if (!running) return
      const elapsed = reduceMotion ? 12 : (performance.now() - start) / 1000

      mouse.x += (target.x - mouse.x) * 0.045
      mouse.y += (target.y - mouse.y) * 0.045

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, elapsed)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uIntensity, 1.0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      if (!reduceMotion) raf = requestAnimationFrame(render)
    }
    render()

    // don't burn cycles on a hidden tab
    const onVisibility = () => {
      if (document.hidden) {
        running = false
        cancelAnimationFrame(raf)
      } else if (!reduceMotion) {
        running = true
        render()
      }
    }
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      observer.disconnect()
      window.removeEventListener("pointermove", onPointer)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  if (failed) {
    return (
      <div
        aria-hidden
        className={cn(
          "size-full bg-[radial-gradient(120%_90%_at_50%_0%,#0e2a5c_0%,#08080f_60%)]",
          className
        )}
      />
    )
  }

  return <canvas ref={ref} aria-hidden className={cn("size-full", className)} />
}
