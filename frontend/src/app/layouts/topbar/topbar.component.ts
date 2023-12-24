import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrls: ['./topbar.component.css'],
})
export class TopbarComponent {
  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}
  logout() {
    // Ask for confirmation
    const confirmLogout = confirm('Are you sure you want to SignOut ?');

    // If the user confirms, proceed with the logout
    if (confirmLogout) {
      this.authService.clearToken();
      this.authService.clearuserRoles();
      this.router.navigate(['/login']);
      this.toastr.success('Logout Successfully','Success');
    }
    else{
        this.toastr.warning('Logout Failed','Warning')
    }
  }
}
