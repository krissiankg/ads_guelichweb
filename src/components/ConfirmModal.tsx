import { AlertTriangle, AlertCircle, Check } from 'lucide-react';
import { Language } from '../translations';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type?: 'danger' | 'info' | 'success';
    language: Language;
}

export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'danger', language }: ConfirmModalProps) {
    if (!isOpen) return null;

    const fr = language === 'fr';

    const icon = type === 'danger'
        ? <AlertTriangle size={32} className="text-red-500" />
        : type === 'success'
            ? <Check size={32} className="text-green-500" />
            : <AlertCircle size={32} className="text-blue-500" />;

    const gradient = type === 'danger'
        ? 'from-red-600 to-orange-600'
        : type === 'success'
            ? 'from-green-600 to-emerald-600'
            : 'from-blue-600 to-indigo-600';

    const confirmText = fr ? 'Confirmer' : 'Confirm';
    const cancelText = fr ? 'Annuler' : 'Cancel';
    const closeText = fr ? 'Fermer' : 'Close';

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        {icon}
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                    <p className="text-slate-600 mb-6 leading-relaxed">{message}</p>

                    <div className="flex gap-3 justify-center">
                        {type !== 'success' && (
                            <button
                                onClick={onClose}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                {cancelText}
                            </button>
                        )}

                        <button
                            onClick={() => { onConfirm(); if (type === 'success') onClose(); }}
                            className={`px-5 py-2.5 rounded-xl text-white font-medium shadow-lg transition-all transform hover:-translate-y-0.5 bg-gradient-to-r ${gradient} ${type === 'danger' ? 'shadow-red-500/30' : 'shadow-blue-500/30'}`}
                        >
                            {type === 'success' ? closeText : confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
