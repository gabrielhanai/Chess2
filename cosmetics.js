// cosmetics.js - Sistema Ultra-Otimizado com Fusão de Geometrias (Merged BufferGeometries)
import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

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
// 2. CATÁLOGO DE MODELOS 3D E COSMÉTICOS
// ==========================================
export const MODELS = {
    staunton: { name: "Clássico Staunton (Torneado)" },
    cyber: { name: "Mecha Facetado (Low-Poly)" },
    imperial: { name: "Imperial Real (Ornamentado)" }
};

export const COSMETICS = {
    none: { name: "Nenhum (Padrão)" },
    halo: { name: "Auréola Celestial Flutuante" },
    crown_gems: { name: "Cristal Arcano Flutuante" },
    aura_ring: { name: "Runa de Energia na Base" }
};

// ==========================================
// 3. ESTADO SALVO POR EQUIPE (LOCALSTORAGE)
// ==========================================
const defaultConfig = {
    w: { skin: 'marfim', model: 'staunton', cosmetic: 'none' },
    b: { skin: 'obsidiana', model: 'staunton', cosmetic: 'none' },
    quality: 'medium' // 'low' (Turbo), 'medium' (Equilibrado), 'high' (Ultra)
};

export function loadTeamConfig() {
    try {
        const saved = localStorage.getItem('chess3d_cosmetics');
        if (saved) {
            const parsed = JSON.parse(saved);
            return {
                w: { ...defaultConfig.w, ...parsed.w },
                b: { ...defaultConfig.b, ...parsed.b },
                quality: parsed.quality || defaultConfig.quality
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
// 4. CACHE DE GEOMETRIAS FUNDIDAS E MATERIAIS
// ==========================================
const mergedPieceCache = new Map();
const cosmeticGeoCache = new Map();
const materialCache = new Map();

function getCachedMaterials(skinKey, modelStyle) {
    const cacheKey = `${skinKey}_${modelStyle}`;
    if (materialCache.has(cacheKey)) {
        return materialCache.get(cacheKey);
    }

    const skinData = SKINS[skinKey] || SKINS.marfim;
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

    const haloMat = new THREE.MeshBasicMaterial({ color: skinData.trimColor });
    const gemColor = skinData.emissive !== 0x000000 ? skinData.emissive : skinData.trimColor;
    const gemMat = new THREE.MeshBasicMaterial({ color: gemColor });
    const auraMat = new THREE.MeshBasicMaterial({
        color: gemColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
        depthWrite: false
    });

    const mats = { mainMat, trimMat, haloMat, gemMat, auraMat };
    materialCache.set(cacheKey, mats);
    return mats;
}

// Normaliza atributos para que BufferGeometryUtils.mergeGeometries funcione sem erros
function prepareGeo(geo) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (g.attributes.uv) g.deleteAttribute('uv');
    g.computeVertexNormals();
    return g;
}

function createLatheGeo(pointsCoords, segments) {
    const points = pointsCoords.map(([x, y]) => new THREE.Vector2(x, y));
    return prepareGeo(new THREE.LatheGeometry(points, segments));
}

// Constrói e funde todas as sub-partes da peça em APENAS 2 BufferGeometries (bodyGeo e trimGeo)
function getMergedPieceGeometries(upperType, modelStyle, color) {
    const rotTag = upperType === 'N' ? color : 'sym';
    const key = `${upperType}_${modelStyle}_${rotTag}`;
    if (mergedPieceCache.has(key)) {
        return mergedPieceCache.get(key);
    }

    const latheSegments = modelStyle === 'cyber' ? 6 : 16;
    const sphereSegments = modelStyle === 'cyber' ? 6 : 12;

    const mainGeos = [];
    const trimGeos = [];

    // Anel da base
    const baseRing = prepareGeo(new THREE.CylinderGeometry(0.49, 0.51, 0.05, latheSegments));
    baseRing.translate(0, 0.025, 0);
    trimGeos.push(baseRing);

    if (modelStyle === 'imperial') {
        const collar = prepareGeo(new THREE.TorusGeometry(0.32, 0.045, 8, 16));
        collar.rotateX(Math.PI / 2);
        collar.translate(0, 0.78, 0);
        trimGeos.push(collar);
    }

    let topHeight = 1.3;

    if (upperType === 'P') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.46, 0], [0.46, 0.1], [0.38, 0.18], [0.34, 0.25],
            [0.18, 0.55], [0.14, 0.85], [0.26, 0.90], [0.15, 0.96], [0, 0.96]
        ], latheSegments));

        const head = prepareGeo(
            modelStyle === 'cyber'
                ? new THREE.OctahedronGeometry(0.26, 0)
                : new THREE.SphereGeometry(0.24, sphereSegments, sphereSegments)
        );
        head.translate(0, 1.15, 0);
        mainGeos.push(head);
        topHeight = 1.5;
    } 
    else if (upperType === 'R') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.42, 0.24], [0.32, 0.45],
            [0.27, 1.05], [0.36, 1.15], [0.36, 1.32], [0.22, 1.32], [0.22, 1.18], [0, 1.18]
        ], latheSegments));

        const battlements = modelStyle === 'imperial' ? 8 : 6;
        for (let i = 0; i < battlements; i++) {
            const angle = (i / battlements) * Math.PI * 2;
            const b = prepareGeo(new THREE.BoxGeometry(0.12, 0.18, 0.12));
            b.rotateY(-angle);
            b.translate(Math.cos(angle) * 0.29, 1.38, Math.sin(angle) * 0.29);
            if (modelStyle === 'imperial' && i % 2 === 0) {
                trimGeos.push(b);
            } else {
                mainGeos.push(b);
            }
        }
        topHeight = 1.65;
    } 
    else if (upperType === 'N') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.42, 0.22], [0.34, 0.36], [0, 0.36]
        ], latheSegments));

        const rotY = color === 'w' ? Math.PI : 0;

        const neck = prepareGeo(new THREE.BoxGeometry(0.32, 0.78, 0.44));
        neck.rotateX(0.22);
        neck.translate(0, 0.72, -0.04);
        if (rotY) neck.rotateY(rotY);
        mainGeos.push(neck);

        const snout = prepareGeo(new THREE.ConeGeometry(0.22, 0.55, latheSegments));
        snout.rotateX(Math.PI * 0.42);
        snout.translate(0, 1.08, 0.22);
        if (rotY) snout.rotateY(rotY);
        mainGeos.push(snout);

        const mane = prepareGeo(new THREE.BoxGeometry(0.10, 0.68, 0.18));
        mane.rotateX(0.18);
        mane.translate(0, 0.80, -0.22);
        if (rotY) mane.rotateY(rotY);
        trimGeos.push(mane);

        const earL = prepareGeo(new THREE.ConeGeometry(0.06, 0.22, 6));
        earL.translate(0.09, 1.28, -0.02);
        if (rotY) earL.rotateY(rotY);
        trimGeos.push(earL);

        const earR = prepareGeo(new THREE.ConeGeometry(0.06, 0.22, 6));
        earR.translate(-0.09, 1.28, -0.02);
        if (rotY) earR.rotateY(rotY);
        trimGeos.push(earR);

        topHeight = 1.65;
    } 
    else if (upperType === 'B') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.50, 0], [0.50, 0.12], [0.40, 0.24], [0.20, 0.70],
            [0.16, 1.08], [0.28, 1.14], [0.18, 1.20], [0, 1.20]
        ], latheSegments));

        const mitre = prepareGeo(
            modelStyle === 'cyber'
                ? new THREE.OctahedronGeometry(0.30, 0)
                : new THREE.SphereGeometry(0.26, sphereSegments, sphereSegments)
        );
        mitre.scale(1, 1.45, 1);
        mitre.translate(0, 1.42, 0);
        mainGeos.push(mitre);

        const tip = prepareGeo(new THREE.SphereGeometry(0.07, 8, 8));
        tip.translate(0, 1.82, 0);
        trimGeos.push(tip);
        topHeight = 2.0;
    } 
    else if (upperType === 'Q') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.54, 0], [0.54, 0.14], [0.44, 0.26], [0.24, 0.75],
            [0.19, 1.32], [0.34, 1.42], [0.26, 1.50], [0.36, 1.72], [0, 1.65]
        ], latheSegments));

        const dome = prepareGeo(new THREE.SphereGeometry(0.22, sphereSegments, sphereSegments));
        dome.translate(0, 1.68, 0);
        mainGeos.push(dome);

        const coronet = prepareGeo(new THREE.SphereGeometry(0.08, 8, 8));
        coronet.translate(0, 1.94, 0);
        trimGeos.push(coronet);

        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const pearl = prepareGeo(new THREE.SphereGeometry(0.045, 6, 6));
            pearl.translate(Math.cos(angle) * 0.34, 1.75, Math.sin(angle) * 0.34);
            trimGeos.push(pearl);
        }
        topHeight = 2.15;
    } 
    else if (upperType === 'K') {
        mainGeos.push(createLatheGeo([
            [0, 0], [0.56, 0], [0.56, 0.14], [0.46, 0.28], [0.26, 0.80],
            [0.21, 1.45], [0.36, 1.55], [0.28, 1.65], [0.38, 1.90], [0, 1.88]
        ], latheSegments));

        const crossV = prepareGeo(new THREE.BoxGeometry(0.09, 0.34, 0.09));
        crossV.translate(0, 2.12, 0);
        const crossH = prepareGeo(new THREE.BoxGeometry(0.25, 0.09, 0.09));
        crossH.translate(0, 2.16, 0);
        trimGeos.push(crossV, crossH);
        topHeight = 2.45;
    }

    const mergedMain = BufferGeometryUtils.mergeGeometries(mainGeos, false);
    const mergedTrim = BufferGeometryUtils.mergeGeometries(trimGeos, false);

    const result = { mergedMain, mergedTrim, topHeight };
    mergedPieceCache.set(key, result);
    return result;
}

function getCosmeticGeo(key, createFn) {
    if (!cosmeticGeoCache.has(key)) {
        cosmeticGeoCache.set(key, createFn());
    }
    return cosmeticGeoCache.get(key);
}

// ==========================================
// 5. CONSTRUTOR DE PEÇAS OTIMIZADO
// ==========================================
export function buildCustomPieceMesh(type, color, teamConfig) {
    const cfg = teamConfig[color];
    const skinKey = cfg.skin || 'marfim';
    const modelStyle = cfg.model || 'staunton';
    const cosmeticStyle = cfg.cosmetic || 'none';
    const shadowsEnabled = teamConfig.quality !== 'low';

    const { mainMat, trimMat, haloMat, gemMat, auraMat } = getCachedMaterials(skinKey, modelStyle);
    const upperType = type.toUpperCase();

    const { mergedMain, mergedTrim, topHeight } = getMergedPieceGeometries(upperType, modelStyle, color);

    const group = new THREE.Group();

    const mainMesh = new THREE.Mesh(mergedMain, mainMat);
    mainMesh.castShadow = shadowsEnabled;
    mainMesh.receiveShadow = shadowsEnabled;
    group.add(mainMesh);

    const trimMesh = new THREE.Mesh(mergedTrim, trimMat);
    trimMesh.castShadow = false; // Adornos pequenos não precisam projetar sombra (economiza GPU)
    trimMesh.receiveShadow = false;
    group.add(trimMesh);

    if (cosmeticStyle === 'halo') {
        const haloGeo = getCosmeticGeo('cosm_halo', () => {
            const g = new THREE.TorusGeometry(0.26, 0.025, 8, 16);
            g.rotateX(Math.PI / 2);
            return g;
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.y = topHeight + 0.12;
        group.add(halo);
    } 
    else if (cosmeticStyle === 'crown_gems') {
        const gemGeo = getCosmeticGeo('cosm_gem', () => new THREE.OctahedronGeometry(0.11, 0));
        const gem = new THREE.Mesh(gemGeo, gemMat);
        gem.position.y = topHeight + 0.16;
        group.add(gem);
    } 
    else if (cosmeticStyle === 'aura_ring') {
        const auraGeo = getCosmeticGeo('cosm_aura', () => {
            const g = new THREE.RingGeometry(0.52, 0.63, 16);
            g.rotateX(-Math.PI / 2);
            return g;
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
            Object.entries(SKINS).forEach(([key, val]) => skinSelect.add(new Option(val.name, key)));
            skinSelect.value = teamConfig[t].skin;
            skinSelect.addEventListener('change', (e) => {
                teamConfig[t].skin = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }

        if (modelSelect) {
            modelSelect.innerHTML = '';
            Object.entries(MODELS).forEach(([key, val]) => modelSelect.add(new Option(val.name, key)));
            modelSelect.value = teamConfig[t].model;
            modelSelect.addEventListener('change', (e) => {
                teamConfig[t].model = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }

        if (cosmSelect) {
            cosmSelect.innerHTML = '';
            Object.entries(COSMETICS).forEach(([key, val]) => cosmSelect.add(new Option(val.name, key)));
            cosmSelect.value = teamConfig[t].cosmetic;
            cosmSelect.addEventListener('change', (e) => {
                teamConfig[t].cosmetic = e.target.value;
                saveTeamConfig(teamConfig);
                onChangeCallback();
            });
        }
    });
}
