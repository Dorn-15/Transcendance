"use client"; // Obligatoire pour utiliser useEffect et useRef

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // Note le chemin d'import
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";

export default function Scene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- SETUP DE BASE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0f5);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // Dimensions du conteneur (plus sûr que window.innerWidth directement)
    const width = window.innerWidth;
    const height = window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    const initialCameraPosition = { x: 0, y: 2, z: 5 };
    camera.position.set(initialCameraPosition.x, initialCameraPosition.y, initialCameraPosition.z);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    
    // IMPORTANT : On attache le canvas au ref React, pas au body directement
    mountRef.current.appendChild(renderer.domElement);

    // --- LUMIÈRES ---
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // --- LE SOL ---
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100),
      new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.name = "leSol";
    scene.add(mesh);

    // --- CHARGEMENT DES MODÈLES ---
    const loader = new GLTFLoader();

    function chargerModele(url: string, x: number, y: number, z: number, echelle = 1, rotationY = 0) {
      // Dans Next.js, le chemin part de la racine du dossier 'public'
      loader.load(url, (gltf) => {
        const model = gltf.scene;
        model.position.set(x, y, z);
        model.scale.set(echelle, echelle, echelle);
        model.rotation.y = rotationY;

        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.parentGroup = model;
          }
        });

        scene.add(model);
        console.log(`Modèle chargé : ${url}`);
      });
    }

    // Chargement des assets (Chemin relatif au dossier public)
    chargerModele('/glbFile/SpaceInvaders.glb', 0, 0, -1, 1.5, 0);
    chargerModele('/glbFile/Pong.glb', 2, 0, 5, 1.5, Math.PI / 4);
    chargerModele('/glbFile/Pong.glb', -2, 0, 5, 1.5, -Math.PI / 4);

    // --- CONTRÔLES ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    const initialTarget = { x: 0, y: 1, z: 0 };
    controls.target.set(initialTarget.x, initialTarget.y, initialTarget.z);

    // --- GESTION DU CLIC ---
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      // Calculer la position de la souris par rapport à la fenêtre
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length > 0) {
        const objetTouche = intersects[0].object;
        if (objetTouche.name === "leSol") return;

        const leModele = objetTouche.userData.parentGroup || objetTouche;
        const box = new THREE.Box3().setFromObject(leModele);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const demiProfondeur = box.max.z - center.z;
        const distanceRecul = 0.05;
        const distanceTotale = demiProfondeur + distanceRecul;

        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(leModele.quaternion);
        const finalPos = center.clone().add(direction.multiplyScalar(distanceTotale));

        gsap.to(camera.position, {
          duration: 1.5,
          x: finalPos.x,
          y: center.y + 0.8,
          z: finalPos.z,
          ease: "power2.inOut",
        });

        gsap.to(controls.target, {
          duration: 1.5,
          x: center.x,
          y: center.y + 0.8,
          z: center.z,
          ease: "power2.inOut",
          onUpdate: () => controls.update(),
        });
      }
    };

    const onRightClick = (event: MouseEvent) => {
      event.preventDefault();
      gsap.to(camera.position, {
        duration: 1.5,
        x: initialCameraPosition.x,
        y: initialCameraPosition.y,
        z: initialCameraPosition.z,
        ease: "power2.inOut",
      });

      gsap.to(controls.target, {
        duration: 1.5,
        x: initialTarget.x,
        y: initialTarget.y,
        z: initialTarget.z,
        ease: "power2.inOut",
        onUpdate: () => controls.update(),
      });
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("click", onMouseClick);
    window.addEventListener("contextmenu", onRightClick);
    window.addEventListener("resize", onResize);

    // --- BOUCLE D'ANIMATION ---
    let animationId: number;
    function animate() {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // --- NETTOYAGE (CLEANUP) ---
    // Très important dans React pour éviter que la scène ne se duplique quand tu navigues
    return () => {
      window.removeEventListener("click", onMouseClick);
      window.removeEventListener("contextmenu", onRightClick);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
      
      if(mountRef.current) {
         mountRef.current.removeChild(renderer.domElement);
      }
      
      // Libérer la mémoire
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100vw", height: "100vh", overflow: "hidden" }} />;
}