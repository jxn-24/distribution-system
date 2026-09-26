"use client";

import { useEffect, useRef, useState } from "react";

type BarcodeResult = { rawValue: string };
type NativeBarcodeDetector = {
  detect: (source: CanvasImageSource) => Promise<BarcodeResult[]>;
};
type BarcodeDetectorConstructor = new (options?: { formats: string[] }) => NativeBarcodeDetector;

declare global {
  interface Window {
    BarcodeDetector?: BarcodeDetectorConstructor;
  }
}

interface ScanBarcodeProps {
  onDetected: (value: string) => void;
}

export default function ScanBarcode({ onDetected }: ScanBarcodeProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<NativeBarcodeDetector | null>(null);
  const busyRef = useRef(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError("");
    if (!window.BarcodeDetector) {
      setCameraError("Camera scanning is not supported in this browser. Enter the SKU manually.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      detectorRef.current = new window.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch {
      stopCamera();
      setCameraError("Could not start the camera. Check camera permission or enter the SKU manually.");
    }
  };

  useEffect(() => {
    if (!cameraActive) return;
    const timer = window.setInterval(async () => {
      const video = videoRef.current;
      if (!video || !detectorRef.current || busyRef.current || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
      busyRef.current = true;
      try {
        const results = await detectorRef.current.detect(video);
        const value = results[0]?.rawValue?.trim();
        if (value) {
          stopCamera();
          onDetected(value);
        }
      } catch {
        setCameraError("Could not read this barcode. Try another angle or enter the SKU manually.");
      } finally {
        busyRef.current = false;
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [cameraActive, onDetected]);

  return (
    <div className="space-y-3">
      <div className="relative aspect-video overflow-hidden rounded-lg border border-neutral-700 bg-black">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline aria-label="Barcode camera preview" />
        {cameraActive && <div className="pointer-events-none absolute inset-x-8 top-1/2 h-0.5 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]" />}
        {!cameraActive && <div className="absolute inset-0 grid place-items-center text-sm text-neutral-400">Camera preview appears here</div>}
      </div>
      {cameraError && <p role="alert" className="text-sm text-red-300">{cameraError}</p>}
      <button type="button" onClick={cameraActive ? stopCamera : startCamera} className="min-h-12 w-full rounded-md border border-amber-400 px-4 font-semibold text-amber-300 hover:bg-amber-400/10">
        {cameraActive ? "Stop camera" : "Start camera scanner"}
      </button>
    </div>
  );
}
