import { Component , inject,signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {DndLinksService} from '../../../core/services/dndlinks.service';
import {map,Observable} from 'rxjs';
import {
  DndAbilityScore,
  DndClass,
  DndMonster,
  DndRace,
  DndReference,
  DndRule,
  DndSpell,
} from '../../../core/models/dndlinks';

interface InfoItem {
  title: string;
  description: string;
}

interface Section<T> {
  data: T | null;
  error: boolean;
}

const RULE_CHAPTERS: Record<string, string> = {
  'using-ability-scores':
    'Cómo se resuelven las acciones: tirás un d20, sumás tu modificador y comparás con la dificultad.',
  adventuring: 'Viajar, explorar, descansar y sobrevivir a trampas, enfermedades y al entorno.',
  combat:
    'El combate se juega por turnos según la iniciativa: moverse, atacar, cubrirse y curarse.',
  spellcasting:
    'Cómo funcionan los conjuros: espacios de conjuro, componentes, alcance y duración.',
};

const ABILITY_INFO: Record<string, { abbr: string; text: string }> = {
  str: { abbr: 'FUE', text: 'Poder físico y fuerza bruta.' },
  dex: { abbr: 'DES', text: 'Agilidad, reflejos y equilibrio.' },
  con: { abbr: 'CON', text: 'Salud, aguante y resistencia.' },
  int: { abbr: 'INT', text: 'Razonamiento y memoria.' },
  wis: { abbr: 'SAB', text: 'Percepción e intuición.' },
  cha: { abbr: 'CAR', text: 'Fuerza de personalidad.' },
}

@Component({
  imports: [RouterLink],
  selector: 'app-home-public',
  styleUrl: './home-public.css',
  templateUrl: './home-public.html',
})
export class HomePublic implements OnInit {
private readonly dnd = inject(DndLinksService);


rules = signal<Section<DndRule[]>>({ data: null, error: false });
  abilities = signal<Section<DndAbilityScore[]>>({ data: null, error: false });
  races = signal<Section<DndRace[]>>({ data: null, error: false });
  classes = signal<Section<DndClass[]>>({ data: null, error: false });
  monster = signal<Section<DndMonster>>({ data: null, error: false });
  spell = signal<Section<DndSpell>>({ data: null, error: false });
  monsterCount = signal<number | null>(null);
  spellCount = signal<number | null>(null);



}
