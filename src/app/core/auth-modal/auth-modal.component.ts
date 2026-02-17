import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';

import { AuthModalService, AuthModalState } from '../auth/auth-modal.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent {
  state$: Observable<AuthModalState>;

  constructor(private readonly authModalService: AuthModalService) {
    this.state$ = this.authModalService.state$;
  }

  close(): void {
    this.authModalService.close();
  }

  switchToLogin(): void {
    this.authModalService.openLogin();
  }

  switchToRegister(): void {
    this.authModalService.openRegister();
  }
}
