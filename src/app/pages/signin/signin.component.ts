import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
})
export class SigninComponent implements OnInit {
  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  onSignin(f: NgForm) {
    const { email, password } = f.form.value;
    this.auth
      .signIn(email, password)
      .then((res) => {
        this.toastr.success('Sign in success!');
        this.router.navigateByUrl('');
      })
      .catch((err) => {
        this.toastr.error(
          'Invalid email or password. Try again!',
          'Unable to sign in!',
          {
            closeButton: true,
          }
        );
      });
  }
}
