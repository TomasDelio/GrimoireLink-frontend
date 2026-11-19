import { HttpClient } from '@angular/common/http';
import { inject, Injectable} from '@angular/core';
import { Observable } from 'rxjs';
import { Campaign, CampaignRequest } from '../../models/campaign';
import { CampaignMember } from '../../models/campaign-member';

@Injectable({
  providedIn: 'root'
})
export class CampaignService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/campaigns';

  getCampaigns(): Observable<Campaign[]> {
    return this.http.get<Campaign[]>(this.apiUrl);
  }

  getCampaignById(id: string): Observable<Campaign> {
    return this.http.get<Campaign>(
      `${this.apiUrl}/${id}`
    );
  }

  createCampaign(data: CampaignRequest): Observable<Campaign> {
    return this.http.post<Campaign>(
      this.apiUrl,
      data
    );
  }

  getCampaignMembers(id: string): Observable<CampaignMember[]> {
    return this.http.get<CampaignMember[]>(
      `${this.apiUrl}/${id}/members`
    );
  }

  updateCampaignStatus(
    id: string,
    status: Campaign['status']
  ): Observable<Campaign> {
    return this.http.patch<Campaign>(
      `${this.apiUrl}/${id}`,
      { status }
    );
  }

  joinCampaign(inviteCode: string): Observable<Campaign> {
    return this.http.post<Campaign>(
      `${this.apiUrl}/join`,
      null,
      {
        params: { inviteCode }
      }
    );
  }

}
