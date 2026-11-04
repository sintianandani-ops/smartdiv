/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Three.js 3D Scene untuk Level 3: Pulau Kotak Kosong (M1 Pembagian dengan Nol)
 * - Menampilkan permen/benda 3D dan kotak-kotak penerima
 * - Ketika kotak = 0, kotak hilang, benda tidak punya tempat bertumpu (efek melayang tanda tanya)
 * - Ketika permen = 0 dan kotak = 5, kotak-kotak berbaris tapi semuanya kosong
 * - Kanvas 3D 100% bebas dari kotak teks mengambang yang menutupi objek
 * - Bilah kontrol dan info status bersih (dock) diletakkan di luar/bawah kanvas
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { audioService } from '../../services/audioService';

interface ThreeZeroBoxSceneProps {
  candyCount: number;
  boxCount: number;
  isInverseMode?: boolean; // True jika menguji 0 : b = 0
  className?: string;
}

export const ThreeZeroBoxScene: React.FC<ThreeZeroBoxSceneProps> = ({
  candyCount,
  boxCount,
  isInverseMode = false,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const itemsGroupRef = useRef<THREE.Group | null>(null);
  const boxesGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

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
    scene.background = new THREE.Color(0xfff7ed); // Oranye pastel hangat
    scene.fog = new THREE.Fog(0xfff7ed, 12, 34);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 7.2, 8.8);
    camera.lookAt(0, 0.3, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment
    try {
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
    } catch (e) {
      console.debug('PMREM fallback', e);
    }

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0xfed7aa, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.7);
    keyLight.position.set(5, 10, 6);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    // Meja bulat pulau
    const floorGeo = new THREE.CylinderGeometry(5.4, 5.7, 0.4, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xfdba74,
      roughness: 0.6,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.2;
    floor.receiveShadow = !isSoftwareGl;
    scene.add(floor);

    // Wadah grup untuk boxes dan items
    const boxesGroup = new THREE.Group();
    scene.add(boxesGroup);
    boxesGroupRef.current = boxesGroup;

    const itemsGroup = new THREE.Group();
    scene.add(itemsGroup);
    itemsGroupRef.current = itemsGroup;

    let frameId = 0;
    let time = 0;
    let camAngle = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      time += 0.02;

      // Efek sedikit melayang jika kotak = 0
      if (itemsGroupRef.current) {
        itemsGroupRef.current.position.y = Math.sin(time) * 0.08;
      }

      if (isRotatingRef.current) {
        camAngle += 0.003;
        camera.position.x = Math.sin(camAngle) * 8.8;
        camera.position.z = Math.cos(camAngle) * 8.8;
        camera.lookAt(0, 0.3, 0);
      }

      renderer.render(scene, camera);
    };
    animate();

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

  // Update geometri kotak & permen
  useEffect(() => {
    const boxesGroup = boxesGroupRef.current;
    const itemsGroup = itemsGroupRef.current;
    if (!boxesGroup || !itemsGroup) return;

    // Bersihkan objek lama
    while (boxesGroup.children.length > 0) boxesGroup.remove(boxesGroup.children[0]);
    while (itemsGroup.children.length > 0) itemsGroup.remove(itemsGroup.children[0]);

    // Jika ada kotak (boxCount > 0)
    if (boxCount > 0) {
      const radius = 3.0;
      for (let i = 0; i < boxCount; i++) {
        const theta = (i / boxCount) * Math.PI * 2 - Math.PI / 2;
        const bx = Math.cos(theta) * radius;
        const bz = Math.sin(theta) * radius;

        const boxGeo = new THREE.BoxGeometry(1.65, 0.85, 1.4);
        const boxMat = new THREE.MeshPhysicalMaterial({
          color: 0x38bdf8,
          transparent: true,
          opacity: 0.55,
          roughness: 0.15,
          clearcoat: 1.0,
        });
        const boxMesh = new THREE.Mesh(boxGeo, boxMat);
        boxMesh.position.set(bx, 0.42, bz);
        boxMesh.castShadow = true;
        boxesGroup.add(boxMesh);

        const edges = new THREE.EdgesGeometry(boxGeo);
        const line = new THREE.LineSegments(
          edges,
          new THREE.LineBasicMaterial({ color: 0x0284c7, linewidth: 3 })
        );
        line.position.copy(boxMesh.position);
        boxesGroup.add(line);
      }
    }

    // Jika ada permen (candyCount > 0)
    if (candyCount > 0) {
      const perBox = boxCount > 0 ? Math.floor(candyCount / boxCount) : 0;

      if (boxCount === 0) {
        // Permen berkumpul di tengah lantai karena tidak ada kotak
        for (let c = 0; c < candyCount; c++) {
          const candyGeo = new THREE.SphereGeometry(0.3, 20, 20);
          const candyMat = new THREE.MeshStandardMaterial({
            color: 0xf43f5e,
            roughness: 0.2,
            metalness: 0.4,
          });
          const candy = new THREE.Mesh(candyGeo, candyMat);
          const angle = (c * 137.5 * Math.PI) / 180;
          const r = 0.5 + (c % 3) * 0.5;
          candy.position.set(Math.cos(angle) * r, 0.5, Math.sin(angle) * r);
          candy.castShadow = true;
          itemsGroup.add(candy);
        }
      } else {
        // Bagikan permen ke tiap kotak
        const radius = 3.0;
        for (let b = 0; b < boxCount; b++) {
          const theta = (b / boxCount) * Math.PI * 2 - Math.PI / 2;
          const bx = Math.cos(theta) * radius;
          const bz = Math.sin(theta) * radius;

          for (let p = 0; p < perBox; p++) {
            const candyGeo = new THREE.SphereGeometry(0.26, 20, 20);
            const candyMat = new THREE.MeshStandardMaterial({
              color: 0xf43f5e,
              roughness: 0.2,
              metalness: 0.4,
            });
            const candy = new THREE.Mesh(candyGeo, candyMat);
            candy.position.set(bx + (p % 2) * 0.3 - 0.15, 0.25 + Math.floor(p / 2) * 0.3, bz);
            itemsGroup.add(candy);
          }
        }
      }
    }
  }, [candyCount, boxCount, isInverseMode]);

  return (
    <div
      className={`relative w-full ${
        className || 'h-64 sm:h-72 lg:h-[340px]'
      } rounded-2xl overflow-hidden shadow-xs border-2 border-rose-300 bg-rose-50 flex flex-col`}
    >
      {/* Kanvas 3D Three.js Murni Bebas Teks Mengambang */}
      <div
        ref={mountRef}
        className="w-full flex-1 min-h-[170px] cursor-grab active:cursor-grabbing"
      />

      {/* Bilah Dock Info & Kontrol Rapi di Luar/Bawah Kanvas */}
      <div className="bg-white/95 border-t-2 border-rose-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0">
        {/* Info Status Bersih Unboxed */}
        <div className="flex items-center gap-2 text-slate-700">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span>Permen:</span>
            <strong className="text-rose-700 font-black text-sm">{candyCount}</strong>
          </span>

          <span className="text-slate-300">·</span>

          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span>
            <span>Kotak:</span>
            <strong className="text-sky-700 font-black text-sm">{boxCount}</strong>
          </span>

          {boxCount === 0 ? (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-rose-600 font-black flex items-center gap-1">
                <span>🚫 Kotak = 0 (Tidak ada penerima)</span>
              </span>
            </>
          ) : candyCount === 0 ? (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-emerald-700 font-bold">
                Permen = 0 (Semua kotak kosong)
              </span>
            </>
          ) : (
            <>
              <span className="text-slate-300 hidden sm:inline">·</span>
              <span className="text-slate-600 hidden sm:inline">
                Isi per kotak: <strong>{Math.floor(candyCount / boxCount)}</strong>
              </span>
            </>
          )}
        </div>

        {/* Tombol Aksi Nyata & Fungsional */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => {
              setIsRotating((prev) => !prev);
              audioService.playTapSound();
            }}
            className="px-2.5 py-1 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-950 text-xs font-bold active:scale-95 transition-all flex items-center gap-1"
            title="Putar atau jeda animasi 3D"
          >
            <span>{isRotating ? '⏸️ Jeda Putar' : '▶️ Putar 3D'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
