import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showAboutOnly = false;

  showAboutSection(): void {
    this.showAboutOnly = true;
  }

  showMainContent(): void {
    this.showAboutOnly = false;
  }
}

