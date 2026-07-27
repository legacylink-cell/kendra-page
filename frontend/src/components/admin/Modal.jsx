import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children, testid }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10" data-testid={testid} onClick={onClose}>
      <div className="bg-white border border-border rounded-lg w-full max-w-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold text-lg">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground" data-testid="modal-close"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export const Field = ({ label, children }) => (
  <div>
    <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</label>
    <div className="mt-1.5">{children}</div>
  </div>
);

export const inputCls = "w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent";
