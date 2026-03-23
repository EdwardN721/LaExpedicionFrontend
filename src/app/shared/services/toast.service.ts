import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastIdCounter = 0;
  
  // Exponemos las notificaciones como un Signal para poder leerlas en el HTML
  readonly toasts = signal<ToastMessage[]>([]);

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  remove(id: number): void {
    this.toasts.update(current => current.filter(t => t.id !== id));
  }

  private show(message: string, type: 'success' | 'error' | 'info'): void {
    const id = ++this.toastIdCounter;
    const newToast: ToastMessage = { id, message, type };
    
    this.toasts.update(current => [...current, newToast]);

    // Auto-eliminar después de 3 segundos
    setTimeout(() => {
      this.remove(id);
    }, 3000);
  }
}