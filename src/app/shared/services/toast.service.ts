import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let _id = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string, duration = 4000): void {
    this._add(message, 'success', duration);
  }

  error(message: string, duration = 5000): void {
    this._add(message, 'error', duration);
  }

  info(message: string, duration = 4000): void {
    this._add(message, 'info', duration);
  }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private _add(message: string, type: ToastType, duration: number): void {
    const id = ++_id;
    this.toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
