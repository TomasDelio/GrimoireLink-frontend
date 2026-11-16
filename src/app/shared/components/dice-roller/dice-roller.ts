import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-dice-roller',
  styleUrl: './dice-roller.css',
  templateUrl: './dice-roller.html',
})
export class DiceRoller implements OnInit {

    diceTypes: number[] = [4, 6, 8, 10, 12, 20, 100];

  selectedDice: number = 20;
  quantity: number = 1;
  modifier: number = 0;

  results: number[] = [];
  total: number | null = null;

  ngOnInit(): void {
    this.selectedDice = 20;
    this.quantity = 1;
    this.modifier = 0;
  }

  rollDice(): void {
    this.results = [];
    this.total = null;

    const quantity = Number(this.quantity);
    const modifier = Number(this.modifier);

    if (
      !this.diceTypes.includes(this.selectedDice) ||
      !Number.isInteger(quantity) ||
      quantity < 1 || quantity > 20 ||
      !Number.isInteger(modifier) ||
      modifier < -20 || modifier > 20
    ) {
      return;
    }

    for (let i = 0; i < quantity; i++) {
      const result = Math.floor(Math.random() * this.selectedDice) + 1;
      this.results.push(result);
    }

    this.total = this.results.reduce(
      (sum, value) => sum + value, 0
    ) + modifier;
  }

  selectDice(dice: number): void {
    this.selectedDice = dice;
    this.results = [];
    this.total = null;
  }

}
