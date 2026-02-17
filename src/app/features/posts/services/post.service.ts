import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  throwError,
  timeout
} from 'rxjs';

import { Photo } from '../models/photo.model';
import { Post } from '../models/post.model';
import { PostWithPhoto } from '../models/post-with-photo.model';
import { Actor } from '../models/actor.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly postsUrl = 'https://jsonplaceholder.typicode.com/posts';
  private readonly photosUrl = 'https://jsonplaceholder.typicode.com/photos';
  private readonly tvMazeUrl = 'https://api.tvmaze.com/shows';
  private readonly tvMazePeopleUrl = 'https://api.tvmaze.com/people';
  // false = usa fotos de jsonplaceholder (API requerida)
  // true  = usa fotos alternas (TVMaze) para evitar bloqueos de red
  useAltPhotoApi = true;

  constructor(private readonly http: HttpClient) {}

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.postsUrl).pipe(
      catchError(() => throwError(() => new Error('No se pudieron cargar los posts.')))
    );
  }

  getPhotos(): Observable<Photo[]> {
    return this.http.get<Photo[]>(this.photosUrl).pipe(
      catchError(() => throwError(() => new Error('No se pudieron cargar las fotos.')))
    );
  }

  private getAltPhotos(): Observable<Photo[]> {
    return this.http
      .get<Array<{ id: number; name: string; image?: { original?: string; medium?: string } }>>(
        this.tvMazeUrl
      )
      .pipe(
        map((items) =>
          items.map((item) => ({
            albumId: 0,
            id: Number(item.id),
            title: item.name,
            url: item.image?.original ?? item.image?.medium ?? '',
            thumbnailUrl: item.image?.medium ?? item.image?.original ?? ''
          }))
        ),
        catchError(() => throwError(() => new Error('No se pudieron cargar las fotos alternas.')))
      );
  }

  getPostsWithPhotos(): Observable<PostWithPhoto[]> {
    return forkJoin({
      posts: this.getPosts(),
      photos: this.useAltPhotoApi ? this.getAltPhotos() : this.getPhotos()
    }).pipe(
      map(({ posts, photos }) => {
        const photoById = new Map<number, Photo>();
        photos.forEach((photo) => photoById.set(photo.id, photo));

        return posts.map((post) => ({
          ...post,
          photo: photoById.get(post.id)
        }));
      }),
      catchError(() =>
        throwError(() => new Error('No se pudo cargar la información de posts.'))
      )
    );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.postsUrl}/${id}`).pipe(
      timeout(8000),
      catchError(() => throwError(() => new Error('No se pudo cargar el post.')))
    );
  }

  getPhotoById(id: number): Observable<Photo | undefined> {
    if (this.useAltPhotoApi) {
      return this.http
        .get<{ id: number; name: string; image?: { original?: string; medium?: string } }>(
          `${this.tvMazeUrl}/${id}`
        )
        .pipe(
          map((item) => ({
            albumId: 0,
            id: item.id,
            title: item.name,
            url: item.image?.original ?? item.image?.medium ?? '',
            thumbnailUrl: item.image?.medium ?? item.image?.original ?? ''
          })),
          timeout(8000),
          catchError(() => of(undefined))
        );
    }

    return this.http
      .get<Photo>(`${this.photosUrl}/${id}`)
      .pipe(timeout(8000), catchError(() => of(undefined)));
  }

  getPostWithPhoto(id: number): Observable<PostWithPhoto> {
    const photo$ = this.useAltPhotoApi
      ? this.http
          .get<{ id: number; name: string; image?: { original?: string; medium?: string } }>(
            `${this.tvMazeUrl}/${id}`
          )
          .pipe(
            map((item) => ({
              albumId: 0,
              id: item.id,
              title: item.name,
              url: item.image?.original ?? item.image?.medium ?? '',
              thumbnailUrl: item.image?.medium ?? item.image?.original ?? ''
            })),
            timeout(8000),
            catchError(() => of(undefined))
          )
      : this.http
          .get<Photo>(`${this.photosUrl}/${id}`)
          .pipe(timeout(8000), catchError(() => of(undefined)));

    return this.http.get<Post>(`${this.postsUrl}/${id}`).pipe(
      timeout(8000),
      switchMap((post) =>
        photo$.pipe(
          map((photo) => ({
            ...post,
            photo
          })),
          catchError(() => of({ ...post, photo: undefined }))
        )
      ),
      catchError(() => throwError(() => new Error('No se pudo cargar el detalle del post.')))
    );
  }

  getActors(): Observable<Actor[]> {
    return this.http
      .get<Array<{ id: number; name: string; image?: { medium?: string; original?: string } }>>(
        this.tvMazePeopleUrl
      )
      .pipe(
        map((items) =>
          items
            .filter((item) => Boolean(item.image?.medium || item.image?.original))
            .map((item) => ({
              id: item.id,
              name: item.name,
              imageUrl: item.image?.medium ?? item.image?.original ?? ''
            }))
        ),
        catchError(() => throwError(() => new Error('No se pudieron cargar los actores.')))
      );
  }
}

