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
  /** The link text while empty, e.g. "Upload CV". */
  placeholder: string;
}

const readAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Could not read the file'));
    reader.readAsDataURL(file);
  });

/**
 * Upload control styled like the "+ Add ..." links: an upload icon + blue link text ("Upload CV"). Once a file is
 * chosen it turns into a small chip with the file name and an x to remove it. Sits on the same row height as the inputs.
 */
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
      <div className="flex h-10 items-center">
        {value ? (
          <span className="inline-flex max-w-full items-center gap-2 rounded-md border border-primary/50 bg-primary-soft px-2.5 py-1.5 text-sm">
            <FileText size={16} className="shrink-0 text-info" />
            <button
              id={id}
              type="button"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
              title={`${fileName} - click to replace`}
              className="min-w-0 truncate text-left font-medium text-info hover:underline focus:outline-none"
            >
              {fileName}
            </button>
            {!disabled && (
              <button type="button" aria-label="Remove file" onClick={() => onChange('', '')} className="shrink-0 rounded p-0.5 text-muted hover:text-danger">
                <X size={14} />
              </button>
            )}
          </span>
        ) : (
          <button
            id={id}
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            title={`${placeholder} (${accept.replace(/\./g, '').toUpperCase()}, up to ${MAX_FILE_MB} MB)`}
            className={cn(
              'inline-flex items-center gap-2 rounded-md py-1 text-sm font-medium focus:outline-none focus-visible:ring-1 focus-visible:ring-primary',
              disabled ? 'cursor-not-allowed text-muted opacity-60' : 'text-info hover:underline',
            )}
          >
            <Upload size={16} /> {placeholder}
          </button>
        )}
      </div>
      {error && <p className="truncate text-xs text-danger" title={error}>{error}</p>}
      <input ref={inputRef} type="file" accept={accept} className="sr-only" tabIndex={-1} onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
