// cosmetics.js - Sistema de Skins, Modelos 3D e Cosméticos por Equipe
import * as THREE from 'three';

// ==========================================
// 1. CATÁLOGO DE SKINS (CORES E MATERIAIS)
// ==========================================
export const SKINS = {
    marfim: {
        name: "Marfim Clássico & Ouro",
        bodyColor: 0xf5f0e6, roughness: 0.18, metalness: 0.08,
        trimColor: 0xd4af37, trimMetal: 0.85, emissive: 0x000000, emissiveIntensity: 0
    },
    obsidiana: {
        name: "Obsidiana & Ouro",
        bodyColor: 0x22252a, roughness: 0.22, metalness: 0.25,
        trimColor: 0xd4af37, trimMetal: 0.85, emissive: 0x000000, emissiveIntensity: 0
    },
    ouro_imperial: {
        name: "Ouro Maciço 24k",
        bodyColor: 0xffd700, roughness: 0.15, metalness: 0.92,
        trimColor: 0xffffff, trimMetal: 0.95, emissive: 0x332200, emissiveIntensity: 0.15
    },
    cromo_prata: {
        name: "Prata Cromada Espelhada",
        bodyColor: 0xe2e8f0, roughness: 0.08, metalness: 0.95,
        trimColor: 0x38bdf8, trimMetal: 0.9, emissive: 0x001122, emissiveIntensity: 0.2
    },
    jade_imperial: {
        name: "Jade Esmeralda",
        bodyColor: 0x059669, roughness: 0.12, metalness: 0.15,
        trimColor: 0xfacc15, trimMetal: 0.88, emissive: 0x022c22, emissiveIntensity: 0.25
    },
    rubi_sangue: {
        name: "Rubi Carmesim",
        bodyColor: 0xdc2626, roughness: 0.14, metalness: 0.35,
        trimColor: 0xfde047, trimMetal: 0.9, emissive: 0x450a0a, emissiveIntensity: 0.3
    },
    cyber_ciano: {
        name: "Cyberpunk Neon Ciano",
        bodyColor: 0x0f172a, roughness: 0.2, metalness: 0.8,
        trimColor: 0x00f5d4, trimMetal: 0.5, emissive: 0x00f5d4, emissiveIntensity: 0.65
    },
    cyber_magenta: {
        name: "Synthwave Neon Magenta",
        bodyColor: 0x181028, roughness: 0.2, metalness: 0.8,
        trimColor: 0xff007f, trimMetal: 0.5, emissive: 0xff007f, emissiveIntensity: 0.65
    },
    ametista_void: {
        name: "Ametista Sombria",
        bodyColor: 0x581c87, roughness: 0.18, metalness: 0.45,
        trimColor: 0xc084fc, trimMetal: 0.8, emissive: 0x3b0764, emissiveIntensity: 0.4
    }
};

// ==========================================
// 2. CATÁLOGO DE MODELOS 3D (GEOMETRIAS)
// ==========================================
export const MODELS = {
    staunton: { name: "Clássico Staunton (Torneado)" },
    cyber: { name: "Mecha Facetado (Low-Poly)" },
    imperial: { name: "Imperial Real (Ornamentado)" }
};

// ==========================================
// 3. CATÁLOGO DE COSMÉTICOS E EFEITOS EXTRAS
// ==========================================
export const COSMETICS = {
    none: { name: "Nenhum (Padrão)" },
    halo: { name: "Auréola Celestial Flutuante" },
    crown_gems: { name: "Cristal Arcano Flutuante" },
    aura_ring: { name: "Runa de Energia na Base" }
};

// ==========================================
// 4. ESTADO SALVO POR EQUIPE (LOCALSTORAGE)
// ==========================================
const defaultConfig = {
    w: { skin: 'marfim', model: 'staunton', cosmetic: 'none' },
    b: { skin: 'obsidiana', model: 'staunton', cosmetic: 'none' }
};

export function loadTeamConfig() {
    try {
        const saved = localStorage.getItem('chess3d_cosmetics');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                w: { ...defaultConfig.w, ...parsed.w },
                b: { ...defaultConfig.b, ...parsed.b }
            };
        }
    } catch (e) {
        console.warn("Não foi possível ler o localStorage:", e);
    }
    return JSON.parse(JSON.stringify(defaultConfig));
}

export function saveTeamConfig(config) {
    try {
        localStorage.setItem('chess3d_cosmetics', JSON.stringify(config));
    } catch (e) {
        console.warn("Não foi possível salvar no localStorage:", e);
    }
}

// ==========================================
// 5. CONSTRUTOR DE PEÇAS COM SKINS E COSMÉTICOS
// ==========================================
function createLathePart(pointsCoords, material, segments = 36) {
    const points = pointsCoords.map(([x, y]) => new THREE.Vector2(x, y));
    const geo = new THREE.LatheGeometry(points, segments);
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
}

export function buildCustomPieceMesh(type, color, teamConfig) {
    const cfg = teamConfig[color];
    const skinData = SKINS[cfg.skin] || SKINS.marfim;
    const modelStyle = cfg.model || 'staunton';
    const cosmeticStyle = cfg.cosmetic || 'none';

    // Segmentos da malha: modelo Cyber usa 6 lados (hexagonal low-poly), outros usam curvas suaves
    const latheSegments = modelStyle === 'cyber' ? 6 : 36;
    const sphereSegments = modelStyle === 'cyber' ? 6 : 28;
    const flatShading = modelStyle === 'cyber';

    const mainMat = new THREE.MeshStandardMaterial({
        color: skinData.bodyColor,
        roughness: skinData.roughness,
        metalness: skinData.metalness,
        flatShading: flatShading
    });

    const trimMat = new THREE.MeshStandardMaterial({
        color: skinData.trimColor,
        roughness: 0.2,
        metalness: skinData.trimMetal,
        emissive: skinData.emissive,
        emissiveIntensity: skinData.emissiveIntensity,
        flatShading: flatShading
    });

    const group = new THREE.Group();
    const upperType = type.toUpperCase();

    // Anel metálico da base
    const ringGeo = new THREE.CylinderGeometry(0.49, 0.51, 0.05, latheSegments);
    const ringMesh = new THREE.Mesh(ringGeo, trimMat);
    ringMesh.position.y = 0.025;
    group.add(ringMesh);

    // Colar Imperial extra se o modelo for 'imperial'
    if (modelStyle === 'imperial') {
        const collarGeo = new THREE.TorusGeometry(0.32, 0.045, 12, 32);
        collarGeo.rotateX(Math.PI / 2);
        const collarMesh = new THREE.Mesh(collarGeo, trimMat);
        collarMesh.position.y = 0.78;
        group.add(collarMesh);
    }

    let topHeight = 1.3;

    if (upperType === 'P') {
        const body = createLathePart([
            [0, 0], [0.46, 0], [0.46, 0.1], [0.38, 0.18], [0.34, 0.25],
            [0.18, 0.55], [0.14, 0.85], [0.26, 0.90], [0.15, 0.96], [0, 0.96]
        ], mainMat, latheSegments);

        const headGeo = modelStyle === 'cyber'
            ? new THREE.OctahedronGeometry(0.26, 0)
            : new THREE.SphereGeometry(0.24, sphereSegments, sphereSegments);
        const head = new THREE.Mesh(headGeo, mainMat);
        head.position.y = 1.15;
        head.castShadow = true;
        group.add(body, head);
        topHeight = 1.5;
    } 
    else if (upperType === 'R') {
        const body = createLathePart([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.42, 0.24], [0.32, 0.45],
            [0.27, 1.05], [0.36, 1.15], [0.36, 1.32], [0.22, 1.32], [0.22, 1.18], [0, 1.18]
        ], mainMat, latheSegments);
        group.add(body);
        const battlements = modelStyle === 'imperial' ? 8 : 6;
        for (let i = 0; i < battlements; i++) {
            const angle = (i / battlements) * Math.PI * 2;
            const b = new THREE.Mesh(
                new THREE.BoxGeometry(0.12, 0.18, 0.12),
                modelStyle === 'imperial' && i % 2 === 0 ? trimMat : mainMat
            );
            b.position.set(Math.cos(angle) * 0.29, 1.38, Math.sin(angle) * 0.29);
            b.rotation.y = -angle;
            b.castShadow = true;
            group.add(b);
        }
        topHeight = 1.65;
    } 
    else if (upperType === 'N') {
        const base = createLathePart([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.42, 0.22], [0.34, 0.36], [0, 0.36]
        ], mainMat, latheSegments);
        group.add(base);

        const horseGroup = new THREE.Group();
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.78, 0.44), mainMat);
        neck.position.set(0, 0.72, -0.04); neck.rotation.x = 0.22; neck.castShadow = true;

        const snout = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.55, latheSegments), mainMat);
        snout.position.set(0, 1.08, 0.22); snout.rotation.x = Math.PI * 0.42; snout.castShadow = true;

        const maneMat = modelStyle === 'ST' ? mainMat : trimMat;
        const mane = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.68, 0.18), maneMat);
        mane.position.set(0, 0.80, -0.22); mane.rotation.x = 0.18; mane.castShadow = true;

        const earL = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 8), trimMat);
        earL.position.set(0.09, 1.28, -0.02);
        const earR = earL.clone(); earR.position.x = -0.09;

        horseGroup.add(neck, snout, mane, earL, earR);
        horseGroup.rotation.y = color === 'w' ? Math.PI : 0;
        group.add(horseGroup);
        topHeight = 1.65;
    } 
    else if (upperType === 'B') {
        const body = createLathePart([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.40, 0.24], [0.20, 0.70],
            [0.16, 1.08], [0.28, 1.14], [0.18, 1.20], [0, 1.20]
        ], mainMat, latheSegments);
        const mitreGeo = modelStyle === 'cyber'
            ? new THREE.OctahedronGeometry(0.30, 0)
            : new THREE.SphereGeometry(0.26, sphereSegments, sphereSegments);
        const mitre = new THREE.Mesh(mitreGeo, mainMat);
        mitre.scale.set(1, 1.45, 1); mitre.position.y = 1.42; mitre.castShadow = true;

        const tip = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 12), trimMat);
        tip.position.y = 1.82;
        group.add(body, mitre, tip);
        topHeight = 2.0;
    } 
    else if (upperType === 'Q') {
        const body = createLathePart([
            [0, 0], [0.54, 0], [0.54, 0.14], [0.44, 0.26], [0.24, 0.75],
            [0.19, 1.32], [0.34, 1.42], [0.26, 1.50], [0.36, 1.72], [0, 1.65]
        ], mainMat, latheSegments);
        const dome = new THREE.Mesh(new THREE.SphereGeometry(0.22, sphereSegments, sphereSegments), mainMat);
        dome.position.y = 1.68;
        const coronet = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), trimMat);
        coronet.position.y = 1.94;
        group.add(body, dome, coronet);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), trimMat);
            pearl.position.set(Math.cos(angle) * 0.34, 1.75, Math.sin(angle) * 0.34);
            group.add(pearl);
        }
        topHeight = 2.15;
    } 
    else if (upperType === 'K') {
        const body = createLathePart([
            [0, 0], [0.56, 0], [0.56, 0.14], [0.46, 0.28], [0.26, 0.80],
            [0.21, 1.45], [0.36, 1.55], [0.28, 1.65], [0.38, 1.90], [0, 1.88]
        ], mainMat, latheSegments);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.34, 0.09), trimMat);
        crossV.position.y = 2.12;
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.09, 0.09), trimMat);
        crossH.position.y = 2.16;
        group.add(body, crossV, crossH);
        topHeight = 2.45;
    }

    // ==========================================
    // APLICAR COSMÉTICOS VISUAIS EXTRAS
    // ==========================================
    if (cosmeticStyle === 'halo') {
        const haloGeo = new THREE.TorusGeometry(0.26, 0.025, 12, 32);
        haloGeo.rotateX(Math.PI / 2);
        const haloMat = new THREE.MeshBasicMaterial({ color: skinData.trimColor });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.y = topHeight + 0.12;
        group.add(halo);
    } 
    else if (cosmeticStyle === 'crown_gems') {
        const gemGeo = new THREE.OctahedronGeometry(0.11, 0);
        const gemMat = new THREE.MeshBasicMaterial({
            color: skinData.emissive !== 0x000000 ? skinData.emissive : skinData.trimColor,
            wireframe: false
        });
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.y = topHeight + 0.16;
        group.add(gem);
    } 
    else if (cosmeticStyle === 'aura_ring') {
        const auraGeo = new THREE.RingGeometry(0.52, 0.63, 24);
        auraGeo.rotateX(-Math.PI / 2);
        const auraMat = new THREE.MeshBasicMaterial({
            color: skinData.emissive !== 0x000000 ? skinData.emissive : skinData.trimColor,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
            depthWrite: false
        });
        const aura = new THREE.Mesh(auraGeo, auraMat);
        aura.position.y = 0.02;
        group.add(aura);
    }

    return group;
}

// ==========================================
// 6. PREENCHIMENTO AUTOMÁTICO DOS SELECTS HTML
// ==========================================
export function initCosmeticsUI(teamConfig, onChangeCallback) {
    const teams = ['w', 'b'];
    teams.forEach(t => {
        const skinSelect = document.getElementById(`skin-${t}`);
        const modelSelect = document.getElementById(`model-${t}`);
        const cosmSelect = document.getElementById(`cosmetic-${t}`);

        if (skinSelect) {
            skinSelect.innerHTML = '';
            Object.entries(SKINS).forEach(([key, val]) => {
                const opt = new Option(val.name, key);
                skinSelect.add(opt);
            });
            skinSelect.value = teamConfig[t].skin;
            skinSelect.addEventListener('change', (e) => {
                teamConfig[t].skin = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }

        if (modelSelect) {
            modelSelect.innerHTML = '';
            Object.entries(MODELS).forEach(([key, val]) => {
                const opt = new Option(val.name, key);
                modelSelect.add(opt);
            });
            modelSelect.value = teamConfig[t].model;
            modelSelect.addEventListener('change', (e) => {
                teamConfig[t].model = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }

        if (cosmSelect) {
            cosmSelect.innerHTML = '';
            Object.entries(COSMETICS).forEach(([key, val]) => {
                const opt = new Option(val.name, key);
                cosmSelect.add(opt);
            });
            cosmSelect.value = teamConfig[t].cosmetic;
            cosmSelect.addEventListener('change', (e) => {
                teamConfig[t].cosmetic = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }
    });
}
