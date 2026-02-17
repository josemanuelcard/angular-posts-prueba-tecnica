import { ChangeDetectorRef, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, interval, startWith, Subject, takeUntil } from 'rxjs';

import { PostWithPhoto } from '../../models/post-with-photo.model';
import { Actor } from '../../models/actor.model';
import { PostService } from '../../services/post.service';

@Component({
  selector: 'app-post-list',
  standalone: false,
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  filterForm!: FormGroup;
  posts: PostWithPhoto[] = [];
  filteredPosts: PostWithPhoto[] = [];
  userIds: number[] = [];
  loading = false;
  errorMessage = '';
  isSearchResult = false;
  heroImages: string[] = [];
  heroImageUrl = '';
  private heroIndex = 0;
  private verticalPage = 0;
  private readonly verticalPageSize = 6;
  private horizontalPage = 0;
  private horizontalPageSize = 3;
  actors: Actor[] = [];
  private actorsPage = 0;
  private readonly actorsPageSize = 6;
  actorsLoading = false;
  actorsError = '';
  private readonly heroFallback =
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=60';

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly postService: PostService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.updateHorizontalPageSize();
    this.filterForm = this.fb.group({
      title: [''],
      cinema: [''],
      date: [''],
      time: [''],
      format: ['']
    });

    this.filterForm.valueChanges
      .pipe(startWith(this.filterForm.value), debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => this.applyFilters());

    this.loadPosts();
    this.loadActors();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateHorizontalPageSize();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPosts(): void {
    this.loading = true;
    this.errorMessage = '';

    this.postService.getPostsWithPhotos().subscribe({
      next: (posts) => {
        this.posts = posts;
        this.userIds = Array.from(new Set(posts.map((post) => post.userId))).sort(
          (a, b) => a - b
        );
        this.setupHeroCarousel();
        this.applyFilters();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message ?? 'Ocurrió un error inesperado.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private loadActors(): void {
    this.actorsLoading = true;
    this.actorsError = '';
    this.postService.getActors().subscribe({
      next: (actors) => {
        this.actors = actors;
        this.actorsPage = 0;
        this.actorsLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.actors = [];
        this.actorsError = 'No se pudieron cargar los actores.';
        this.actorsLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private applyFilters(): void {
    const { title, cinema, date, time, format } = this.filterForm.value as {
      title: string;
      cinema: string;
      date: string;
      time: string;
      format: string;
    };
    const term = title?.toLowerCase().trim() ?? '';
    const userFilter = format ? Number(format) : null;
    this.isSearchResult = Boolean(term || cinema || date || time || format);

    if (this.isSearchResult) {
      this.filteredPosts = this.getRandomPosts(6);
    } else {
      this.filteredPosts = this.posts.filter((post) => {
        const matchesTitle = !term || post.title.toLowerCase().includes(term);
        const matchesUser = !userFilter || post.userId === userFilter;
        return matchesTitle && matchesUser;
      });
    }
    this.verticalPage = 0;
    this.horizontalPage = 0;
  }

  clearFilters(): void {
    this.filterForm.reset({
      title: '',
      cinema: '',
      date: '',
      time: '',
      format: ''
    });
    this.isSearchResult = false;
    this.filteredPosts = [...this.posts];
    this.verticalPage = 0;
    this.horizontalPage = 0;
  }

  private getRandomPosts(count: number): PostWithPhoto[] {
    const shuffled = [...this.posts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  get verticalPosts(): PostWithPhoto[] {
    const start = this.verticalPage * this.verticalPageSize;
    return this.filteredPosts.slice(start, start + this.verticalPageSize);
  }

  get horizontalPosts(): PostWithPhoto[] {
    const start = this.horizontalPage * this.horizontalPageSize;
    return this.filteredPosts.slice(start, start + this.horizontalPageSize);
  }

  prevHorizontalPage(): void {
    if (this.filteredPosts.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.filteredPosts.length / this.horizontalPageSize);
    this.horizontalPage = (this.horizontalPage - 1 + totalPages) % totalPages;
  }

  nextHorizontalPage(): void {
    if (this.filteredPosts.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.filteredPosts.length / this.horizontalPageSize);
    this.horizontalPage = (this.horizontalPage + 1) % totalPages;
  }

  private updateHorizontalPageSize(): void {
    const isMobile = window.innerWidth < 768;
    const nextSize = isMobile ? 1 : 3;
    if (this.horizontalPageSize !== nextSize) {
      this.horizontalPageSize = nextSize;
      this.horizontalPage = 0;
    }
  }

  prevVerticalPage(): void {
    if (this.filteredPosts.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.filteredPosts.length / this.verticalPageSize);
    this.verticalPage = (this.verticalPage - 1 + totalPages) % totalPages;
  }

  nextVerticalPage(): void {
    if (this.filteredPosts.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.filteredPosts.length / this.verticalPageSize);
    this.verticalPage = (this.verticalPage + 1) % totalPages;
  }

  get actorCards(): Actor[] {
    const start = this.actorsPage * this.actorsPageSize;
    return this.actors.slice(start, start + this.actorsPageSize);
  }

  prevActorsPage(): void {
    if (this.actors.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.actors.length / this.actorsPageSize);
    this.actorsPage = (this.actorsPage - 1 + totalPages) % totalPages;
  }

  nextActorsPage(): void {
    if (this.actors.length === 0) {
      return;
    }
    const totalPages = Math.ceil(this.actors.length / this.actorsPageSize);
    this.actorsPage = (this.actorsPage + 1) % totalPages;
  }

  private setupHeroCarousel(): void {
    this.heroImages = this.posts
      .map((post) => post.photo?.url)
      .filter((url): url is string => Boolean(url));

    if (this.heroImages.length === 0) {
      this.heroImageUrl = this.heroFallback;
      return;
    }

    this.heroIndex = 0;
    this.heroImageUrl = this.heroImages[this.heroIndex];

    if (this.heroImages.length > 1) {
      interval(4000)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.nextHero();
        });
    }
  }

  prevHero(): void {
    if (this.heroImages.length === 0) {
      return;
    }
    this.heroIndex = (this.heroIndex - 1 + this.heroImages.length) % this.heroImages.length;
    this.heroImageUrl = this.heroImages[this.heroIndex];
  }

  nextHero(): void {
    if (this.heroImages.length === 0) {
      return;
    }
    this.heroIndex = (this.heroIndex + 1) % this.heroImages.length;
    this.heroImageUrl = this.heroImages[this.heroIndex];
  }
}

