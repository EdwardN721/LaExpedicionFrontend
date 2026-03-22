import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalExpeditions: number;
  activeAdventures: number;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./admin-dashboard.html`,
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly http = inject(HttpClient);

  readonly loading = signal(true);
  readonly stats = signal<AdminStats | null>(null);

  ngOnInit(): void {
    // Replace with your actual stats endpoint
    this.http
      .get<AdminStats>(`${environment.apiUrl}/api/admin/stats`)
      .subscribe({
        next: (data) => {
          this.stats.set(data);
          this.loading.set(false);
        },
        error: () => {
          // Fallback mock while backend isn't connected
          this.stats.set({ totalUsers: 0, totalItems: 0, totalExpeditions: 0, activeAdventures: 0 });
          this.loading.set(false);
        },
      });
  }
}
