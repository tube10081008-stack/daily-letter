import React, { useEffect, useState, useMemo } from 'react';
import { useStorage, type Photo } from '../context/StorageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Film, Search, Share2, Coffee } from 'lucide-react';
import './Gallery.css';

interface GalleryProps {
    onClose: () => void;
}

// Circular Progress Component
const CircularProgress = ({ progress }: { progress: number }) => {
    const radius = 22;
    const stroke = 3;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="icon-wrapper">
            {/* Ring */}
            <svg
                height={radius * 2}
                width={radius * 2}
                className="progress-ring"
            >
                <circle
                    className="progress-ring-circle-bg"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    className="progress-ring-circle"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            {/* Icon Centered */}
            <Film size={16} color="#aaa" style={{ position: 'absolute' }} />
        </div>
    );
};

const PhotoItem = ({ photo }: { photo: Photo }) => {
    const isDeveloping = photo.status === 'developing';
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [progress, setProgress] = useState(0);
    const [isShaking, setIsShaking] = useState(false);
    const [imageUrl, setImageUrl] = useState<string>('');

    // Timer & Progress Logic (Real-time)
    useEffect(() => {
        if (!isDeveloping) return;

        const totalDuration = 3 * 24 * 60 * 60 * 1000; // 3 days in ms

        const tick = () => {
            const now = Date.now();
            const remaining = photo.developsAt - now;

            // Calculate progress (0 to 100)
            const elapsed = totalDuration - remaining;
            const pct = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
            setProgress(pct);

            if (remaining <= 0) {
                setTimeLeft('READY');
            } else {
                // Formatting: HH:MM:SS
                const totalSeconds = Math.floor(remaining / 1000);
                const days = Math.floor(totalSeconds / (3600 * 24));
                const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                if (days > 0) {
                    setTimeLeft(`${days}D ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                } else {
                    setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                }
            }
        };
        tick();
        const interval = setInterval(tick, 1000); // 1 sec update
        return () => clearInterval(interval);
    }, [photo.developsAt, isDeveloping]);

    // Blob URL Logic
    useEffect(() => {
        if (!isDeveloping) {
            const url = URL.createObjectURL(photo.blob);
            setImageUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [photo.blob, isDeveloping]);

    // Interaction Handlers
    const handleShake = () => {
        if (isDeveloping) {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            if (typeof navigator.vibrate === 'function') navigator.vibrate(50);
        }
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isDeveloping) return;

        // Web Share API
        if (navigator.share) {
            try {
                const file = new File([photo.blob], `analogy-${photo.id}.jpg`, { type: 'image/jpeg' });
                await navigator.share({
                    files: [file],
                    title: 'Analogy Camera Memory',
                    text: 'A moment captured with Analogy Camera.',
                });
            } catch (err) {
                console.warn('Share failed:', err);
            }
        } else {
            // Fallback: Download
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = `analogy-${photo.id}.jpg`;
            link.click();
        }
    };

    return (
        <div
            className={`photo-item ${isShaking ? 'shake' : ''}`}
            onClick={handleShake}
        >
            {isDeveloping ? (
                <div className="developing-placeholder">
                    {/* Circular Progress Ring */}
                    <CircularProgress progress={progress} />

                    <span className="status-text">{timeLeft}</span>
                </div>
            ) : (
                <>
                    <img
                        src={imageUrl}
                        alt="Memory"
                        className="photo-img"
                        loading="lazy"
                    />
                    <button className="share-btn-overlay" onClick={handleShare}>
                        <Share2 size={14} />
                    </button>
                </>
            )}
        </div>
    );
};

export const Gallery: React.FC<GalleryProps> = ({ onClose }) => {
    const { photos, refreshPhotos } = useStorage();
    const [showDonation, setShowDonation] = useState(false);

    useEffect(() => {
        refreshPhotos();
    }, [refreshPhotos]);

    // Grouping Logic
    const sections = useMemo(() => {
        const groups: Record<string, Photo[]> = {};

        photos.forEach(photo => {
            const date = new Date(photo.createdAt);
            const dateString = date.toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            }).toUpperCase(); // e.g. "FEB 08, 2026"

            if (!groups[dateString]) groups[dateString] = [];
            groups[dateString].push(photo);
        });

        // Sort dates descending
        return Object.entries(groups).sort((a, b) => {
            return new Date(b[0]).getTime() - new Date(a[0]).getTime();
        });
    }, [photos]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="gallery-container"
        >
            <header className="gallery-header">
                <button onClick={onClose} className="back-btn">
                    <ArrowLeft size={24} />
                </button>
                <h2>ARCHIVE</h2>
                <div style={{ width: 24 }}></div>
            </header>

            <div className="gallery-scroll-area">
                {sections.length === 0 ? (
                    <div className="empty-state">
                        <Search size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
                        <p>NO RECORDS FOUND</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>START CAPTURING MOMENTS</p>
                    </div>
                ) : (
                    sections.map(([date, groupPhotos]) => (
                        <div key={date} className="exhibition-frame">
                            {/* The Mat Board Grid */}
                            <div className="gallery-grid">
                                {groupPhotos.map(photo => (
                                    <PhotoItem key={photo.id} photo={photo} />
                                ))}
                            </div>

                            {/* Museum Label */}
                            <div className="museum-label">
                                <span className="label-date">{date}</span>
                                <span className="label-info">
                                    {groupPhotos.length} {groupPhotos.length === 1 ? 'MEMORY' : 'MEMORIES'} | ANALOGY CAMERA
                                </span>
                            </div>
                        </div>
                    ))
                )}

                {/* Footer / Attribution */}
                <footer className="gallery-footer">
                    <div className="attribution">Original Concept & Design by <strong>GartenHong</strong></div>
                    <button
                        className="donation-btn"
                        onClick={() => setShowDonation(true)}
                    >
                        <Coffee size={16} />
                        Buy me a film roll
                    </button>
                </footer>
            </div>

            {/* Donation Modal */}
            <AnimatePresence>
                {showDonation && (
                    <motion.div
                        className="donation-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowDonation(false)} // Close on background click
                    >
                        <motion.div
                            className="donation-modal"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()} // Prevent close on modal click
                        >
                            <h3>Small Gift</h3>
                            <p className="donation-message">
                                Analogy Camera를 사랑해주셔서 감사합니다.<br />
                                커피 한 잔 값의 후원은<br />
                                새로운 필름 개발에 큰 힘이 됩니다. 🎞️
                            </p>

                            <div className="qr-crop-container">
                                <img src="/kakaopay-qr.png" alt="KakaoPay QR" className="qr-code-img" />
                            </div>

                            <a
                                href="https://qr.kakaopay.com/Ej7v7HNeO"
                                target="_blank"
                                rel="noreferrer"
                                className="kakao-link-btn"
                            >
                                카카오페이로 마음 전하기
                            </a>

                            <button onClick={() => setShowDonation(false)} className="close-modal-btn">
                                닫기
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
