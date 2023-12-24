import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { AllUserService } from 'src/app/service/allUser.service'; 
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-system-user',
  templateUrl: './system-user.component.html',
  styleUrls: ['./system-user.component.css'],
})
export class SystemUserComponent implements OnInit {
  users: any = [];
  newUser: any = {};
  selectedUser: any = { roleIds: [] };
  selectedRoleIds: number[] = [];
  isNewUser: boolean = true;
  selectedRoles = [];
  searchTerm: string = '';
  originalUsers: any[] = [];

  roleMappings: { id: number; name: string }[] = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'Editor' },
    { id: 3, name: 'User' },
    // Add more role mappings as needed
  ];

  constructor(
    private allUserService: AllUserService,
    private toastr: ToastrService, 
  ) {}

  ngOnInit() {
    this.fetchUsers();
  }

  registerUser() {
    this.allUserService.registerUser(this.newUser).subscribe(
      (response: any) => {
        if (response.success) { 
          this.toastr.success(response.message, 'Success');
          this.fetchUsers();
        } else {
          this.toastr.error(response.message, 'Error');
        }
      },
      (error) => {
        this.toastr.error(error.message, 'Error');
      }
    );
  }

  updateSelectedRoles(selectedRoles: number[]) {
    this.selectedUser.roleIds = selectedRoles;
  }

  updateUser() {
    this.allUserService
      .updateUser(this.selectedUser.id, this.selectedUser)
      .subscribe(
        (response: any) => {
          if (response.success) {
            this.toastr.success(response.message, 'Success');
            this.fetchUsers();
          } else {
            this.toastr.error(response.message, 'Error');
          }
        },
        (error) => {
          this.toastr.error(error.message, 'Error');
        }
      );
  }

  fetchUsers(): void {
    this.allUserService.listUsers().subscribe(
      (res: any) => {
        if (res.success) {
          this.users = res.usersWithRoles;
          this.originalUsers = [...this.users];
          this.filterUsers();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      (error: any) => {
        this.toastr.error(error, 'Error');
      }
    );
  }

  deleteUser(index: number): void {
    const user = this.users[index];
  
    if (!user) {
      this.toastr.error('User not found', 'Error');
      return;
    }
  
    const confirmation = window.confirm('Are you sure you want to delete this user?');
  
    if (confirmation) {
      this.allUserService.deleteUser(user.id).subscribe(
        (response: any) => {
          if (response && response.success) {
            this.toastr.success('User has been deleted', 'Success');
            this.users.splice(index, 1);
          } else {
            this.toastr.error(response?.message || 'An error occurred', 'Error');
          }
        },
        (error: any) => {
          this.toastr.error(error?.message || 'An error occurred', 'Error');
        }
      );
    } else {
      this.toastr.warning('User deletion canceled', 'Warning');
    }
  }
  
  

  selectUser(user: any): void {
    this.selectedUser = { ...user }; 
  }

  clearForm(): void {
    this.newUser = {};
  }

  filterUsers(): void {
    const searchTermLower = this.searchTerm.toLowerCase().trim();
    if (searchTermLower === '') {
      // If the search term is empty, show all users
      this.users = [...this.originalUsers];
    } else {
      // Filter users based on the search input for name or email
      this.users = this.originalUsers.filter(
        (user: any) =>
          user.name.toLowerCase().includes(searchTermLower) ||
          user.email.toLowerCase().includes(searchTermLower)
      );
    }
  }

  reloadWebsite(): void {
    window.location.reload();
  }

  //excell code begins here
  exportToExcel(): void {
    const data = this.users.map((user: any, index: number) => ({
      'S.N': index + 1,
      id: user.id,
      Name: user.name,
      Email: user.email,
      Contact: user.phone,
      Address: user.address,
      Role: user.roles.join(', '),
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
    XLSX.utils.book_append_sheet(workbook, worksheet, 'User List');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    this.saveExcelFile(excelBuffer, 'UserList.xlsx');
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
