import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { useStorage } from '../context/StorageContext';
import { motion, AnimatePresence, useDragControls, type PanInfo } from 'framer-motion';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import './Viewfinder.css';
import { processPhoto } from '../utils/photoProcessor';

interface ViewfinderProps {
    onOpenGallery: () => void;
}

const videoConstraints = {
    width: { ideal: 1920 },
    height: { ideal: 1080 },
    facingMode: "environment"
};

export const Viewfinder: React.FC<ViewfinderProps> = ({ onOpenGallery }) => {
    const webcamRef = useRef<Webcam>(null);
    const { savePhoto } = useStorage();
    const [isFlashing, setIsFlashing] = useState(false);
    const [isShutterClosed, setIsShutterClosed] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

    // Mechanical Logic
    const [isWound, setIsWound] = useState(false); // Start unwound
    const winderControls = useDragControls();
    const winderRef = useRef<HTMLDivElement>(null);

    const capture = useCallback(async () => {
        if (!webcamRef.current) return;
        if (!isWound) return; // Mechanical Lock

        // 1. Shutter mechanics
        setIsShutterClosed(true);
        if (typeof navigator.vibrate === 'function') navigator.vibrate(50);

        // Simulate mechanical delay
        setTimeout(async () => {
            // 2. Capture frame
            const imageSrc = webcamRef.current?.getScreenshot();

            if (imageSrc) {
                try {
                    // 3. Process to "True Film" (Canvas Burn-in)
                    const processedBlob = await processPhoto(imageSrc);

                    // 4. Save to "Light Box"
                    await savePhoto(processedBlob, ''); // No extra CSS filter needed
                } catch (e) {
                    console.error("Processing failed", e);
                }
            }

            // 5. Reset shutter and flash
            setIsShutterClosed(false);
            setIsFlashing(true);
            setIsWound(false); // Discharge spring mechanism

            setTimeout(() => setIsFlashing(false), 200);

        }, 150);

    }, [webcamRef, savePhoto, isWound]);

    const handleWind = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        if (info.offset.y > 50) { // Dragged down enough
            if (!isWound) {
                setIsWound(true);
                if (typeof navigator.vibrate === 'function') navigator.vibrate([20, 30, 20]); // Ratchet feel
            }
        }
    };

    const toggleCamera = () => {
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="viewfinder"
        >
            {/* Viewfinder / Lens */}
            <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ ...videoConstraints, facingMode }}
                playsInline
                className="camera-feed"
            />

            {/* Super-8 HUD Overlay */}
            <div className="hud-overlay">
                <div className="hud-crosshair hc-tl" />
                <div className="hud-crosshair hc-tr" />
                <div className="hud-crosshair hc-bl" />
                <div className="hud-crosshair hc-br" />
            </div>

            {/* Shutter Blades */}
            <AnimatePresence>
                {isShutterClosed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1 }}
                        className="shutter-curtain"
                    />
                )}
            </AnimatePresence>

            {/* Flash Effect */}
            <AnimatePresence>
                {isFlashing && (
                    <motion.div
                        initial={{ opacity: 0.8 }}
                        animate={{ opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flash-overlay"
                    />
                )}
            </AnimatePresence>

            {/* Winder Mechanic */}
            <div className="winder-area">
                <motion.div
                    ref={winderRef}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }} // Snap back
                    dragElastic={{ top: 0, bottom: 0.5 }}
                    onDragEnd={handleWind}
                    dragControls={winderControls}
                    className="winder-wheel"
                    style={{
                        rotate: isWound ? 90 : 0,
                        opacity: isWound ? 0.3 : 1, // Only slight dim
                        filter: isWound ? 'contrast(0.5)' : 'none'
                    }}
                    whileTap={{ scale: 1.1 }}
                >
                    <div className="winder-arrow" style={{ transform: isWound ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</div>
                </motion.div>
                <div className="film-status">
                    {isWound ? "READY" : "WIND"}
                </div>
            </div>

            {/* Controls Overlay */}
            <div className="controls">
                {/* Gallery Preview / Link */}
                <button className="glass-btn" onClick={onOpenGallery}>
                    <LayoutGrid size={24} color="#f0e6d2" />
                </button>

                {/* Shutter Button */}
                <button
                    onClick={capture}
                    className={`shutter-btn ${isWound ? 'ready' : ''}`}
                    aria-label="Capture"
                    disabled={!isWound}
                >
                    <div className="shutter-btn-inner" />
                </button>

                {/* Flip Camera */}
                <button onClick={toggleCamera} className="glass-btn">
                    <RefreshCw size={24} color="#f0e6d2" />
                </button>
            </div>
        </motion.div>
    );
};
