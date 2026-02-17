import { Component, EventEmitter, Output } from '@angular/core';
import { AuthModalService } from '../auth/auth-modal.service';

@Component({
  selector: 'app-menu',
  standalone: false,
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
  @Output() aboutClick = new EventEmitter<void>();

  constructor(private readonly authModalService: AuthModalService) {}

  openLogin(): void {
    this.authModalService.openLogin();
  }

  openRegister(): void {
    this.authModalService.openRegister();
  }

  openAbout(event: Event): void {
    event.preventDefault();
    this.aboutClick.emit();
  }
}

