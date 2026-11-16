import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { Encounter } from '../models/encounter';

@Injectable({
  providedIn: 'root'
})export class EncounterService {

    private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/encounters`;

  getEncounterById(id: string): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.apiUrl}/${id}`);
  }

  addMonster(
    encounterId: string,
    monsterIndex: string
  ): Observable<Encounter> {
    return this.http.post<Encounter>(
      `${this.apiUrl}/${encounterId}/monsters/${encodeURIComponent(monsterIndex)}`,
      {}
    );
  }

  updateMonsterHp(
    encounterId: string,
    monsterId: string,
    newHp: number
  ): Observable<Encounter> {
    const params = new HttpParams().set('newHp', newHp);

    return this.http.patch<Encounter>(
      `${this.apiUrl}/${encounterId}/monsters/${monsterId}/hp`,
      {},
      { params }
    );
  }

  removeMonster(
    encounterId: string,
    monsterId: string
  ): Observable<Encounter> {
    return this.http.delete<Encounter>(
      `${this.apiUrl}/${encounterId}/monsters/${monsterId}`
    );
  }
}
