"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const walnutPositions: Array<[number, number, number]> = [
  [-0.62, 0.77, 0.18],
  [-0.16, 0.91, 0.34],
  [0.36, 0.79, 0.26],
  [0.61, 0.74, -0.22],
  [0.16, 0.93, -0.32],
  [-0.36, 0.82, -0.28],
  [0.02, 1.13, 0.02],
];

const almondPositions: Array<[number, number, number]> = [
  [-0.82, 0.73, -0.06],
  [0.82, 0.77, 0.05],
  [-0.41, 1.12, 0.16],
  [0.46, 1.08, -0.14],
  [0.01, 0.78, 0.58],
];

function makeWalnutGeometry() {
  const geometry = new THREE.SphereGeometry(0.38, 40, 32);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const x = position.getX(index);
    const y = position.getY(index);
    const z = position.getZ(index);
    const longitude = Math.atan2(z, x);
    const latitude = Math.atan2(y, Math.hypot(x, z));
    const ridges = 1 + 0.055 * Math.sin(longitude * 15 + latitude * 7) * Math.sin(latitude * 12);
    position.setXYZ(index, x * ridges, y * ridges, z * ridges);
  }

  geometry.computeVertexNormals();
  return geometry;
}

function makeAlmondGeometry() {
  const geometry = new THREE.SphereGeometry(0.29, 32, 24);
  const position = geometry.attributes.position;

  for (let index = 0; index < position.count; index += 1) {
    const y = position.getY(index);
    const taper = 0.72 + 0.28 * Math.pow(Math.abs(y) / 0.29, 2.5);
    position.setX(index, position.getX(index) * taper);
    position.setZ(index, position.getZ(index) * taper);
  }

  geometry.computeVertexNormals();
  return geometry;
}

export default function NutBowlScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 60);
    camera.position.set(0, 2.55, 7.4);
    camera.lookAt(0, 0.32, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      container.dataset.webgl = "unavailable";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff5df, 0x4e321e, 2.1));

    const keyLight = new THREE.DirectionalLight(0xffedce, 3.4);
    keyLight.position.set(-3, 6, 5);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0xffb768, 42, 12, 2);
    fillLight.position.set(3, 2.5, 3.5);
    scene.add(fillLight);

    const display = new THREE.Group();
    scene.add(display);

    const bowlProfile = [
      new THREE.Vector2(0, 0.22),
      new THREE.Vector2(0.9, 0.22),
      new THREE.Vector2(1.08, 0.29),
      new THREE.Vector2(1.19, 0.62),
      new THREE.Vector2(1.28, 0.66),
      new THREE.Vector2(1.29, 0.6),
      new THREE.Vector2(1.17, 0.25),
      new THREE.Vector2(1.03, 0.15),
      new THREE.Vector2(0, 0.15),
    ];
    const bowl = new THREE.Mesh(
      new THREE.LatheGeometry(bowlProfile, 72),
      new THREE.MeshStandardMaterial({ color: "#9b4b2d", roughness: 0.28, metalness: 0.12 })
    );
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    display.add(bowl);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(1.245, 0.035, 12, 72),
      new THREE.MeshStandardMaterial({ color: "#d2a25d", roughness: 0.32, metalness: 0.62 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 0.635;
    display.add(rim);

    const foot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.57, 0.68, 0.16, 64),
      new THREE.MeshStandardMaterial({ color: "#73371f", roughness: 0.38, metalness: 0.08 })
    );
    foot.position.y = 0.08;
    foot.castShadow = true;
    display.add(foot);

    const walnutGeometry = makeWalnutGeometry();
    const almondGeometry = makeAlmondGeometry();
    const walnutMaterials = ["#80502f", "#9a6038", "#704329"].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.83 })
    );
    const almondMaterials = ["#b77b46", "#c68b50", "#a76b3c"].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 0.72 })
    );

    walnutPositions.forEach((position, index) => {
      const kernel = new THREE.Mesh(walnutGeometry, walnutMaterials[index % walnutMaterials.length]);
      kernel.position.set(...position);
      kernel.scale.set(0.82, 0.94, 0.68);
      kernel.rotation.set(index * 0.31, index * 0.77, index * 0.48);
      kernel.castShadow = true;
      kernel.receiveShadow = true;
      display.add(kernel);
    });

    almondPositions.forEach((position, index) => {
      const almond = new THREE.Mesh(almondGeometry, almondMaterials[index % almondMaterials.length]);
      almond.position.set(...position);
      almond.scale.set(0.78, 1.32, 0.72);
      almond.rotation.set(index * 0.2, index * 0.8, 0.52 + index * 0.18);
      almond.castShadow = true;
      almond.receiveShadow = true;
      display.add(almond);
    });

    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1.75, 64),
      new THREE.MeshBasicMaterial({ color: "#18271c", transparent: true, opacity: 0.2, depthWrite: false })
    );
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(0, -0.08, 0);
    display.add(shadow);
    display.position.y = -0.34;

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      if (!width || !height) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    window.addEventListener("resize", resize);
    resize();

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let pointerRotation = 0;
    const animate = (time: number) => {
      display.rotation.y += (pointerRotation + Math.sin(time * 0.00022) * 0.055 - display.rotation.y) * 0.025;
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };
    const handlePointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointerRotation = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.26;
    };
    const resetPointer = () => {
      pointerRotation = 0;
    };

    if (!prefersReducedMotion.matches) {
      animationFrame = window.requestAnimationFrame(animate);
      container.addEventListener("pointermove", handlePointerMove);
      container.addEventListener("pointerleave", resetPointer);
    }

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", resetPointer);
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={containerRef} className="hero-scene absolute inset-0" aria-hidden="true" />;
}