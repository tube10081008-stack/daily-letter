import { useState } from 'react';
import { StorageProvider } from './context/StorageContext';
import { Viewfinder } from './components/Viewfinder';
import { Gallery } from './components/Gallery';
import { SplashScreen } from './components/SplashScreen';
import { AnimatePresence } from 'framer-motion';

function App() {
  const [view, setView] = useState<'splash' | 'camera' | 'gallery'>('splash');

  return (
    <StorageProvider>
      <div style={{ height: '100vh', width: '100vw', overflow: 'hidden', background: '#000' }}>
        <AnimatePresence mode="wait">
          {view === 'splash' && (
            <SplashScreen key="splash" onStart={() => setView('camera')} />
          )}
          {view === 'camera' && (
            <Viewfinder key="viewfinder" onOpenGallery={() => setView('gallery')} />
          )}
          {view === 'gallery' && (
            <Gallery key="gallery" onClose={() => setView('camera')} />
          )}
        </AnimatePresence>
      </div>
    </StorageProvider>
  );
}

export default App;
