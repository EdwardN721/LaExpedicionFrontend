import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      @for (toast of toastSvc.toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex items-start gap-3 rounded-lg px-4 py-3
                 shadow-lg border transition-all animate-in slide-in-from-right-5"
          [class]="toastClass(toast.type)"
        >
          <!-- Icon -->
          <span class="mt-0.5 shrink-0 text-base leading-none">
            @switch (toast.type) {
              @case ('success') { ✔ }
              @case ('error') { ✖ }
              @default { ℹ }
            }
          </span>

          <p class="flex-1 text-sm leading-relaxed">{{ toast.message }}</p>

          <button
            class="ml-2 opacity-60 hover:opacity-100 transition text-sm leading-none"
            (click)="toastSvc.dismiss(toast.id)"
            aria-label="Cerrar notificación"
          >
            ✕
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastSvc = inject(ToastService);

  toastClass(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-rpg-card border-rpg-success/50 text-rpg-success';
      case 'error':
        return 'bg-rpg-card border-rpg-danger/50 text-rpg-danger';
      default:
        return 'bg-rpg-card border-rpg-border text-rpg-text';
    }
  }
}
