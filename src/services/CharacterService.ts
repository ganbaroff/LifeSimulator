// CharacterService.ts - генератор случайных персонажей и утилиты
import names from '../data/names.json';

const COUNTRIES = [
  'USA',
  'Russia',
  'China',
  'India',
  'Germany',
  'Japan',
  'Brazil',
  'UK',
  'France',
  'Nigeria',
] as const;

const PROFESSIONS = ['none', 'Programmer', 'PMP', 'Doctor', 'Entrepreneur', 'Teacher'] as const;

interface NamesData {
  first_unisex: string[];
  first_male: string[];
  first_female: string[];
  surnames: string[];
}

const typedNames = names as NamesData;

const randItem = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const randomYearBase = (): number => {
  // Десятилетия 1900..2020 (с шагом 10)
  const decades: number[] = [];
  for (let y = 1900; y <= 2020; y += 10) decades.push(y);
  return randItem(decades);
};

export interface CharacterSeed {
  name: string;
  country: string;
  yearBase: number;
  profession: string;
}

export interface RandomCharacterOptions {
  proUnlocked?: boolean;
}

export function generateRandomName(): string {
  // 50% унисекс, иначе муж/жен по 50/50
  const pick = Math.random();
  if (pick < 0.5) return `${randItem(typedNames.first_unisex)} ${randItem(typedNames.surnames)}`;
  if (pick < 0.75) return `${randItem(typedNames.first_male)} ${randItem(typedNames.surnames)}`;
  return `${randItem(typedNames.first_female)} ${randItem(typedNames.surnames)}`;
}

export function generateRandomCharacterSeed({
  proUnlocked = false,
}: RandomCharacterOptions = {}): CharacterSeed {
  const name = generateRandomName();
  const country = randItem(COUNTRIES);
  const yearBase = randomYearBase();
  // Если профи-режим не открыт — оставим none
  const profession = proUnlocked ? randItem(PROFESSIONS) : 'none';

  return { name, country, yearBase, profession };
}

export default {
  generateRandomName,
  generateRandomCharacterSeed,
};
