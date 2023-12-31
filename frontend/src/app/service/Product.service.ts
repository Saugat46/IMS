import { Injectable} from '@angular/core';
import { AllUserService } from './allUser.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:3000/product/';
  constructor(
    private http: HttpClient,
    private alluserService: AllUserService, 
  ) {}

  Stock() {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.get<any>(`${this.apiUrl}get-all`, { headers });
  }
  recent() {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.get<any>(`${this.apiUrl}recent`, { headers });
  }
  getProductById(id: any) {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.get<any>(`${this.apiUrl}get/${id}`, { headers });
  }
  productCreate(addedProduct: any) {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.post<any>(`${this.apiUrl}create`, addedProduct, {
      headers,
    });
  }
  deleteProduct(id: any) {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.delete<any>(`${this.apiUrl}delete/${id}`, { headers });
  }
  updateProduct(updatedProduct: any) {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.post<any>(`${this.apiUrl}update`, updatedProduct, {
      headers,
    });
  }
  getAllCategories() {
    const headers = this.alluserService.getHeadersWithToken();
    return this.http.get<any>('http://localhost:3000/categories/viewAll', {
      headers,
    });
  }
}
