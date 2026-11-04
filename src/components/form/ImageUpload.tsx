import { useRef, useState } from 'react';
import { Camera, Trash2, Upload } from 'lucide-react';

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

/** Round photo preview + Upload / Change / Remove. Value is a data URL ('' when empty). */
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
    <div className="flex flex-wrap items-center gap-4">
      <span className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed border-field-line bg-field text-muted">
        {value ? <img src={value} alt="Profile preview" className="h-full w-full object-cover" /> : <Camera size={26} />}
      </span>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} className="inline-flex h-10 items-center gap-2 rounded-md border border-primary/60 bg-primary/10 px-4 text-sm font-medium text-info transition hover:bg-primary/20">
            <Upload size={16} /> {value ? 'Change photo' : 'Upload photo'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange('')} className="inline-flex h-10 items-center gap-2 rounded-md border border-line px-4 text-sm text-muted transition hover:text-danger">
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted">JPG or PNG, up to {MAX_FILE_MB} MB (optional)</p>
        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
      <input ref={inputRef} id={id} type="file" accept="image/*" className="sr-only" onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
