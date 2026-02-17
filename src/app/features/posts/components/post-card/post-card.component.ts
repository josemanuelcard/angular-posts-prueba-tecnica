import { Component, Input } from '@angular/core';
import { PostWithPhoto } from '../../models/post-with-photo.model';

@Component({
  selector: 'app-post-card',
  standalone: false,
  templateUrl: './post-card.component.html',
  styleUrls: ['./post-card.component.css']
})
export class PostCardComponent {
  @Input({ required: true }) post!: PostWithPhoto;
  @Input() variant: 'horizontal' | 'vertical' = 'vertical';

  private readonly fallbackImage =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'><rect width='100%' height='100%' fill='%23e9ecef'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%236c757d' font-size='24' font-family='Arial'>Imagen</text></svg>";
  private readonly proxyA = 'https://wsrv.nl/?url=';
  private readonly proxyB = 'https://images.weserv.nl/?url=';
  private readonly proxyC = 'https://api.allorigins.win/raw?url=';

  getImageUrl(size: 'horizontal' | 'vertical'): string {
    if (size === 'horizontal') {
      return this.safeUrl(this.post.photo?.url) ?? this.fallbackImage;
    }
    return (
      this.safeUrl(this.post.photo?.thumbnailUrl) ??
      this.safeUrl(this.post.photo?.url) ??
      this.fallbackImage
    );
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    const current = target.src;
    if (current.startsWith('data:image')) {
      return;
    }
    if (current.includes('images.weserv.nl')) {
      target.src = this.toProxyUrl(current, this.proxyC);
      return;
    }
    if (current.includes('allorigins.win')) {
      target.src = this.fallbackImage;
      return;
    }
    target.src = this.toProxyUrl(current, this.proxyA);
  }

  private toProxyUrl(url: string, proxy: string): string {
    return `${proxy}${encodeURIComponent(url)}`;
  }

  private safeUrl(url?: string): string | undefined {
    if (!url) {
      return undefined;
    }
    return url.includes('via.placeholder.com') ? this.toProxyUrl(url, this.proxyA) : url;
  }
}

