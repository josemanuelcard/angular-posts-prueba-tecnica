import { Photo } from './photo.model';
import { Post } from './post.model';

export interface PostWithPhoto extends Post {
  photo?: Photo;
}

