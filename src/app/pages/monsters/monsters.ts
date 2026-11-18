import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MonsterService } from '../../core/services/monster-service';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { MonsterCatalogDetail, MonsterReference } from '../../core/models/monster';
import { FormsModule } from '@angular/forms';
import { DndMonster } from '../../core/models/dndlinks';
import { Dndlinkservice } from '../../core/services/dndlinkservice';

@Component({
  imports: [FormsModule],
  selector: 'app-monsters',
  styleUrl: './monsters.css',
  templateUrl: './monsters.html',
})
export class Monsters implements OnInit{
  private readonly monsterService = inject(MonsterService);
  private readonly dndService = inject(Dndlinkservice);

  private detailSubscription?: Subscription;
  private catalogSubscription?: Subscription;

  readonly monsters = signal<MonsterReference[]>([]);
  readonly searchTerm = signal('');

  readonly selectedMonster = signal<MonsterReference | null>(null);
  readonly monsterDetail = signal<MonsterCatalogDetail | null>(null);

  readonly monsterImageUrl = signal<string | null>(null);

  readonly isLoading = signal(false);
  readonly isDetailLoading = signal(false);

  readonly errorMessage = signal('');
  readonly detailError = signal('');

  readonly filteredMonsters = computed(() => {
    const search = this.searchTerm().trim().toLowerCase();

    return this.monsters().filter(monster =>
      monster.name.toLowerCase().includes(search) ||
      monster.index.toLowerCase().includes(search)
    );
  });

  ngOnInit(): void {
    this.loadMonsters();
  }

  ngOnDestroy(): void {
    this.catalogSubscription?.unsubscribe();
    this.detailSubscription?.unsubscribe();
  }

  loadMonsters(): void {
    this.catalogSubscription?.unsubscribe();

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.catalogSubscription = this.monsterService
      .getMonsters()
      .subscribe({
        next: monsters => {
          this.monsters.set(monsters);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set(
            'No se pudo cargar el bestiario.'
          );
          this.isLoading.set(false);
        }
      });
  }

  selectMonster(monster: MonsterReference): void {
    if (this.selectedMonster()?.index === monster.index) {
      return;
    }

    this.detailSubscription?.unsubscribe();

    this.selectedMonster.set(monster);
    this.monsterDetail.set(null);
    this.monsterImageUrl.set(null);

    this.detailError.set('');
    this.isDetailLoading.set(true);

    // Load monster stats and optional illustration.

    this.detailSubscription = forkJoin({
      detail: this.monsterService.getMonsterFromApi(
        monster.index
      ),

      artwork: this.dndService
        .getOne<Pick<DndMonster, 'image'>>(
          'monsters',
          monster.index
        )
        .pipe(
          catchError(() => of(null))
        )
    }).subscribe({
      next: ({ detail, artwork }) => {
        this.monsterDetail.set(detail);

        this.monsterImageUrl.set(
          this.dndService.imageUrl(artwork?.image)
        );

        this.isDetailLoading.set(false);
      },

      error: () => {
        this.detailError.set(
          'No se pudo consultar el monstruo.'
        );

        this.isDetailLoading.set(false);
      }
    });
  }

  retryDetail(): void {
    const monster = this.selectedMonster();

    if (!monster) {
      return;
    }

    this.selectedMonster.set(null);
    this.selectMonster(monster);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  onImageError(): void {
    this.monsterImageUrl.set(null);
  }
}
