import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { FooterComponent } from './core/footer/footer.component';
import { AuthModalComponent } from './core/auth-modal/auth-modal.component';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    FooterComponent,
    AuthModalComponent
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

