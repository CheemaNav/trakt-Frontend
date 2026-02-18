import React from 'react';
import './SkeletonLoader.css';

/* ── Primitives ── */

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
    return (
        <div
            className="skeleton skeleton-line"
            style={{ width, height, ...style }}
        />
    );
}

export function SkeletonCircle({ size = 36, style = {} }) {
    return (
        <div
            className="skeleton skeleton-circle"
            style={{ width: size, height: size, ...style }}
        />
    );
}

/* ── Dashboard Skeleton ── */

export function DashboardSkeleton() {
    return (
        <div className="skeleton-dashboard">
            {/* Metric Cards */}
            <div className="skeleton-metrics-grid">
                {Array.from({ length: 7 }).map((_, i) => (
                    <div className="skeleton-metric-card" key={i}>
                        <SkeletonLine width="60%" height={12} />
                        <SkeletonLine width="40%" height={28} />
                        <SkeletonLine width="75%" height={10} />
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="skeleton-charts-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div className="skeleton-chart-card" key={i}>
                        <div className="skeleton-chart-header">
                            <SkeletonLine width={120} height={16} style={{ marginBottom: 0 }} />
                            <div className="skeleton-chart-tabs">
                                <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                                <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                                <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                            </div>
                        </div>
                        <div className="skeleton-chart-body">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <div
                                    key={j}
                                    className="skeleton skeleton-chart-bar"
                                    style={{ height: `${30 + Math.random() * 60}%` }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Row */}
            <div className="skeleton-bottom-grid">
                <div className="skeleton-chart-card">
                    <div className="skeleton-chart-header">
                        <SkeletonLine width={120} height={16} style={{ marginBottom: 0 }} />
                        <div className="skeleton-chart-tabs">
                            <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                            <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                            <SkeletonLine width={50} height={24} style={{ marginBottom: 0 }} />
                        </div>
                    </div>
                    <div className="skeleton-chart-body">
                        {Array.from({ length: 8 }).map((_, j) => (
                            <div
                                key={j}
                                className="skeleton skeleton-chart-bar"
                                style={{ height: `${20 + Math.random() * 70}%` }}
                            />
                        ))}
                    </div>
                </div>
                <div className="skeleton-chart-card">
                    <div className="skeleton-chart-header">
                        <SkeletonLine width={120} height={16} style={{ marginBottom: 0 }} />
                    </div>
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                            <SkeletonCircle size={40} />
                            <div style={{ flex: 1 }}>
                                <SkeletonLine width="60%" height={14} />
                                <SkeletonLine width="40%" height={11} />
                            </div>
                            <SkeletonLine width={60} height={26} style={{ borderRadius: 12, marginBottom: 0 }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

/* ── Table Skeleton ── */

export function TableSkeleton({ rows = 6, columns = 6, showCheckbox = true, showAvatar = true }) {
    return (
        <div className="skeleton-table-container">
            {/* Header */}
            <div className="skeleton-table-header">
                {showCheckbox && (
                    <div className="skeleton-table-cell-narrow">
                        <SkeletonLine width={16} height={16} style={{ marginBottom: 0, borderRadius: 3 }} />
                    </div>
                )}
                {Array.from({ length: columns }).map((_, i) => (
                    <div className="skeleton-table-cell" key={i}>
                        <SkeletonLine width={`${50 + Math.random() * 40}%`} height={12} style={{ marginBottom: 0 }} />
                    </div>
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <div className="skeleton-table-row" key={rowIdx}>
                    {showCheckbox && (
                        <div className="skeleton-table-cell-narrow">
                            <SkeletonLine width={16} height={16} style={{ marginBottom: 0, borderRadius: 3 }} />
                        </div>
                    )}
                    {Array.from({ length: columns }).map((_, colIdx) => {
                        // First column gets avatar treatment
                        if (colIdx === 0 && showAvatar) {
                            return (
                                <div className="skeleton-table-cell-avatar" key={colIdx}>
                                    <SkeletonCircle size={32} />
                                    <div style={{ flex: 1 }}>
                                        <SkeletonLine width="70%" height={13} />
                                        <SkeletonLine width="45%" height={10} />
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <div className="skeleton-table-cell" key={colIdx}>
                                <SkeletonLine
                                    width={`${40 + Math.random() * 50}%`}
                                    height={13}
                                    style={{ marginBottom: 0 }}
                                />
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

/* ── Kanban / Pipeline Skeleton ── */

export function KanbanSkeleton({ columns = 4, cardsPerColumn = 3 }) {
    return (
        <div className="skeleton-kanban">
            {Array.from({ length: columns }).map((_, colIdx) => (
                <div className="skeleton-kanban-column" key={colIdx}>
                    <div className="skeleton-kanban-column-header">
                        <SkeletonLine width={100} height={16} style={{ marginBottom: 0 }} />
                        <SkeletonLine width={30} height={20} style={{ marginBottom: 0, borderRadius: 10 }} />
                    </div>
                    {Array.from({ length: cardsPerColumn }).map((_, cardIdx) => (
                        <div className="skeleton-kanban-card" key={cardIdx}>
                            <SkeletonLine width="70%" height={14} />
                            <SkeletonLine width="50%" height={12} />
                            <SkeletonLine width="35%" height={12} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── Reports Summary Skeleton ── */

export function SummaryCardsSkeleton({ count = 4 }) {
    return (
        <div className="skeleton-summary-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div className="skeleton-summary-card" key={i}>
                    <SkeletonLine width="60%" height={10} />
                    <SkeletonLine width="40%" height={28} />
                </div>
            ))}
        </div>
    );
}
