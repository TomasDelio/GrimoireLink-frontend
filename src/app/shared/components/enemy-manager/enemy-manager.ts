import {Component,computed,inject,Input,OnInit,OnChanges,SimpleChanges,signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { MonsterService } from '../../../core/services/monster-service';
import { EncounterService } from '../../../core/services/encounter-service';
import { MonsterReference } from '../../../core/models/monster';
import { Encounter } from '../../../core/models/encounter';

@Component({
  selector: 'app-enemy-manager',
  imports: [FormsModule],
  templateUrl: './enemy-manager.html',
  styleUrl: './enemy-manager.css',
})
export class EnemyManager implements OnInit, OnChanges {

  @Input() encounterId: string | null = null;

  private readonly monsterService = inject(MonsterService);
  private readonly encounterService = inject(EncounterService);

  catalog = signal<MonsterReference[]>([]);
  encounter = signal<Encounter | null>(null);

  searchTerm = signal('');
  selectedMonster = signal<MonsterReference | null>(null);

  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal('');

  filteredMonsters = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    return this.catalog()
      .filter(monster =>
        monster.name.toLowerCase().includes(search)
      )
      .slice(0, 20);
  });

  ngOnInit(): void {
    this.loadCatalog();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['encounterId']) {
      this.encounter.set(null);

      if (this.encounterId) {
        this.loadEncounter();
      }
    }
  }

  loadCatalog(): void {
    this.monsterService.getMonsters().subscribe({
      next: monsters => {
        this.catalog.set(monsters);
      },
      error: () => {
        this.errorMessage.set(
          'No se pudo cargar el catalogo de monstruos.'
        );
      }
    });
  }

  loadEncounter(): void {
    const encounterId = this.encounterId;

    if (!encounterId) {
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.encounterService.getEncounterById(encounterId)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: encounter => {
          if (this.encounterId === encounterId) {
            this.encounter.set(encounter);
          }
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo cargar el encuentro.'
          );
        }
      });
  }

  selectMonster(monster: MonsterReference): void {
    this.selectedMonster.set(monster);
  }

  addMonster(): void {
    const monster = this.selectedMonster();
    const encounterId = this.encounterId;

    if (!monster || !encounterId || !this.encounter() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.encounterService
      .addMonster(encounterId, monster.index)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: encounter => {
          this.encounter.set(encounter);
          this.selectedMonster.set(null);
          this.searchTerm.set('');
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo agregar el monstruo.'
          );
        }
      });
  }

  updateHp(monsterId: string, newHp: number): void {
    const encounterId = this.encounterId;

    if (!encounterId || !this.encounter() ||
        this.isSaving() || !Number.isInteger(newHp)) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.encounterService
      .updateMonsterHp(encounterId, monsterId, newHp)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: encounter => {
          this.encounter.set(encounter);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudieron actualizar los puntos de golpe.'
          );
        }
      });
  }

  removeMonster(monsterId: string): void {
    const encounterId = this.encounterId;

    if (!encounterId || !this.encounter() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    this.encounterService
      .removeMonster(encounterId, monsterId)
      .pipe(finalize(() => this.isSaving.set(false)))
      .subscribe({
        next: encounter => {
          this.encounter.set(encounter);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo quitar el monstruo.'
          );
        }
      });
  }
}
