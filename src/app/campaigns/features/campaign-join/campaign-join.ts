import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CampaignService } from '../../../core/services/campaign-service';
import { CampaignContextService } from '../../data-access/campaign-context-service';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-campaign-join',
  styleUrl: './campaign-join.css',
  templateUrl: './campaign-join.html',
})
export class CampaignJoin {

  private readonly campaignService = inject(CampaignService);
  private readonly campaignContext = inject(CampaignContextService);
  private readonly router = inject(Router);

  readonly inviteCode = signal('');
  readonly isSubmitting = signal(false);
  readonly errorMessage = signal('');

  readonly isValidCode = computed(() =>
    /^[0-9]{6}$/.test(this.inviteCode())
  );

  onCodeChange(value: string): void {
    const code = value.replace(/\D/g, '').slice(0, 6);

    this.inviteCode.set(code);
    this.errorMessage.set('');
  }

  joinCampaign(): void {
    if (this.isSubmitting()) {
      return;
    }

    if (!this.isValidCode()) {
      this.errorMessage.set(
        'El codigo debe contener 6 digitos'
      );
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    this.campaignService
      .joinCampaign(this.inviteCode())
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({                
        next: campaign => {
          this.campaignContext.load(campaign.publicId);

          this.router.navigate([
            '/campanias',
            campaign.publicId
          ]);
        },
        error: (error: HttpErrorResponse) => {
          switch (error.status) {
            case 400:
              this.errorMessage.set(
                'El codigo ingresado no es valido.'
              );
              break;

            case 404:
              this.errorMessage.set(
                'No se encontro ninguna campana con ese codigo.'
              );
              break;

            case 409:
              this.errorMessage.set(
                'Ya perteneces a esta campana.'
              );
              break;

            case 401:
              this.errorMessage.set(
                'Tu sesion ha expirado. Inicia sesion nuevamente.'
              );
              break;

            case 403:
              this.errorMessage.set(
                'No tienes permiso para unirte a esta campana.'
              );
              break;

            default:
              this.errorMessage.set(
                'No se pudo completar la solicitud. Intenta nuevamente.'
              );
          }
        }
      });
  }
}
