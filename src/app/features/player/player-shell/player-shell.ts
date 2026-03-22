import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-player-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: `./player-shell.html`,
  styleUrl: './player-shell.css'
})
export class PlayerShellComponent {
  readonly auth = inject(AuthService);
}
