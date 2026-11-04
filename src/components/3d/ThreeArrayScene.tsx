/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Three.js 3D Scene untuk Level 2: Pulau Pasangan Ajaib (M2 Kebalikan Perkalian)
 * Berdasarkan Temuan Validasi Ahli Media No. 5:
 * - Mengganti dodecahedron dengan Permen Berbungkus Realistis 3D (Wrapped Candy)
 * - Rotasi presisi 90 derajat dengan durasi ~0.5 detik
 * - Menampilkan sudut yang tepat (0° vs 90°) dan tombol "Kembali ke Awal (0°)"
 * - Menampilkan fakta keluarga perkalian-pembagian yang berganti sesuai orientasi
 * - Kanvas 3D 100% bebas dari kotak teks mengambang yang menutupi objek
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { audioService } from '../../services/audioService';

interface ThreeArraySceneProps {
  rows: number;
  cols: number;
  isRotated?: boolean;
  highlightStatus?: 'normal' | 'correct' | 'wrong';
  onToggleRotate?: () => void;
  onResetRotate?: () => void;
  className?: string;
}

export const ThreeArrayScene: React.FC<ThreeArraySceneProps> = ({
  rows,
  cols,
  isRotated = false,
  highlightStatus = 'normal',
  onToggleRotate,
  onResetRotate,
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const gridGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Sudut rotasi target untuk transisi halus 0.5 detik
  const targetRotationYRef = useRef(0);
  const currentRotationYRef = useRef(0);

  // Update target rotasi saat prop isRotated berubah (0 atau 90 derajat = Math.PI / 2)
  useEffect(() => {
    targetRotationYRef.current = isRotated ? Math.PI / 2 : 0;
  }, [isRotated]);

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
    scene.background = new THREE.Color(0xf0fdf4); // Hijau pastel lembut
    scene.fog = new THREE.Fog(0xf0fdf4, 14, 38);
    sceneRef.current = scene;

    const maxDim = Math.max(rows, cols);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 8.5 + maxDim * 0.18, 9.2 + maxDim * 0.22);
    camera.lookAt(0, 0.2, 0);
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

    // Pencahayaan
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xdcfce7, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xffedd5, 1.8);
    keyLight.position.set(6, 10, 5);
    keyLight.castShadow = !isSoftwareGl;
    scene.add(keyLight);

    // Landasan papan nampan kayu bulat ramah yang lebih besar
    const boardGeo = new THREE.CylinderGeometry(6.5, 6.8, 0.45, 32);
    const boardMat = new THREE.MeshStandardMaterial({
      color: 0x86efac,
      roughness: 0.6,
      metalness: 0.1,
    });
    const board = new THREE.Mesh(boardGeo, boardMat);
    board.position.y = -0.25;
    board.receiveShadow = !isSoftwareGl;
    scene.add(board);

    // Grup Grid yang bisa diputar dengan presisi
    const gridGroup = new THREE.Group();
    scene.add(gridGroup);
    gridGroupRef.current = gridGroup;

    // Animasi loop tenang tanpa putaran konstan yang membuat pusing
    let frameId = 0;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (gridGroupRef.current) {
        // Damping halus ~0.4s response
        currentRotationYRef.current = THREE.MathUtils.damp(
          currentRotationYRef.current,
          targetRotationYRef.current,
          8,
          0.016
        );
        gridGroupRef.current.rotation.y = currentRotationYRef.current;
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

  // Membangun objek 3D Realistis: Permen Berbungkus Cantik (Wrapped Candy)
  useEffect(() => {
    const gridGroup = gridGroupRef.current;
    if (!gridGroup) return;

    // Bersihkan objek lama
    while (gridGroup.children.length > 0) {
      const child = gridGroup.children[0];
      gridGroup.remove(child);
    }

    // Jarak susunan dan offset diperbesar agar permen besar muat rapi
    const spacingX = 1.3;
    const spacingZ = 1.3;
    const offsetX = ((cols - 1) * spacingX) / 2;
    const offsetZ = ((rows - 1) * spacingZ) / 2;

    // Warna permen cerah dan mengkilap
    let candyColor = 0x3b82f6; // Biru manis ceria
    let wrapperColor = 0x60a5fa;
    let emissiveColor = 0x000000;

    if (highlightStatus === 'correct') {
      candyColor = 0x10b981; // Hijau sukses
      wrapperColor = 0x34d399;
      emissiveColor = 0x059669;
    } else if (highlightStatus === 'wrong') {
      candyColor = 0xf97316; // Jingga lembut
      wrapperColor = 0xfb923c;
      emissiveColor = 0xea580c;
    }

    // Material Permen Berkilau
    const candyMat = new THREE.MeshStandardMaterial({
      color: candyColor,
      roughness: 0.2,
      metalness: 0.35,
      emissive: emissiveColor,
      emissiveIntensity: highlightStatus === 'normal' ? 0 : 0.35,
    });

    // Material Bungkus Ujung Mengkilap
    const wrapperMat = new THREE.MeshStandardMaterial({
      color: wrapperColor,
      roughness: 0.3,
      metalness: 0.25,
      flatShading: true,
    });

    const plateUnderneathMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
    });

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const itemGroup = new THREE.Group();

        // 1. Badan Permen Silinder Memanjang (Diperbesar 50% agar jelas)
        const bodyGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.6, 20);
        const bodyMesh = new THREE.Mesh(bodyGeo, candyMat);
        bodyMesh.rotation.z = Math.PI / 2;
        bodyMesh.castShadow = true;
        itemGroup.add(bodyMesh);

        // 2. Ujung Bungkus Kiri (Twist Kerucut)
        const leftTieGeo = new THREE.ConeGeometry(0.25, 0.3, 12);
        const leftTieMesh = new THREE.Mesh(leftTieGeo, wrapperMat);
        leftTieMesh.position.x = -0.42;
        leftTieMesh.rotation.z = Math.PI / 2;
        leftTieMesh.castShadow = true;
        itemGroup.add(leftTieMesh);

        // 3. Ujung Bungkus Kanan (Twist Kerucut)
        const rightTieGeo = new THREE.ConeGeometry(0.25, 0.3, 12);
        const rightTieMesh = new THREE.Mesh(rightTieGeo, wrapperMat);
        rightTieMesh.position.x = 0.42;
        rightTieMesh.rotation.z = -Math.PI / 2;
        rightTieMesh.castShadow = true;
        itemGroup.add(rightTieMesh);

        // 4. Piring Kecil Penyangga Putih di Bawah
        const plateGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.08, 20);
        const plateMesh = new THREE.Mesh(plateGeo, plateUnderneathMat);
        plateMesh.position.y = -0.28;
        plateMesh.receiveShadow = true;
        itemGroup.add(plateMesh);

        itemGroup.position.set(c * spacingX - offsetX, 0.35, r * spacingZ - offsetZ);
        gridGroup.add(itemGroup);
      }
    }

    if (cameraRef.current) {
      const maxD = Math.max(rows, cols);
      cameraRef.current.position.set(0, 8.5 + maxD * 0.18, 9.2 + maxD * 0.22);
      cameraRef.current.lookAt(0, 0.2, 0);
    }
  }, [rows, cols, highlightStatus]);

  const currentDisplayRows = isRotated ? cols : rows;
  const currentDisplayCols = isRotated ? rows : cols;
  const totalItems = rows * cols;

  return (
    <div
      className={`relative w-full ${
        className || 'h-64 sm:h-72 lg:h-[340px]'
      } rounded-2xl overflow-hidden shadow-xs border-2 border-emerald-300 bg-emerald-50 flex flex-col`}
    >
      {/* Kanvas 3D Three.js Murni Bebas Teks Mengambang */}
      <div
        ref={mountRef}
        className="w-full flex-1 min-h-[170px] cursor-grab active:cursor-grabbing"
      />

      {/* Bilah Dock Info & Kontrol Rapi di Bawah Kanvas */}
      <div className="bg-white/95 border-t-2 border-emerald-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold shrink-0">
        {/* Info Status Bersih & Kaitan Keluarga Perkalian-Pembagian */}
        <div className="flex flex-wrap items-center gap-2 text-slate-700">
          <span className="flex items-center gap-1.5 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            <span>🍬 Susunan:</span>
            <strong className="text-emerald-900 font-black text-xs sm:text-sm">
              {currentDisplayRows} baris × {currentDisplayCols} kolom
            </strong>
          </span>

          <span className="bg-sky-50 px-2 py-0.5 rounded-lg border border-sky-200 text-sky-900 font-extrabold text-xs">
            {isRotated ? '🔄 Posisi: Kolom ⇄ Baris' : '📐 Posisi: Normal (Baris × Kolom)'}
          </span>

          <span className="bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 text-amber-950 font-black text-xs hidden sm:inline">
            {isRotated
              ? `${cols} × ${rows} = ${totalItems}  ⇄  ${totalItems} : ${cols} = ${rows}`
              : `${rows} × ${cols} = ${totalItems}  ⇄  ${totalItems} : ${rows} = ${cols}`}
          </span>
        </div>

        {/* Tombol Aksi Nyata: Tukar Orientasi Baris ⇄ Kolom */}
        <div className="flex items-center gap-1.5 ml-auto">
          {onToggleRotate && (
            <button
              type="button"
              onClick={() => {
                audioService.playTapSound();
                onToggleRotate();
              }}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-extrabold shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <span>🔄 Tukar Susunan (Baris ⇄ Kolom)</span>
            </button>
          )}

          {isRotated && onResetRotate && (
            <button
              type="button"
              onClick={() => {
                audioService.playTapSound();
                onResetRotate();
              }}
              className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl text-xs font-bold border border-slate-300 active:scale-95 transition-all cursor-pointer"
            >
              <span>Kembali ke Awal</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
