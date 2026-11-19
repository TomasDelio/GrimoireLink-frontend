import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CampaignService } from '../../data-access/campaign-service';
import { CampaignRequest } from '../../data-access/campaign.model';
import { finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { CampaignContextService } from '../../data-access/campaign-context-service';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-campaign-form',
  styleUrl: './campaign-form.css',
  templateUrl: './campaign-form.html',
})
export class CampaignForm {

  private readonly campaignService = inject(CampaignService);
  private readonly router = inject(Router);
  private readonly campaignContext = inject(CampaignContextService);

  campaign: CampaignRequest = {
    name: '',
    description: ''
  };

  isLoading = signal(false);
  errorMessage = signal('');

  createCampaign(form: NgForm): void {
    if (form.invalid || this.isLoading()) {
      return;
    }

    const data: CampaignRequest = {
      name: this.campaign.name.trim(),
      description: this.campaign.description.trim()
    };

    if (!data.name || !data.description) {
      this.errorMessage.set('Completa todos los campos.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.campaignService.createCampaign(data)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: () => {
          this.campaignContext.load();
          this.router.navigate(['/campanias']);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.errorMessage.set(
              'Revisa el nombre y la descripcion.'
            );
          } else if (error.status === 401) {
            this.errorMessage.set(
              'Tu sesion no es valida. Inicia sesion nuevamente.'
            );
          } else if (error.status === 0) {
            this.errorMessage.set(
              'No se pudo conectar con el servidor.'
            );
          } else {
            this.errorMessage.set(
              'No se pudo crear la campana.'
            );
          }
        }
      });
  }
}
