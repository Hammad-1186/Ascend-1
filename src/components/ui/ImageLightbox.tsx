import { useEffect } from 'react';
import { X } from 'lucide-react';

interface Props { src: string; title?: string; onClose: () => void }

/** Full-size image viewer. Closes on Esc, on the X button, or when the dark backdrop is clicked. */
export default function ImageLightbox({ src, title, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title ?? 'Photo'} onClick={onClose} className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
      <div onClick={(e) => e.stopPropagation()} className="relative flex max-h-full max-w-full flex-col items-center gap-3">
        <button type="button" aria-label="Close photo" onClick={onClose} className="absolute -right-2 -top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-surface text-ink shadow-lg ring-1 ring-line hover:bg-primary-soft">
          <X size={18} />
        </button>
        <img src={src} alt={title ?? 'Uploaded photo'} className="max-h-[78vh] max-w-[90vw] rounded-xl object-contain shadow-2xl ring-1 ring-white/20" />
        {title && <p className="rounded-full bg-black/50 px-4 py-1 text-sm font-medium text-white">{title}</p>}
      </div>
    </div>
  );
}
