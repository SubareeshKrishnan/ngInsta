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
import { Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent implements OnInit {
  picture: string =
    'https://images.unsplash.com/photo-1505628346881-b72b27e84530?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80';
  uuid = null;
  uploadProgress$: Observable<number>;
  fileRef = null;
  resizedImage;
  constructor(
    private router: Router,
    private toastr: ToastrService,
    private authf: AuthService,
    private db: AngularFireDatabase,
    private storage: AngularFireStorage
  ) {}

  ngOnInit(): void {}
  onSubmit(f: NgForm) {
    const { email, password, username, country, bio, name } = f.form.value;
    this.authf
      .signUp(email, password)
      .then((res) => {
        this.uuid = res['user'].uid;
        const { uid } = res.user;
        this.db.object(`/users/${uid}`).set({
          id: uid,
          name: name,
          country: country,
          bio: bio,
          instaUsername: username,
          picture: this.picture,
        });
      })
      .then(() => {
        this.fileRef.delete();
        const newRef = this.storage.ref(this.uuid);
        const task = this.storage.upload(this.uuid, this.resizedImage);
        task
          .snapshotChanges()
          .pipe(
            finalize(() => {
              newRef.getDownloadURL().subscribe((url) => {
                this.picture = url;
                this.db.object(`/users/${this.uuid}`).update({
                  picture: this.picture,
                });
              });
            })
          )
          .subscribe();
      })
      .then(() => {
        this.toastr.success('Signup successfull!');
        this.router.navigateByUrl('/signin');
      })
      .catch((err) => {
        console.log(err);
        this.toastr.error('Unable to signup!', err.message);
      });
  }

  async uploadFile(event) {
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
            this.toastr.success('Image uploaded!');
          });
        })
      )
      .subscribe();
  }
}
