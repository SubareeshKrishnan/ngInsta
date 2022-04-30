import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { ToastrService } from 'ngx-toastr';

import { finalize } from 'rxjs/operators';

import { AuthService } from 'src/app/services/auth.service';

import { readAndCompressImage } from 'browser-image-resizer';
import { imageConfig } from 'src/utils/config';

import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { faPaperclip } from '@fortawesome/free-solid-svg-icons';

import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-post',
  templateUrl: './add-post.component.html',
  styleUrls: ['./add-post.component.css'],
})
export class AddPostComponent implements OnInit {
  faPaperclip = faPaperclip;

  title: string;
  locationName: string;
  description: string;
  picture: string = null;
  uploadProgress$: Observable<number>;
  user = null;
  uploadPercent = null;
  uid = null;
  resizedImage;
  fileRef;
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authf: AuthService,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) {
    this.authf.getUser().subscribe((user) => {
      console.log(user);
      this.db
        .object(`/users/${user.uid}`)
        .valueChanges()
        .subscribe((user) => {
          this.user = user;
        });
    });
  }

  ngOnInit(): void {}

  onPost() {
    this.uid = uuidv4();
    this.db
      .object(`/posts/${this.uid}`)
      .set({
        id: this.uid,
        title: this.title,
        location: this.locationName,
        decription: this.description,
        picture: this.picture,
        by: this.user.name,
        instaId: this.user.instaUsername,
        date: Date.now(),
      })
      .then(() => {
        this.fileRef.delete();
        const newRef = this.storage.ref(this.uid);
        const task = this.storage.upload(this.uid, this.resizedImage);
        task
          .snapshotChanges()
          .pipe(
            finalize(() => {
              newRef.getDownloadURL().subscribe((url) => {
                this.picture = url;
                this.db.object(`/posts/${this.uid}`).update({
                  picture: this.picture,
                });
              });
            })
          )
          .subscribe();
      })
      .then(() => {
        this.toastr.success('Posted successfully!');
        this.router.navigateByUrl('');
      })
      .catch((err) => {
        this.toastr.error(err.message, 'Error happend while posting!');
      });
  }

  async onFileupload(event) {
    const file = event.target.files[0];
    this.resizedImage = await readAndCompressImage(file, imageConfig);
    const filePath = file.name;
    this.fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, this.resizedImage);
    this.uploadProgress$ = task.percentageChanges();
    task
      .snapshotChanges()
      .pipe(
        finalize(() => {
          setTimeout(() => {
            this.uploadProgress$ = null;
          }, 2000);
          this.fileRef.getDownloadURL().subscribe((url) => {
            this.picture = url;
            this.toastr.success('Picture uploaded successfully!');
          });
        })
      )
      .subscribe();
  }
}
