import { useState, useRef } from 'react';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadImage, deleteImage } from '../lib/supabase';

// Compress image before upload using Canvas API
const MAX_DIMENSION = 1200;
const QUALITY = 0.8;

async function compressImage(file: File): Promise<File> {
    // Skip non-image or already small files
    if (!file.type.startsWith('image/') || file.size < 100 * 1024) return file;
    // Skip SVGs and GIFs (can't be compressed via canvas)
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let { width, height } = img;
            // Only resize if larger than max
            if (width <= MAX_DIMENSION && height <= MAX_DIMENSION) {
                // Still compress quality
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d')!.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
                    'image/jpeg', QUALITY
                );
                return;
            }
            // Scale down
            if (width > height) {
                height = Math.round((height * MAX_DIMENSION) / width);
                width = MAX_DIMENSION;
            } else {
                width = Math.round((width * MAX_DIMENSION) / height);
                height = MAX_DIMENSION;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : file),
                'image/jpeg', QUALITY
            );
        };
        img.onerror = () => resolve(file);
        img.src = URL.createObjectURL(file);
    });
}

interface ImageUploaderProps {
    value: string;
    onChange: (url: string) => void;
    onRemove?: () => void;
    folder: string;
    label?: string;
    className?: string;
}

export function ImageUploader({ value, onChange, onRemove, folder, label, className = '' }: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) return;
        setUploading(true);
        try {
            const compressed = await compressImage(file);
            const url = await uploadImage(compressed, folder);
            onChange(url);
        } catch (err: any) {
            alert('Erreur upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleRemove = async () => {
        if (value) {
            await deleteImage(value);
            onChange('');
            onRemove?.();
        }
    };

    if (value) {
        return (
            <div className={`relative group rounded-xl overflow-hidden border border-slate-200 ${className}`}>
                <img src={value} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={handleRemove} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                {label && <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-1 rounded">{label}</span>}
            </div>
        );
    }

    return (
        <div
            className={`relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${dragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
                } ${className}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
        >
            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
            {uploading ? (
                <Loader2 size={24} className="text-blue-500 animate-spin" />
            ) : (
                <>
                    <Upload size={20} className="text-slate-400 mb-1" />
                    <span className="text-xs text-slate-500">{label || 'Upload'}</span>
                </>
            )}
        </div>
    );
}

interface MultiImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    folder: string;
    maxImages?: number;
}

export function MultiImageUploader({ images, onChange, folder, maxImages = 20 }: MultiImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (files: FileList) => {
        const remaining = maxImages - images.length;
        const toUpload = Array.from(files).slice(0, remaining).filter(f => f.type.startsWith('image/'));
        if (!toUpload.length) return;

        setUploading(true);
        try {
            const urls: string[] = [];
            for (const file of toUpload) {
                const compressed = await compressImage(file);
                const url = await uploadImage(compressed, folder);
                urls.push(url);
            }
            onChange([...images, ...urls]);
        } catch (err: any) {
            alert('Erreur upload: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async (index: number) => {
        await deleteImage(images[index]);
        onChange(images.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map((url, i) => (
                    <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={() => handleRemove(i)} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600">
                                <X size={14} />
                            </button>
                        </div>
                    </div>
                ))}
                {images.length < maxImages && (
                    <div
                        className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-slate-50 transition-all"
                        onClick={() => fileRef.current?.click()}
                    >
                        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handleFiles(e.target.files); }} />
                        {uploading ? <Loader2 size={20} className="text-blue-500 animate-spin" /> : <Upload size={20} className="text-slate-400" />}
                        <span className="text-xs text-slate-500 mt-1">Ajouter</span>
                    </div>
                )}
            </div>
        </div>
    );
}
