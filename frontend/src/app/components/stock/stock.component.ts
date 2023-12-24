import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/service/Product.service';
import { AuthService } from 'src/app/service/auth.service';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.css'],
})
export class StockComponent implements OnInit {
  @ViewChild('saleDetailsModal') saleDetailsModal!: ElementRef;
  stock: any = [];
  searchTerm: string = '';
  filteredStock: any[] = [];
  originalStock: any[] = [];
  productInfo: any = {};
  userName: any;

  constructor(
    private Product: ProductService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.Stock();
  }

  saveUpdatedStock() {
    this.Product.updateProduct(this.productInfo).subscribe(
      (res: any) => {
        if (res.success) {
          this.Stock();
          this.toastr.success(res.message, 'Success');
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error.error.message, 'Error');
      }
    );
  }

  Stock(): void {
    this.Product.Stock().subscribe(
      (res: any) => {
        if (res.success) {
          this.stock = res.products;
          this.originalStock = [...this.stock];
          this.updateFilteredStock();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  removeStock(index: any): void {
    const id = this.stock[index].id;
    var r = confirm('Are you sure you want to delete this stock?');
    if (r == true) {
      this.Product.deleteProduct(id).subscribe(
        (res: any) => {
          if (res.success) {
            this.reloadWebsite();
            this.toastr.success(res.message, 'Success');
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        (error: any) => {
          this.toastr.error(error.message, 'Error');
        }
      );
    } else {
      this.toastr.warning('Stock deletion cancelled', 'Error');
    }
  }

  filterStock(event: any): void {
    const term = event.target.value.trim().toLowerCase(); // Trim and lowercase the search term
    this.searchTerm = term;
    this.updateFilteredStock();
  }

  updateFilteredStock(): void {
    if (this.searchTerm) {
      this.filteredStock = this.originalStock.filter((stockItem: any) =>
        stockItem.name.toLowerCase().includes(this.searchTerm)
      );
    } else {
      this.filteredStock = this.originalStock; // Reset to the original data
    }
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  roll() {
    return this.authService.getRoll();
  }

  editStock(index: number): void {
    this.productInfo = { ...this.stock[index] };
    this.userName = { ...this.stock[index] }; 
  }

  printSaleDetails() {
    // Show a confirmation dialog to the user
    const userConfirmed = window.confirm(
      'Are you sure you want to download the PDF file?'
    );

    if (userConfirmed) {
      const modalContent = this.saleDetailsModal.nativeElement;
      this.toastr.success('File downloaded successfully', 'Success');

      // Ensure the modal content exists
      if (!modalContent) {
        return;
      }

      // Hide the buttons in the modal for printing
      const printButton = modalContent.querySelector('.btn-primary');
      const closeButton = modalContent.querySelector('.btn-secondary');
      printButton.style.display = 'none';
      closeButton.style.display = 'none';

      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Capture the modal content as an image using html2canvas
      html2canvas(modalContent).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        // Calculate the aspect ratio to fit the width of the page (210 mm for A4)
        const imgWidth = 210; // Set your desired width here (A4 width)
        const imgHeight = (imgWidth / canvas.width) * canvas.height;

        // Add the captured image to the PDF
        pdf.addImage(imgData, 'png', 20, 20, imgWidth, imgHeight);

        // Save or open the PDF
        pdf.save('productInfo.pdf');

        // Show the buttons again after printing
        printButton.style.display = 'block';
        closeButton.style.display = 'block';
      });
    } else {
      // User canceled the action, show a toastr message or any other notification
      this.toastr.warning('Download cancelled by user', 'Warning');
    }
  }

  exportToExcel(): void {
    const data = this.filteredStock.map(
      (filteredStock: any, index: number) => ({
        'S.N': index + 1,
        id: filteredStock.id,
        Name: filteredStock.name,
        'Product code': filteredStock.code,
        Quantity: filteredStock.quantity,
        'Buying Price': filteredStock.bprice,
        'Selling Price': filteredStock.sprice,
        'Categroy Code': filteredStock.categoryCode,
        'Vendor Name': filteredStock.sname,
        'Vendor Email': filteredStock.semail,
        'Vendor Contact': filteredStock.scontact,
        createdAt: filteredStock.createdAt,
        updatedAt: filteredStock.updatedAt,
      })
    );
    // Show a confirmation dialog before proceeding with the download
    const confirmation = window.confirm(
      'Are you sure you want to download the Excel file?'
    );
    if (!confirmation) {
      this.toastr.warning('User cancelled the download', 'Error');
      return;
    }
    this.toastr.success('Excel file downloaded successfully', 'Success');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Stocks');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveExcelFile(excelBuffer, 'Stock.xlsx');
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
