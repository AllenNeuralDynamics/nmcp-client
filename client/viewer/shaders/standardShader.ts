import {ElementShader, SystemShader} from "./shaders";

export class StandardShader implements SystemShader {
    public static Default = new StandardShader();

    public get NodeShader(): ElementShader {
        return StandardNodeShader.Default;
    }

    public get PathShader(): ElementShader {
        return StandardPathShader.Default;
    }

    public get CompartmentShader(): ElementShader {
        return StandardCompartmentShader.Default;
    }
}

export class StandardNodeShader implements ElementShader {
    public static Default = new StandardNodeShader();

    private constructor() {
    }

    public get VertexShader(): string {
        return this._vertexShader;
    }

    public get FragmentShader(): string {
        return this._fragmentShader;
    }

    private _vertexShader = [
        'uniform float particleScale;',
        'attribute float radius;',
        'attribute vec3 typeColor;',
        '//attribute float alpha;',
        'varying vec3 vColor;',
        '// varying vec4 mvPosition;',
        'varying float vAlpha;',
        'void main() ',
        '{',
        'vColor = vec3(typeColor); // set RGB color associated to vertex; use later in fragment shader.',
        'vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        'vAlpha = alpha;',
        '// gl_PointSize = size;',
        'gl_PointSize = radius * ((particleScale*2.0) / length(mvPosition.z));',
        'gl_Position = projectionMatrix * mvPosition;',
        '}'
    ].join("\n");

    private _fragmentShader = [
        'uniform sampler2D sphereTexture; // Imposter image of sphere',
        'uniform mat4 projectionMatrix;',
        'varying vec3 vColor; // colors associated to vertices; assigned by vertex shader',
        '//varying vec4 mvPosition;',
        'varying float vAlpha;',
        'void main() ',
        '{',
        '// what part of the sphere image?',
        'vec2 uv = vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y);',
        'vec4 sphereColors = texture2D(sphereTexture, uv);',
        '// avoid further computation at invisible corners',
        'if (sphereColors.a < 0.3) discard;',
        'if (vAlpha < 0.05) discard;',

        '// calculates a color for the particle',
        '// gl_FragColor = vec4(vColor, 1.0);',
        '// sets a white particle texture to desired color',
        '// gl_FragColor = sqrt(gl_FragColor * texture2D(sphereTexture, uv)) + vec4(0.1, 0.1, 0.1, 0.0);',
        '// red channel contains colorizable sphere image',
        'vec3 baseColor = vColor * sphereColors.r;',
        '// green channel contains (white?) specular highlight',
        'vec3 highlightColor = baseColor + sphereColors.ggg;',
        'gl_FragColor = vec4(highlightColor, sphereColors.a * vAlpha);',
        '// TODO blue channel contains depth offset, but we cannot use gl_FragDepth in webgl?',
        '#ifdef GL_EXT_frag_depth',
        '// gl_FragDepthExt = 0.5;',
        '#endif',
        '}'
    ].join("\n");
}

export class StandardPathShader implements ElementShader {
    public static Default = new StandardPathShader();

    private constructor() {
    }

    public get VertexShader(): string {
        return this._vertexShader;
    }

    public get FragmentShader(): string {
        return this._fragmentShader;
    }

    private _vertexShader = [
        'attribute float radius;',
        'attribute vec3 typeColor;',
        '// attribute float alpha;',
        'varying vec3 vColor;',
        'varying vec2 sphereUv;',
        'varying float vAlpha;',
        'void main() ',
        '{',
        '   vAlpha = alpha;',
        '	// TODO - offset cone position for different sphere sizes',
        '	// TODO - implement depth buffer on Chrome',
        '	vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);',
        '	// Expand quadrilateral perpendicular to both view/screen direction and cone axis',
        '	vec3 cylAxis = (modelViewMatrix * vec4(normal, 0.0)).xyz; // convert cone axis to camera space',
        '	vec3 sideDir = normalize(cross(vec3(0.0,0.0,-1.0), cylAxis));',
        '	mvPosition += vec4(radius * sideDir, 0.0);',
        '	gl_Position = projectionMatrix * mvPosition;',
        '	// Pass and interpolate color',
        '	vColor = typeColor;',
        '	// Texture coordinates',
        '	sphereUv = uv - vec2(0.5, 0.5); // map from [0,1] range to [-.5,.5], before rotation',
        '	// If sideDir is "up" on screen, make sure u is positive',
        '	float q = sideDir.y * sphereUv.y;',
        '	sphereUv.y = sign(q) * sphereUv.y;',
        '	// rotate texture coordinates to match cone orientation about z',
        '	float angle = atan(sideDir.x/sideDir.y);',
        '	float c = cos(angle);',
        '	float s = sin(angle);',
        '	mat2 rotMat = mat2(',
        '		c, -s, ',
        '		s,  c);',
        '	sphereUv = rotMat * sphereUv;',
        '	sphereUv += vec2(0.5, 0.5); // map back from [-.5,.5] => [0,1]',
        '}'
    ].join("\n");


    private _fragmentShader = [
        'uniform sampler2D sphereTexture; // Imposter image of sphere',
        'varying vec3 vColor;',
        'varying vec2 sphereUv;',
        'varying float vAlpha;',
        'void main() ',
        '{',
        '   if (vAlpha < 0.05) discard;',
        '	vec4 sphereColors = texture2D(sphereTexture, sphereUv);',
        '	if (sphereColors.a < 0.3) discard;',
        '	vec3 baseColor = vColor * sphereColors.r;',
        '	vec3 highlightColor = baseColor + sphereColors.ggg;',
        '	gl_FragColor = vec4(highlightColor, sphereColors.a * vAlpha);',
        '}'
    ].join("\n");

}

export class StandardCompartmentShader implements ElementShader {
    public static Default = new StandardCompartmentShader();

    public get VertexShader(): string {
        return this._vertexShader;
    }

    public get FragmentShader(): string {
        return this._fragmentShader;
    }

    private _vertexShader = `
					#line 585
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						vec4 pos_in_camera = modelViewMatrix * vec4(position, 1.0);
						gl_Position = projectionMatrix * pos_in_camera;
						normal_in_camera = normalize(mat3(modelViewMatrix) * normal);
						view_direction = normalize(pos_in_camera.xyz);
					}
				`;

    private _fragmentShader = `
                	#line 597
                	uniform vec3 color;
					varying vec3 normal_in_camera;
					varying vec3 view_direction;

					void main() {
						// Make edges more opaque than center
						float edginess = 1.0 - abs(dot(normal_in_camera, view_direction));
						float opacity = clamp(edginess - 0.30, 0.0, 0.5);
						// Darken compartment at the very edge
						float blackness = pow(edginess, 4.0) - 0.3;
						vec3 c = mix(color, vec3(0,0,0), blackness);
						gl_FragColor = vec4(c, opacity);
					}
				`;
}
