import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ProductService } from 'src/app/service/Product.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-vendor-details',
  templateUrl: './vendor-details.component.html',
  styleUrls: ['./vendor-details.component.css'],
})
export class VendorDetailsComponent implements OnInit {
  uniqueVendors: any[] = [];
  filteredVendors: any[] = [];
  stockProducts: any[] = [];
  searchTerm: string = '';

  constructor(
    private productService: ProductService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.Stock();
  }

  Stock(): void {
    this.productService.Stock().subscribe(
      (res: any) => {
        if (res.success) {
          this.stockProducts = res.products;
          this.getUniqueVendor(this.stockProducts);
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  getUniqueVendor(stockProducts: any[]): void {
    const uniqueVendorMap = new Map<string, any>();

    stockProducts.forEach((product: any) => {
      const vendorKey = `${product.sname}-${product.semail}-${product.scontact}`;
      if (!uniqueVendorMap.has(vendorKey)) {
        uniqueVendorMap.set(vendorKey, {
          sname: product.sname,
          semail: product.semail,
          scontact: product.scontact,
          saddress: product.saddress,
        });
      }
    });

    this.uniqueVendors = Array.from(uniqueVendorMap.values());
    this.filteredVendors = [...this.uniqueVendors]; // Initialize filteredVendors with all vendors
  }

  applyFilter(): void {
    if (this.searchTerm) {
      const trimmedSearchTerm = this.searchTerm.trim().toLowerCase();

      // Filter stockProducts based on the search term
      const filteredProducts = this.stockProducts.filter((product) => {
        return (
          product.sname.toLowerCase().includes(trimmedSearchTerm) ||
          product.semail.toLowerCase().includes(trimmedSearchTerm) ||
          product.scontact.includes(trimmedSearchTerm) ||
          product.quantity.toString().includes(trimmedSearchTerm)
        );
      });

      // Extract unique vendors from the filtered products
      const uniqueVendorMap = new Map<string, any>();
      filteredProducts.forEach((product: any) => {
        const vendorKey = `${product.sname}-${product.semail}-${product.scontact}`;
        if (!uniqueVendorMap.has(vendorKey)) {
          uniqueVendorMap.set(vendorKey, {
            sname: product.sname,
            semail: product.semail,
            scontact: product.scontact,
            saddress: product.saddress,
          });
        }
      });

      // Update filteredVendors with unique vendors from the filtered products
      this.filteredVendors = Array.from(uniqueVendorMap.values());
    } else {
      this.filteredVendors = [...this.uniqueVendors]; // Reset to all unique vendors
    }
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  exportToExcel(): void {
    const data = this.filteredVendors.map(
      (filteredVendors: any, index: number) => ({
        'S.N': index + 1,
        Name: filteredVendors.sname,
        Email: filteredVendors.semail,
        contact: filteredVendors.scontact,
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

    this.toastr.success('File downloaded successfully', 'Success');
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendors');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveExcelFile(excelBuffer, 'Vendors.xlsx');
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
