import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  loading = false;
  users = [];
  posts = [];
  constructor(private db: AngularFireDatabase, private toastr: ToastrService) {
    this.loading = true;

    // Getting user's objects from DB
    db.object('/users')
      .valueChanges()
      .subscribe((obj) => {
        if (obj) {
          this.users = Object.values(obj);
          this.loading = false;
        } else {
          toastr.error('No users found!');
          this.users = [];
          this.loading = false;
        }
      });

    // Getting all the posts from the DB
    db.object('/posts')
      .valueChanges()
      .subscribe((obj) => {
        if (obj) {
          this.posts = Object.values(obj).sort((a, b) => b.date - a.date);
          this.loading = false;
        } else {
          toastr.error('No posts to show!');
          this.loading = false;
          this.posts = [];
        }
      });
  }
  ngOnInit(): void {}
}
