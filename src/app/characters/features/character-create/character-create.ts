import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { form, FormField, FormRoot, max, min, required, validate } from '@angular/forms/signals';
import { catchError, firstValueFrom, of } from 'rxjs';

import { CampaignContextService } from '../../../campaigns/data-access/campaign-context-service';
import { Dndlinkservice } from '../../../core/services/dndlinkservice';
import { DndClass, DndRace } from '../../../core/models/dndlinks';
import { CatalogService } from '../data-access/catalog-service';
import { CharacterService } from '../data-access/character-service';
import { CharacterCreateRequest } from '../data-access/character.model';
import {
  ABILITIES,
  AbilityKey,
  AbilityScores,
  defaultScores,
  feetToMeters,
  formatBonus,
  isStandardArray,
  MAX_ABILITY_SCORE,
  maxHitPoints,
  modifier,
  POINT_BUY_BUDGET,
  pointBuyCost,
  proficiencyBonus,
  SCORE_METHODS,
  ScoreMethod,
} from './character-rules';

interface CharacterDraft {
  name: string;
  raceIndex: string;
  classIndex: string;
  subclassIndex: string;
  backgroundIndex: string;
  level: number;
  method: ScoreMethod;
  scores: AbilityScores;
  skills: string[];
  gold: number;
  campaignId: string;
}

interface WizardStep {
  number: number;
  label: string;
}

interface SkillOption {
  index: string;
  name: string;
}

const DRAFT_KEY = 'grimoirelink:character-draft';

const STEPS: WizardStep[] = [
  { number: 1, label: 'Identidad' },
  { number: 2, label: 'Caracteristicas' },
  { number: 3, label: 'Equipo' },
  { number: 4, label: 'Revisar y crear' },
];

// Nivel a partir del cual se muestra la eleccion de subclase.
const SUBCLASS_LEVEL = 3;

@Component({
  imports: [FormField, FormRoot, RouterLink],
  selector: 'app-character-create',
  styleUrl: './character-create.css',
  templateUrl: './character-create.html',
})
export class CharacterCreate {

  readonly campaignContext = inject(CampaignContextService);

  private readonly catalogService = inject(CatalogService);
  private readonly characterService = inject(CharacterService);
  private readonly dndService = inject(Dndlinkservice);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly steps = STEPS;
  protected readonly abilityList = ABILITIES;
  protected readonly scoreMethods = SCORE_METHODS;
  protected readonly pointBuyBudget = POINT_BUY_BUDGET;
  protected readonly formatBonus = formatBonus;

  readonly currentStep = signal(1);
  readonly maxReachedStep = signal(1);
  readonly submitError = signal('');
  readonly lastSavedAt = signal<Date | null>(null);

  // Catalogos (backend)

  readonly races = toSignal(
    this.catalogService.getRaces().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly classes = toSignal(
    this.catalogService.getClasses().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  readonly backgrounds = toSignal(
    this.catalogService.getBackgrounds().pipe(catchError(() => of([]))),
    { initialValue: [] }
  );

  // Formulario

  readonly draftModel = signal<CharacterDraft>(this.restoreDraft());

  readonly characterForm = form(
    this.draftModel,
    (path) => {
      required(path.name, { message: 'Elige un nombre para tu personaje' });
      required(path.raceIndex, { message: 'Elige un linaje' });
      required(path.classIndex, { message: 'Elige una clase' });
      required(path.backgroundIndex, { message: 'Elige un trasfondo' });
      required(path.campaignId, { message: 'Elige la campana del personaje' });

      required(path.level, { message: 'Indica el nivel inicial' });
      min(path.level, 1, { message: 'El nivel minimo es 1' });
      max(path.level, 20, { message: 'El nivel maximo es 20' });

      min(path.gold, 0, { message: 'El oro no puede ser negativo' });

      validate(path.scores, ({ value, valueOf }) =>
        this.validateScores(value(), valueOf(path.method))
      );

      validate(path.skills, ({ value }) => {
        const choose = this.skillChoice()?.choose ?? 0;

        return value().length === choose
          ? undefined
          : { kind: 'skills', message: `Elige ${choose} competencias de clase.` };
      });
    },
    {
      submission: {
        action: async () => this.createCharacter(),
      },
    }
  );

  // Datos de la D&D API para la raza y clase elegidas

  readonly raceDetails = rxResource({
    params: () => this.draftModel().raceIndex || undefined,
    stream: ({ params }) => this.dndService.getOne<DndRace>('races', params),
  });

  readonly classDetails = rxResource({
    params: () => this.draftModel().classIndex || undefined,
    stream: ({ params }) => this.dndService.getOne<DndClass>('classes', params),
  });

  // Derivados para la vista

  readonly selectedRace = computed(() =>
    this.races().find(race => race.index === this.draftModel().raceIndex) ?? null
  );

  readonly selectedClass = computed(() =>
    this.classes().find(item => item.index === this.draftModel().classIndex) ?? null
  );

  readonly selectedBackground = computed(() =>
    this.backgrounds().find(item => item.index === this.draftModel().backgroundIndex) ?? null
  );

  readonly selectedCampaign = computed(() =>
    this.campaignContext.campaigns().find(
      campaign => campaign.publicId === this.draftModel().campaignId
    ) ?? null
  );

  readonly showSubclass = computed(() =>
    this.draftModel().level >= SUBCLASS_LEVEL &&
    (this.classDetails.value()?.subclasses?.length ?? 0) > 0
  );

  readonly subclassName = computed(() =>
    this.classDetails.value()?.subclasses?.find(
      item => item.index === this.draftModel().subclassIndex
    )?.name ?? null
  );

  readonly racialBonuses = computed<Partial<Record<AbilityKey, number>>>(() => {
    const bonuses: Partial<Record<AbilityKey, number>> = {};

    for (const bonus of this.raceDetails.value()?.ability_bonuses ?? []) {
      const key = bonus.ability_score.index as AbilityKey;
      bonuses[key] = (bonuses[key] ?? 0) + bonus.bonus;
    }

    return bonuses;
  });

  readonly racialBonusText = computed(() =>
    ABILITIES
      .filter(({ key }) => this.racialBonuses()[key])
      .map(({ key, name }) => `${formatBonus(this.racialBonuses()[key]!)} ${name}`)
      .join(' y ')
  );

  // Puntuacion final = base + bonus racial (tope 20). Es lo que se envia al backend.
  readonly finalScores = computed<AbilityScores>(() => {
    const base = this.draftModel().scores;
    const bonuses = this.racialBonuses();
    const result = { ...base };

    for (const { key } of ABILITIES) {
      result[key] = Math.min(MAX_ABILITY_SCORE, base[key] + (bonuses[key] ?? 0));
    }

    return result;
  });

  readonly finalModifiers = computed<AbilityScores>(() => {
    const scores = this.finalScores();
    const result = { ...scores };

    for (const { key } of ABILITIES) {
      result[key] = modifier(scores[key]);
    }

    return result;
  });

  readonly pointsSpent = computed(() => pointBuyCost(this.draftModel().scores));

  readonly scoreHint = computed(() =>
    SCORE_METHODS.find(method => method.value === this.draftModel().method)?.hint ?? ''
  );

  readonly skillChoice = computed(() =>
    this.classDetails.value()?.proficiency_choices?.find(choice =>
      choice.from.options.some(option => option.item?.index.startsWith('skill-'))
    ) ?? null
  );

  readonly skillOptions = computed<SkillOption[]>(() =>
    (this.skillChoice()?.from.options ?? [])
      .filter(option => option.item)
      .map(option => ({
        index: option.item!.index,
        name: option.item!.name.replace('Skill: ', ''),
      }))
  );

  readonly proficiency = computed(() => proficiencyBonus(this.draftModel().level || 1));

  readonly maxHp = computed(() => {
    const hitDie = this.classDetails.value()?.hit_die;

    return hitDie
      ? maxHitPoints(hitDie, this.draftModel().level || 1, this.finalScores().con)
      : null;
  });

  readonly initiative = computed(() => modifier(this.finalScores().dex));

  readonly speed = computed(() => {
    const feet = this.raceDetails.value()?.speed;
    return feet ? feetToMeters(feet) : null;
  });

  readonly isCaster = computed(() => !!this.classDetails.value()?.spellcasting);

  readonly isDungeonMasterOfSelection = computed(() =>
    this.draftModel().campaignId === this.campaignContext.selectedId() &&
    this.campaignContext.isRealDungeonMaster()
  );

  readonly stepValid = computed(() => ({
    1: this.fieldsValid(1),
    2: this.fieldsValid(2),
    3: this.fieldsValid(3),
    4: this.fieldsValid(4),
  } as Record<number, boolean>));

  constructor() {
    // Campana por defecto: query param o la seleccionada en el contexto.
    effect(() => {
      const fromQuery = this.route.snapshot.queryParamMap.get('campaignId');
      const fallback = fromQuery ?? this.campaignContext.selectedId();

      if (!this.draftModel().campaignId && fallback) {
        this.characterForm.campaignId().value.set(fallback);
      }
    });

    // Si cambia la clase, se descartan competencias que ya no son validas.
    effect(() => {
      const options = this.skillOptions();
      const skills = this.draftModel().skills;

      if (!options.length) {
        return;
      }

      const valid = skills.filter(skill => options.some(option => option.index === skill));

      if (valid.length !== skills.length) {
        this.characterForm.skills().value.set(valid);
      }
    });

    // Autoguardado del borrador.
    effect(() => {
      const draft = this.draftModel();

      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        this.lastSavedAt.set(new Date());
      } catch {
        // Sin almacenamiento disponible: el borrador solo vive en memoria.
      }
    });
  }

  // Navegacion entre pasos

  goToStep(step: number): void {
    if (step <= this.maxReachedStep()) {
      this.currentStep.set(step);
    }
  }

  next(): void {
    const step = this.currentStep();

    if (!this.fieldsValid(step)) {
      this.stepFields(step).forEach(field => field().markAsTouched());
      return;
    }

    const nextStep = Math.min(step + 1, STEPS.length);
    this.currentStep.set(nextStep);
    this.maxReachedStep.update(value => Math.max(value, nextStep));
  }

  previous(): void {
    this.currentStep.update(step => Math.max(1, step - 1));
  }

  // Caracteristicas

  changeMethod(method: ScoreMethod): void {
    this.draftModel.update(draft => ({ ...draft, method, scores: defaultScores(method) }));
  }

  resetScores(): void {
    this.changeMethod(this.draftModel().method);
  }

  toggleSkill(index: string): void {
    const skills = this.draftModel().skills;
    const next = skills.includes(index)
      ? skills.filter(skill => skill !== index)
      : [...skills, index];

    this.characterForm.skills().value.set(next);
    this.characterForm.skills().markAsTouched();
  }

  isSkillDisabled(index: string): boolean {
    const choose = this.skillChoice()?.choose ?? 0;
    const skills = this.draftModel().skills;

    return !skills.includes(index) && skills.length >= choose;
  }

  // Borrador

  saveAndExit(): void {
    this.router.navigate(['/personajes']);
  }

  discardDraft(): void {
    this.clearDraft();
    this.draftModel.set(this.emptyDraft());
    this.currentStep.set(1);
    this.maxReachedStep.set(1);
  }

  // Envio

  private async createCharacter(): Promise<void> {
    this.submitError.set('');

    const draft = this.draftModel();
    const scores = this.finalScores();

    const request: CharacterCreateRequest = {
      name: draft.name.trim(),
      raceIndex: draft.raceIndex,
      classIndex: draft.classIndex,
      subclassIndex: this.showSubclass() && draft.subclassIndex ? draft.subclassIndex : null,
      backgroundIndex: draft.backgroundIndex,
      level: draft.level,
      strength: scores.str,
      dexterity: scores.dex,
      constitution: scores.con,
      intelligence: scores.int,
      wisdom: scores.wis,
      charisma: scores.cha,
      gold: draft.gold,
    };

    try {
      const created = await firstValueFrom(
        this.characterService.create(request, draft.campaignId)
      );

      this.clearDraft();

      await this.router.navigate(['/personajes', created.publicId], {
        queryParams: { campaignId: draft.campaignId },
      });
    } catch (error) {
      this.submitError.set(this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      switch (error.status) {
        case 0:
          return 'No se pudo conectar con el servidor.';
        case 400:
          return 'Revisa los datos del personaje.';
        case 401:
          return 'Tu sesion ha expirado. Inicia sesion nuevamente.';
        case 403:
          return 'El Dungeon Master no puede crear personajes en esta campana.';
        case 404:
          return 'No se encontro la campana, la clase, el linaje o el trasfondo elegido.';
        case 409:
          return 'Ya tienes un personaje vivo en esta campana.';
      }
    }

    return 'No se pudo crear el personaje. Intenta nuevamente.';
  }

  // Helpers

  private stepFields(step: number) {
    const f = this.characterForm;

    switch (step) {
      case 1:
        return [f.name, f.raceIndex, f.classIndex, f.backgroundIndex, f.level];
      case 2:
        return [f.scores, f.skills];
      case 3:
        return [f.gold];
      default:
        return [f.campaignId];
    }
  }

  private fieldsValid(step: number): boolean {
    return this.stepFields(step).every(field => field().valid());
  }

  private validateScores(scores: AbilityScores, method: ScoreMethod) {
    const values = ABILITIES.map(({ key }) => scores[key]);

    if (values.some(value => value === null || Number.isNaN(value))) {
      return { kind: 'scores', message: 'Completa todas las caracteristicas.' };
    }

    if (method === 'standard' && !isStandardArray(scores)) {
      return { kind: 'scores', message: 'Usa cada valor estandar una sola vez: 15, 14, 13, 12, 10 y 8.' };
    }

    if (method === 'point-buy') {
      const spent = pointBuyCost(scores);

      if (spent === null) {
        return { kind: 'scores', message: 'En compra por puntos cada valor va de 8 a 15.' };
      }

      if (spent > POINT_BUY_BUDGET) {
        return { kind: 'scores', message: `Gastaste ${spent} de ${POINT_BUY_BUDGET} puntos.` };
      }
    }

    if (method === 'manual' && values.some(value => value < 3 || value > 18)) {
      return { kind: 'scores', message: 'Cada valor debe estar entre 3 y 18.' };
    }

    return undefined;
  }

  private emptyDraft(): CharacterDraft {
    return {
      name: '',
      raceIndex: '',
      classIndex: '',
      subclassIndex: '',
      backgroundIndex: '',
      level: 1,
      method: 'standard',
      scores: defaultScores('standard'),
      skills: [],
      gold: 0,
      campaignId: '',
    };
  }

  private restoreDraft(): CharacterDraft {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      return saved ? { ...this.emptyDraft(), ...JSON.parse(saved) } : this.emptyDraft();
    } catch {
      return this.emptyDraft();
    }
  }

  private clearDraft(): void {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Nada que limpiar.
    }
  }
}
