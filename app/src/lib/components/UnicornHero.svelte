<!--
  UNICORN EFFECT - Danni Hero Background
  Deep indigo mesh gradient with organic domain-warped FBM.
  Mouse-reactive. Slow, elegant drift. Premium dark aesthetic.
-->
<script lang="ts">
	interface PassConfig {
		name: string;
		fragment: string;
		uniforms: Record<string, number | number[]>;
	}

	const FRAG = `#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_scale;
uniform float u_edgeWidth;
uniform vec3 u_edgeColor;
uniform vec3 u_glowColor;
uniform float u_glowRadius;
uniform float u_nodeSize;

in vec2 v_uv;
out vec4 fragColor;

const float TAU = 6.28318530718;

vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

struct VoronoiResult {
    float cellDist;
    float edgeDist;
    vec2 cellId;
    vec2 nearestPoint;
};

VoronoiResult voronoiEx(vec2 st, float time) {
    vec2 i_st = floor(st);
    vec2 f_st = fract(st);

    float minDist = 10.0;
    float secondDist = 10.0;
    vec2 minPoint = vec2(0.0);
    vec2 minCellId = vec2(0.0);

    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellId = i_st + neighbor;
            vec2 rnd = hash2(cellId);
            vec2 point = neighbor + 0.5 + 0.4 * sin(time * 0.3 + TAU * rnd);
            float d = length(point - f_st);

            if (d < minDist) {
                secondDist = minDist;
                minDist = d;
                minPoint = point;
                minCellId = cellId;
            } else if (d < secondDist) {
                secondDist = d;
            }
        }
    }

    float minEdgeDist = 10.0;
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            vec2 cellId = i_st + neighbor;
            vec2 rnd = hash2(cellId);
            vec2 point = neighbor + 0.5 + 0.4 * sin(time * 0.3 + TAU * rnd);

            vec2 diff = point - minPoint;
            if (dot(diff, diff) < 0.0001) continue;
            float edgeDist = dot(f_st - 0.5 * (minPoint + point), normalize(diff));
            minEdgeDist = min(minEdgeDist, abs(edgeDist));
        }
    }

    VoronoiResult r;
    r.cellDist = minDist;
    r.edgeDist = minEdgeDist;
    r.cellId = minCellId;
    r.nearestPoint = minPoint + i_st;
    return r;
}

void main() {
    vec2 uv = v_uv;
    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    vec2 st = uv * aspect * u_scale;

    float time = u_time * u_speed;

    vec2 mouseSt = u_mouse * aspect * u_scale;
    float mouseDist = length(st - mouseSt);
    float mouseProx = smoothstep(u_glowRadius * 2.5, 0.0, mouseDist);

    VoronoiResult v1 = voronoiEx(st, time);
    VoronoiResult v2 = voronoiEx(st * 0.5 + 10.0, time * 0.7);

    float edge1 = 1.0 - smoothstep(0.0, u_edgeWidth, v1.edgeDist);
    float edge2 = 1.0 - smoothstep(0.0, u_edgeWidth * 1.5, v2.edgeDist);

    float cellHash = hash1(v1.cellId);
    float pulse = 0.3 + 0.7 * (0.5 + 0.5 * sin(time * 0.5 + cellHash * TAU));

    vec2 centerUv = uv - vec2(0.5, 0.46);
    float centerQuiet = smoothstep(0.0, 0.38, length(centerUv * vec2(1.2, 1.6)));
    float centerMix = mix(0.08, 1.0, centerQuiet);

    float edgeBrightness = edge1 * (0.15 + 0.85 * mouseProx) * pulse * centerMix;
    edgeBrightness += edge2 * 0.04 * pulse * centerMix;

    float nodeDist = v1.cellDist;
    float node = 1.0 - smoothstep(0.0, u_nodeSize, nodeDist);
    float nodeGlow = 1.0 - smoothstep(0.0, u_nodeSize * 4.0, nodeDist);
    float nodeBrightness = node * (0.3 + 0.7 * mouseProx) * pulse * centerMix;

    vec3 bgColor = vec3(0.039, 0.039, 0.039);
    vec3 color = bgColor;

    float glowBase = (1.0 - smoothstep(0.0, u_glowRadius, v1.edgeDist)) * 0.06 * pulse * centerMix;
    color += u_glowColor * glowBase;

    float mouseGlow = mouseProx * 0.08 * centerMix;
    color += u_glowColor * mouseGlow * (1.0 - smoothstep(0.0, u_glowRadius * 0.5, v1.edgeDist));

    color += u_edgeColor * edgeBrightness;

    vec3 nodeColor = u_edgeColor * 1.4;
    color += nodeColor * nodeBrightness;
    color += u_glowColor * nodeGlow * 0.03 * pulse * centerMix;

    float scanline = 0.5 + 0.5 * sin(uv.y * u_resolution.y * 0.5);
    color *= 0.97 + scanline * 0.03;

    float grain = (hash1(st * 500.0 + u_time * 7.0) - 0.5) * 0.015;
    color += grain;

    float bottomFade = smoothstep(0.0, 0.2, uv.y);
    float topFade = smoothstep(1.0, 0.9, uv.y);
    color = mix(bgColor, color, bottomFade * topFade);

    vec2 vigUv = uv - 0.5;
    float vig = 1.0 - dot(vigUv * vec2(1.3, 0.8), vigUv * vec2(1.3, 0.8));
    vig = smoothstep(0.0, 0.7, vig);
    color = mix(bgColor, color, vig);

    color = clamp(color, 0.0, 1.0);
    fragColor = vec4(color, 1.0);
}`;

	const EFFECT_PASSES: PassConfig[] = [
		{
			name: 'voronoi-constellation',
			fragment: FRAG,
			uniforms: {
				u_speed: 1.0,
				u_scale: 5.0,
				u_edgeWidth: 0.025,
				u_edgeColor: [0.388, 0.4, 0.945],
				u_glowColor: [0.25, 0.26, 0.65],
				u_glowRadius: 0.15,
				u_nodeSize: 0.03
			}
		}
	];

	// --- Component Props ---
	let {
		class: className = ''
	} = $props();

	// --- Shared vertex shader ---
	const VERT_SRC = `#version 300 es
out vec2 v_uv;
void main() {
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  v_uv = vec2(x, y) * 0.5 + 0.5;
  gl_Position = vec4(x, y, 0.0, 1.0);
}`;

	const STANDARD_UNIFORMS = [
		'u_time', 'u_resolution', 'u_mouse', 'u_scroll',
		'u_prevPass', 'u_frame', 'u_dpi'
	];

	function compileShader(gl: WebGL2RenderingContext, type: number, source: string) {
		const shader = gl.createShader(type)!;
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const log = gl.getShaderInfoLog(shader);
			gl.deleteShader(shader);
			throw new Error(`[unicorn] Shader compile error:\n${log}`);
		}
		return shader;
	}

	function createProgram(gl: WebGL2RenderingContext, vertSrc: string, fragSrc: string) {
		const vert = compileShader(gl, gl.VERTEX_SHADER, vertSrc);
		const frag = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc);
		const prog = gl.createProgram()!;
		gl.attachShader(prog, vert);
		gl.attachShader(prog, frag);
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			const log = gl.getProgramInfoLog(prog);
			gl.deleteProgram(prog);
			throw new Error(`[unicorn] Program link error:\n${log}`);
		}
		gl.deleteShader(vert);
		gl.deleteShader(frag);
		return prog;
	}

	let canvas: HTMLCanvasElement;
	const dpi = typeof window !== 'undefined'
		? Math.min(window.devicePixelRatio, 2)
		: 2;

	$effect(() => {
		if (!canvas) return;

		const maybeGl = canvas.getContext('webgl2', {
			alpha: true, antialias: false,
			premultipliedAlpha: false, preserveDrawingBuffer: false
		});

		if (!maybeGl) {
			console.warn('[unicorn] WebGL2 not available');
			return;
		}

		const gl: WebGL2RenderingContext = maybeGl;

		const state = {
			time: 0, frame: 0, width: 0, height: 0,
			mouseX: 0.5, mouseY: 0.5, scroll: 0, dpi
		};
		const mouseTarget = { x: 0.5, y: 0.5 };

		// Init size
		const rect = canvas.getBoundingClientRect();
		state.width = Math.floor(rect.width * dpi);
		state.height = Math.floor(rect.height * dpi);
		canvas.width = state.width;
		canvas.height = state.height;
		gl.viewport(0, 0, state.width, state.height);

		// Compile passes
		type Pass = {
			program: WebGLProgram;
			locs: Record<string, WebGLUniformLocation | null>;
			customUniforms: Record<string, number | number[]>;
		};
		const passes: Pass[] = [];

		for (const cfg of EFFECT_PASSES) {
			const program = createProgram(gl, VERT_SRC, cfg.fragment);
			const locs: Record<string, WebGLUniformLocation | null> = {};
			for (const name of [...STANDARD_UNIFORMS, ...Object.keys(cfg.uniforms)]) {
				locs[name] = gl.getUniformLocation(program, name);
			}
			passes.push({ program, locs, customUniforms: cfg.uniforms });
		}

		const vao = gl.createVertexArray();
		let isVisible = true;

		const intObs = new IntersectionObserver(
			(e) => { isVisible = e[0].isIntersecting; }, { threshold: 0 }
		);
		intObs.observe(canvas);

		const resObs = new ResizeObserver((entries) => {
			const r = entries[0].contentRect;
			const w = Math.floor(r.width * dpi);
			const h = Math.floor(r.height * dpi);
			if (w === state.width && h === state.height) return;
			canvas.width = w; canvas.height = h;
			state.width = w; state.height = h;
			gl.viewport(0, 0, w, h);
		});
		resObs.observe(canvas);

		// Mouse — smoothed
		const onMouse = (e: MouseEvent) => {
			const r = canvas.getBoundingClientRect();
			mouseTarget.x = (e.clientX - r.left) / r.width;
			mouseTarget.y = 1.0 - (e.clientY - r.top) / r.height;
		};
		const onLeave = () => { mouseTarget.x = 0.5; mouseTarget.y = 0.5; };

		canvas.addEventListener('mousemove', onMouse);
		canvas.addEventListener('mouseleave', onLeave);

		// Touch
		const onTouch = (e: TouchEvent) => {
			const touch = e.touches[0];
			const r = canvas.getBoundingClientRect();
			mouseTarget.x = (touch.clientX - r.left) / r.width;
			mouseTarget.y = 1.0 - (touch.clientY - r.top) / r.height;
		};
		const onTouchEnd = () => { mouseTarget.x = 0.5; mouseTarget.y = 0.5; };
		canvas.addEventListener('touchmove', onTouch, { passive: true });
		canvas.addEventListener('touchend', onTouchEnd);

		const startTime = performance.now();
		let raf: number;

		function render(now: number) {
			raf = requestAnimationFrame(render);
			if (!isVisible) return;

			state.time = (now - startTime) * 0.001;
			state.frame++;
			state.mouseX += (mouseTarget.x - state.mouseX) * 0.06;
			state.mouseY += (mouseTarget.y - state.mouseY) * 0.06;

			gl.bindVertexArray(vao);

			for (let i = 0; i < passes.length; i++) {
				const p = passes[i];
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
				gl.useProgram(p.program);

				if (p.locs.u_time !== null) gl.uniform1f(p.locs.u_time!, state.time);
				if (p.locs.u_resolution !== null) gl.uniform2f(p.locs.u_resolution!, state.width, state.height);
				if (p.locs.u_mouse !== null) gl.uniform2f(p.locs.u_mouse!, state.mouseX, state.mouseY);
				if (p.locs.u_frame !== null) gl.uniform1i(p.locs.u_frame!, state.frame);
				if (p.locs.u_dpi !== null) gl.uniform1f(p.locs.u_dpi!, dpi);

				for (const [n, v] of Object.entries(p.customUniforms)) {
					const loc = p.locs[n];
					if (!loc) continue;
					if (typeof v === 'number') gl.uniform1f(loc, v);
					else if (v.length === 2) gl.uniform2fv(loc, v);
					else if (v.length === 3) gl.uniform3fv(loc, v);
					else if (v.length === 4) gl.uniform4fv(loc, v);
				}

				gl.drawArrays(gl.TRIANGLES, 0, 3);
			}
		}

		raf = requestAnimationFrame(render);

		return () => {
			cancelAnimationFrame(raf);
			intObs.disconnect();
			resObs.disconnect();
			canvas.removeEventListener('mousemove', onMouse);
			canvas.removeEventListener('mouseleave', onLeave);
			canvas.removeEventListener('touchmove', onTouch);
			canvas.removeEventListener('touchend', onTouchEnd);
			for (const p of passes) gl.deleteProgram(p.program);
			if (vao) gl.deleteVertexArray(vao);
			const ext = gl.getExtension('WEBGL_lose_context');
			if (ext) ext.loseContext();
		};
	});
</script>

<canvas bind:this={canvas} class={className}></canvas>

<style>
	canvas {
		display: block;
		width: 100%;
		height: 100%;
	}
</style>
