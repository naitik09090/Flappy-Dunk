// =====================================================
// FLAPPY DUNK - Complete Game
// React JS + HTML5 Canvas
// =====================================================

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import ballAsset from '../assets/Ball_Images/flappy_dunk_ball.webp';
import hoopAsset from '../assets/Ball_Images/hoop_top.webp';
import ballAsset2 from '../assets/Ball_Images/flappy_dunk_ball.svg';

import heartAsset from '../assets/Heart_Images/flappy_dunk_heart.svg';
import heartHoopAsset from '../assets/Heart_Images/flappy_dunk_heart_hoop.svg';

import kiteAsset from '../assets/Kite_Images/flappy_dunk_kite_ball.svg';
import kiteHoopAsset from '../assets/Kite_Images/flappy_dunk_kite_hoops4.svg';

import kittyAsset from '../assets/Kitty_Images/flappy_dunk_kitty.svg';
import kittyHoopAsset from '../assets/Kitty_Images/flappy_dunk_kitty_hoop.svg';

import {
    LEVELS,
    LevelSelection,
    LevelCompleteScreen,
    CountdownOverlay,
    StarsBg
} from './level-section';

// =====================================================
// CONSTANTS (Game na rules ane matching values)
// =====================================================
const GRAVITY = 0.4;        // Ball niche padvani speed
const FLAP_STRENGTH = -9.2; // Jump marye tyare ketlu unchu jay
const BASE_SPEED = 3.5;     // Game ni starting speed
const HOOP_WIDTH = 180;     // Ring (hoop) ni width
// const HOOP_GAP = 135;       
const BALL_RADIUS = 48;     // Ball ni size
const BALL_PHYSICS_RADIUS = 34; // Ball ni collision size
const TRAIL_LEN = 14;       // Ball ni pachad ni puchdi
const MAX_SPEED = 2.8;
const MIN_GAP = 95;
const DEFAULT_GAP = 135;

const BALL_SKINS = [ // Game ma jetla skins che teni list
    { id: 'classic', label: 'Classic', emoji: '🏀', unlockScore: 0, color: 'transparent', lineColor: '#1a0a00', desc: 'Default' },
    { id: 'blue', label: 'Blue', emoji: '💙', unlockScore: 25, color: '#3498db', lineColor: '#0a1a2e', desc: 'Score 25' },
    { id: 'green', label: 'Green', emoji: '💚', unlockScore: 50, color: '#2ecc71', lineColor: '#0a2e1a', desc: 'Score 50' },
    { id: 'gold', label: 'Gold', emoji: '🌟', unlockScore: 75, color: '#ffd700', lineColor: '#2e2000', desc: 'Score 75' },
    { id: 'purple', label: 'Purple', emoji: '💜', unlockScore: 100, color: '#9b59b6', lineColor: '#1a0a2e', desc: 'Score 100' },
    { id: 'fire', label: 'Fire', emoji: '🔥', unlockScore: 125, color: '#ff1744', lineColor: '#2e0000', desc: 'Score 125' },
    { id: 'heart', label: 'Heart', emoji: '❤️', unlockScore: 25, color: '#ff4b4b', lineColor: '#360d0f', desc: 'Score 25', isCustom: true },
    { id: 'kite', label: 'Kite', emoji: '🪁', unlockScore: 50, color: '#ff4b4b', lineColor: '#360d0f', desc: 'Score 50', isCustom: true },
    { id: 'kitty', label: 'Kitty', emoji: '🐱', unlockScore: 75, color: '#ffcc80', lineColor: '#3e2723', desc: 'Score 75', isCustom: true },
];

const SKIN_CATEGORIES = [
    { id: 'classic', label: 'Classic', emoji: '🏀', unlockScore: 0, variants: ['classic', 'blue', 'green', 'gold', 'purple', 'fire'] },
    { id: 'heart', label: 'Heart', emoji: '❤️', unlockScore: 25, variants: ['heart'] },
    { id: 'kite', label: 'Kite', emoji: '🪁', unlockScore: 50, variants: ['kite'] },
    { id: 'kitty', label: 'Kitty', emoji: '🐱', unlockScore: 75, variants: ['kitty'] },
];

// =====================================================
// UTILITIES
// =====================================================
const lerp = (a, b, t) => a + (b - a) * t;
const getSpeedMult = (score) => Math.min(1 + score * 0.015, MAX_SPEED);
// const lighten = (hex, amt) => {
//     const n = parseInt(hex.replace('#', ''), 16);
//     return `rgb(${Math.min(255, (n >> 16) + amt)},${Math.min(255, ((n >> 8) & 0xFF) + amt)},${Math.min(255, (n & 0xFF) + amt)})`;
// };
// const darken = (hex, amt) => {
//     const n = parseInt(hex.replace('#', ''), 16);
//     return `rgb(${Math.max(0, (n >> 16) - amt)},${Math.max(0, ((n >> 8) & 0xFF) - amt)},${Math.max(0, (n & 0xFF) - amt)})`;
// };

// =====================================================
// CANVAS DRAWING
// =====================================================
function generateStars(W, H) {
    return Array.from({ length: 80 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H * 1.9, // Spread stars higher up
        r: Math.random() * 1.5 + 0.2,
        alpha: Math.random() * 0.6 + 0.1,
        tw: Math.random() * Math.PI * 2,
    }));
}

// Background dore che
function drawBackground(ctx, W, H) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#080818');
    g.addColorStop(0.6, '#111135');
    g.addColorStop(1, '#1c0a35');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    // Niche no rastow (Floor)
    const floorH = 60;
    const fg = ctx.createLinearGradient(0, H - floorH, 0, H);
    fg.addColorStop(0, '#3b2000');
    fg.addColorStop(1, '#200f00');
    ctx.fillStyle = fg;
    ctx.fillRect(0, H - floorH, W, floorH);

    // Floor line
    ctx.strokeStyle = 'rgba(255,140,40,0.5)';
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(0, H - floorH); ctx.lineTo(W, H - floorH); ctx.stroke();

    // Floor planks
    ctx.strokeStyle = 'rgba(255,140,40,0.12)';
    ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 70) {
        ctx.beginPath(); ctx.moveTo(x, H - floorH); ctx.lineTo(x + 35, H); ctx.stroke();
    }
}

function drawStars(ctx, stars, t) {
    stars.forEach(s => {
        const a = 0.15 + 0.55 * Math.abs(Math.sin(t * 0.0008 + s.tw));
        ctx.globalAlpha = a;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawTrail(ctx, trail, skinColor) {
    trail.forEach((pt, i) => {
        const a = (i / trail.length) * 0.4;
        const sz = BALL_PHYSICS_RADIUS * (i / trail.length) * 0.65;
        if (sz < 0.5) return;
        ctx.globalAlpha = a;
        ctx.fillStyle = skinColor;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, sz, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawBall(ctx, x, y, rot, skin, ts = performance.now(), tintedImg = null, vy = 0) {
    const r = BALL_RADIUS;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);

    // Smoother & Subtler Flap Animation
    // Use a stable frequency and a much smaller amplitude to avoid extreme distortion
    const baseFreq = 0.012;
    const movementIntensity = Math.min(Math.abs(vy) * 0.015, 0.08); // much more subtle scaling
    const smoothedAmp = 0.05 + movementIntensity; // max amplitude around 0.13

    const wave = Math.sin(ts * baseFreq);
    const scaleY = 1 + wave * smoothedAmp;
    const scaleX = 1 - (wave * smoothedAmp * 0.3); // volume preservation

    ctx.scale(scaleX, scaleY);

    if (tintedImg) {
        ctx.drawImage(tintedImg, -r, -r, r * 2, r * 2);
    } else {
        // Fallback placeholder if image not ready
        ctx.fillStyle = skin.color;
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = skin.lineColor;
        ctx.lineWidth = 3; ctx.stroke();
    }
    ctx.restore();
}

// function drawNet(ctx, lx, rx, topY, h) {
//     const segs = 6;
//     const sw = (rx - lx) / segs;
//     ctx.strokeStyle = 'rgba(230,218,200,0.72)'; ctx.lineWidth = 1;
//     // top bar
//     ctx.beginPath(); ctx.moveTo(lx, topY); ctx.lineTo(rx, topY); ctx.stroke();
//     // verticals (narrowing)
//     for (let i = 0; i <= segs; i++) {
//         const tx = lx + i * sw;
//         const bx = lerp(lx + (rx - lx) * 0.15, rx - (rx - lx) * 0.15, i / segs);
//         ctx.beginPath(); ctx.moveTo(tx, topY); ctx.lineTo(bx, topY + h); ctx.stroke();
//     }
//     // horizontals
//     for (let j = 1; j <= 4; j++) {
//         const t = j / 5;
//         const llx = lerp(lx, lx + (rx - lx) * 0.15, t);
//         const rrx = lerp(rx, rx - (rx - lx) * 0.15, t);
//         ctx.globalAlpha = 0.68 - j * 0.1;
//         ctx.beginPath(); ctx.moveTo(llx, topY + h * t); ctx.lineTo(rrx, topY + h * t); ctx.stroke();
//     }
//     ctx.globalAlpha = 1;
// }

// Hoop (Ring) dore che
function drawHoopFront(ctx, hoop, hoopImg = null) {
    if (!hoopImg) return;
    const { x, y, width, gap, wobble = 0 } = hoop;
    const bodyW = (gap / 2 + 10); // Ring thodi motti dekhay te mateg

    // Check kare che ke special skin vali hoop che ke nahi
    const isSpecial = hoopImg.width >= 450;

    // Dimensions set kare che upar niche na parts mateg
    const bodyH = isSpecial ? (gap * 0.45) : (16 + wobble);
    const drawH = isSpecial ? (gap * 1.7) : (bodyH * 3.5);

    ctx.save();
    ctx.translate(0, wobble * 2);
    // Hoop ni image draw kare che
    // Hoop ni Height ne vadhare sakay
    ctx.drawImage(hoopImg, x + width / 2 - bodyW, y - bodyH, bodyW * 2, drawH * 0.5);
    ctx.restore();
}

// function drawBall(ctx, x, y, rot, skin, ts = performance.now()) {
//     const r = BALL_RADIUS;
//     const color = skin.color;
//     const lc = skin.lineColor;
//     const flap = Math.sin(ts * 0.012) * 0.45;

//     ctx.save();
//     ctx.translate(x, y);
//     ctx.rotate(rot);

//     // Helper: Draw Wing Shape
//     const wingPath = (side) => {
//         ctx.save();
//         ctx.translate(side * r * 0.45, -r * 0.3);
//         ctx.rotate(flap * side - 0.1 * side);
//         ctx.scale(side, 1);
//         ctx.beginPath();
//         ctx.moveTo(0, 0);
//         ctx.bezierCurveTo(r * 0.2, -r * 1.5, r * 2.2, -r * 1.3, r * 1.8, 0);
//         ctx.bezierCurveTo(r * 1.6, r * 0.9, r * 0.5, r * 1.2, 0, 0);
//         ctx.closePath();
//         ctx.restore();
//     };

//     // 1. UNIFIED BORDER (Back Side)
//     // We draw a thick black silhouette of the whole character first
//     ctx.strokeStyle = lc;
//     ctx.lineWidth = 10; // Thick "pachad" border
//     ctx.lineJoin = 'round';

//     // Silhouette of wings
//     wingPath(1); ctx.stroke();
//     wingPath(-1); ctx.stroke();
//     // Silhouette of ball
//     ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

//     // 2. FILL COLORED PARTS
//     // Wings Fill
//     ctx.fillStyle = '#ffffff';
//     wingPath(1); ctx.fill();
//     wingPath(-1); ctx.fill();

//     // Ball Body Fill
//     ctx.fillStyle = color;
//     ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

//     // 3. INTERNAL DETAILS (Seams & Face)
//     // Crosshair Seams
//     ctx.strokeStyle = lc;
//     ctx.lineWidth = 3.5;
//     // ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
//     // ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
//     ctx.beginPath(); ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2); ctx.stroke();

//     // Character Face (PROPERLY SHOWN)
//     // Large Expressive Eyes
//     ctx.fillStyle = lc;
//     ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
//     ctx.beginPath(); ctx.arc(r * 0.22, -r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
//     // Bright Sparkles
//     ctx.fillStyle = '#ffffff';
//     ctx.beginPath(); ctx.arc(-r * 0.26, -r * 0.19, r * 0.05, 0, Math.PI * 2); ctx.fill();
//     ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.19, r * 0.05, 0, Math.PI * 2); ctx.fill();
//     // Bold Smile
//     ctx.strokeStyle = lc;
//     ctx.lineWidth = 4;
//     ctx.lineCap = 'round';
//     ctx.beginPath();
//     ctx.arc(0, r * 0.08, r * 0.25, 0.4, Math.PI - 0.4);
//     ctx.stroke();

//     // Polished Shine
//     const bg = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
//     bg.addColorStop(0, 'rgba(255,255,255,0.25)');
//     bg.addColorStop(1, 'rgba(255,255,255,0)');
//     ctx.fillStyle = bg;
//     ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

//     ctx.restore();
// }

// --- Inside your loop (around line 853 and 863) ---
// I've updated the call to include your 'ballImg' asset:

// --- Updated drawBall function ---



// function drawBall(ctx, x, y, rot, skin, ts = performance.now()) {
//     const r = BALL_RADIUS;
//     const color = skin.color;
//     const lc = skin.lineColor;
//     const flap = Math.sin(ts * 0.012) * 0.45;

//     ctx.save();
//     ctx.translate(x, y);
//     ctx.rotate(rot);

//     // 1. SILHOUETTE (Back Border)
//     const wingPath = (side) => {
//         ctx.save();
//         ctx.translate(side * r * 0.45, -r * 0.35);
//         ctx.rotate(flap * side - 0.1 * side);
//         ctx.scale(side, 1);
//         ctx.beginPath();
//         ctx.moveTo(0, 0);
//         ctx.bezierCurveTo(r * 0.2, -r * 1.5, r * 2.2, -r * 1.3, r * 1.8, 0);
//         ctx.bezierCurveTo(r * 1.6, r * 0.9, r * 0.5, r * 1.2, 0, 0);
//         ctx.closePath();
//         ctx.restore();
//     };

//     ctx.strokeStyle = lc;
//     ctx.lineWidth = 9;
//     wingPath(1); ctx.stroke();
//     wingPath(-1); ctx.stroke();
//     ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();

//     // 2. WINGS FILL (with PNG-style feather detail)
//     const drawRichWing = (side) => {
//         ctx.save();
//         ctx.translate(side * r * 0.45, -r * 0.35);
//         ctx.rotate(flap * side - 0.1 * side);
//         ctx.scale(side, 1);

//         ctx.fillStyle = '#ffffff';
//         ctx.beginPath();
//         ctx.moveTo(0, 0);
//         ctx.bezierCurveTo(r * 0.2, -r * 1.5, r * 2.2, -r * 1.3, r * 1.8, 0);
//         ctx.bezierCurveTo(r * 1.6, r * 0.9, r * 0.5, r * 1.2, 0, 0);
//         ctx.closePath();
//         ctx.fill();

//         // Feather texture
//         ctx.strokeStyle = 'rgba(0,0,0,0.06)';
//         ctx.lineWidth = 1.5;
//         ctx.beginPath();
//         ctx.moveTo(r * 0.5, -r * 0.4); ctx.lineTo(r * 1.2, -r * 0.6);
//         ctx.moveTo(r * 0.6, -r * 0.1); ctx.lineTo(r * 1.3, -r * 0.2);
//         ctx.stroke();
//         ctx.restore();
//     }
//     drawRichWing(1);
//     drawRichWing(-1);

//     // 3. BODY FILL (3D PNG Gradient)
//     const bodyGrad = ctx.createRadialGradient(-r * 0.4, -r * 0.4, r * 0.1, 0, 0, r);
//     bodyGrad.addColorStop(0, '#ffffff55'); // Highlight
//     bodyGrad.addColorStop(0.3, color);      // Main Color
//     bodyGrad.addColorStop(1, 'rgba(0,0,0,0.2)'); // Shadow

//     ctx.fillStyle = bodyGrad;
//     ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

//     // 4. FACE & INTERNAL DETAILS
//     // Decorative inner ring
//     ctx.strokeStyle = lc;
//     ctx.lineWidth = 3.5;
//     ctx.beginPath(); ctx.arc(0, 0, r * 0.72, 0, Math.PI * 2); ctx.stroke();

//     // Face
//     ctx.fillStyle = lc;
//     ctx.beginPath(); ctx.arc(-r * 0.22, -r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();
//     ctx.beginPath(); ctx.arc(r * 0.22, -r * 0.15, r * 0.18, 0, Math.PI * 2); ctx.fill();

//     ctx.fillStyle = '#ffffff'; // Sparkles
//     ctx.beginPath(); ctx.arc(-r * 0.26, -r * 0.19, r * 0.05, 0, Math.PI * 2); ctx.fill();
//     ctx.beginPath(); ctx.arc(r * 0.18, -r * 0.19, r * 0.05, 0, Math.PI * 2); ctx.fill();

//     ctx.strokeStyle = lc; // Smile
//     ctx.lineWidth = 4;
//     ctx.lineCap = 'round';
//     ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.25, 0.4, Math.PI - 0.4); ctx.stroke();

//     ctx.restore();
// }

function drawParticles(ctx, particles) {
    particles.forEach(p => {
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1;
}

// =====================================================
// REACT UI COMPONENTS
// =====================================================

function SkinItem({ skin, selected, unlocked, onSelect, tintedBall }) {
    const bg = {
        classic: 'linear-gradient(135deg,#ff6b35,#cc3300)',
        blue: 'linear-gradient(135deg,#3498db,#1a5276)',
        green: 'linear-gradient(135deg,#2ecc71,#1a6b3a)',
        gold: 'linear-gradient(135deg,#ffd700,#996600)',
        purple: 'linear-gradient(135deg,#9b59b6,#4a235a)',
        fire: 'linear-gradient(135deg,#ff1744,#880000)',
        heart: 'linear-gradient(135deg,#ff4b4b,#660d0f)',
    };

    const canvasRef = useRef(null);
    useEffect(() => {
        if (tintedBall && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, 64, 64);
            ctx.drawImage(tintedBall, 0, 0, 64, 64);
        }
    }, [tintedBall]);

    return (
        <div
            className={`skin-item ${selected ? 'selected' : ''} ${!unlocked ? 'locked' : ''}`}
            style={{ background: bg[skin.id] || '#444' }}
            onClick={() => unlocked && onSelect(skin.id)}
            title={unlocked ? skin.label : `Unlock at score ${skin.unlockScore}`}
        >
            <div className="skin-preview">
                {unlocked && tintedBall ? (
                    <canvas ref={canvasRef} width={64} height={64} style={{ width: '100%', height: '100%' }} />
                ) : (
                    <span style={{ fontSize: '1.35rem', lineHeight: 1 }}>{unlocked ? skin.emoji : '🔒'}</span>
                )}
            </div>
            {!unlocked && (
                <>
                    <span className="lock-icon">🔒</span>
                    <span className="unlock-score">{skin.desc}</span>
                </>
            )}
        </div>
    );
}

function StartScreen({ bestScore, selectedSkin, onSkinSelect, onStart, tintedBalls, onSettings, onLevels }) {
    const [showSkins, setShowSkins] = useState(false);

    // Get the tinted canvas for the logo
    const canvasRef = useRef(null);
    useEffect(() => {
        if (tintedBalls[selectedSkin] && canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, 180, 180);
            ctx.drawImage(tintedBalls[selectedSkin], 0, 0, 180, 180);
        }
    }, [tintedBalls, selectedSkin]);

    const [activeCategory, setActiveCategory] = useState(() => {
        const currentSkin = BALL_SKINS.find(s => s.id === selectedSkin);
        const cat = SKIN_CATEGORIES.find(c => c.variants.includes(currentSkin?.id));
        return cat ? cat.id : null;
    });

    const handleCategoryClick = (cat) => {
        if (cat.variants.length === 0) {
            onSkinSelect(cat.id);
            setActiveCategory(null);
        } else {
            setActiveCategory(prev => prev === cat.id ? null : cat.id);
        }
    };

    return (
        <div className="start-screen">
            <StarsBg />

            <div className="top-corner-actions">
                <button className="settings-entry-btn" onClick={onSettings}>⚙️</button>
            </div>

            <div className="glass-hub">
                <div className="game-logo" style={{ animation: 'logoFloat 4s ease-in-out infinite', display: showSkins ? 'none' : 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="logo-basketball">
                        {tintedBalls[selectedSkin] ? (
                            <canvas ref={canvasRef} width={180} height={180} style={{ width: '180px', height: 'auto', maxWidth: '45vw', paddingTop: 0 }} />
                        ) : (
                            <img src={ballAsset} alt="" style={{ height: "auto", width: "180px", maxWidth: "45vw", marginBottom: 0, paddingTop: 0 }} />
                        )}
                    </div>
                </div>

                <div className="hub-header">
                    <div className="logo-title">FLAPPY DUNK</div>
                    <div className="logo-subtitle">Basketball Edition</div>

                    {bestScore > 0 && (
                        <div className="hub-best-score">
                            <div className="hub-score-val">{bestScore} - BEST SCORE</div>
                        </div>
                    )}
                </div>

                <div className="start-actions" style={{ margin: 0 }}>
                    <button className="start-btn btn-endless" onClick={() => onStart(null)}>
                        <div className="btn-icon-box">🏀</div>
                        <div className="btn-content">
                            <span className="btn-title">ENDLESS MODE</span>
                            <span className="btn-desc">Infinite High Scores</span>
                        </div>
                    </button>

                    <button className="start-btn btn-levels" onClick={onLevels}>
                        <div className="btn-icon-box">🏆</div>
                        <div className="btn-content">
                            <span className="btn-title">LEVELS MODE</span>
                            <span className="btn-desc">{LEVELS.length} Stage Challenges</span>
                        </div>
                    </button>

                    <button className="shop-toggle-btn" onClick={() => setShowSkins(v => !v)}>
                        🎨 {showSkins ? 'Hide Skins' : 'Choose Skins'}
                    </button>
                </div>
                <div className="tap-hint" style={{ display: showSkins ? 'none' : 'flex' }}>CLICK • TAP • SPACEBAR</div>
                {showSkins && (
                    <div className="skin-selector" style={{ position: 'relative', zIndex: 1 }}>
                        <div className="skin-selector-title">
                            {activeCategory ? (
                                <div className="category-back-header">
                                    <button className="cat-back-btn" onClick={() => setActiveCategory(null)}>←</button>
                                    <span>{SKIN_CATEGORIES.find(c => c.id === activeCategory)?.label} Variants</span>
                                </div>
                            ) : (
                                "🎯 Choose Category"
                            )}
                        </div>
                        <div className="skin-grid">
                            {!activeCategory ? (
                                SKIN_CATEGORIES.map(cat => {
                                    const isCatUnlocked = bestScore >= (cat.unlockScore || 0);
                                    return (
                                        <div
                                            key={cat.id}
                                            className={`skin-item category-item ${activeCategory === cat.id ? 'active' : ''} ${!isCatUnlocked ? 'locked' : ''}`}
                                            onClick={() => isCatUnlocked && handleCategoryClick(cat)}
                                        >
                                            <div className="skin-preview">
                                                <span style={{ fontSize: '1.5rem' }}>{isCatUnlocked ? cat.emoji : '🔒'}</span>
                                            </div>
                                            <div className="skin-label-mini">{isCatUnlocked ? cat.label : `Score ${cat.unlockScore}`}</div>
                                            {isCatUnlocked && cat.variants.length > 0 && <div className="variants-badge">{isCatUnlocked ? cat.variants.length : 0}</div>}
                                        </div>
                                    );
                                })
                            ) : (
                                SKIN_CATEGORIES.find(c => c.id === activeCategory)?.variants.map(varId => {
                                    const sk = BALL_SKINS.find(s => s.id === varId);
                                    if (!sk) return null;
                                    return (
                                        <SkinItem
                                            key={sk.id}
                                            skin={sk}
                                            selected={selectedSkin === sk.id}
                                            unlocked={bestScore >= sk.unlockScore}
                                            onSelect={onSkinSelect}
                                            tintedBall={tintedBalls[sk.id]}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </div>
                )}
                <div className="how-to-play">
                    {[
                        { icon: '👆', label: 'Tap to Flap' },
                        { icon: '🏀', label: 'Through Hoop' },
                        { icon: '⭐', label: 'Swish +3' },
                        { icon: '🔥', label: 'Build streak' },
                    ].map(h => (
                        <div key={h.label} className="how-item">
                            <span className="how-icon">{h.icon}</span>
                            <span className="how-text">{h.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function GameOverScreen({ score, bestScore, isNewBest, streak, onRestart, onHome }) {
    const starsCount = score >= 50 ? 3 : score >= 20 ? 2 : score >= 5 ? 1 : 0;
    return (
        <div className="gameover-screen">
            <div className="gameover-header">
                {isNewBest ? (
                    <div className="new-best-crown">👑</div>
                ) : (
                    <div className="gameover-icon">🏀</div>
                )}
                <div className="gameover-title">{isNewBest ? 'NEW RECORD' : 'GAME OVER'}</div>
            </div>

            {/* <div className={`stars-display stars-${starsCount}`}>
                {[0, 1, 2].map(i => (
                    <div key={i} className={`star-slot ${i < starsCount ? 'filled' : ''}`}>
                        <div className="star-shape">⭐</div>
                        {i < starsCount && <div className="star-flare" />}
                    </div>
                ))}
            </div> */}

            <div className="bento-results">
                <div className="bento-item main-card">
                    <div className="bento-label">TOTAL SCORE</div>
                    <div className={`bento-value large ${isNewBest ? 'is-best' : ''}`}>
                        {score}
                    </div>
                </div>
                <div className="result-row">
                    <div className="bento-item mini-card">
                        <div className="bento-label">BEST</div>
                        <div className="bento-value">{bestScore}</div>
                    </div>
                    <div className="bento-item mini-card highlight">
                        <div className="bento-label">MAX STREAK</div>
                        <div className="bento-value">🔥 {streak}</div>
                    </div>
                </div>
            </div>

            <div className="action-btns">
                <button className="btn-play-again" onClick={onRestart}>
                    <span className="btn-shine" />
                    <span className="btn-label">TRY AGAIN</span>
                </button>
                <button className="btn-home-outline" onClick={onHome}>
                    EXIT TO MENU
                </button>
            </div>
        </div>
    );
}

function PauseScreen({ onResume, onQuit, onSettings }) {
    return (
        <div className="pause-screen">
            <div className="pause-card">
                <div className="pause-title-area">
                    <span className="pause-icon-big">⏸</span>
                    <h2>PAUSED</h2>
                </div>

                <div className="pause-btn-list">
                    <button className="pause-btn-resume" onClick={onResume}>
                        <span>▶</span> RESUME GAME
                    </button>

                    <button className="pause-btn-secondary" onClick={onSettings}>
                        <span>⚙️</span> SETTINGS
                    </button>

                    <button className="pause-btn-quit" onClick={onQuit}>
                        QUIT TO MENU
                    </button>
                </div>
            </div>
        </div>
    );
}

function SettingsOverlay({ settings, onToggle, onClose }) {
    return (
        <div className="settings-overlay" onClick={onClose}>
            <div className="settings-card" onClick={e => e.stopPropagation()}>
                <div className="settings-header">
                    <h3>GAME SETTINGS</h3>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="settings-list">
                    <div className="setting-item">
                        <span>🎵 Music</span>
                        <button className={`toggle-btn ${settings.music ? 'on' : ''}`} onClick={() => onToggle('music')}>
                            {settings.music ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div className="setting-item">
                        <span>🔊 Sound Effects</span>
                        <button className={`toggle-btn ${settings.sfx ? 'on' : ''}`} onClick={() => onToggle('sfx')}>
                            {settings.sfx ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div className="setting-item">
                        <span>📳 Haptic Feedback</span>
                        <button className={`toggle-btn ${settings.haptic ? 'on' : ''}`} onClick={() => onToggle('haptic')}>
                            {settings.haptic ? 'ON' : 'OFF'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// =====================================================
// MAIN GAME COMPONENT
// =====================================================
function FlappyDunk() {
    const canvasRef = useRef(null);

    // Step 1 Add Svg Logo Design
    // Asset Loading
    const ballImg = useMemo(() => {
        const img = new Image();
        img.src = ballAsset2;
        return img;
    }, []);

    const heartImg = useMemo(() => {
        const img = new Image();
        img.src = heartAsset;
        return img;
    }, []);

    const kiteImg = useMemo(() => {
        const img = new Image();
        img.src = kiteAsset;
        return img;
    }, []);

    const hoopImg = useMemo(() => {
        const img = new Image();
        img.src = hoopAsset;
        return img;
    }, []);

    const heartHoopImg = useMemo(() => {
        const img = new Image();
        img.src = heartHoopAsset;
        return img;
    }, []);

    const kiteHoopImg = useMemo(() => {
        const img = new Image();
        img.src = kiteHoopAsset;
        return img;
    }, []);
    // kitty icon and hoop images add

    const kittyImg = useMemo(() => {
        const img = new Image();
        img.src = kittyAsset;
        return img;
    }, []);

    const kittyHoopImg = useMemo(() => {
        const img = new Image();
        img.src = kittyHoopAsset;
        return img;
    }, []);

    const stateRef = useRef(null);
    const rafRef = useRef(null);
    const lastTRef = useRef(0);
    const hoopTimerRef = useRef(0);
    const skinRef = useRef('classic');

    const [screen, setScreen] = useState('start'); // 'start', 'playing', 'paused', 'gameover', 'countdown', 'levels', 'levelcomplete'
    const screenRef = useRef(screen);
    useEffect(() => { screenRef.current = screen; }, [screen]);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestScore, setBestScore] = useState(() => +localStorage.getItem('flappyDunk_best') || 0);
    const [bestStreak, setBestStreak] = useState(0);
    const [isNewBest, setIsNewBest] = useState(false);
    const [selectedSkin, setSelectedSkin] = useState(() => localStorage.getItem('flappyDunk_skin') || 'classic');
    const [unlockedLevels, setUnlockedLevels] = useState(() => +(localStorage.getItem('flappyDunk_unlocked') || 1));
    const [currentLevelId, setCurrentLevelId] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('flappyDunk_settings');
        return saved ? JSON.parse(saved) : { music: true, sfx: true, haptic: true };
    });
    const [showSettings, setShowSettings] = useState(false);
    const hapticRef = useRef(settings.haptic);
    useEffect(() => { hapticRef.current = settings.haptic; }, [settings.haptic]);

    const [showSwish, setShowSwish] = useState(false);
    const [swishKey, setSwishKey] = useState(0);
    const [comboInfo, setComboInfo] = useState(null);
    const [levelInfo, setLevelInfo] = useState(null);
    const [level, setLevel] = useState(1);
    const [flashType, setFlashType] = useState(null);
    const [shaking, setShaking] = useState(false);
    const [tintedBalls, setTintedBalls] = useState({});
    const [tintedHoops, setTintedHoops] = useState({});

    const toggleSetting = (key) => {
        setSettings(prev => {
            const n = { ...prev, [key]: !prev[key] };
            localStorage.setItem('flappyDunk_settings', JSON.stringify(n));
            return n;
        });
    };

    const vibrate = useCallback((ms = 10) => {
        if (hapticRef.current && navigator.vibrate) navigator.vibrate(ms);
    }, []);

    // Asset Tinting & Pre-rendering Logic
    useEffect(() => {
        // Step_2
        const createTints = () => {
            if (!ballImg.complete || !heartImg.complete || !kiteImg.complete || !kittyImg.complete || !hoopImg.complete || !heartHoopImg.complete || !kiteHoopImg.complete || !kittyHoopImg.complete) return;

            // Pre-process Balls
            const ballTints = {};
            BALL_SKINS.forEach(skin => {
                const off = document.createElement('canvas');
                const sz = BALL_RADIUS * 4;
                off.width = sz; off.height = sz;
                const octx = off.getContext('2d');

                if (skin.isCustom && skin.id === 'heart') {
                    octx.drawImage(heartImg, 0, 0, sz, sz);
                } else if (skin.id === 'kite') {
                    octx.drawImage(kiteImg, 0, 0, sz, sz);
                } else if (skin.id === 'kitty') {
                    octx.drawImage(kittyImg, 0, 0, sz, sz);
                } else {
                    octx.drawImage(ballImg, 0, 0, sz, sz);
                    octx.globalCompositeOperation = 'source-in';
                    octx.fillStyle = skin.color;
                    octx.fillRect(0, 0, sz, sz);
                    octx.globalCompositeOperation = 'multiply';
                    octx.drawImage(ballImg, 0, 0, sz, sz);
                    octx.globalCompositeOperation = 'destination-over';
                    octx.drawImage(ballImg, 0, 0, sz, sz);
                }
                ballTints[skin.id] = off;
            });
            setTintedBalls(ballTints);

            // hoop images Step_3
            // Pre-process Hoops
            // Hoop skins pre-render kare che resolution sudharva mate
            const hoopTints = {};
            const makeCanvas = (img, w = 380, h = 380) => {
                const c = document.createElement('canvas');
                c.width = w; c.height = h;
                c.getContext('2d').drawImage(img, 0, 0, w, h);
                return c;
            };

            hoopTints.classic = makeCanvas(hoopImg, 512, 512);
            hoopTints.heart = makeCanvas(heartHoopImg, 512, 512);
            hoopTints.kite = makeCanvas(kiteHoopImg, 512, 512);
            hoopTints.kitty = makeCanvas(kittyHoopImg, 512, 512);

            setTintedHoops(hoopTints);
        };
        const onLoaded = () => createTints();
        ballImg.onload = heartImg.onload = kiteImg.onload = kittyImg.onload = hoopImg.onload = heartHoopImg.onload = kiteHoopImg.onload = kittyHoopImg.onload = onLoaded;
        if ([ballImg, heartImg, kiteImg, kittyImg, hoopImg, heartHoopImg, kiteHoopImg, kittyHoopImg].every(i => i.complete)) createTints();
    }, [ballImg, heartImg, kiteImg, kittyImg, hoopImg, heartHoopImg, kiteHoopImg, kittyHoopImg]);

    // Keep skinRef in sync
    useEffect(() => { skinRef.current = selectedSkin; }, [selectedSkin]);

    // ---- Game state factory ----
    const makeState = useCallback((W, H, levelId = null) => {
        const ballX = W < 450 ? W * 0.32 : W * 0.25;
        const state = {
            ball: { x: ballX, y: H * 0.45, vy: 0, rot: 0, trail: [] },
            hoops: [],
            particles: [],
            stars: generateStars(W, H),
            score: 0,
            streak: 0,
            bestStreak: 0,
            level: 1,
            W, H,
            floorY: H - 60,
            dead: false,
            levelId, // tracking current level if any
        };

        if (levelId) {
            const lvl = LEVELS.find(l => l.id === levelId);
            state.levelTarget = lvl?.goal || 10;
        }
        return state;
    }, []);

    // ---- Hoop spawner ----
    const spawnHoop = (state) => {
        const minY = state.H * 0.10; // Maximized vertical range for premium feel
        const maxY = state.floorY - 90; // Plenty of room above floor

        // Progression: Hoops get slightly narrower as level increases
        const gapReduction = Math.min((state.level - 1) * 4.5, 35);
        const currentGap = Math.max(DEFAULT_GAP - gapReduction, MIN_GAP);

        state.hoops.push({
            x: state.W,
            y: minY + Math.random() * (maxY - minY),
            width: HOOP_WIDTH,
            gap: currentGap,
            passed: false,
        });
    };

    // ---- Particle burst ----
    const burst = (state, x, y, swish) => {
        const cols = swish
            ? ['#ffd700', '#ffaa00', '#ff6b35', '#00d4ff', '#ffffff']
            : ['#ff6b35', '#ff8c42', '#ffd700', '#ffffff'];
        const n = swish ? 26 : 14;
        for (let i = 0; i < n; i++) {
            const a = (Math.PI * 2 * i / n) + Math.random() * 0.4;
            const sp = (Math.random() * 4.5 + 2) * (swish ? 1.6 : 1);
            state.particles.push({
                x, y,
                vx: Math.cos(a) * sp,
                vy: Math.sin(a) * sp - 2.5,
                size: Math.random() * 4.5 + 2,
                color: cols[i % cols.length],
                alpha: 1,
            });
        }
    };

    // ---- Game Over handler ----
    const doGameOver = useCallback((state) => {
        state.dead = true;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

        setShaking(true);
        setTimeout(() => setShaking(false), 500);
        setFlashType('flash-gameover');
        setTimeout(() => setFlashType(null), 400);

        setBestStreak(state.bestStreak);

        const prev = +localStorage.getItem('flappyDunk_best') || 0;
        if (!state.levelId && state.score > prev) {
            localStorage.setItem('flappyDunk_best', String(state.score));
            setBestScore(state.score);
            setIsNewBest(true);
        } else {
            setIsNewBest(false);
        }

        setTimeout(() => setScreen('gameover'), 550);
    }, []);

    const doLevelComplete = useCallback((state) => {
        state.dead = true;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

        vibrate(200);
        setFlashType('flash-swish');
        setTimeout(() => setFlashType(null), 1000);

        const nextLvl = state.levelId + 1;
        if (nextLvl > unlockedLevels) {
            setUnlockedLevels(nextLvl);
            localStorage.setItem('flappyDunk_unlocked', String(nextLvl));
        }

        setTimeout(() => setScreen('levelcomplete'), 800);
    }, [unlockedLevels, vibrate]);

    // ---- Main loop ----
    const loop = useCallback((ts) => {
        // Only run loop if playing or in countdown (for drawing)
        if (screenRef.current !== 'playing' && screenRef.current !== 'countdown') return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const state = stateRef.current;
        if (!state || state.dead) return;

        const ctx = canvas.getContext('2d');
        const dt = screenRef.current === 'playing'
            ? Math.min((ts - lastTRef.current) / 16.667, 3)
            : 0; // No movement during countdown

        if (screenRef.current === 'playing') lastTRef.current = ts;

        const { ball, W, H, floorY } = state;

        // Progression: Speed increases slightly per score & level
        const levelBonus = (state.level - 1) * 0.08;
        const speed = BASE_SPEED * (getSpeedMult(state.score) + levelBonus);

        // Physics rules: Ball upar niche jay che gravity pramane
        ball.vy += GRAVITY * dt;
        ball.vy = Math.max(Math.min(ball.vy, 14), -18); // Speed cap
        ball.y += ball.vy * dt;

        // X-Stabilization: Pull ball back to its home X after any bounces
        const targetX = W < 450 ? W * 0.32 : W * 0.25;
        if (Math.abs(ball.x - targetX) > 0.1) {
            ball.x = lerp(ball.x, targetX, 0.08 * dt);
        }
        // Tilting rather than spinning for a "stable" ball feel
        const targetRot = ball.vy * 0.05;
        ball.rot = lerp(ball.rot, targetRot, 0.15 * dt);

        // Trail
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > TRAIL_LEN) ball.trail.shift();

        // Move hoops
        state.hoops.forEach(h => { h.x -= speed * dt; });
        state.hoops = state.hoops.filter(h => h.x > -HOOP_WIDTH - 20);

        // Spawn timer
        hoopTimerRef.current += dt * 16.667;
        const spawnInterval = Math.max(2200 - state.score * 14, 1100);
        if (hoopTimerRef.current >= spawnInterval) {
            spawnHoop(state);
            hoopTimerRef.current = 0;
        }

        // ---- Hoop logic ----
        state.hoops.forEach(hoop => {
            const hoopMidX = hoop.x + hoop.width / 2;
            const rimY = hoop.y;
            const rimThick = 12; // Drawing thickness
            const rimCenterOffset = hoop.gap / 2 + 6; // Drawing offset
            const rimLeft = hoopMidX - rimCenterOffset;
            const rimRight = hoopMidX + rimCenterOffset;

            if (!hoop.passed) {
                // Ball crossed the horizontal plane of the rim this frame (or slightly before)
                const lastY = ball.y - ball.vy * dt;
                const hitPlane = (lastY <= rimY && ball.y >= rimY);
                const hitBoxX = ball.x > rimLeft + (rimThick / 2) && ball.x < rimRight - (rimThick / 2);

                if (hitPlane && hitBoxX && ball.vy > 0) {
                    hoop.passed = true;
                    const isSwish = Math.abs(ball.x - hoopMidX) < (hoop.gap / 2) * 0.55;
                    const pts = 1;

                    state.score += pts;
                    state.streak += 1;
                    hoop.wobble = 6; // Score wobble
                    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

                    vibrate(pts > 1 ? 55 : 25);
                    burst(state, ball.x, ball.y, isSwish);

                    setScore(state.score);
                    setStreak(state.streak);

                    setFlashType(isSwish ? 'flash-swish' : 'flash-score');
                    setTimeout(() => setFlashType(null), 300);

                    if (isSwish) {
                        setShaking(true);
                        setTimeout(() => setShaking(false), 250);
                        setSwishKey(k => k + 1);
                        setShowSwish(true);
                        setTimeout(() => setShowSwish(false), 1400);
                    }

                    if (state.streak > 1) {
                        setComboInfo({ text: `🔥 ${state.streak}x COMBO!`, k: ts });
                        setTimeout(() => setComboInfo(null), 1000);
                    }

                    // Level Mode: check for goal completion
                    if (state.levelId && state.score >= state.levelTarget) {
                        doLevelComplete(state);
                        return;
                    }

                    // Level Up Logic (Progressive difficulty) - Only notify in Level Mode
                    const nextLevel = Math.floor(state.score / 15) + 1;
                    if (nextLevel > state.level) {
                        state.level = nextLevel;
                        vibrate(100);
                        if (state.levelId) {
                            setLevel(nextLevel);
                            setLevelInfo({ text: `⚡ LEVEL ${nextLevel} 🚀`, k: ts });
                            setTimeout(() => setLevelInfo(null), 2400);
                        }
                    }
                }
            }

            // Rim collision (Improved - Bounces from any angle)
            const rimCenterY = rimY; // Ring is at Y
            const combinedRadius = BALL_PHYSICS_RADIUS + rimThick * 0.4; // Slightly more forgiving

            const checkRim = (rx) => {
                const dx = ball.x - rx;
                const dy = ball.y - rimCenterY;
                const dist = Math.hypot(dx, dy);
                if (dist < combinedRadius) {
                    const ny = dy / dist;
                    const nx = dx / dist;

                    // Bounce based on where we hit the rim circle
                    ball.vy = ny * (Math.abs(ball.vy) * 0.4 + 4);
                    ball.vx = nx * 3; // Push ball out horizontally too
                    // Move ball out of collision slightly to avoid sticking
                    ball.y = rimCenterY + ny * combinedRadius;
                    ball.x = rx + nx * combinedRadius;

                    hoop.wobble = 5; // Collision wobble
                    if (state.streak > 0) { state.streak = 0; setStreak(0); }
                    return true;
                }
                return false;
            };

            hoop.wobble = (hoop.wobble || 0) * 0.9; // Decay wobble
            checkRim(rimLeft) || checkRim(rimRight);
        });

        // ---- Particles ----
        state.particles = state.particles.filter(p => p.alpha > 0.02);
        state.particles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 0.18 * dt;
            p.alpha -= 0.033 * dt;
            p.size *= 0.972;
        });

        // ---- Boundaries ----
        if (ball.y + BALL_PHYSICS_RADIUS >= floorY) {
            ball.y = floorY - BALL_PHYSICS_RADIUS;
            vibrate(150);
            doGameOver(state);
            return;
        }
        if (ball.y - BALL_PHYSICS_RADIUS <= 0) {
            ball.vy = Math.abs(ball.vy) * 0.6;
            ball.y = BALL_PHYSICS_RADIUS + 1;
        }

        // ---- Draw ----
        drawBackground(ctx, W, H);
        drawStars(ctx, state.stars, ts);

        const currentSkinId = skinRef.current;
        const skin = BALL_SKINS.find(s => s.id === currentSkinId) || BALL_SKINS[0];
        const tintedImg = tintedBalls[currentSkinId];
        // Step_1
        // OPTIMIZATION: Use pre-rendered hoop canvas
        let hImg = tintedHoops.classic;
        // Setp_4
        if (currentSkinId === 'heart' || currentSkinId === 'pink') hImg = tintedHoops.heart;
        if (currentSkinId === 'kite') hImg = tintedHoops.kite;
        if (currentSkinId === 'kitty') hImg = tintedHoops.kitty;

        drawTrail(ctx, ball.trail, skin.color);

        // Advanced depth sorting for passing through rings
        const ballMidX = ball.x;
        state.hoops.forEach(h => {
            const hMidX = h.x + h.width / 2;
            const isNear = Math.abs(ballMidX - hMidX) < h.width / 2 + 10;

            if (isNear) {
                // Ball is "inside" this hoop area
                drawBall(ctx, ball.x, ball.y, ball.rot, skin, ts, tintedImg, ball.vy);
                drawHoopFront(ctx, h, hImg);
            } else {
                drawHoopFront(ctx, h, hImg);
            }
        });

        // Ensure ball is always drawn at least once if no hoops are near
        const anyNear = state.hoops.some(h => Math.abs(ballMidX - (h.x + h.width / 2)) < h.width / 2 + 10);
        if (!anyNear) {
            drawBall(ctx, ball.x, ball.y, ball.rot, skin, ts, tintedImg, ball.vy);
        }

        drawParticles(ctx, state.particles);

        // Continue loop even during countdown to keep drawing
        rafRef.current = requestAnimationFrame(loop);
    }, [doGameOver, doLevelComplete, ballImg, hoopImg, tintedBalls, tintedHoops, vibrate]);

    // ---- Start / Restart ----
    const startGame = useCallback((levelId = null) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }

        const W = canvas.width, H = canvas.height;
        stateRef.current = makeState(W, H, levelId);
        hoopTimerRef.current = 2200; // spawn first hoop immediately

        setScore(0); setStreak(0); setBestStreak(0); setLevel(1);
        setCurrentLevelId(levelId);
        setShowSwish(false); setComboInfo(null); setLevelInfo(null);

        setScreen('countdown');
        setCountdown(3);
        screenRef.current = 'countdown';

        // Start drawing immediately
        lastTRef.current = performance.now();
        rafRef.current = requestAnimationFrame(loop);

        const itv = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) {
                    clearInterval(itv);
                    screenRef.current = 'playing';
                    setScreen('playing');
                    lastTRef.current = performance.now();
                    return null;
                }
                return c - 1;
            });
        }, 1000);
    }, [makeState, loop]);

    // ---- Navigation Handlers ----
    const handlePause = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        screenRef.current = 'paused';
        setScreen('paused');
    }, []);

    const handleQuit = useCallback(() => {
        if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
        stateRef.current = null;
        screenRef.current = 'start';
        setScreen('start');
        const c = canvasRef.current;
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    }, []);

    const handleResume = useCallback(() => {
        screenRef.current = 'playing';
        setScreen('playing');
        const s = stateRef.current;
        if (!s || s.dead) return;
        lastTRef.current = performance.now();
        rafRef.current = requestAnimationFrame(loop);
    }, [loop]);

    const handleNextLevel = useCallback(() => {
        if (currentLevelId < LEVELS.length) {
            startGame(currentLevelId + 1);
        } else {
            handleQuit();
        }
    }, [currentLevelId, startGame, handleQuit]);

    // ---- Flap ----
    const flap = useCallback(() => {
        const s = stateRef.current;
        if (!s || s.dead) return;

        // Dynamic jump height: increase strength as movement speed increases
        const speedMult = getSpeedMult(s.score);
        const levelBonus = (s.level - 1) * 0.08;
        const totalSpeedFactor = speedMult + levelBonus;

        // Scale flap power by speed factor (more subtle scaling for better control)
        const dynamicStrength = FLAP_STRENGTH * (1 + (totalSpeedFactor - 1) * 0.12);

        s.ball.vy = dynamicStrength;
        vibrate(10);
    }, []);

    const handleCanvasInteract = useCallback(() => {
        if (screen === 'playing') flap();
        else if (screen === 'start') startGame(null);
    }, [screen, flap, startGame]);

    // ---- Resize ----
    useEffect(() => {
        const resize = () => {
            const c = canvasRef.current;
            if (!c) return;
            c.width = window.innerWidth;
            c.height = window.innerHeight;
            const s = stateRef.current;
            if (s) {
                s.W = c.width; s.H = c.height; s.floorY = c.height - 60;
                s.stars = generateStars(c.width, c.height);
            }
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, []);

    // ---- Keyboard ----
    useEffect(() => {
        const onKey = (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                if (screen === 'playing') flap();
                else if (screen === 'start' || screen === 'gameover') startGame();
                else if (screen === 'paused') handleResume();
            }
            if ((e.code === 'Escape' || e.code === 'KeyP') && screen === 'playing') handlePause();
            else if ((e.code === 'Escape' || e.code === 'KeyP') && screen === 'paused') handleResume();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [screen, flap, startGame]);

    // ---- Touch on canvas ----
    useEffect(() => {
        const c = canvasRef.current;
        if (!c) return;
        const onTouch = (e) => { e.preventDefault(); handleCanvasInteract(); };
        c.addEventListener('touchstart', onTouch, { passive: false });
        return () => c.removeEventListener('touchstart', onTouch);
    });


    const handleShare = useCallback(() => {
        const s = stateRef.current;
        const sc = s ? s.score : score;
        const txt = `🏀 I scored ${sc} in Flappy Dunk! Can you beat me? 🎯`;
        if (navigator.share) navigator.share({ title: 'Flappy Dunk', text: txt });
        else navigator.clipboard?.writeText(txt).then(() => alert('Copied! 🏀')).catch(() => alert(txt));
    }, [score]);

    const handleSkinSelect = useCallback((id) => {
        setSelectedSkin(id);
        skinRef.current = id;
        localStorage.setItem('flappyDunk_skin', id);
    }, []);

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    // =====================================================
    // RENDER
    // =====================================================
    return (
        <div className={`game-wrapper ${shaking ? 'shake' : ''}`}>
            <canvas
                ref={canvasRef}
                className="game-canvas"
                onClick={handleCanvasInteract}
            />

            {/* Flash */}
            {flashType && <div className={`flash-overlay ${flashType}`} key={flashType + Date.now()} />}

            {showSettings && (
                <SettingsOverlay
                    settings={settings}
                    onToggle={toggleSetting}
                    onClose={() => setShowSettings(false)}
                />
            )}

            <div className="ui-overlay">

                {/* ===== HUD (Visible in Play, Pause, LevelComplete, and GameOver) ===== */}
                {['playing', 'paused', 'gameover', 'levelcomplete'].includes(screen) && (
                    <div className="game-hud">
                        <div className="hud-left">
                            {screen === 'playing' ? (
                                <button className="push-btn-hud" onClick={(e) => { e.stopPropagation(); handlePause(); }}>
                                    <span className="push-btn-face">⏸</span>
                                </button>
                            ) : screen === 'paused' ? (
                                <div className="push-btn-hud disabled">
                                    <span className="push-btn-face" style={{ opacity: 0.5 }}>⏸</span>
                                </div>
                            ) : null}
                        </div>
                        <div className="score-display">
                            <div className="score-number" key={score}>{score}</div>
                            {currentLevelId !== null && screen !== 'gameover' && <div className="level-badge small">Area {currentLevelId}</div>}
                            {streak >= 2 && (
                                <div className="streak-badge">
                                    🔥 {streak}
                                </div>
                            )}
                        </div>
                        <div className="hud-right" />
                    </div>
                )}

                {/* Swish */}
                {showSwish && (
                    <div className="swish-text" key={`sw-${swishKey}`}>⭐ SWISH! +1</div>
                )}

                {/* Combo */}
                {comboInfo && (
                    <div className="combo-text" key={comboInfo.k} style={{ top: '36%' }}>
                        {comboInfo.text}
                    </div>
                )}

                {/* Level up */}
                {levelInfo && (
                    <div className="level-up-notif" key={levelInfo.k}>{levelInfo.text}</div>
                )}

                {/* Countdown */}
                {screen === 'countdown' && <CountdownOverlay count={countdown} />}

                {/* ===== START ===== */}
                {screen === 'start' && (
                    <StartScreen
                        bestScore={bestScore}
                        selectedSkin={selectedSkin}
                        onSkinSelect={handleSkinSelect}
                        onStart={() => startGame(null)}
                        tintedBalls={tintedBalls}
                        onSettings={() => setShowSettings(true)}
                        onLevels={() => setScreen('levels')}
                    />
                )}

                {/* ===== LEVELS ===== */}
                {screen === 'levels' && (
                    <LevelSelection
                        unlockedLevels={unlockedLevels}
                        onSelectLevel={(id) => startGame(id)}
                        onBack={() => setScreen('start')}
                    />
                )}

                {/* ===== LEVEL COMPLETE ===== */}
                {screen === 'levelcomplete' && (
                    <LevelCompleteScreen
                        levelId={currentLevelId}
                        score={score}
                        goal={LEVELS.find(l => l.id === currentLevelId)?.goal}
                        onNext={handleNextLevel}
                        onHome={handleQuit}
                    />
                )}

                {/* ===== GAME OVER ===== */}
                {screen === 'gameover' && (
                    <GameOverScreen
                        score={score}
                        bestScore={bestScore}
                        isNewBest={isNewBest}
                        streak={bestStreak}
                        onRestart={() => startGame(currentLevelId)}
                        onHome={handleQuit}
                    />
                )}

                {/* ===== PAUSE ===== */}
                {screen === 'paused' && (
                    <PauseScreen
                        onResume={handleResume}
                        onQuit={handleQuit}
                        onSettings={() => setShowSettings(true)}
                    />
                )}

            </div>

            {screen === 'playing' && (
                <div className="scroll-instruction">
                    CLICK / TAP to FLAP &nbsp;•&nbsp; SPACE &nbsp;•&nbsp; ESC = Pause
                </div>
            )}
        </div>
    );
}


export default FlappyDunk;