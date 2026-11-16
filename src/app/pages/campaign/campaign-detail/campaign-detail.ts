import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign-service';
import { CampaignMember } from '../../../models/campaign-member';
import { Campaign as CampaignModel } from '../../../models/campaign';
import { forkJoin } from 'rxjs';
import { Campaign } from '../campaign';

@Component({
  imports: [RouterLink, DatePipe],
  selector: 'app-campaign-detail',
  styleUrl: './campaign-detail.css',
  templateUrl: './campaign-detail.html',
})
export class CampaignDetail implements OnInit{
  
  private readonly campaignService = inject(CampaignService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  campaign = signal<CampaignModel | null>(null);
  members = signal<CampaignMember[]>([]);

  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    const publicId = this.route.snapshot.paramMap.get('publicId');

    if (!publicId) {
      this.router.navigate(['/campanias']);
      return;
    }

    this.loadCampaignDetails(publicId);
  }

  loadCampaignDetails(publicId: string): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      campaign: this.campaignService.getCampaignById(publicId),
      members: this.campaignService.getCampaignMembers(publicId)
    }).subscribe({
      next: ({ campaign, members }) => {
        this.campaign.set(campaign);
        this.members.set(members);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar la informacion de la campana.'
        );
        this.isLoading.set(false);
      }
    });
  }

  retry(): void {
    const publicId = this.route.snapshot.paramMap.get('publicId');

    if (publicId) {
      this.loadCampaignDetails(publicId);
    }
  }

  getStatusLabel(status: CampaignModel['status']): string {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'PAUSED':
        return 'Pausada';
      case 'FINISHED':
        return 'Finalizada';
      default:
        return 'Desconocido';
    }
  }

  getRoleLabel(role: CampaignMember['role']): string {
    switch (role) {
      case 'DUNGEON_MASTER':
        return 'Dungeon Master';
      case 'PLAYER':
        return 'Jugador';
      default:
        return 'Desconocido';
    }
  }
}
