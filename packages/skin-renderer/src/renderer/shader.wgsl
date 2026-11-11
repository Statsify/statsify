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

@group(3) @binding(0)
var t_glint: texture_2d<f32>;

@group(3) @binding(1)
var s_glint: sampler;

@fragment
fn fs_main(in: VertexOutput) -> @location(0) vec4<f32> {
    return shade(in, textureSample(t_diffuse, s_diffuse, in.texture_coordinates));
}

// Armour has see-through gaps, which must not hide what's drawn behind them later.
// The skin keeps fs_main, since a discard turns off early depth testing on software renderers
@fragment
fn fs_attachment(in: VertexOutput) -> @location(0) vec4<f32> {
    return attachment_color(in);
}

fn attachment_color(in: VertexOutput) -> vec4<f32> {
    let object_color: vec4<f32> = textureSample(t_diffuse, s_diffuse, in.texture_coordinates);

    if object_color.a == 0.0 {
        discard;
    }

    return shade(in, object_color);
}

fn shade(in: VertexOutput, object_color: vec4<f32>) -> vec4<f32> {
    let ambient_strength = 0.2;
    let ambient_color = light.color * ambient_strength;

    let light_dir = normalize(light.position - in.world_position);

    let diffuse_strength = max(dot(in.world_normal, light_dir), 0.0);
    let diffuse_color = light.color * diffuse_strength;

    let result = (ambient_color + diffuse_color) * object_color.xyz;

    return vec4<f32>(result, object_color.a);
}

// The game draws the glint as a second pass that adds its squared layers to the
// armour's gamma-encoded colour. Blending would add in linear space and wash the
// glint out, so enchanted armour adds it here instead. A gamma of 2 stands in for
// sRGB, since pow is slow on software renderers and the square root squares back
// to the same colour where there's no glint
@fragment
fn fs_enchanted(in: VertexOutput) -> @location(0) vec4<f32> {
    let tint = vec3<f32>(0.38, 0.19, 0.608);
    var glint = vec3<f32>(0.0);

    for (var i = 0; i < 2; i++) {
        let angle = radians(30.0 - f32(i) * 60.0);
        let rotation = mat2x2<f32>(cos(angle), sin(angle), -sin(angle), cos(angle));
        let uv = rotation * in.texture_coordinates / 3.0;
        glint += textureSample(t_glint, s_glint, uv).rgb * tint * tint;
    }

    let armor = attachment_color(in);
    let color = min(sqrt(armor.rgb) + glint, vec3<f32>(1.0));

    return vec4<f32>(color * color, armor.a);
}