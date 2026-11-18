import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { DiceRoller } from '../../../shared/components/dice-roller/dice-roller';
import { EnemyManager } from '../enemy-manager/enemy-manager';

@Component({
  imports: [DiceRoller, EnemyManager],
  selector: 'app-encounter-detail',
  styleUrl: './encounter-detail.css',
  templateUrl: './encounter-detail.html',
})
export class EncounterDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly queryParams = toSignal(this.route.queryParamMap);

  encounterId = computed(() => this.queryParams()?.get('encounterId') ?? null);
}
