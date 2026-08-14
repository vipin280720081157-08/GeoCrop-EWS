import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export interface ComponentInfo {
  id: string;
  name: string;
  category: "Connected Hardware" | "Planned Extension";
  status: "CONNECTED" | "NOT CONNECTED";
  description: string;
  purpose: string;
  details?: string;
}

export const HARDWARE_COMPONENTS: Record<string, ComponentInfo> = {
  esp32: {
    id: "esp32",
    name: "ESP32",
    category: "Connected Hardware",
    status: "CONNECTED",
    description: "Main Wi-Fi enabled micro-controller node",
    purpose: "Collects field telemetry and transmits data wirelessly to GeoCrop FastAPI backend.",
    details: "Tensilica LX6 Dual-Core @ 240MHz, 2.4GHz Wi-Fi + Bluetooth 4.2 BLE.",
  },
  dht22: {
    id: "dht22",
    name: "DHT22 Temperature & Humidity Sensor",
    category: "Connected Hardware",
    status: "CONNECTED",
    description: "Digital ambient temperature & humidity sensor",
    purpose: "Measures ambient field temperature (°C) and canopy relative humidity (%).",
    details: "Sampling Period: 2s. Temp accuracy ±0.5°C, Humidity accuracy ±2% RH.",
  },
  soil: {
    id: "soil",
    name: "Soil Moisture Sensor",
    category: "Connected Hardware",
    status: "CONNECTED",
    description: "Capacitive soil moisture probe",
    purpose: "Measures soil volumetric water content when inserted into root zone soil.",
    details: "Capacitive sensing technology avoids electrode corrosion over time.",
  },
  gps: {
    id: "gps",
    name: "NEO-6M GPS",
    category: "Planned Extension",
    status: "NOT CONNECTED",
    description: "Geographic positioning module (Disconnected in test setup)",
    purpose: "Module is physically disconnected in current indoor setup. Connect outdoors for live satellite positioning.",
    details: "Requires satellite visibility and physical hardware connection. Marked not connected for indoor testing.",
  },
  npk: {
    id: "npk",
    name: "NPK Sensor",
    category: "Planned Extension",
    status: "NOT CONNECTED",
    description: "Future soil NPK nutrient probe",
    purpose: "Planned future hardware extension for real-time Nitrogen, Phosphorus, and Potassium monitoring.",
    details: "Currently an enhanced system concept. GeoCrop uses crop-aware reference targets.",
  },
  rain: {
    id: "rain",
    name: "Rain Sensor",
    category: "Planned Extension",
    status: "NOT CONNECTED",
    description: "Future rainfall detection module",
    purpose: "Planned future hardware extension for direct physical rainfall measurement.",
    details: "Currently GeoCrop utilizes Open-Meteo meteorological API for 1h & 7d rainfall.",
  },
};

interface LabelPosition {
  x: number;
  y: number;
  visible: boolean;
}

interface Props {
  selectedId: string | null;
  onSelectComponent: (id: string) => void;
  autoRotate: boolean;
  isDark: boolean;
}

export default function Hardware3DScene({
  selectedId,
  onSelectComponent,
  autoRotate,
  isDark,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshesRef = useRef<Record<string, THREE.Object3D>>({});
  const isDraggingRef = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0.4, y: 0.6 });

  const [overlayLabels, setOverlayLabels] = useState<Record<string, LabelPosition>>({});

  // Camera Reset Handler
  const resetCamera = () => {
    rotationRef.current = { x: 0.4, y: 0.6 };
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 7, 10);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 480;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDark ? 0x10161a : 0xf8fafc);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.set(0, 7, 10);
    camera.lookAt(0, 0, 0);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.2 : 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(8, 12, 8);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2196f3, 1.5, 10);
    blueLight.position.set(-4, 3, -2);
    scene.add(blueLight);

    const greenLight = new THREE.PointLight(0x4caf50, 1.5, 10);
    greenLight.position.set(4, 3, 2);
    scene.add(greenLight);

    // Group for entire setup
    const setupGroup = new THREE.Group();
    scene.add(setupGroup);

    const meshes: Record<string, THREE.Object3D> = {};

    // 5. Acrylic Base Mounting Board
    const boardGeo = new THREE.BoxGeometry(11, 0.2, 8);
    const boardMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1e272c : 0xe2e8f0,
      roughness: 0.4,
      metalness: 0.1,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.set(0, -0.1, 0);
    setupGroup.add(board);

    // --- A. ESP32 Controller Board (Center) ---
    const espGroup = new THREE.Group();
    espGroup.position.set(0, 0.2, 0);

    // PCB
    const pcbGeo = new THREE.BoxGeometry(2.4, 0.12, 3.8);
    const pcbMat = new THREE.MeshStandardMaterial({ color: 0x1a242f, roughness: 0.3 });
    const pcb = new THREE.Mesh(pcbGeo, pcbMat);
    espGroup.add(pcb);

    // Main ESP32 Metal Chip Cover
    const chipGeo = new THREE.BoxGeometry(1.2, 0.14, 1.6);
    const chipMat = new THREE.MeshStandardMaterial({ color: 0xc0c0c0, metalness: 0.8, roughness: 0.2 });
    const chip = new THREE.Mesh(chipGeo, chipMat);
    chip.position.set(0, 0.1, -0.2);
    espGroup.add(chip);

    // Micro USB Connector
    const usbGeo = new THREE.BoxGeometry(0.6, 0.15, 0.5);
    const usbMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9 });
    const usb = new THREE.Mesh(usbGeo, usbMat);
    usb.position.set(0, 0.1, 1.8);
    espGroup.add(usb);

    // Header pin rows
    const pinGeo = new THREE.BoxGeometry(0.12, 0.25, 3.4);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const pinLeft = new THREE.Mesh(pinGeo, pinMat);
    pinLeft.position.set(-1.05, 0.15, 0);
    const pinRight = new THREE.Mesh(pinGeo, pinMat);
    pinRight.position.set(1.05, 0.15, 0);
    espGroup.add(pinLeft, pinRight);

    setupGroup.add(espGroup);
    meshes["esp32"] = espGroup;

    // --- B. DHT22 Sensor (Top Left) ---
    const dhtGroup = new THREE.Group();
    dhtGroup.position.set(-3.5, 0.4, -2.2);

    const dhtGeo = new THREE.BoxGeometry(1.2, 0.5, 1.6);
    const dhtMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.4 });
    const dhtMesh = new THREE.Mesh(dhtGeo, dhtMat);
    dhtGroup.add(dhtMesh);

    // Sensor grill slots
    for (let i = -0.4; i <= 0.4; i += 0.2) {
      const slotGeo = new THREE.BoxGeometry(0.8, 0.05, 0.08);
      const slotMat = new THREE.MeshBasicMaterial({ color: 0x1d4ed8 });
      const slot = new THREE.Mesh(slotGeo, slotMat);
      slot.position.set(0, 0.26, i);
      dhtGroup.add(slot);
    }
    setupGroup.add(dhtGroup);
    meshes["dht22"] = dhtGroup;

    // --- C. Capacitive Soil Moisture Sensor (Bottom Left + Soil Mound) ---
    const soilGroup = new THREE.Group();
    soilGroup.position.set(-3.5, 0.1, 2.2);

    // Soil Mound
    const moundGeo = new THREE.CylinderGeometry(1.3, 1.5, 0.6, 16);
    const moundMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const mound = new THREE.Mesh(moundGeo, moundMat);
    mound.position.set(0, 0.3, 0);
    soilGroup.add(mound);

    // Probe PCB entering soil
    const probeGeo = new THREE.BoxGeometry(0.6, 1.6, 0.1);
    const probeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.5 });
    const probe = new THREE.Mesh(probeGeo, probeMat);
    probe.position.set(0, 0.9, 0);
    soilGroup.add(probe);

    setupGroup.add(soilGroup);
    meshes["soil"] = soilGroup;

    // --- D. NEO-6M GPS Module (Top Right) ---
    const gpsGroup = new THREE.Group();
    gpsGroup.position.set(3.5, 0.3, -2.2);

    // GPS PCB
    const gpsPcbGeo = new THREE.BoxGeometry(1.5, 0.1, 1.5);
    const gpsPcbMat = new THREE.MeshStandardMaterial({ color: 0x1e40af });
    const gpsPcb = new THREE.Mesh(gpsPcbGeo, gpsPcbMat);
    gpsGroup.add(gpsPcb);

    // Ceramic Patch Antenna
    const antGeo = new THREE.BoxGeometry(1.0, 0.25, 1.0);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(0, 0.18, 0);
    gpsGroup.add(ant);

    setupGroup.add(gpsGroup);
    meshes["gps"] = gpsGroup;

    // --- E. REALISTIC NPK SENSOR (Soil Probe with 3 Prongs — Muted Amber) ---
    const npkGroup = new THREE.Group();
    npkGroup.position.set(3.5, 0.1, 2.2);

    // NPK Probe Head Enclosure
    const npkHeadGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.8, 16);
    const npkHeadMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.65,
      roughness: 0.3,
    });
    const npkHead = new THREE.Mesh(npkHeadGeo, npkHeadMat);
    npkHead.position.set(0, 0.8, 0);
    npkGroup.add(npkHead);

    // 3 Metallic Stainless Steel Prongs entering soil mound
    for (let i = -0.2; i <= 0.2; i += 0.2) {
      const prongGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8);
      const prongMat = new THREE.MeshStandardMaterial({
        color: 0xd1d5db,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.7,
      });
      const prong = new THREE.Mesh(prongGeo, prongMat);
      prong.position.set(i, 0.2, 0);
      npkGroup.add(prong);
    }
    setupGroup.add(npkGroup);
    meshes["npk"] = npkGroup;

    // --- F. REALISTIC RAIN SENSOR (Conductive Grid Plate + PCB Module — Muted Blue) ---
    const rainGroup = new THREE.Group();
    rainGroup.position.set(0, 0.3, -3.2);

    // Rain Sensing Grid Plate (Tilted)
    const plateGeo = new THREE.BoxGeometry(1.4, 0.08, 1.6);
    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.6,
      roughness: 0.3,
    });
    const plate = new THREE.Mesh(plateGeo, plateMat);
    plate.rotation.x = -0.3; // Tilted angle
    plate.position.set(0, 0.4, 0);
    rainGroup.add(plate);

    // Gold Conductive Grid Traces on Plate
    for (let z = -0.5; z <= 0.5; z += 0.25) {
      const traceGeo = new THREE.BoxGeometry(1.2, 0.02, 0.06);
      const traceMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
      const trace = new THREE.Mesh(traceGeo, traceMat);
      trace.rotation.x = -0.3;
      trace.position.set(0, 0.45, z);
      rainGroup.add(trace);
    }

    setupGroup.add(rainGroup);
    meshes["rain"] = rainGroup;

    meshesRef.current = meshes;

    // --- WIRING PATHS ---
    const createWire = (from: THREE.Vector3, to: THREE.Vector3, color: number, isDashed = false) => {
      const points = [
        from,
        new THREE.Vector3(from.x * 0.5, 0.4, from.z * 0.5),
        to,
      ];
      const curve = new THREE.CatmullRomCurve3(points);
      const geometry = new THREE.TubeGeometry(curve, 20, 0.04, 8, false);

      if (isDashed) {
        const material = new THREE.MeshStandardMaterial({
          color,
          transparent: true,
          opacity: 0.5,
          wireframe: true,
        });
        return new THREE.Mesh(geometry, material);
      } else {
        const material = new THREE.MeshStandardMaterial({ color, roughness: 0.4 });
        return new THREE.Mesh(geometry, material);
      }
    };

    // Add Wires
    setupGroup.add(createWire(new THREE.Vector3(-3.5, 0.4, -2.2), new THREE.Vector3(-1.0, 0.2, -0.5), 0xef4444)); // DHT22
    setupGroup.add(createWire(new THREE.Vector3(-3.5, 0.6, 2.2), new THREE.Vector3(-1.0, 0.2, 0.5), 0x22c55e));  // Soil Sensor
    setupGroup.add(createWire(new THREE.Vector3(3.5, 0.3, -2.2), new THREE.Vector3(1.0, 0.2, -0.5), 0x64748b, true));   // GPS (Dashed)
    setupGroup.add(createWire(new THREE.Vector3(3.5, 0.5, 2.2), new THREE.Vector3(1.0, 0.2, 0.5), 0xf59e0b, true)); // NPK (Dashed)
    setupGroup.add(createWire(new THREE.Vector3(0, 0.4, -3.2), new THREE.Vector3(0, 0.2, -1.5), 0x64748b, true));   // Rain (Dashed)

    // --- MOUSE & TOUCH INTERACTION ---
    const handleMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePosition.current.x;
      const deltaY = e.clientY - previousMousePosition.current.y;

      rotationRef.current.y += deltaX * 0.008;
      rotationRef.current.x += deltaY * 0.008;
      rotationRef.current.x = Math.max(0.1, Math.min(1.2, rotationRef.current.x));

      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Click Detection via Raycaster
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const interactiveObjects: THREE.Object3D[] = [];
      Object.values(meshesRef.current).forEach((g) => {
        g.traverse((child) => {
          if (child instanceof THREE.Mesh) interactiveObjects.push(child);
        });
      });

      const intersects = raycaster.intersectObjects(interactiveObjects);
      if (intersects.length > 0) {
        let obj: THREE.Object3D | null = intersects[0].object;
        while (obj && obj.parent && obj.parent !== setupGroup) {
          obj = obj.parent;
        }
        if (obj) {
          const foundKey = Object.keys(meshesRef.current).find(
            (k) => meshesRef.current[k] === obj
          );
          if (foundKey) {
            onSelectComponent(foundKey);
          }
        }
      }
    };

    const domElement = renderer.domElement;
    domElement.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    domElement.addEventListener("click", handleClick);

    // --- ANIMATION & REAL-TIME 3D TO 2D SCREEN PROJECTION ---
    let animationFrameId: number;
    const tempVec = new THREE.Vector3();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (autoRotate && !isDraggingRef.current) {
        rotationRef.current.y += 0.004;
      }

      setupGroup.rotation.x = rotationRef.current.x;
      setupGroup.rotation.y = rotationRef.current.y;

      renderer.render(scene, camera);

      // Project 3D Positions to 2D Screen Overlay Badges
      if (containerRef.current && cameraRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const newPos: Record<string, LabelPosition> = {};

        Object.keys(meshesRef.current).forEach((key) => {
          const obj = meshesRef.current[key];
          obj.getWorldPosition(tempVec);
          tempVec.y += 0.8; // Offset label slightly above object

          tempVec.project(cameraRef.current!);

          const x = (tempVec.x * 0.5 + 0.5) * rect.width;
          const y = (-(tempVec.y * 0.5) + 0.5) * rect.height;
          const visible = tempVec.z < 1.0;

          newPos[key] = { x, y, visible };
        });

        setOverlayLabels(newPos);
      }
    };

    animate();

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 480;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      domElement.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      domElement.removeEventListener("click", handleClick);
      window.removeEventListener("resize", handleResize);
      if (rendererRef.current && domElement) {
        domElement.remove();
      }
    };
  }, [autoRotate, isDark, onSelectComponent]);

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden select-none border border-borderC dark:border-darkBorderC">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* ALWAYS-VISIBLE 2D OVERLAY COMPONENT LABELS */}
      {Object.keys(HARDWARE_COMPONENTS).map((key) => {
        const pos = overlayLabels[key];
        const comp = HARDWARE_COMPONENTS[key];
        const isSelected = selectedId === key;
        const isConnected = comp.status === "CONNECTED";

        if (!pos || !pos.visible) return null;

        return (
          <div
            key={key}
            onClick={(e) => {
              e.stopPropagation();
              onSelectComponent(key);
            }}
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              transform: "translate(-50%, -100%)",
            }}
            className={`absolute pointer-events-auto cursor-pointer transition-all duration-75 z-20 flex flex-col items-center group`}
          >
            <div
              className={`px-2.5 py-1 rounded-xl shadow-lg border backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap text-[11px] font-bold ${
                isSelected
                  ? "bg-primary text-white border-primary ring-2 ring-primary/40 scale-105"
                  : isDark
                  ? "bg-slate-900/90 text-slate-100 border-slate-700 hover:border-primary"
                  : "bg-white/95 text-slate-900 border-slate-200 hover:border-primary"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  isConnected ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              <span>{comp.name}</span>
              {!isConnected && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-500/40">
                  Not Connected
                </span>
              )}
            </div>

            {/* Leader Callout Pin */}
            <div className={`w-0.5 h-3 ${isSelected ? "bg-primary" : "bg-slate-400/60"}`} />
            <div className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-primary" : "bg-slate-500"}`} />
          </div>
        );
      })}

      {/* Floating 3D Viewport Controls */}
      <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-card/90 dark:bg-darkCard/90 backdrop-blur-md p-1.5 rounded-xl border border-borderC dark:border-darkBorderC shadow-lg z-10 text-xs font-semibold">
        <button
          onClick={resetCamera}
          className="px-2.5 py-1.5 rounded-lg bg-bg dark:bg-darkBg hover:bg-primaryLight text-textPrimary dark:text-darkTextPrimary transition"
        >
          Reset View
        </button>
      </div>

      <div className="absolute top-3 left-3 bg-card/80 dark:bg-darkCard/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-borderC dark:border-darkBorderC text-[11px] font-semibold text-textSecondary dark:text-darkTextSecondary pointer-events-none">
        💡 Drag to rotate · Labels stay aligned
      </div>
    </div>
  );
}
