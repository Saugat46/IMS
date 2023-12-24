import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { SaleService } from 'src/app/service/Sale.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.css'],
})
export class CustomerDetailsComponent implements OnInit {
  sales: any;
  uniqueCustomers: any[] = [];
  filteredCustomers: any[] = [];
  searchTerm: string = '';

  constructor(
    private saleService: SaleService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.latestSale();
  }

  latestSale(): void {
    this.saleService.latestSale().subscribe(
      (res: any) => {
        if (res.success) {
          this.sales = res.sales;
          this.getUniqueCustomers();
          this.updateFilteredCustomers();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  searchCustomers(): void {
    // Convert the search term to lowercase for case-insensitive search
    const searchTermLower = this.searchTerm.trim().toLowerCase();

    if (searchTermLower === '') {
      // If the search term is empty or contains only spaces, load all data
      this.updateFilteredCustomers();
    } else {
      // Filter uniqueCustomers based on the search input for customer name
      this.filteredCustomers = this.uniqueCustomers.filter(
        (customer) =>
          customer.bname.toLowerCase().includes(searchTermLower) ||
          customer.bemail.toLowerCase().includes(searchTermLower) ||
          customer.bcontact.toLowerCase().includes(searchTermLower) ||
          customer.baddress.toLowerCase().includes(searchTermLower)
      );
    }
  }

  getUniqueCustomers(): void {
    const uniqueCustomersMap = new Map<string, any>();

    this.sales.forEach((sale: any) => {
      const customerKey = `${sale.bname}-${sale.bemail}-${sale.bcontact}-${sale.baddress}`;
      if (!uniqueCustomersMap.has(customerKey)) {
        uniqueCustomersMap.set(customerKey, {
          bname: sale.bname,
          bemail: sale.bemail,
          bcontact: sale.bcontact,
          baddress: sale.baddress,
        });
      }
    });

    this.uniqueCustomers = Array.from(uniqueCustomersMap.values());
    this.updateFilteredCustomers(); // Update filteredCustomers when uniqueCustomers change
  }

  updateFilteredCustomers(): void {
    // Initialize filteredCustomers with uniqueCustomers
    this.filteredCustomers = [...this.uniqueCustomers];
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  exportToExcel(): void {
    const data = this.filteredCustomers.map((customer: any, index: number) => ({
      'S.N': index + 1,
      Name: customer.bname,
      Email: customer.bemail,
      contact: customer.bcontact,
      Address: customer.baddress,
    }));

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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customers');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveExcelFile(excelBuffer, 'Customers.xlsx');
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
