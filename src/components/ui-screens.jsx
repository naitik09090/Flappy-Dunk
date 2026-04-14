import React, { useState, useEffect, useRef } from 'react';
import { StarsBg, LEVELS } from './level-section';
import ballAsset from '../assets/Ball_Images/flappy_dunk_ball.webp';

export function SkinItem({ skin, selected, unlocked, onSelect, tintedBall }) {
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

export function StartScreen({ bestScore, selectedSkin, onSkinSelect, onStart, tintedBalls, onSettings, onLevels, BALL_SKINS, SKIN_CATEGORIES }) {
    const [showSkins, setShowSkins] = useState(false);

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

export function GameOverScreen({ score, bestScore, isNewBest, streak, onRestart, onHome }) {
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

export function PauseScreen({ onResume, onQuit, onSettings }) {
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

export function SettingsOverlay({ settings, onToggle, onClose }) {
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
