import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign-service';
import { CampaignMember } from '../../../models/campaign-member';
import { Campaign as CampaignModel } from '../../../models/campaign';
import { finalize, forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { UserService } from '../../../auth/data-access/user-service';
import { HttpErrorResponse } from '@angular/common/http';
import { CampaignEncounters } from '../../../encounters/features/campaign-encounters/campaign-encounters';


@Component({
  imports: [RouterLink, DatePipe,FormsModule, CampaignEncounters],
  selector: 'app-campaign-detail',
  styleUrl: './campaign-detail.css',
  templateUrl: './campaign-detail.html',
})
export class CampaignDetail implements OnInit{
 
  private readonly campaignService = inject(CampaignService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  

  campaign = signal<CampaignModel | null>(null);
  members = signal<CampaignMember[]>([]);

  isLoading = signal(false);
  isSaving = signal(false);
  isDungeonMaster = signal(false);

  errorMessage = signal('');
  statusError = signal('');
  statusSuccess = signal('');

  selectedStatus = signal<CampaignModel['status']>('ACTIVE');

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
    this.isDungeonMaster.set(false);

    forkJoin({
      campaign: this.campaignService.getCampaignById(publicId),
      members: this.campaignService.getCampaignMembers(publicId),
      user: this.userService.getCurrentUser()
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: ({ campaign, members, user }) => {
        this.campaign.set(campaign);
        this.members.set(members);
        this.selectedStatus.set(campaign.status);

        const isDm = members.some(
          member =>
            member.publicId === user.publicId &&
            member.role === 'DUNGEON_MASTER'
        );

        this.isDungeonMaster.set(isDm);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar la informacion de la campana.'
        );
      }
    });
  }

  saveStatus(): void {
    const campaign = this.campaign();

    if (!campaign || !this.isDungeonMaster() ||
        this.isSaving() ||
        campaign.status === this.selectedStatus()) {
      return;
    }

    this.isSaving.set(true);
    this.statusError.set('');
    this.statusSuccess.set('');

    this.campaignService.updateCampaignStatus(
      campaign.publicId,
      this.selectedStatus()
    )
    .pipe(finalize(() => this.isSaving.set(false)))
    .subscribe({
      next: updated => {
        this.campaign.set(updated);
        this.selectedStatus.set(updated.status);
        this.campaignContext.updateCampaign(updated);

        this.statusSuccess.set(
          'Estado actualizado correctamente.'
        );
      },
      error: (error: HttpErrorResponse) => {
        if (error.status === 403) {
          this.statusError.set(
            'Solo el Dungeon Master puede cambiar el estado.'
          );
        } else if (error.status === 401) {
          this.statusError.set(
            'Tu sesion ha expirado. Inicia sesion nuevamente.'
          );
        } else {
          this.statusError.set(
            'No se pudo actualizar el estado.'
          );
        }
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
