import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
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
