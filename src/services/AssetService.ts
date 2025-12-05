import type { Character, Asset } from '../types';
import { AVAILABLE_ASSETS } from '../data/assets';

/**
 * Покупает актив для персонажа.
 * @param character - Текущий объект персонажа.
 * @param assetId - ID актива для покупки.
 * @returns - Новый объект персонажа с купленным активом.
 * @throws - Ошибку, если актив не найден, уже куплен или недостаточно средств.
 */
export const buyAsset = (character: Character, assetId: string): Character => {
  const assetToBuy = AVAILABLE_ASSETS.find(a => a.id === assetId);

  if (!assetToBuy) {
    throw new Error('Актив не найден!');
  }

  if (character.wealth < assetToBuy.cost) {
    throw new Error('Недостаточно средств для покупки.');
  }

  if (character.assets?.some(a => a.id === assetId)) {
    throw new Error('Вы уже владеете этим активом.');
  }

  const newWealth = character.wealth - assetToBuy.cost;
  const newAssets = [...(character.assets || []), assetToBuy];

  return {
    ...character,
    wealth: newWealth,
    assets: newAssets,
  };
};

/**
 * Продает актив персонажа.
 * @param character - Текущий объект персонажа.
 * @param assetId - ID актива для продажи.
 * @returns - Новый объект персонажа после продажи актива.
 * @throws - Ошибку, если актив не найден во владении.
 */
export const sellAsset = (character: Character, assetId: string): Character => {
  const assetToSell = character.assets?.find(a => a.id === assetId);

  if (!assetToSell) {
    throw new Error('У вас нет такого актива для продажи.');
  }

  // Продаем за 80% от первоначальной стоимости
  const salePrice = Math.floor(assetToSell.cost * 0.8);
  const newWealth = character.wealth + salePrice;
  const newAssets = character.assets?.filter(a => a.id !== assetId) || [];

  return {
    ...character,
    wealth: newWealth,
    assets: newAssets,
  };
};

/**
 * Применяет все пассивные эффекты от активов к персонажу.
 * Вызывается, например, в начале каждого нового года.
 * @param character - Текущий объект персонажа.
 * @returns - Новый объект персонажа с примененными пассивными эффектами.
 */
export const applyPassiveAssetEffects = (character: Character): Character => {
  if (!character.assets || character.assets.length === 0) {
    return character;
  }

  let updatedCharacter = { ...character };

  character.assets.forEach(asset => {
    if (asset.passiveEffect) {
      const effects = asset.passiveEffect(updatedCharacter);
      updatedCharacter = { ...updatedCharacter, ...effects };
    }
  });

  return updatedCharacter;
};
