import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Encounter, EncounterRequest, EncounterStatus } from './encounter.model';

@Service()
export class EncounterService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiURL}/encounters`;

  getByCampaign(campaignId: string) {
    return this.http.get<Encounter[]>(`${this.url}/campaign/${campaignId}`);
  }

  getById(id: string) {
    return this.http.get<Encounter>(`${this.url}/${id}`);
  }

  updateStatus(id: string, status: EncounterStatus) {
  return this.http.put<Encounter>(`${this.url}/${id}/status`, null, { params: { status } });
}

  add(encounter: EncounterRequest) {
    return this.http.post<Encounter>(this.url, encounter);
  }

  addMonster(id: string, monsterIndex: string) {
  return this.http.post<Encounter>(`${this.url}/${id}/monsters/${monsterIndex}`, null);
}

updateMonsterHp(id: string, monsterId: string, newHp: number) {
  return this.http.patch<Encounter>(`${this.url}/${id}/monsters/${monsterId}/hp`, null, {
    params: { newHp },
  });
}

  removeMonster(id: string, monsterId: string) {
    return this.http.delete<Encounter>(`${this.url}/${id}/monsters/${monsterId}`);
  }
}