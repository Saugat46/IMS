import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ProductService } from 'src/app/service/Product.service';
import { AuthService } from 'src/app/service/auth.service';
import { CategoryService } from 'src/app/service/Category.service';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-purchase-product',
  templateUrl: './purchase-product.component.html',
  styleUrls: ['./purchase-product.component.css'],
})
export class PurchaseProductComponent implements OnInit {
  @ViewChild('exampleModal') exampleModal!: ElementRef;
  addedProduct: any = {};
  quantityEntered: boolean = false;
  recentPurchase: any[] = [];
  categories: any[] = [];
  uniqueVendors: Set<string> = new Set();
  uniqueVendorNames: Set<string> = new Set();
  uniqueVendorEmails: Set<string> = new Set();
  uniqueVendorContacts: Set<string> = new Set();
  searchTerm: string = '';
  filteredRecentPurchase: any[] = [];
  productInfo: any = {};
  userInfo: any = {};
  userName: any;

  constructor(
    private authService: AuthService,
    private product: ProductService,
    private categoryService: CategoryService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.recentProduct();
    this.categoryList();
    this.fetchCategories();
  }

  fetchCategories() {
    this.product.getAllCategories().subscribe(
      (response: any) => {
        if (response.success) {
          this.categories = response.categories;
        }
      },
      (error) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  recentProduct(): void {
    this.product.recent().subscribe(
      (res: any) => {
        if (res.success) {
          this.recentPurchase = res.purchase;
          // Initialize filteredRecentPurchase with all recent purchases
          this.filteredRecentPurchase = this.recentPurchase;
          // Extract unique vendor info from recentPurchase
          this.uniqueVendors = new Set<string>();
          this.recentPurchase.forEach((item) => {
            const vendorInfo = `${item.sname} (${item.semail}) - ${item.scontact}`;
            this.uniqueVendors.add(vendorInfo);
          });

          // Extract unique vendor names, emails, and contacts
          this.uniqueVendorNames = new Set<string>();
          this.uniqueVendorEmails = new Set<string>();
          this.uniqueVendorContacts = new Set<string>();

          this.recentPurchase.forEach((item) => {
            this.uniqueVendorNames.add(item.sname);
            this.uniqueVendorEmails.add(item.semail);
            this.uniqueVendorContacts.add(item.scontact);
          });
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  selectedCategoryCode: any = {};
  onCategorySelect() {
    // Find the category based on the selected category code
    const selectedCategory = this.categories.find(
      (category) => category.code === this.selectedCategoryCode
    );

    if (selectedCategory) {
      this.addedProduct.selectedCategory = selectedCategory.name;
    }
  }

  categoryList(): void {
    this.categoryService.categroyList().subscribe(
      (res: any) => {
        if (res.success) {
          this.categories = res.categories;

          // Apply the filter only if quantity has been entered
          if (this.quantityEntered) {
            this.categories = this.categories.filter(
              (category) => +category.volume >= this.addedProduct.quantity
            );
          }
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  newProduct(): void {
    this.addedProduct.categoryCode = this.selectedCategoryCode.code;
    this.product.productCreate(this.addedProduct).subscribe(
      (res: any) => {
        if (res.success) {
          this.toastr.success(res.message, 'Success');
          this.recentProduct();
        } else {
          this.toastr.error(res.message);
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  editProduct(index: number): void {
    this.productInfo = { ...this.recentPurchase[index] }; 
    console.log('im hereeee', this.productInfo)
  }

  saveUpdatedProduct() { 
    this.product.updateProduct(this.productInfo).subscribe(
      (res: any) => {
        if (res.success) {
          this.recentProduct();
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

  applyFilter(): void {
    // Trim leading and trailing spaces from the search term
    const trimmedSearchTerm = this.searchTerm.trim().toLowerCase();

    // If the trimmed search term is empty, show all recent purchases
    if (trimmedSearchTerm === '') {
      this.filteredRecentPurchase = this.recentPurchase;
    } else {
      // Otherwise, filter based on the trimmed search term
      this.filteredRecentPurchase = this.recentPurchase.filter(
        (purchase) =>
          purchase.name.toLowerCase().includes(trimmedSearchTerm) ||
          purchase.code.toLowerCase().includes(trimmedSearchTerm) ||
          purchase.quantity.toString().includes(trimmedSearchTerm) ||
          purchase.categoryCode.toLowerCase().includes(trimmedSearchTerm)
      );
    }
  }

  view(index: number): void {
    const id = this.filteredRecentPurchase[index].id;
    this.product.getProductById(id).subscribe(
      (res: any) => {
        if (res.success) {
          this.productInfo = res.product;
          this.userInfo = res.userInfo[0];
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  roll() {
    return this.authService.getRoll();
  }

  exportToExcel(): void {
    const data = this.recentPurchase.map(
      (recentPurchase: any, index: number) => ({
        'S.N': index + 1,
        Name: recentPurchase.name,
        Code: recentPurchase.code,
        Quantity: recentPurchase.quantity,
        'Purchase Price': recentPurchase.bprice,
        'Selling Price': recentPurchase.bprice,
        'Category Code': recentPurchase.categoryCode,
        createdAt: recentPurchase.createdAt,
        updatedAt: recentPurchase.updatedAt,
      })
    );

    // Show a confirmation dialog before proceeding with the download
    const confirmation = window.confirm(
      'Are you sure you want to download the Excel file?'
    );
    if (!confirmation) {
      this.toastr.warning('User canceled the download', 'Error');
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
      const modalContent = this.exampleModal.nativeElement;
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
  
        // Calculate the aspect ratio to fit the width ofp the page (210 mm for A4)
        const imgWidth = 360; // Set your desired width here
        const imgHeight = (imgWidth / canvas.width) * canvas.height;
  
        // Add the captured image to the PDF
        pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
  
        // Save or open the PDF
        pdf.save('product-details.pdf');
  
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
