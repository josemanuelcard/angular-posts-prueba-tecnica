import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PostCardComponent } from '../features/posts/components/post-card/post-card.component';

@NgModule({
  declarations: [PostCardComponent],
  imports: [CommonModule, RouterModule],
  exports: [PostCardComponent]
})
export class SharedModule {}

