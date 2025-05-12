export interface ElementShader {
    VertexShader: string;
    FragmentShader: string;

}

export interface SystemShader {
    NodeShader: ElementShader;
    PathShader: ElementShader;
    CompartmentShader: ElementShader;
}
