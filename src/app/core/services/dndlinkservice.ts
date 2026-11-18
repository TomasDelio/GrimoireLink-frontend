import { Service, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { DndAbilityScore,DndClass,DndMonster,DndRace,DndReference,DndReferenceList,DndRule,DndSpell } from '../models/dndlinks';


const DND_BASE = 'https://www.dnd5eapi.co';
const DND_API = `${DND_BASE}/api/2014`;

type DndRes =
  | 'classes'
  | 'races'
  | 'monsters'
  | 'spells'
  | 'rules'
  | 'ability-scores'
  | 'skills';

@Service()
export class Dndlinkservice {

    private readonly http = inject(HttpClient); 

    getList(resource: DndRes): Observable<DndReference[]>{
        return this.getPage(resource).pipe(map((res) => res.results ));

    }


    getCount(resource: DndRes): Observable<number> {
    return this.getPage(resource).pipe(map((res) => res.count));
    }


    getOne<T>(resource:DndRes, index: string):Observable<T>{
            return this.http.get<T>(`${DND_API}/${resource}/${index}`);
    }

    getAll <T>(resource: DndRes): Observable<T[]> {
    return this.getList(resource).pipe(
      switchMap((list) =>
        list.length ? forkJoin(list.map((ref) => this.getOne<T>(resource, ref.index))) : of([]),
      ),
    );
  }


  getRules( index: string[]): Observable<DndRule[]>{
    return forkJoin(index.map((index) => this.getOne<DndRule>('rules', index)));

  }

   getAbilityScores(): Observable<DndAbilityScore[]> {
    return this.getAll<DndAbilityScore>('ability-scores');
  }

  getRaces(): Observable<DndRace[]> {
    return this.getAll<DndRace>('races');
  }

  getClasses(): Observable<DndClass[]> {
    return this.getAll<DndClass>('classes');
  }

  getRandomMonster():Observable<DndMonster>{
    return this.getList('monsters').pipe(switchMap((list) => this.getOne<DndMonster>('monsters',pickRandom(list).index)),
  );
}

getRandomSpell(): Observable<DndSpell> {
    return this.getList('spells').pipe(
      switchMap((list) => this.getOne<DndSpell>('spells', pickRandom(list).index)),
    );
  }

  
  imageUrl(path: string | undefined): string | null {
    return path ? `${DND_BASE}${path}` : null;
  }

  private getPage(resource: DndRes): Observable<DndReferenceList> {
    return this.http.get<DndReferenceList>(`${DND_API}/${resource}`);
  }
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}
