import { HttpClient } from '@angular/common/http';
import { inject, Injectable, Service } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MonsterReference } from '../models/monster';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MonsterService {

     private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiURL}/monster`;

  getMonsters(): Observable<MonsterReference[]> {
    return this.http.get<MonsterReference[]>(
      `${this.apiUrl}/catalog`
    );
  }

}
