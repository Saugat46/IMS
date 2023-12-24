import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/service/Product.service';
import { SaleService } from 'src/app/service/Sale.service';
import { AuthService } from 'src/app/service/auth.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-sell-product',
  templateUrl: './sell-product.component.html',
  styleUrls: ['./sell-product.component.css'],
})
export class SellProductComponent implements OnInit {
  sales: any;
  saleQuantity: any;
  stockQuantity: any = 0;
  saleData: any = {
    name: '', // Initialize the name property
  };
  selectedProductId: any;

  productData: any[] = [];


  userInfo: any;
  salesDetailsById: any;
  productInfoById: any;

  constructor(
    private saleService: SaleService,
    private productService: ProductService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.productInfo();
    this.fetchSales();
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  roll() {
    return this.authService.getRoll();
  }

  productInfo(): void {
    this.productService.Stock().subscribe((res: any) => {
      if (res.success) {
        this.productData = res.products;  
        console.log(this.productData)
      } else {
        this.toastr.error(res.message, 'Error');
      }
    });
  }
  

  fetchSales(): void {
    this.saleService.latestSale().subscribe((res: any) => {
      if (res.success) {
        this.sales = res.sales;  
        this.productInfo()

        this.invoice(0);  
      } else {
        this.toastr.error(res.message, 'Error');
      }
    });
  }
  
  onProductSelect(event: any) {
    const selectedProductName = event.target.value;
    const selectedProduct = this.productData.find(
      (product: any) => product.name === selectedProductName
    ); 
    if (selectedProduct) {
      this.saleData.name = selectedProductName; // Update the input field
      this.saleData.code = selectedProduct.code; // Set the code based on the selected product
      this.selectedProductId = selectedProduct.id; // Set the selected product's ID 
      this.stockQuantity = selectedProduct.quantity; // Set the selected product's ID
      console.log("im at stock qty",this.stockQuantity);
    }
  }
  
  sellProduct() { 
    this.saleService.saleProduct(this.selectedProductId, this.saleData).subscribe(
      
      (res: any) => { 
        if (res.success) {
          this.toastr.success(res.message, 'Success'); 
          this.fetchSales();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  invoice(index: number): void {
    const id = this.sales[index].id;
    this.saleService.viewSale(id).subscribe(
      (res: any) => {
        if (res.success) {
          this.salesDetailsById = res.sales;
          console.log(this.salesDetailsById)
          this.productInfoById = res.product;
          console.log(this.productInfoById)
          this.userInfo = res.user;
          console.log(this.userInfo)
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  exportToExcel(): void {
    const data = this.sales.map((sales: any, index: number) => ({
      'S.N': index + 1,
      id: sales.id,
      'Product Name': sales.detail,
      'Total Quantity': sales.quantity,
      'Total Price': sales.totalPrice,
      'Customer Name': sales.bname,
      'Customer Address': sales.baddress,
      'Customer Email': sales.bemail,
      'Customer Contact': sales.bcontact,
      createdAt: sales.createdAt,
      updatedAt: sales.updatedAt,
    }));

    // Show a confirmation dialog before proceeding with the download
    const confirmation = window.confirm(
      'Are you sure you want to download the Excel file?'
    );
    if (!confirmation) {
      this.toastr.warning('User Cancelled the download', 'Error');
      return;
    }

    this.toastr.success('File downloaded successfully', 'Success');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveExcelFile(excelBuffer, 'Sales.xlsx');
  }
  // Function to trigger the download of the Excel file
  saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  }
}
