import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Monster, MonsterReference } from '../../../core/models/monster';
import { MonsterService } from '../../../core/services/monster-service';
import { EncounterService } from '../../data-access/encounter-service';
import { Encounter } from '../../data-access/encounter.model';

@Component({
  selector: 'app-enemy-manager',
  imports: [FormsModule],
  templateUrl: './enemy-manager.html',
  styleUrl: './enemy-manager.css',
})
export class EnemyManager implements OnInit {
  private readonly monsterService = inject(MonsterService);
  private readonly encounterService = inject(EncounterService);

  encounterId = input<string | null>(null);

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
      .filter((monster) => monster.name.toLowerCase().includes(search))
      .slice(0, 20);
  });

  constructor() {
    effect(() => {
      const encounterId = this.encounterId();

      untracked(() => {
        this.encounter.set(null);

        if (encounterId) {
          this.loadEncounter(encounterId);
        }
      });
    });
  }

  ngOnInit() {
    this.loadCatalog();
  }

  loadCatalog() {
    this.monsterService.getMonsters().subscribe({
      next: (monsters) => this.catalog.set(monsters),
      error: () => this.errorMessage.set('No se pudo cargar el catálogo de monstruos.'),
    });
  }

  async loadEncounter(encounterId: string) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const encounter = await firstValueFrom(this.encounterService.getById(encounterId));

      if (this.encounterId() === encounterId) {
        this.encounter.set(encounter);
      }
    } catch {
      this.errorMessage.set('No se pudo cargar el encuentro.');
    } finally {
      this.isLoading.set(false);
    }
  }

  selectMonster(monster: MonsterReference) {
    this.selectedMonster.set(monster);
  }

  async addMonster() {
    const monster = this.selectedMonster();
    const encounterId = this.encounterId();

    if (!monster || !encounterId || !this.encounter() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      this.encounter.set(
        await firstValueFrom(this.encounterService.addMonster(encounterId, monster.index)),
      );
      this.selectedMonster.set(null);
      this.searchTerm.set('');
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo agregar el monstruo.'));
    } finally {
      this.isSaving.set(false);
    }
  }

  async updateHp(monsterId: string, newHp: number) {
    const encounterId = this.encounterId();

    if (!encounterId || !this.encounter() || this.isSaving() || !Number.isInteger(newHp)) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      this.encounter.set(
        await firstValueFrom(this.encounterService.updateMonsterHp(encounterId, monsterId, newHp)),
      );
    } catch (error) {
      this.errorMessage.set(
        this.getErrorMessage(error, 'No se pudieron actualizar los puntos de golpe.'),
      );
    } finally {
      this.isSaving.set(false);
    }
  }

    damage(monster: Monster, amount: number) {
    if (!this.isValidAmount(amount)) {
      this.errorMessage.set('Ingresá una cantidad entera mayor a 0.');
      return;
    }

    this.updateHp(monster.publicId, Math.max(monster.currentHp - amount, 0));
  }

  heal(monster: Monster, amount: number) {
    if (!this.isValidAmount(amount)) {
      this.errorMessage.set('Ingresá una cantidad entera mayor a 0.');
      return;
    }

    this.updateHp(monster.publicId, Math.min(monster.currentHp + amount, monster.maxHp));
  }

  async removeMonster(monsterId: string) {
    const encounterId = this.encounterId();

    if (!encounterId || !this.encounter() || this.isSaving()) {
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set('');

    try {
      this.encounter.set(
        await firstValueFrom(this.encounterService.removeMonster(encounterId, monsterId)),
      );
    } catch (error) {
      this.errorMessage.set(this.getErrorMessage(error, 'No se pudo quitar el monstruo.'));
    } finally {
      this.isSaving.set(false);
    }
  }

    private isValidAmount(amount: number) {
    return Number.isInteger(amount) && amount > 0;
  }

  private getErrorMessage(error: unknown, fallback: string) {
    if (error instanceof HttpErrorResponse && error.status === 403) {
      return 'Solo el Dungeon Master puede modificar el encuentro.';
    }

    return fallback;
  }
}