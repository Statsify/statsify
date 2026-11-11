struct Camera {
    view_pos: vec4<f32>,
    view_proj: mat4x4<f32>,
}

@group(1) @binding(0)
var<uniform> camera: Camera;

struct Light {
    position: vec3<f32>,
    color: vec3<f32>,
}

@group(2) @binding(0)
var<uniform> light: Light;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) texture_coordinates: vec2<f32>,
    @location(2) normal: vec3<f32>,
};

struct InstanceInput {
    @location(5) model_matrix_0: vec4<f32>,
    @location(6) model_matrix_1: vec4<f32>,
    @location(7) model_matrix_2: vec4<f32>,
    @location(8) model_matrix_3: vec4<f32>,

    @location(9) normal_matrix_0: vec3<f32>,
    @location(10) normal_matrix_1: vec3<f32>,
    @location(11) normal_matrix_2: vec3<f32>,
}

struct VertexOutput {
    @builtin(position) clip_position: vec4<f32>,
    @location(0) texture_coordinates: vec2<f32>,
    @location(1) world_normal: vec3<f32>,
    @location(2) world_position: vec3<f32>,
}

@vertex
fn vs_main(
    model: VertexInput,
    instance: InstanceInput,
) -> VertexOutput {
    let model_matrix = mat4x4<f32>(
        instance.model_matrix_0,
        instance.model_matrix_1,
        instance.model_matrix_2,
        instance.model_matrix_3,
    );

    let normal_matrix = mat3x3<f32>(
        instance.normal_matrix_0,
        instance.normal_matrix_1,
        instance.normal_matrix_2,
    );

    var out: VertexOutput;
    out.texture_coordinates = model.texture_coordinates;
    out.world_normal = normal_matrix * model.normal;

    var world_position: vec4<f32> = model_matrix * vec4<f32>(model.position, 1.0);
    out.world_position = world_position.xyz;
    out.clip_position = camera.view_proj * world_position;

    return out;
}

@group(0) @binding(0)
var t_diffuse: texture_2d<f32>;

@group(0)@binding(1)
var s_diffuse: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    let object_color: vec4<f32> = textureSample(t_diffuse, s_diffuse, in.texture_coordinates);

    // Armour has see-through gaps, which must not hide what's drawn behind them later
    // or take the glint, which only draws where the armour wrote depth
    if object_color.a == 0.0 {
        discard;
    }

    let ambient_strength = 0.2;
    let ambient_color = light.color * ambient_strength;

    let light_dir = normalize(light.position - in.world_position);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.color * diffuse_strength;

    let result = (ambient_color + diffuse_color) * object_color.xyz;

    return vec4<f32>(result, object_color.a);
}

// The game squares and adds each glint layer on gamma-encoded colours, so the
// sample is encoded again or the glint all but disappears
@fragment
fn fs_glint(in: VertexOutput) -> @location(0) vec4<f32> {
    let tint = vec3<f32>(0.38, 0.19, 0.608);
    var glint = vec3<f32>(0.0);

    for (var i = 0; i < 2; i++) {
        let angle = radians(30.0 - f32(i) * 60.0);
        let rotation = mat2x2<f32>(cos(angle), sin(angle), -sin(angle), cos(angle));
        let uv = rotation * in.texture_coordinates / 3.0;
        let texel = pow(textureSample(t_diffuse, s_diffuse, uv).rgb, vec3<f32>(1.0 / 2.2));
        let layer = texel * tint;
        glint += layer * layer;
    }

    return vec4<f32>(glint, 1.0);
}