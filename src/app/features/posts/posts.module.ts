import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { PostsRoutingModule } from './posts-routing.module';
import { PostListComponent } from './components/post-list/post-list.component';
import { SharedModule } from '../../shared/shared.module';
import { PostDetailComponent } from './components/post-detail/post-detail.component';

@NgModule({
  declarations: [PostListComponent, PostDetailComponent],
  imports: [CommonModule, ReactiveFormsModule, PostsRoutingModule, SharedModule]
})
export class PostsModule {}

