import { useRef, useState } from 'react';
import { FileText, ImagePlus, LoaderCircle, RefreshCw, Trash2, Upload, Video } from 'lucide-react';
import { acceptFor, optimizeImage, uploadToCloudinary } from '../../lib/media.js';
import { useToast } from './Toast.jsx';

const ICON = { image: ImagePlus, video: Video, document: FileText };
const LIMIT = { image: '8 MB · JPG, PNG, WEBP, AVIF, GIF', video: '100 MB · MP4, WEBM, MOV', document: '10 MB · PDF' };

/**
 * Upload or replace a file via signed Cloudinary upload. The value is a URL string.
 * A URL can also be pasted manually (e.g. an existing /images/... path).
 * onUploaded receives the full verified asset (useful for video poster/duration).
 */
export default function MediaUpload({ kind = 'image', folder = 'misc', value, onChange, onUploaded }) {
  const input = useRef(null);
  const [progress, setProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const toast = useToast();
  const Icon = ICON[kind];

  const handle = async (file) => {
    if (!file) return;
    setProgress(0);
    try {
      const asset = await uploadToCloudinary(file, { kind, folder, onProgress: setProgress });
      onChange(asset.url);
      onUploaded?.(asset);
      toast(`${kind === 'video' ? 'Video' : kind === 'document' ? 'File' : 'Image'} uploaded`);
    } catch (err) {
      toast(err.message || 'Upload failed', 'error');
    } finally {
      setProgress(null);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`relative overflow-hidden rounded-2xl border border-dashed transition ${dragging ? 'border-iris bg-iris/5' : 'border-line-strong'}`}
      >
        {value ? (
          <div className="flex flex-col gap-4 p-3 sm:flex-row sm:items-center">
            <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-44">
              {kind === 'image' && <img src={optimizeImage(value, 400)} alt="" className="h-full w-full object-cover" />}
              {kind === 'video' && <video src={value} className="h-full w-full object-cover" muted preload="metadata" />}
              {kind === 'document' && <div className="grid h-full place-items-center"><FileText className="h-8 w-8 text-iris" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate font-mono text-xs text-muted hover:text-ink">{value}</a>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => input.current?.click()} className="chip !py-1.5 hover:!text-ink"><RefreshCw className="h-3.5 w-3.5" /> Replace</button>
                <button type="button" onClick={() => onChange('')} className="chip !py-1.5 hover:!text-rose"><Trash2 className="h-3.5 w-3.5" /> Remove</button>
              </div>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex w-full flex-col items-center gap-2 px-4 py-8 text-center">
            <Icon className="h-7 w-7 text-iris" />
            <span className="text-sm font-medium">Click to upload or drag & drop</span>
            <span className="text-xs text-faint">{LIMIT[kind]}</span>
          </button>
        )}
        {progress !== null && (
          <div className="absolute inset-0 grid place-items-center bg-bg/85 backdrop-blur-sm">
            <div className="w-2/3 text-center">
              <LoaderCircle className="mx-auto h-6 w-6 animate-spin text-iris" />
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-gradient-to-r from-iris to-aqua transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 font-mono text-xs text-muted">{progress < 100 ? `Uploading ${progress}%` : 'Verifying…'}</p>
            </div>
          </div>
        )}
        <input ref={input} type="file" accept={acceptFor(kind)} className="hidden" onChange={(e) => handle(e.target.files?.[0])} />
      </div>
      <div className="flex items-center gap-2">
        <Upload className="h-3.5 w-3.5 shrink-0 text-faint" />
        <input value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="…or paste a URL / site path" className="w-full bg-transparent font-mono text-xs text-muted outline-none placeholder:text-faint" aria-label="Media URL" />
      </div>
    </div>
  );
}
