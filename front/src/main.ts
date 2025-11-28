import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder } from "@babylonjs/core";

// Récupération du canvas
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

// Initialisation Engine
const engine = new Engine(canvas, true);

// Création de la scène
const createScene = (): Scene => {
    const scene = new Scene(engine);
    
    // Caméra
    const camera = new ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2.5, 10, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Lumière
    const light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // Mesh de test (une sphère)
    const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 2 }, scene);
    sphere.position.y = 1;

    // Sol
    MeshBuilder.CreateGround("ground", { width: 6, height: 6 }, scene);

    return scene;
};

const scene = createScene();

// Render Loop
engine.runRenderLoop(() => {
    scene.render();
});

// Resize event
window.addEventListener("resize", () => {
    engine.resize();
});