import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CategoryService } from 'src/app/service/Category.service';
import { AuthService } from 'src/app/service/auth.service';
import { NgModel } from '@angular/forms';
import * as XLSX from 'xlsx';
@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css'],
})
export class CategoryComponent implements OnInit {
  categories: any[] = [];
  addedCategory: any = {};
  id: any;
  selectedCategory: any = {};
  searchTerm: string = '';
  originalCategories: any[] = [];

  constructor(
    private categoryService: CategoryService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.categoryList();
    this.searchCategories();
  }

  categoryList(): void {
    this.categoryService.categroyList().subscribe(
      (res: any) => {
        if (res.success) {
          this.categories = res.categories;
          this.originalCategories = [...this.categories];
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  newCategory(): void {
    this.categoryService.categroyCreate(this.addedCategory).subscribe(
      (res: any) => {
        if (res.success) {
          this.toastr.success(res.message, 'Success');
          this.categoryList();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error.message, 'Error');
      }
    );
  }

  reloadWebsite(): void {
    window.location.reload();
  }
  roll() {
    return this.authService.getRoll();
  }

  exportToExcel(): void {
    const data = this.categories.map((categories: any, index: number) => ({
      'S.N': index + 1,
      id: categories.id,
      Name: categories.name,
      Code: categories.code,
      'Available Volume': categories.volume,
      Shelf: categories.catNum,
      createdAt: categories.createdAt,
      updatedAt: categories.updatedAt,
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Category');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveExcelFile(excelBuffer, 'Category.xlsx');
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
  selectCategory(category: any): void {
    this.selectedCategory = { ...category };
  }

  editCategory(): void {
    this.categoryService
      .updateCategory(this.selectedCategory.id, this.selectedCategory)
      .subscribe(
        (res: any) => {
          console.log(this.selectedCategory);
          if (res.success) {
            this.toastr.success(res.message, 'Success');
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        (error: any) => {
          this.toastr.error(error, 'Error');
        }
      );
  }
  removeCategory(index: number): void {
    const id = this.categories[index].id;
    console.log('Test', id);
    var c = confirm('Are you sure you want to delete this category?');
    if (c == true) {
      this.categoryService.deleteCategory(id).subscribe(
        (res: any) => {
          if (res.success) {
            this.categoryList();
            this.toastr.success(res.message, 'Success');
          }
        },
        (error: any) => {
          this.toastr.error(error.error.message, 'Error');
        }
      );
    } else {
      this.toastr.warning('Category deletion cancelled', 'Error');
    }
  }

  updateCategory() {
    this.categoryService
      .updateCategory(this.selectedCategory.id, this.selectedCategory)
      .subscribe(
        (res: any) => {
          if (res.success) {
            // alert('Category Updated Successfully');
            this.toastr.success(res.message, 'Success');
            this.categoryList();
          } else {
            this.toastr.error(res.message, 'Error');
          }
        },
        (error: any) => {
          this.toastr.error(error.error.message, 'Error');
          
        }
      );
  }

  searchCategories(): void {
    const trimmedSearchTerm = this.searchTerm.trim(); // Trim the search input

    if (!trimmedSearchTerm) {
      // If the trimmed search input is empty or contains only spaces, show all categories from the original list
      this.categories = [...this.originalCategories];
    } else {
      // Convert the trimmed search term to lowercase for case-insensitive search
      const searchTermLower = trimmedSearchTerm.toLowerCase();

      // Filter categories based on the trimmed search input for name or code
      this.categories = this.originalCategories.filter(
        (category) =>
          category.name.toLowerCase().includes(trimmedSearchTerm) ||
          category.code.toLowerCase().includes(trimmedSearchTerm) ||
          category.catNum.toLowerCase().includes(trimmedSearchTerm)
      );

      // If no matches are found, you can display a message or handle it as needed
      if (this.categories.length === 0) {
        console.log('No matching categories found.');
      }
    }
  }
}
