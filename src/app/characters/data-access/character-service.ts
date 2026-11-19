
import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { CharacterResponse } from './character.model';
import { environment } from '../../../environments/environment';

@Service()
export class CharacterService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/characters`;

  getById(characterId: string,campaignId: string): Observable<CharacterResponse> {
    return this.http.get<CharacterResponse>(`${this.apiUrl}/${characterId}`,
        {params: {campaignPublicId: campaignId}});
  }
  
}
