import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientsService } from '../services/clients.service';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-profile.component.html',
  styleUrl: './edit-profile.component.css'
})
export class EditProfileComponent implements OnInit {

  profile: any = {
    fname: '',
    lname: '',
    email: ''
  };

  constructor(private clientService: ClientsService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.clientService.getMyProfile().subscribe({
      next: (data) => {
        this.profile = data;
      },
      error: (err) => {
        console.error('Error loading profile', err);
      }
    });
  }

  save() {
    this.clientService.updateMyProfile(this.profile).subscribe({
      next: () => {
        alert('Profile updated successfully');
      },
      error: (err) => {
        console.error('Update error', err);
      }
    });
  }
}
