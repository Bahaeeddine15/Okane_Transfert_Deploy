import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ClientsService } from '../services/clients.service';
import { NotificationsService } from '../services/notification.service';
import { Router } from '@angular/router';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
	selector: 'app-client-dashboard-page',
	standalone: true,
	imports: [CommonModule, ChatbotComponent],
	templateUrl: './dashboard.page.html',
	styleUrl: './dashboard.page.css'
})
export class ClientDashboardPage implements OnInit {

	sentTransfers: any[] = [];
	receivedTransfers: any[] = [];

	totalTransfers = 0;
	pending = 0;
	success = 0;
	notifications = 0; // (si API dispo plus tard)

	lastSent: any[] = [];
	lastReceived: any[] = [];

	constructor(private clientService: ClientsService, private router: Router, private notifService: NotificationsService ) {}

	ngOnInit(): void {
	console.log('🔍 Dashboard Init - Chargement des transferts...');
	this.loadSent();
	this.loadReceived();
	this.loadNotifications();
	}

	loadNotifications() {
		this.notifService.getAll().subscribe({
			next: (data: any[]) => {
			this.notifications = data.length;
			},
			error: (err) => {
			console.error('❌ Erreur chargement notifications:', err);
			this.notifications = 0;
			}
		});
		}
	loadSent() {
	console.log('📤 Appel API: getSentTransfers()');
	
	this.clientService.getSentTransfers().subscribe({
		next: (data: any[]) => {
		console.log('✅ Transferts envoyés reçus:', data);
		console.log('📊 Nombre de transferts envoyés:', data.length);
		
		this.sentTransfers = data;
		this.computeStats();
		},
		error: (err) => {
		console.error('❌ Erreur chargement envoyés:', err);
		console.error('Status:', err.status);
		console.error('Message:', err.message);
		console.error('Error body:', err.error);
		}
	});
	}

	loadReceived() {
	console.log('📥 Appel API: getReceivedTransfers()');
	
	this.clientService.getReceivedTransfers().subscribe({
		next: (data: any[]) => {
		console.log('✅ Transferts reçus:', data);
		console.log('📊 Nombre de transferts reçus:', data.length);
		
		this.receivedTransfers = data;
		this.computeStats();
		},
		error: (err) => {
		console.error('❌ Erreur chargement reçus:', err);
		console.error('Status:', err.status);
		console.error('Message:', err.message);
		console.error('Error body:', err.error);
		}
	});
	}

	computeStats() {
	console.log('📈 Calcul des statistiques...');
	console.log('Sent:', this.sentTransfers.length, 'Received:', this.receivedTransfers.length);
	
	this.totalTransfers = this.sentTransfers.length + this.receivedTransfers.length;

	const all = [
		...this.sentTransfers,
		...this.receivedTransfers
	];

	this.pending = all.filter(t => t.status === 'PENDING').length;
	this.success = all.filter(t => t.status === 'PAID').length;

	this.lastSent = [...this.sentTransfers]
		.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
		.slice(0, 3);

	this.lastReceived = [...this.receivedTransfers]
		.sort((a, b) => new Date(b.paidAt ?? b.createdAt).getTime() - new Date(a.paidAt ?? a.createdAt).getTime())
		.slice(0, 3);
	}


	goToNotifications() {
	this.router.navigate(['/client/notifications']);
	}

	goToProfile() {
	this.router.navigate(['/client/profile']);
	}
}
