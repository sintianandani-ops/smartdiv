/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Three.js 3D Scene untuk Level 1: Pulau Kelereng (M3 Habis Dibagi & Bersisa)
 * - Objek kelereng 3D dengan kilauan kaca mengkilap (PBR standard/physical)
 * - Kotak-kotak transparan 3D untuk wadah pembagian
 * - Kanvas 3D 100% bebas dari kotak teks mengambang yang menghalangi objek
 * - Bilah kontrol dan info status bersih (dock) diletakkan di bawah kanvas
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { audioService } from '../../services/audioService';

interface ThreeKelerengSceneProps {
  totalMarbles: number;
  boxCount: number;
  distributedMarbles: number[]; // Jumlah kelereng di setiap kotak
  remainingMarbles: number;     // Kelereng di area tengah (sisa)
  onDistributeOne?: () => void;
  onResetDistribution?: () => void;
  onWatchProcess?: () => void;
  isWatchingProcess?: boolean;
  isInteractive?: boolean;
  className?: string;
}

export const ThreeKelerengScene: React.FC<ThreeKelerengSceneProps> = ({
  totalMarbles,
  boxCount,
  distributedMarbles,
  remainingMarbles,
  onDistributeOne,
  onResetDistribution,
  onWatchProcess,
  isWatchingProcess = false,
  isInteractive = true,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const marbleMeshesRef = useRef<THREE.Mesh[]>([]);
  const boxMeshesRef = useRef<THREE.Group[]>([]);
  const [isRotating, setIsRotating] = useState(false);
  const isRotatingRef = useRef(isRotating);

  useEffect(() => {
    isRotatingRef.current = isRotating;
  }, [isRotating]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 340;

    // Deteksi software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch {
        return false;
      }
    })();

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfefce8); // Latar lembut amber-50
    scene.fog = new THREE.Fog(0xfefce8, 14, 38);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.2, 9.8);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {
      console.debug('PMREM fallback', e);
    }

    // 3-Point Lighting Rig
    const ambientLight = new THREE.HemisphereLight(0xfffbeb, 0xd1fae5, 0.95);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(5, 12, 6);
    keyLight.castShadow = !isSoftwareGl;
    if (keyLight.castShadow) {
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe0f2fe, 0.8);
    fillLight.position.set(-6, 8, -4);
    scene.add(fillLight);

    // Lantai beralas pulau kayu ceria
    const floorGeo = new THREE.CylinderGeometry(8.5, 8.8, 0.5, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfde68a,
      roughness: 0.7,
      metalness: 0.1,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.25;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // Piring baki tengah untuk kelereng sisa / yang belum dibagikan
    const trayGeo = new THREE.CylinderGeometry(2.2, 2.4, 0.16, 32);
    const trayMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.3,
      metalness: 0.15,
    });
    const tray = new THREE.Mesh(trayGeo, trayMat);
    tray.position.set(0, 0.08, 0);
    tray.receiveShadow = !isSoftwareGl;
    scene.add(tray);

    // Bibir piring tengah warna emas
    const trayRimGeo = new THREE.TorusGeometry(2.22, 0.08, 16, 32);
    trayRimGeo.rotateX(Math.PI / 2);
    const trayRimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.25,
      metalness: 0.4,
    });
    const trayRim = new THREE.Mesh(trayRimGeo, trayRimMat);
    trayRim.position.set(0, 0.16, 0);
    scene.add(trayRim);

    // Loop animasi
    let frameId = 0;
    let angle = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (isRotatingRef.current) {
        angle += 0.003;
        camera.position.x = Math.sin(angle) * 9.6;
        camera.position.z = Math.cos(angle) * 9.6;
        camera.lookAt(0, 0.4, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Penanganan Resize
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      renderer.dispose();
      container.innerHTML = '';
    };
  }, []);

  // Update objek piring dan kelereng saat state berubah
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Bersihkan piring lama
    boxMeshesRef.current.forEach((grp) => scene.remove(grp));
    boxMeshesRef.current = [];

    // Bersihkan kelereng lama
    marbleMeshesRef.current.forEach((m) => scene.remove(m));
    marbleMeshesRef.current = [];

    // Buat Piring-Piring Pembagian Cantik 3D (Bukan kotak kaku)
    const radius = 3.7;
    const boxGroupList: THREE.Group[] = [];

    for (let i = 0; i < boxCount; i++) {
      const group = new THREE.Group();
      const theta = (i / boxCount) * Math.PI * 2;
      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // Alas piring keramik bundar putih bersih
      const plateBaseGeo = new THREE.CylinderGeometry(1.2, 1.05, 0.14, 32);
      const plateBaseMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.18,
        metalness: 0.1,
      });
      const plateMesh = new THREE.Mesh(plateBaseGeo, plateBaseMat);
      plateMesh.position.y = 0.07;
      plateMesh.receiveShadow = true;
      group.add(plateMesh);

      // Bibir piring keramik warna biru langit cerah
      const plateRimGeo = new THREE.TorusGeometry(1.18, 0.07, 16, 32);
      plateRimGeo.rotateX(Math.PI / 2);
      const plateRimMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        roughness: 0.2,
        metalness: 0.2,
      });
      const plateRim = new THREE.Mesh(plateRimGeo, plateRimMat);
      plateRim.position.y = 0.14;
      plateRim.castShadow = true;
      group.add(plateRim);

      // Kelereng di dalam piring ini (tertata rapi di piring secara alami)
      const countInBox = distributedMarbles[i] || 0;
      const marbleColors = [0x10b981, 0x06b6d4, 0x6366f1, 0xa855f7, 0xf59e0b];

      for (let m = 0; m < countInBox; m++) {
        const marbleGeo = new THREE.SphereGeometry(0.26, 22, 22);
        const marbleMat = new THREE.MeshStandardMaterial({
          color: marbleColors[m % marbleColors.length],
          roughness: 0.15,
          metalness: 0.5,
        });
        const marble = new THREE.Mesh(marbleGeo, marbleMat);

        // Posisi kelereng di piring tersusun rapi dan simetris
        let mx = 0;
        let mz = 0;
        if (countInBox === 1) {
          mx = 0; mz = 0;
        } else if (countInBox === 2) {
          mx = (m === 0 ? -0.34 : 0.34);
          mz = 0;
        } else if (countInBox === 3) {
          const ang = (m / 3) * Math.PI * 2;
          mx = Math.cos(ang) * 0.36;
          mz = Math.sin(ang) * 0.36;
        } else if (countInBox === 4) {
          const ang = (m / 4) * Math.PI * 2 + Math.PI / 4;
          mx = Math.cos(ang) * 0.42;
          mz = Math.sin(ang) * 0.42;
        } else {
          // 5+ bola: melingkar rapi
          const ang = (m / countInBox) * Math.PI * 2;
          mx = Math.cos(ang) * 0.46;
          mz = Math.sin(ang) * 0.46;
        }

        marble.position.set(mx, 0.32, mz);
        marble.castShadow = true;
        group.add(marble);
      }

      group.position.set(x, 0, z);
      scene.add(group);
      boxGroupList.push(group);
    }
    boxMeshesRef.current = boxGroupList;

    // SISA KELERENG YANG TIDAK BISA MASUK KE PIRING: DITARUH TEPAT DI TENGAH!
    const marbleList: THREE.Mesh[] = [];
    const colors = [0xf43f5e, 0xec4899, 0xa855f7, 0x6366f1, 0x06b6d4];

    for (let r = 0; r < remainingMarbles; r++) {
      const geo = new THREE.SphereGeometry(0.28, 22, 22);
      const mat = new THREE.MeshStandardMaterial({
        color: colors[r % colors.length],
        roughness: 0.15,
        metalness: 0.45,
      });
      const marble = new THREE.Mesh(geo, mat);

      // KELERENG SISA DITARUH TEPAT DI TENGAH (Piring Baki Tengah)
      let rx = 0;
      let rz = 0;
      if (remainingMarbles === 1) {
        // 1 sisa: Tepat di tengah piring baki (x=0, z=0)
        rx = 0;
        rz = 0;
      } else if (remainingMarbles === 2) {
        // 2 sisa: Simetris di tengah piring baki
        rx = r === 0 ? -0.38 : 0.38;
        rz = 0;
      } else if (remainingMarbles === 3) {
        // 3 sisa: Segitiga simetris di tengah
        const ang = (r / 3) * Math.PI * 2 - Math.PI / 2;
        rx = Math.cos(ang) * 0.42;
        rz = Math.sin(ang) * 0.42;
      } else if (remainingMarbles <= 6) {
        // 4-6 kelereng sisa: Melingkar simetris di tengah baki
        const ang = (r / remainingMarbles) * Math.PI * 2;
        rx = Math.cos(ang) * 0.55;
        rz = Math.sin(ang) * 0.55;
      } else {
        // >6 kelereng (saat awal): Sebaran Vogel rapi di baki tengah
        const subR = 0.25 + Math.sqrt(r + 1) * 0.38;
        const angle = r * 137.508 * (Math.PI / 180);
        rx = Math.cos(angle) * subR;
        rz = Math.sin(angle) * subR;
      }

      marble.position.set(rx, 0.35, rz);
      marble.castShadow = true;
      scene.add(marble);
      marbleList.push(marble);
    }
    marbleMeshesRef.current = marbleList;
  }, [boxCount, distributedMarbles, remainingMarbles]);

  const computedTotal = totalMarbles || remainingMarbles + distributedMarbles.reduce((a, b) => a + b, 0);

  return (
    <div
      className={`relative w-full ${
        className || 'h-64 sm:h-72 lg:h-[340px]'
      } rounded-2xl overflow-hidden shadow-xs border-2 border-amber-300 bg-amber-50 flex flex-col`}
    >
      {/* Kanvas 3D Three.js Murni Bebas Teks Mengambang */}
      <div
        ref={mountRef}
        className="w-full flex-1 min-h-[160px] cursor-grab active:cursor-grabbing"
      />

      {/* Bilah Dock Info & Kontrol Rapi di Bawah Kanvas */}
      <div className="bg-white/95 border-t-2 border-amber-200 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0">
        {/* Info Status Bersih: Menampilkan Total, Piring Sisa Tengah, dan Piring Pembagian */}
        <div className="flex items-center gap-2 text-slate-700 flex-wrap">
          <span className="flex items-center gap-1.5 bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg">
            <span>Total:</span>
            <strong className="text-amber-900 font-black text-sm">{computedTotal} Bola</strong>
          </span>

          <span className="text-slate-300">·</span>

          {/* Sisa di Piring Tengah */}
          <span className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-0.5 rounded-lg border-2 border-rose-300 text-rose-950">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
            <span>Piring Sisa di Tengah:</span>
            <strong className="text-rose-700 font-black text-sm">{remainingMarbles}</strong>
          </span>

          {/* Piring Pembagian */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {distributedMarbles && distributedMarbles.map((count, bIdx) => (
              <span
                key={bIdx}
                className="bg-sky-50 text-sky-950 px-1.5 py-0.5 rounded-md border border-sky-200 font-extrabold text-[11px] shrink-0"
              >
                Piring {bIdx + 1}: <strong className="text-sky-700 font-black">{count}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Tombol Aksi Nyata & Fungsional */}
        <div className="flex items-center gap-1.5 ml-auto flex-wrap">
          <button
            type="button"
            onClick={() => {
              setIsRotating((prev) => !prev);
              audioService.playTapSound();
            }}
            className="px-2 py-1 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            title="Putar atau jeda animasi 3D"
          >
            <span>{isRotating ? '⏸️ Jeda' : '▶️ Putar'}</span>
          </button>

          {onWatchProcess && (
            <button
              type="button"
              onClick={() => {
                audioService.playTapSound();
                onWatchProcess();
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-extrabold shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                isWatchingProcess
                  ? 'bg-purple-600 text-white animate-pulse'
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
              }`}
              title="Tonton simulasi otomatis langkah demi langkah"
            >
              <span>{isWatchingProcess ? '⏸️ Jeda Tonton' : '🎬 Tonton Prosesnya'}</span>
            </button>
          )}

          {isInteractive && onDistributeOne && (
            <button
              type="button"
              onClick={() => {
                audioService.playDropSound();
                onDistributeOne();
              }}
              disabled={remainingMarbles < boxCount || isWatchingProcess}
              className={`px-3 py-1 rounded-xl text-white font-extrabold text-xs shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer ${
                remainingMarbles >= boxCount && !isWatchingProcess
                  ? 'bg-amber-500 hover:bg-amber-600'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-75'
              }`}
            >
              <span>📦 Bagi 1 ke Tiap Kotak</span>
            </button>
          )}

          {isInteractive && onResetDistribution && (
            <button
              type="button"
              onClick={() => {
                audioService.playTapSound();
                onResetDistribution();
              }}
              disabled={isWatchingProcess}
              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl text-slate-700 font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              Ulang
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
