import { Component, OnInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { FirebaseAuthService } from '../../firebaseAuthService/firebase-auth.service';
import { toast } from 'ngx-sonner';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';


export interface User{
  id: string;
  email: string;
  disabled: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, NgClass],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
})
export default class UsersComponent implements OnInit {
  users: any[] = [];
  searchTerm: string = '';
  selectedUser: User | null = null;
  newPassword: string = '';
  loading: boolean = true;

  constructor(private firebaseAuthService: FirebaseAuthService) {}
  
  ngOnInit(): void {
    initFlowbite();
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.loading = true;
    this.firebaseAuthService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        toast.error('Error al cargar usuarios:', error);
        // console.error('Error al cargar usuarios:', error);
        this.loading = false;
      }
    });
  }
  onSearch(): void {
    // Implementar lógica de búsqueda
    const searchLower = this.searchTerm.toLowerCase();
    this.users = this.users.filter(user => 
      user.email.toLowerCase().includes(searchLower)
    );
  }

  editUser(user: User): void {
    this.selectedUser = { ...user };
    this.newPassword = '';
  }

  saveUser(): void {
    if (this.selectedUser && this.newPassword) {
      this.firebaseAuthService.updatePassword(this.selectedUser.id, this.newPassword).then(() => {
        this.loadUsers();
        this.selectedUser = null;
        this.newPassword = '';
        // toast.success('Usuario actualizado correctamente');
      }).catch(error => {
        toast.error('Error al actualizar la contraseña:', error);
        // console.error('Error al actualizar la contraseña:', error);
      });
    }
    
  }

  deleteUser(userId: string): void {
    this.firebaseAuthService.deleteUser(userId).then(() => {
      this.loadUsers();
    }).catch(error => {
      toast.error('Error al eliminar el usuario:', error);
      // console.error('Error al eliminar usuario:', error);
    });
  }

  toggleUserStatus(user: User): void {
    this.firebaseAuthService.disableUser(user.id, !user.disabled).then(() => {
      this.loadUsers();
    }).catch(error => {
      toast.error('Error al cambiar el estado del usuario:', error);
      // console.error('Error al cambiar el estado del usuario:', error);
    });
  }

}

