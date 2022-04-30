import { Component } from '@angular/core';

import { AuthService } from 'src/app/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
  email = null;
  constructor(
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    auth.getUser().subscribe((user) => {
      this.email = user?.email;
    });
  }

  async handleSignout() {
    try {
      await this.auth.signOut();
      this.router.navigateByUrl('/signin');
      this.toastr.info('Log out success!');
      this.email = null;
    } catch (e) {
      this.toastr.error('Unable to signout!', e.message());
    }
  }
}
