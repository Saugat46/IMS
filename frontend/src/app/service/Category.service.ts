import { Injectable } from '@angular/core';
import { AllUserService } from './allUser.service';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:3000/categories/';
  constructor(
    private allUserService: AllUserService,
    private http: HttpClient
  ) {}
  categroyList() {
    const headers = this.allUserService.getHeadersWithToken();
    return this.http.get<any>(`${this.apiUrl}viewAll`, { headers });
  }
  categroyCreate(addedCategory: any) {
    debugger
    const headers = this.allUserService.getHeadersWithToken();
    return this.http.post<any>(`${this.apiUrl}create`, addedCategory, {
      headers,
    });
  }
  // updateCategory(id: string, categoryData: any) {
  //   const headers = this.allUserService.getHeadersWithToken();
  //   return this.http.put<any>(`${this.apiUrl}update`, id, { headers });
  // }
  updateCategory(catId: string, catData: any): Observable<any> {
    const headers = this.allUserService.getHeadersWithToken();
    const url = `${this.apiUrl}update/${catId}`;


    return this.http
      .put<any>(url, catData, {headers}) 
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    console.error('An error occurred:', error);
    return throwError('Something went wrong; please try again later.');
  }
  deleteCategory(id: any) {
    const headers = this.allUserService.getHeadersWithToken();
    return this.http.delete<any>(`${this.apiUrl}delete/${id}`, { headers });
  }
}
