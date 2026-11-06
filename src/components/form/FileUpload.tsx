import { useRef, useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { cn } from '../../lib';

const MAX_FILE_MB = 5;

interface Props {
  id: string;
  /** The file as a data URL ('' = nothing uploaded). */
  value: string;
  fileName: string;
  /** Called with the data URL and the original file name ('' / '' when removed). */
  onChange: (dataUrl: string, fileName: string) => void;
  accept?: string;
  disabled?: boolean;
  /** Shown while empty, e.g. "Upload CV". */
  placeholder: string;
}

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });

/** Field-height upload button. Shows the chosen file name with a remove (x). Used for the CV and the LOA document. */
export default function FileUpload({ id, value, fileName, onChange, accept = '.pdf,.doc,.docx', disabled, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    const okType = accept.split(',').some((a) => file.name.toLowerCase().endsWith(a.trim().toLowerCase()));
    if (!okType) return setError(`Allowed: ${accept.replace(/\./g, '').replace(/,/g, ', ').toUpperCase()}`);
    if (file.size > MAX_FILE_MB * 1024 * 1024) return setError(`File must be under ${MAX_FILE_MB} MB`);
    try { onChange(await readAsDataUrl(file), file.name); } catch (e) { setError(e instanceof Error ? e.message : 'Could not read the file'); }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="min-w-0">
      <div
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-md border border-dashed px-3 text-sm transition',
          value ? 'border-primary/60 bg-primary-soft' : 'border-field-line bg-field',
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-primary/60',
        )}
      >
        <button
          id={id}
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          title={value ? `${fileName} - click to replace` : `${placeholder} (${accept.replace(/\./g, '').toUpperCase()}, up to ${MAX_FILE_MB} MB)`}
          className="flex min-w-0 flex-1 items-center gap-2 text-left focus:outline-none disabled:cursor-not-allowed"
        >
          {value ? <FileText size={17} className="shrink-0 text-info" /> : <Upload size={17} className="shrink-0 text-muted" />}
          <span className={cn('truncate', value ? 'text-ink' : 'text-muted')}>{value ? fileName : placeholder}</span>
        </button>
        {value && !disabled && (
          <button type="button" aria-label="Remove file" onClick={() => onChange('', '')} className="shrink-0 rounded p-1 text-muted hover:text-danger">
            <X size={15} />
          </button>
        )}
      </div>
      {error && <p className="mt-1 truncate text-xs text-danger" title={error}>{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
