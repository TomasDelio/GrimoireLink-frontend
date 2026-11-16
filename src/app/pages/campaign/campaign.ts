import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CampaignService } from '../../core/services/campaign-service';
import { Campaign as CampaignModel } from '../../models/campaign';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
@Component({
  imports: [FormsModule,RouterLink],
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


searchTerm = signal('');
selectedStatus = signal('ALL');

filteredCampaigns = computed(() => {
  const search = this.searchTerm().trim().toLowerCase();
  const status = this.selectedStatus();

  return this.campaigns().filter(campaign => {
    const matchesName = campaign.name
      .toLowerCase()
      .includes(search);

    const matchesStatus =
      status === 'ALL' || campaign.status === status;

    return matchesName && matchesStatus;
  });
});

clearFilters(): void {
  this.searchTerm.set('');
  this.selectedStatus.set('ALL');
}


}
