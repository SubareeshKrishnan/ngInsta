import { Component, OnInit, Input, OnChanges } from '@angular/core';

import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AuthService } from 'src/app/services/auth.service';
import {
  faThumbsUp,
  faThumbsDown,
  faShareSquare,
} from '@fortawesome/free-regular-svg-icons';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnChanges {
  constructor(private auth: AuthService, private db: AngularFireDatabase) {
    this.auth.getUser().subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  ngOnChanges(): void {
    if (this.post.votes) {
      Object.values(this.post.votes).map((val: any) => {
        if (val.upvote) {
          this.upVotes += 1;
        }
        if (val.downvote) {
          this.downVotes += 1;
        }
      });
    }
  }
  faThumbsUp = faThumbsUp;
  faThumbsDown = faThumbsDown;
  faShareSquare = faShareSquare;

  @Input() post;
  uid = null;
  upVotes = 0;
  downVotes = 0;

  upVotePost() {
    this.db.object(`/posts/${this.post.id}/votes/${this.uid}`).set({
      upvote: 1,
    });
  }

  downVotePost() {
    this.db.object(`/posts/${this.post.id}/votes/${this.uid}`).set({
      downvote: 1,
    });
  }

  getInstaHandle() {
    return `https://instagram.com/${this.post.instaId}`;
  }
  ngOnInit(): void {}
}
