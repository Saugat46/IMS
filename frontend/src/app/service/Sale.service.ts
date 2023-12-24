import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { AllUserService } from './allUser.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
private apiUrl = 'http://localhost:3000/sale/';
  constructor(private http: HttpClient, private allUserService:AllUserService) {}

  latestSale() {
    const headers = this.allUserService.getHeadersWithToken()  
    return this.http.get<any>(`${this.apiUrl}latestSales`, {headers});
  }
  highestSelling() {
    const headers = this.allUserService.getHeadersWithToken()  
    return this.http.get<any>(`${this.apiUrl}highestSelling`, {headers});
  }
  saleCount(){
    const headers = this.allUserService.getHeadersWithToken()  
    return this.http.get<any>(`${this.apiUrl}salesCount`, {headers});
  }
  salesRevenue(){
    const headers = this.allUserService.getHeadersWithToken()  
    return this.http.get<any>(`${this.apiUrl}salesRevenue`, {headers});
  }
  saleProduct(
    productId: string,
    saleData: any
  ) {
    const headers = this.allUserService.getHeadersWithToken();
    return this.http.post<any>(`${this.apiUrl}${productId}`, saleData, {
      headers
    });
  }
  viewSale(id: string) {
    const headers = this.allUserService.getHeadersWithToken();
    return this.http.get<any>(`${this.apiUrl}view/${id}`, { headers });
  }
}
