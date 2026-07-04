'use client';

import clsx from 'clsx';
import { useEffect } from 'react';

/* ------------------------------------------------------------------ */
/* Modal (bottom sheet)                                                */
/* ------------------------------------------------------------------ */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-md flex-col rounded-t-2xl bg-background"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="text-xl leading-none text-muted-foreground"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && (
          <div className="border-t bg-background p-4">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Form fields                                                         */
/* ------------------------------------------------------------------ */

const fieldBase =
  'w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20';

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={clsx(fieldBase, className)} {...props} />;
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={clsx(fieldBase, 'appearance-none', className)}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium">{label}</span>
      {children}
      {hint && (
        <span className="mt-1 block text-xs text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export function Badge({
  children,
  color = 'neutral',
}: {
  children: React.ReactNode;
  color?: 'neutral' | 'green' | 'red' | 'amber' | 'blue';
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium',
        color === 'neutral' && 'bg-muted text-muted-foreground',
        color === 'green' &&
          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
        color === 'red' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        color === 'amber' &&
          'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
        color === 'blue' &&
          'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  icon = '📭',
  title,
  desc,
  action,
}: {
  icon?: string;
  title: string;
  desc?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="text-4xl">{icon}</div>
      <p className="mt-3 font-medium">{title}</p>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/** FAB tombol tambah mengambang di kanan bawah. */
export function Fab({
  onClick,
  label = 'Tambah',
}: {
  onClick: () => void;
  label?: string;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-20 z-40 mx-auto flex max-w-md justify-end px-4">
      <button
        onClick={onClick}
        className="pointer-events-auto flex items-center gap-1.5 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 active:scale-95"
      >
        <span className="text-lg leading-none">＋</span>
        {label}
      </button>
    </div>
  );
}
