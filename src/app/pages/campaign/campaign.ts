import { Component, inject, OnInit, signal } from '@angular/core';
import { CampaignService } from '../../core/services/campaign-service';
import { Campaign as CampaignModel } from '../../models/campaign';
@Component({
  imports: [],
  selector: 'app-campaign',
  styleUrl: './campaign.css',
  templateUrl: './campaign.html',
})
export class Campaign implements OnInit{

  private readonly campaignService = inject(CampaignService);

  campaigns = signal<CampaignModel[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  ngOnInit(): void {
    this.loadCampaigns();
  }

  loadCampaigns(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.campaignService.getCampaigns().subscribe({
      next: (campaigns) => {
        this.campaigns.set(campaigns);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las campanas.');
        this.isLoading.set(false);
      }
    });
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
}
