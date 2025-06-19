import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error = '';
  searchQuery = '';
  selectedRole = 'all';
  editingUser: User | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.adminService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Errore nel caricamento degli utenti:', err);
        this.error = 'Si è verificato un errore nel caricamento degli utenti.';
        this.loading = false;
      }
    });
  }

  startEdit(user: User): void {
    this.editingUser = { ...user };
  }

  cancelEdit(): void {
    this.editingUser = null;
  }

  saveEdit(): void {
    if (!this.editingUser) return;
    
    this.adminService.updateUser(this.editingUser.id, this.editingUser).subscribe({
      next: () => {
        const index = this.users.findIndex(u => u.id === this.editingUser!.id);
        if (index >= 0) {
          this.users[index] = { ...this.editingUser! };
        }
        this.editingUser = null;
        alert('Utente aggiornato con successo!');
      },
      error: (err) => {
        console.error('Errore nell\'aggiornamento dell\'utente:', err);
        alert('Si è verificato un errore nell\'aggiornamento dell\'utente.');
      }
    });
  }

  deleteUser(id: number): void {
    if (confirm('Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.')) {
      this.adminService.deleteUser(id).subscribe({
        next: () => {
          this.users = this.users.filter(user => user.id !== id);
          alert('Utente eliminato con successo!');
        },
        error: (err) => {
          console.error('Errore nell\'eliminazione dell\'utente:', err);
          alert('Si è verificato un errore nell\'eliminazione dell\'utente.');
        }
      });
    }
  }

  get filteredUsers(): User[] {
    let result = this.users;
    
    // Filtra per ruolo
    if (this.selectedRole !== 'all') {
      result = result.filter(user => user.role === this.selectedRole);
    }
    
    // Filtra per query di ricerca
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    }
    
    return result;
  }
}
