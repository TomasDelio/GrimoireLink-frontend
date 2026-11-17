import { computed, inject, Service, signal } from '@angular/core';
import { forkJoin, finalize } from 'rxjs';
import { AuthService } from '../../auth/data-access/auth-service';
import { CampaignService } from '../../core/services/campaign-service';
import { Campaign } from '../../models/campaign';
import { UserService } from '../../auth/data-access/user-service';

@Service()
export class CampaignContextService {

  private readonly authService = inject(AuthService);
  private readonly campaignService = inject(CampaignService);
  private readonly userService = inject(UserService);

  private userId: string | null = null;

  campaigns = signal<Campaign[]>([]);
  selectedId = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  selectedCampaign = computed(() =>
    this.campaigns().find(
      campaign => campaign.publicId === this.selectedId()
    ) ?? null
  );

  load(): void {
    if (!this.authService.isAuthenticated()) {
      this.reset();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      user: this.userService.getCurrentUser(),
      campaigns: this.campaignService.getCampaigns()
    })
    .pipe(finalize(() => this.isLoading.set(false)))
    .subscribe({
      next: ({ user, campaigns }) => {
        if (!this.authService.isAuthenticated()) return;

        this.userId = user.publicId;
        this.campaigns.set(campaigns);

        const key = this.getStorageKey();
        const savedId = localStorage.getItem(key);

        const selected = campaigns.find(
          campaign => campaign.publicId === savedId
        ) ?? (campaigns.length === 1 ? campaigns[0] : null);

        this.selectedId.set(selected?.publicId ?? null);

        if (selected) {
          localStorage.setItem(key, selected.publicId);
        } else {
          localStorage.removeItem(key);
        }
      },
      error: () => {
        this.campaigns.set([]);
        this.selectedId.set(null);
        this.errorMessage.set(
          'No se pudieron cargar las campanas.'
        );
      }
    });
  }

  selectCampaign(id: string): void {
    const selected = this.campaigns().find(
      campaign => campaign.publicId === id
    );

    this.selectedId.set(selected?.publicId ?? null);

    if (!this.userId) return;

    const key = this.getStorageKey();

    if (selected) {
      localStorage.setItem(key, selected.publicId);
    } else {
      localStorage.removeItem(key);
    }
  }

  updateCampaign(updated: Campaign): void {
    this.campaigns.update(campaigns =>
      campaigns.map(campaign =>
        campaign.publicId === updated.publicId
          ? updated
          : campaign
      )
    );
  }

  reset(): void {
    this.userId = null;
    this.campaigns.set([]);
    this.selectedId.set(null);
    this.errorMessage.set('');
    this.isLoading.set(false);
  }

  private getStorageKey(): string {
    return `grimoirelink:campaign:${this.userId}`;
  }
}
