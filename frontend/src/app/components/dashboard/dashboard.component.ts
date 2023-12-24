import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SaleService } from 'src/app/service/Sale.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  @ViewChild('saleDetailsModal') saleDetailsModal!: ElementRef;
  sales: any[] = [];
  totalSale: number = 0;
  revenue: number = 0;
  totalCustomerCount: number = 0; // Initialize the customer count
  salesDetail: any = {};
  productInfo: any = {};
  userInfo: any = {};

  constructor(
    private saleService: SaleService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData(): void {
    this.topSelling();
    this.saleCount();
    this.totalRevenue();
    this.countTotalCustomers();
  }

  topSelling(): void {
    this.saleService.highestSelling().subscribe(
      (res: any) => {
        if (res.success) {
          this.sales = res.sales;
          this.countTotalCustomers();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }
  
  view(index: number): void {
    const id = this.sales[index].id;
    this.saleService.viewSale(id).subscribe(
      (res: any) => {
        if (res.success) {
          this.salesDetail = res.sales;
          this.productInfo = res.product;
          this.userInfo = res.user;
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  saleCount(): void {
    this.saleService.saleCount().subscribe(
      (res: any) => {
        if (res.success) {
          this.totalSale = res.sales;
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  totalRevenue(): void {
    this.saleService.salesRevenue().subscribe(
      (res: any) => {
        if (res.success) {
          this.revenue = res.totalRevenue;
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  countTotalCustomers(): void {
    const uniqueContacts = new Set(this.sales.map((sale) => sale.bcontact));
    this.totalCustomerCount = uniqueContacts.size;
  }

  exportToExcel(): void {
    const data = [
      {
        'Product Name': this.productInfo.name,
        'Product Code': this.productInfo.code,
        'Category Code': this.productInfo.categoryCode,
        Quantity: this.salesDetail.quantity,
        'Per Unit Cost': this.productInfo.sprice,
        'Customer Name': this.salesDetail.bname,
        Contact: this.salesDetail.bcontact,
        Email: this.salesDetail.bemail,
        Address: this.salesDetail.baddress,
        'Processed By': this.userInfo.name,
        'Total Cost': this.salesDetail.totalPrice,
        Date: this.salesDetail.createdAt,
      },
    ];

    // Show a confirmation dialog before proceeding with the download
    const confirmation = window.confirm(
      'Are you sure you want to download the Excel file?'
    );
    if (!confirmation) {
      this.toastr.warning('Download cancelled by user','Warning');
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

    this.saveExcelFile(excelBuffer, 'sale-details.xlsx');
  }

  saveExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = fileName;
    link.click();
  }

  printSaleDetails() {
    // Show a confirmation dialog to the user
    const userConfirmed = window.confirm('Are you sure you want to download the PDF file?');
  
    if (userConfirmed) { 
      const modalContent = this.saleDetailsModal.nativeElement;
      this.toastr.success('File downloaded successfully', 'Success');
      // Ensure the modal content exists
      if (!modalContent) {
        return;
      }
  
      // Hide the buttons in the modal for printing
      const printButton = modalContent.querySelector('.btn-primary');
      const exportButton = modalContent.querySelector('.btn-success');
      const closeButton = modalContent.querySelector('.btn-secondary');
      printButton.style.display = 'none';
      exportButton.style.display = 'none';
      closeButton.style.display = 'none';
  
      // Create a new jsPDF instance
      const pdf = new jsPDF('p', 'mm', 'a4');
  
      // Capture the modal content as an image using html2canvas
      html2canvas(modalContent).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
  
        // Calculate the aspect ratio to fit the width of the page (210 mm for A4)
        const imgWidth = 210; // Set your desired width here
        const imgHeight = (imgWidth / canvas.width) * canvas.height;
  
        // Add the captured image to the PDF
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
  
        // Save or open the PDF
        pdf.save('sale-details.pdf');
  
        // Show the buttons again after printing
        printButton.style.display = 'block';
        exportButton.style.display = 'block';
        closeButton.style.display = 'block';
      });
    } else {
      // User canceled the action, show a toastr message or any other notification
      this.toastr.warning('Download cancelled by user','Warning');
    }
  }
  
  
  
}
