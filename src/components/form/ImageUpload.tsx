import { useRef, useState } from 'react';
import { Camera, Trash2 } from 'lucide-react';

const MAX_FILE_MB = 5;
const MAX_SIDE = 800; // px - the photo is downscaled so the stored value stays reasonably small

/** Resize to MAX_SIDE and return a JPEG data URL. */
function toDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')?.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That file is not a readable image')); };
    img.src = url;
  });
}

interface Props { id: string; value: string; onChange: (dataUrl: string) => void }

/**
 * Compact photo picker: a round preview that is itself the upload button, with a small Remove link under it.
 * Deliberately small (about two form rows tall) so the form page does not need to scroll. Value is a data URL ('' = none).
 */
export default function ImageUpload({ id, value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!file.type.startsWith('image/')) return setError('Please choose an image file');
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setError(`Image must be under ${MAX_FILE_MB} MB`);
    try { onChange(await toDataUrl(file)); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read the image'); }
    if (inputRef.current) inputRef.current.value = ''; // allow re-picking the same file
  };

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        title={`${value ? 'Change' : 'Upload'} photo (JPG or PNG, up to ${MAX_FILE_MB} MB)`}
        aria-label={value ? 'Change photo' : 'Upload photo'}
        className="group relative grid h-[88px] w-[88px] shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-field-line bg-field text-muted transition hover:border-primary hover:text-info"
      >
        {value ? <img src={value} alt="Profile preview" className="h-full w-full object-cover" /> : <Camera size={26} />}
        {value && <span className="absolute inset-0 grid place-items-center bg-black/50 text-white opacity-0 transition group-hover:opacity-100"><Camera size={22} /></span>}
      </button>
      {value ? (
        <button type="button" onClick={() => onChange('')} className="inline-flex items-center gap-1 text-xs text-muted transition hover:text-danger"><Trash2 size={13} /> Remove</button>
      ) : (
        <span className="text-xs text-muted">Click to upload</span>
      )}
      {error && <p className="max-w-[140px] text-xs text-danger">{error}</p>}
      <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
