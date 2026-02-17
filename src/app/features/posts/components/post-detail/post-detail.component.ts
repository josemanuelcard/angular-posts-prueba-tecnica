import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize, Subject, takeUntil } from 'rxjs';

import { PostWithPhoto } from '../../models/post-with-photo.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-detail',
  standalone: false,
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  post?: PostWithPhoto;
  relatedPosts: PostWithPhoto[] = [];
  loading = false;
  errorMessage = '';

  private readonly destroy$ = new Subject<void>();
  private loadingTimeout?: ReturnType<typeof setTimeout>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly postService: PostService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) {
        this.errorMessage = 'No se encontró el post solicitado.';
        return;
      }
      this.loadPost(id);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPost(id: number): void {
    this.loading = true;
    this.errorMessage = '';
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        this.loading = false;
        this.errorMessage = 'La respuesta está tardando demasiado.';
        this.cdr.detectChanges();
      }
    }, 6000);

    this.postService
      .getPostById(id)
      .pipe(
        finalize(() => {
          this.loading = false;
          if (this.loadingTimeout) {
            clearTimeout(this.loadingTimeout);
          }
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (post) => {
          this.post = { ...post };
          this.loadPhoto(post.id);
          this.loadRelatedPosts(post.userId, post.id);
          this.cdr.detectChanges();
        },
        error: (error: Error) => {
          this.errorMessage = error.message ?? 'Ocurrió un error inesperado.';
          this.cdr.detectChanges();
        }
      });
  }

  private loadPhoto(id: number): void {
    this.postService.getPhotoById(id).subscribe({
      next: (photo) => {
        if (this.post && photo) {
          this.post = { ...this.post, photo };
          this.cdr.detectChanges();
        }
      }
    });
  }

  private loadRelatedPosts(userId: number, currentId: number): void {
    this.postService.getPostsWithPhotos().subscribe({
      next: (posts) => {
        this.relatedPosts = posts
          .filter((item) => item.userId === userId && item.id !== currentId)
          .slice(0, 6);
      },
      error: () => {
        this.relatedPosts = [];
      }
    });
  }
}
