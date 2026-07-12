import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, RefreshCw, X } from 'lucide-react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [error, setError] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const qrRegionId = 'qr-scanner-region';

  useEffect(() => {
    if (!isOpen) {
      setError('');
      setCameraActive(false);
      return;
    }

    let scannerInstance = null;

    // Small delay to let the modal mount its container element fully in DOM
    const t = setTimeout(() => {
      scannerInstance = new Html5Qrcode(qrRegionId);
      scannerRef.current = scannerInstance;

      scannerInstance.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          // Success callback
          if (scannerInstance && scannerInstance.isScanning) {
            scannerInstance.stop().then(() => {
              setCameraActive(false);
              onScanSuccess(decodedText);
            }).catch(() => {
              onScanSuccess(decodedText);
            });
          }
        },
        () => {
          // Silent error for scanning frames
        }
      ).then(() => {
        setCameraActive(true);
        setError('');
      }).catch((err) => {
        console.error('Camera access failed:', err);
        setError('Could not access camera. Please check permissions.');
      });
    }, 300);

    return () => {
      clearTimeout(t);
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch((e) => console.log('Cleanup stop error:', e));
      }
    };
  }, [isOpen, onScanSuccess]);

  const handleManualClose = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.log('Error stopping scanner:', e);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleManualClose}
      title="Scan Asset QR Code"
      size="sm"
      footer={(
        <Button variant="secondary" onClick={handleManualClose}>
          Close
        </Button>
      )}
    >
      <div className="space-y-4 flex flex-col items-center">
        <p className="text-xs text-center text-(--app-color-text-muted)">
          Place the asset tag's QR Code inside the camera frame.
        </p>

        <div className="relative w-full aspect-square max-w-[280px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-(--app-color-border)">
          {/* Scanning frame container */}
          <div id={qrRegionId} className="w-full h-full object-cover" />

          {/* Loader or Error status overlays */}
          {!cameraActive && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white space-y-2">
              <RefreshCw className="h-8 w-8 animate-spin opacity-60" />
              <span className="text-xs opacity-80 font-medium">Initializing camera...</span>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4 text-center space-y-2">
              <Camera className="h-10 w-10 opacity-60" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
          )}

          {/* Visual overlay scanning lines */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none border-2 border-(--app-color-primary)/50 rounded-xl">
              <div className="absolute top-[10%] left-[10%] right-[10%] bottom-[10%] border border-white/20 rounded-lg">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-(--app-color-primary) animate-pulse shadow-[0_0_10px_#0f5f73]" />
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
