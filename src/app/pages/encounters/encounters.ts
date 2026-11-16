import { Component } from '@angular/core';
import { DiceRoller } from '../../shared/components/dice-roller/dice-roller';

@Component({
  imports: [DiceRoller],
  selector: 'app-encounters',
  styleUrl: './encounters.css',
  templateUrl: './encounters.html',
})
export class Encounters {
}
