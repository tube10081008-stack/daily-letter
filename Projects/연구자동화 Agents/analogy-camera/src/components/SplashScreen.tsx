import React from 'react';
import { motion } from 'framer-motion';
import { Clapperboard } from 'lucide-react';
import './SplashScreen.css';

interface SplashScreenProps {
    onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    return (
        <motion.div
            className="splash-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            onClick={onStart}
        >
            <div className="splash-content">
                <motion.div
                    className="logo-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 2 }}
                >
                    <Clapperboard size={48} color="#f0e6d2" />
                </motion.div>

                <motion.h1
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.5 }}
                >
                    ANALOGY
                </motion.h1>

                <motion.div
                    className="subtitle"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                >
                    A CINEMATIC RECORD
                </motion.div>

                <div className="tap-to-start">
                    [ TAP TO START ]
                </div>
            </div>
        </motion.div>
    );
};
