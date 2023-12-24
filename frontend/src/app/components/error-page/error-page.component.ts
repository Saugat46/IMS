import { Component, OnInit } from '@angular/core'; 
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-error-page',
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  constructor(private toastr: ToastrService) {}

  ngOnInit() {
    this.toastr.error('Page not found', 'Error');
  }
}
