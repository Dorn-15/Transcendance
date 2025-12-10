import * as BABYLON from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { ALL_LANGUAGES, LangKey } from './languageData';

declare global {
    interface Window {
        INITIAL_GAME_ID: string;
    }
}

class GameScene {
    engine: BABYLON.Engine;
    scene: BABYLON.Scene;
    camera!: BABYLON.ArcRotateCamera;
    
    currentLangId: LangKey;

    initialCameraState: any = null;
    isCameraAnimating: boolean = false;

    constructor(canvasElement: HTMLCanvasElement, langId: LangKey = 1) {
        this.currentLangId = langId;
        
        this.engine = new BABYLON.Engine(canvasElement, true);
        this.scene = this.createScene();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });

        this.resizeHandler = this.resizeHandler.bind(this);
        window.addEventListener("resize", this.resizeHandler);

        canvasElement.addEventListener("contextmenu", (evt) => {
            evt.preventDefault();
        });
    }

    setLanguage(newLangId: LangKey) {
        this.currentLangId = newLangId;
    }

    resizeHandler() {
        this.engine.resize();
    }

    dispose() {
        window.removeEventListener("resize", this.resizeHandler);
        this.engine.dispose();
    }

    createScene() {
        const scene = new BABYLON.Scene(this.engine);

        // --- CAMERA ---
        this.camera = new BABYLON.ArcRotateCamera(
            "camera1",
            Math.PI / 2, 
            Math.PI / 2.15, 
            10, 
            new BABYLON.Vector3(0, 1, 0), 
            scene
        );
        this.camera.checkCollisions = true;
        this.camera.fov = 2 * Math.atan(24 / (2 * 50)); 
        this.camera.minZ = 0.1;
        this.camera.attachControl(this.engine.getRenderingCanvas(), true);
        this.camera.inputs.clear(); 

        this.initialCameraState = {
            alpha: this.camera.alpha,
            beta: this.camera.beta,
            radius: this.camera.radius,
            target: this.camera.target.clone()
        };

        // --- LUMIERES ---
        const hemiLight = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
        hemiLight.diffuse = new BABYLON.Color3(1, 1, 1);
        hemiLight.groundColor = new BABYLON.Color3(0.4, 0.4, 0.4);
        hemiLight.intensity = 0.5;

        const warmOrange = new BABYLON.Color3(1.0, 0.60, 0.30);
        const dirLight = new BABYLON.PointLight("shadowLight_Right", new BABYLON.Vector3(4, 2.4, 8), scene);
        dirLight.diffuse = warmOrange;
        dirLight.specular = warmOrange;
        dirLight.intensity = 30.5;

        const dirLight2 = new BABYLON.PointLight("shadowLight_Left", new BABYLON.Vector3(-4, 2.4, 8), scene);
        dirLight2.diffuse = warmOrange;
        dirLight2.specular = warmOrange;
        dirLight2.intensity = 65.5;

        // --- OMBRES ---
        const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
        shadowGenerator.useBlurExponentialShadowMap = true;
        shadowGenerator.blurKernel = 32;

        const setupShadows = (meshRoot: any, casts: boolean, receives: boolean) => {
            meshRoot.getChildMeshes().forEach((m: any) => {
                if (casts) {
                    shadowGenerator.addShadowCaster(m, true);
                    m.castShadows = true;
                }
                if (receives) {
                    m.receiveShadows = true;
                }
            });
        };

        // --- LOAD MESHES ---
        BABYLON.SceneLoader.ImportMeshAsync("", "/assets/glbFile/", "Breakout.glb", scene)
            .then((result: any) => {
                const root = result.meshes[0];
                root.position = new BABYLON.Vector3(-1.5, 0, 2.3);
                root.rotate(BABYLON.Axis.Y, Math.PI / 4, BABYLON.Space.LOCAL);
                root.metadata = { 
                    arcade: true,
                    gameId: "breakout",
                    zoomSettings: { height: 1.28, beta: Math.PI / 2.7, radius: 1.3 }
                }; 
                setupShadows(root, true, false); 
            });

        BABYLON.SceneLoader.ImportMeshAsync("", "/assets/glbFile/", "Pong.glb", scene)
            .then((result: any) => {
                const root = result.meshes[0];
                root.position = new BABYLON.Vector3(0, 0, 2);
                root.metadata = { 
                    arcade: true,
                    gameId: "pong",
                    zoomSettings: { height: 1.5, beta: Math.PI / 2.5, radius: 0.8 }
                };
                setupShadows(root, true, false);
            });

        BABYLON.SceneLoader.ImportMeshAsync("", "/assets/glbFile/", "SpaceInvaders.glb", scene)
            .then((result: any) => {
                const root = result.meshes[0];
                root.position = new BABYLON.Vector3(1.5, 0, 2.3);
                root.rotate(BABYLON.Axis.Y, -Math.PI / 4, BABYLON.Space.LOCAL);
                root.metadata = { 
                    arcade: true,
                    gameId: "space-invaders",
                    zoomSettings: { height: 1.48, beta: Math.PI / 2.3, radius: 1.1 }
                };
                setupShadows(root, true, false);
            });

        BABYLON.SceneLoader.ImportMeshAsync("", "/assets/glbFile/", "room.glb", scene)
            .then((result: any) => {
                const root = result.meshes[0];
                root.position = new BABYLON.Vector3(0, 0, 6.2);
                root.metadata = { arcade: false };
                setupShadows(root, false, true);
            });

        BABYLON.SceneLoader.ImportMeshAsync("", "/assets/glbFile/", "table.glb", scene)
            .then((result: any) => {
                const root = result.meshes[0];
                root.position = new BABYLON.Vector3(0, 0, 6.2);
                root.metadata = { arcade: false };
                setupShadows(root, false, true);
            });

        // --- POINTER EVENTS ---
        scene.onPointerObservable.add((pointerInfo: any) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                if (this.isCameraAnimating) return;

                if (pointerInfo.event.button === 2) {
                    this.resetCamera();
                    return;
                }

                if (pointerInfo.event.button === 0 && pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh) {
                    let currentMesh = pointerInfo.pickInfo.pickedMesh;
                    let parentRoot = null;

                    while (currentMesh) {
                        if (currentMesh.metadata && currentMesh.metadata.arcade) {
                            parentRoot = currentMesh;
                            break;
                        }
                        currentMesh = currentMesh.parent;
                    }

                    if (parentRoot) {
                        this.zoomToMesh(parentRoot);
                        const titleDiv = document.querySelector(".title-overlay") as HTMLElement;
                        if (titleDiv) {
                            titleDiv.style.opacity = "0";
                            setTimeout(() => { titleDiv.style.display = "none"; }, 1000);
                        }
                    }
                }
            }
        });

        const initialGameId = typeof window !== 'undefined' ? window.INITIAL_GAME_ID : null;
        if (initialGameId && initialGameId !== "") {
            setTimeout(() => {
                this.showGameInterface(initialGameId);
            }, 100);
        }

        return scene;
    }

    resetCamera() {
        if (!this.initialCameraState) return;

        this.isCameraAnimating = true;
        const titleDiv = document.querySelector(".title-overlay") as HTMLElement;
        if (titleDiv) {
            titleDiv.style.display = "";
            setTimeout(() => { titleDiv.style.opacity = "1"; }, 50);
        }

        const frameRate = 60;
        const duration = 1.0;
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        const targetAlpha = this.initialCameraState.alpha;
        const currentAlpha = this.camera.alpha;
        const twoPi = Math.PI * 2;
        
        let diff = (targetAlpha - currentAlpha) % twoPi;
        if (diff !== diff % twoPi) diff = (diff + twoPi) % twoPi;
        if (diff > Math.PI) diff -= twoPi;
        else if (diff < -Math.PI) diff += twoPi;
        
        const finalAlpha = currentAlpha + diff;

        BABYLON.Animation.CreateAndStartAnimation(
            "animTarget",
            this.camera, 
            "target", 
            frameRate, 
            frameRate * duration, 
            this.camera.target, 
            this.initialCameraState.target, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        BABYLON.Animation.CreateAndStartAnimation(
            "animAlpha", 
            this.camera, 
            "alpha", 
            frameRate, 
            frameRate * duration, 
            this.camera.alpha, 
            finalAlpha, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        BABYLON.Animation.CreateAndStartAnimation("animRadius", 
            this.camera, 
            "radius", 
            frameRate, 
            frameRate * duration, 
            this.camera.radius, 
            this.initialCameraState.radius, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        
        BABYLON.Animation.CreateAndStartAnimation("animBeta", 
            this.camera, 
            "beta", 
            frameRate, 
            frameRate * duration, 
            this.camera.beta, 
            this.initialCameraState.beta, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease, 
            () => {
                this.isCameraAnimating = false;
        });
    }

    zoomToMesh(targetMesh: any) {
        this.isCameraAnimating = true;
        const frameRate = 60;
        const duration = 1;
        const ease = new BABYLON.CubicEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        const settings = targetMesh.metadata.zoomSettings || { 
            height: 1.53, 
            beta: Math.PI / 2, 
            radius: 0.8 
        };

        const boundingBox = targetMesh.getBoundingInfo().boundingBox;
        const targetEnd = boundingBox.centerWorld.clone();
        targetEnd.y += settings.height; 

        const localForward = new BABYLON.Vector3(0, 0, 1);
        let worldForward = new BABYLON.Vector3(0,0,1);
        
        if (targetMesh.absoluteRotationQuaternion) {
            worldForward = localForward.applyRotationQuaternion(targetMesh.absoluteRotationQuaternion);
        } else {
            const matrix = targetMesh.getWorldMatrix();
            worldForward = BABYLON.Vector3.TransformNormal(localForward, matrix);
        }
        worldForward.normalize();

        let targetAlpha = Math.atan2(worldForward.z, worldForward.x);
        const currentAlpha = this.camera.alpha;
        const twoPi = Math.PI * 2;
        let diff = (targetAlpha - currentAlpha) % twoPi;
        if (diff !== diff % twoPi) diff = (diff + twoPi) % twoPi;
        if (diff > Math.PI) diff -= twoPi;
        else if (diff < -Math.PI) diff += twoPi;
        const finalAlpha = currentAlpha + diff;

        BABYLON.Animation.CreateAndStartAnimation(
            "animTarget", 
            this.camera, 
            "target", 
            frameRate, 
            frameRate * duration, 
            this.camera.target, 
            targetEnd, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        BABYLON.Animation.CreateAndStartAnimation(
            "animAlpha", 
            this.camera, 
            "alpha", 
            frameRate, 
            frameRate * duration, 
            this.camera.alpha, 
            finalAlpha, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        BABYLON.Animation.CreateAndStartAnimation(
            "animRadius", 
            this.camera, 
            "radius", 
            frameRate, 
            frameRate * duration, 
            this.camera.radius, 
            settings.radius, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease
        );
        
        BABYLON.Animation.CreateAndStartAnimation(
            "animBeta", 
            this.camera, 
            "beta", 
            frameRate, 
            frameRate * duration, 
            this.camera.beta, 
            settings.beta, 
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT, 
            ease, 
            () => {
                const gameId = targetMesh.metadata.gameId;
                if (gameId) {
                    this.showGameInterface(gameId);
                } else {
                    this.isCameraAnimating = false;
                }
            }
        );
    }

    showGameInterface(gameId: string) {
        const texts = ALL_LANGUAGES[this.currentLangId].defaultInfo;

        window.history.pushState({ gameId: gameId }, "", `/play/${gameId}`);

        const div = document.createElement("div");
        div.id = "game-overlay";
        Object.assign(div.style, {
            position: "absolute", top: "0", left: "0", width: "100%", height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.9)", zIndex: "10", display: "flex",
            flexDirection: "column", alignItems: "center", justifyContent: "center"
        });

        const iframe = document.createElement("iframe");
        iframe.src = `/games/${gameId}/index.html`; 
        Object.assign(iframe.style, {
            width: "80%", height: "80%", border: "4px solid #333",
            borderRadius: "10px", backgroundColor: "white"
        });
        
        iframe.onload = () => { iframe.contentWindow?.focus(); };
        div.appendChild(iframe);

        const closeBtn = document.createElement("button");
        
        closeBtn.textContent = texts.leave;
        
        Object.assign(closeBtn.style, {
            marginTop: "15px", padding: "10px 20px", fontSize: "16px", cursor: "pointer",
            backgroundColor: "#ff4444", color: "white", border: "none", borderRadius: "5px"
        });

        const closeGame = () => {
            div.remove();
            window.history.pushState({}, "", "/");
            this.resetCamera();
            setTimeout(() => { this.isCameraAnimating = false; }, 1100);
        };

        closeBtn.addEventListener("click", closeGame);
        
        const popState = () => {
            closeGame();
            window.removeEventListener('popstate', popState);
        };
        window.addEventListener('popstate', popState);

        div.appendChild(closeBtn);
        document.body.appendChild(div);
    }
}


export function initGame(container: HTMLDivElement | HTMLCanvasElement, langId: LangKey = 1) {
    let canvas: HTMLCanvasElement;
    
    if (container instanceof HTMLDivElement) {
        canvas = document.createElement('canvas');
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        canvas.id = 'renderCanvas'; 
        container.appendChild(canvas);
    } else {
        canvas = container as HTMLCanvasElement;
    }

    const gameInstance = new GameScene(canvas, langId);

    return {
        destroy: () => {
            gameInstance.dispose();
            if (container instanceof HTMLDivElement && container.contains(canvas)) {
                container.removeChild(canvas);
            }
        },
        updateLanguage: (newLangId: LangKey) => {
            gameInstance.setLanguage(newLangId);
        }
    };
}