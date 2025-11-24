import { useEffect } from 'react';

interface ImagePreviewProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  caption?: string;
}

export default function ImagePreview({ src, alt = '', isOpen, onClose, caption }: ImagePreviewProps) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] w-full sm:w-4/5 md:w-3/5 bg-transparent rounded-lg overflow-hidden shadow-2xl"
      >
        <div className="relative bg-gradient-to-b from-black/30 to-black/10">
          <img src={src} alt={alt} className="w-full h-auto max-h-[80vh] object-contain block" />

          <button
            aria-label="Close preview"
            onClick={onClose}
            className="absolute top-3 right-3 inline-flex items-center justify-center h-10 w-10 rounded-full bg-black/50 hover:bg-black/60 text-white transition"
          >
            ×
          </button>
        </div>

        {caption && (
          <div className="p-4 bg-background/70 text-sm text-foreground/80">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
}
