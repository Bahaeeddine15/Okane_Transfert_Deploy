import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
	selector: 'app-close-cash-component',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './close-cash.component.html',
	styleUrl: './close-cash.component.css'
})
export class CloseCashComponent {}
