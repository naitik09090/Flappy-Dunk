import React, { useState, useMemo } from 'react';

export const LEVELS = Array.from({ length: 24 }, (_, i) => ({
    id: i + 1,
    goal: 5 + i * 3,
    speed: 1.0 + (i * 0.05),
    gap: Math.max(140 - i * 2, 95),
    title: `Area ${i + 1}`
}));

export const LEVELS_PER_PAGE = 8;

export function StarsBg() {
    const stars = useMemo(() => Array.from({ length: 55 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 72}%`,
        size: Math.random() * 2.2 + 0.6,
        delay: Math.random() * 3,
        dur: Math.random() * 2 + 1.8,
    })), []);
    return (
        <div className="stars-bg">
            {stars.map(s => (
                <div key={s.id} className="star-dot" style={{
                    left: s.left, top: s.top,
                    width: s.size, height: s.size,
                    animationDelay: `${s.delay}s`,
                    animationDuration: `${s.dur}s`,
                }} />
            ))}
        </div>
    );
}

export function LevelSelection({ unlockedLevels, onSelectLevel, onBack }) {
    const [page, setPage] = useState(0);
    const totalPages = Math.ceil(LEVELS.length / LEVELS_PER_PAGE);
    const currentLevels = LEVELS.slice(page * LEVELS_PER_PAGE, (page + 1) * LEVELS_PER_PAGE);

    return (
        <div className="level-selection">
            <StarsBg />
            <div className="level-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <div className="level-selection-title">CHOOSE LEVEL</div>
            </div>

            <div className="level-grid">
                {currentLevels.map(lvl => {
                    const isUnlocked = lvl.id <= unlockedLevels;
                    return (
                        <div
                            key={lvl.id}
                            className={`level-item ${!isUnlocked ? 'locked' : ''}`}
                            onClick={() => isUnlocked && onSelectLevel(lvl.id)}
                        >
                            <div className="level-num">{lvl.id}</div>
                            <div className="level-goal">Goal: {lvl.goal}</div>
                            {!isUnlocked && <div className="level-lock">🔒</div>}
                        </div>
                    );
                })}
            </div>

            <div className="pagination">
                <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Prev</button>
                <span className="page-info">Page {page + 1} / {totalPages}</span>
                <button disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
        </div>
    );
}

export function LevelCompleteScreen({ levelId, score, goal, onNext, onHome }) {
    return (
        <div className="level-complete-screen">
            <div className="victory-card">
                <div className="victory-title">LEVEL COMPLETE</div>
                <div className="victory-level-num">{levelId}</div>
                
                <div className="victory-stats-tray">
                    <div className="victory-stat-item">
                        <span className="vic-label">SCORE</span>
                        <span className="vic-value">{score}</span>
                    </div>
                    <div className="victory-stat-item">
                        <span className="vic-label">TARGET</span>
                        <span className="vic-value">{goal}</span>
                    </div>
                </div>

                <div className="victory-btns">
                    <button className="btn-next-hero" onClick={onNext}>
                        NEXT LEVEL ➔
                    </button>
                    <button className="btn-menu-flat" onClick={onHome}>
                        BACK TO MENU
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CountdownOverlay({ count }) {
    if (count === null) return null;
    return (
        <div className="countdown-overlay">
            <div className="countdown-content">
                <div className="countdown-glow" />
                <div className="countdown-number" key={count}>
                    {count > 0 ? count : 'GO!'}
                </div>
            </div>
        </div>
    );
}
