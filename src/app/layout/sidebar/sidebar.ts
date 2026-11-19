import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CampaignContextService } from '../../campaigns/data-access/campaign-context-service';
import { Campaign } from '../../models/campaign';

type ViewMode='Dungeon Master'| 'Player';

@Component({
  imports: [RouterLink,RouterLinkActive,FormsModule],
  selector: 'app-sidebar',
  styleUrl: './sidebar.css',
  templateUrl: './sidebar.html',
})
export class Sidebar implements OnInit{
  
  readonly campaignContext = inject(CampaignContextService);

  ngOnInit(): void {
    this.campaignContext.load();
  }

  changeView(): void {
    this.campaignContext.changeView();
  }

  getStatusLabel(status: Campaign['status']): string {
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
