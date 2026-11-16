import { Component, inject, OnInit } from '@angular/core';
import { DiceRoller } from '../../shared/components/dice-roller/dice-roller';
import { EnemyManager } from '../../shared/components/enemy-manager/enemy-manager';
import { ActivatedRoute } from '@angular/router';

@Component({
  imports: [DiceRoller,EnemyManager],
  selector: 'app-encounters',
  styleUrl: './encounters.css',
  templateUrl: './encounters.html',
})
export class Encounters implements OnInit{

  private readonly route = inject(ActivatedRoute);

  //Aca asocia este ID al encuentro 
  //seleccionado por el usuario una vez que la funcionalidad de 
  //la gestion de encuentros esté lista

  selectedEncounterId: string | null = null;
  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.selectedEncounterId = params.get('encounterId');
    });
  }
}
