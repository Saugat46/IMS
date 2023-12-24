import { Component } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(
    private router: Router,
    private titleService: Title,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const title = this.getTitle(this.activatedRoute.root);
        this.titleService.setTitle(title);
      }
    });
  }

  private getTitle(route: ActivatedRoute): string {
    let title = '';
    const routeData = route?.snapshot?.data;
    if (routeData && routeData['title']) {
      title = routeData['title'];
    }
    if (route.firstChild) {
      title = this.getTitle(route.firstChild) || title;
    }
    return title || 'IMS';
  }

  isLoginPage(): boolean {
    return this.router.url === '/login';
  }
}
