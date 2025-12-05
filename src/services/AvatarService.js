// AvatarService.js - Интеграция с Avaturn для генерации аватаров
// Free tier SDK для создания 5 возрастов аватара (0/20/40/60/80)

// ⚠️ ВСТАВЬТЕ ВАШ AVATURN API KEY ЗДЕСЬ
// Получить ключ: https://avaturn.me/
const AVATURN_API_KEY = 'YOUR_AVATURN_API_KEY_HERE';
const AVATURN_API_URL = 'https://api.avaturn.me/v1';

/**
 * ФУНКЦИЯ: Генерация аватара из селфи
 * @param {string} imageUri - URI загруженного селфи
 * @param {number} age - Возраст для морфинга (0-80)
 * @returns {Promise<string>} - URL сгенерированного аватара
 */
export const generateAvatar = async (imageUri, age = 20) => {
  try {
    // Проверка API ключа
    if (AVATURN_API_KEY === 'YOUR_AVATURN_API_KEY_HERE') {
      console.warn('Avaturn API key not configured, using placeholder');
      return getPlaceholderAvatar(age);
    }

    // Определяем возрастную категорию для морфинга
    const ageCategory = getAgeCategory(age);

    // Создаем FormData для загрузки изображения
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'selfie.jpg',
    });
    formData.append('age_category', ageCategory);
    formData.append('style', 'realistic'); // Реалистичный стиль

    // Отправляем запрос к Avaturn API
    const response = await fetch(`${AVATURN_API_URL}/generate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AVATURN_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Avaturn API error: ${response.status}`);
    }

    const data = await response.json();
    return data.avatar_url;
  } catch (error) {
    console.error('Avatar generation failed:', error);
    return getPlaceholderAvatar(age);
  }
};

/**
 * ФУНКЦИЯ: Определение возрастной категории
 * @param {number} age - Возраст персонажа
 * @returns {string} - Категория (child/young/adult/middle/elderly)
 */
const getAgeCategory = (age) => {
  if (age < 12) return 'child';
  if (age < 25) return 'young';
  if (age < 45) return 'adult';
  if (age < 65) return 'middle';
  return 'elderly';
};

/**
 * ФУНКЦИЯ: Получить placeholder аватар (если API недоступен)
 * @param {number} age - Возраст
 * @returns {string} - URL placeholder изображения
 */
const getPlaceholderAvatar = (age) => {
  // Используем UI Avatars как fallback
  const category = getAgeCategory(age);
  const emoji = {
    child: '👶',
    young: '👦',
    adult: '🧑',
    middle: '👨',
    elderly: '👴',
  }[category];

  return `https://ui-avatars.com/api/?name=${emoji}&size=256&background=3b82f6&color=fff`;
};

/**
 * ФУНКЦИЯ: Генерация всех 5 возрастов аватара
 * @param {string} imageUri - URI селфи
 * @returns {Promise<Object>} - Объект с 5 аватарами
 */
export const generateAllAges = async (imageUri) => {
  const ages = [0, 20, 40, 60, 80];
  const avatars = {};

  for (const age of ages) {
    avatars[age] = await generateAvatar(imageUri, age);
  }

  return avatars;
};

/**
 * ФУНКЦИЯ: Получить аватар для текущего возраста
 * @param {Object} avatars - Объект с аватарами всех возрастов
 * @param {number} currentAge - Текущий возраст персонажа
 * @returns {string} - URL ближайшего аватара
 */
export const getAvatarForAge = (avatars, currentAge) => {
  if (!avatars) return getPlaceholderAvatar(currentAge);

  // Находим ближайший доступный возраст
  const ages = [0, 20, 40, 60, 80];
  let closestAge = ages[0];
  let minDiff = Math.abs(currentAge - ages[0]);

  for (const age of ages) {
    const diff = Math.abs(currentAge - age);
    if (diff < minDiff) {
      minDiff = diff;
      closestAge = age;
    }
  }

  return avatars[closestAge] || getPlaceholderAvatar(currentAge);
};

/**
 * ФУНКЦИЯ: Применить эффекты здоровья к аватару (фильтры)
 * @param {number} health - Здоровье (0-100)
 * @returns {Object} - Стили для применения к изображению
 */
export const getHealthEffects = (health) => {
  if (health > 70) {
    return { opacity: 1, filter: 'none' }; // Здоровый
  } else if (health > 40) {
    return { opacity: 0.9, filter: 'grayscale(0.3)' }; // Слегка больной
  } else if (health > 20) {
    return { opacity: 0.8, filter: 'grayscale(0.6)' }; // Очень больной
  } else {
    return { opacity: 0.7, filter: 'grayscale(0.9)' }; // Умирающий
  }
};

export default {
  generateAvatar,
  generateAllAges,
  getAvatarForAge,
  getHealthEffects,
};
