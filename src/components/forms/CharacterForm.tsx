// Компонент формы создания персонажа - Sprint 2 Task 1
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { CharacterSeed } from '../../types/game';

interface CharacterFormProps {
  onSubmit: (character: CharacterSeed) => void;
  isLoading?: boolean;
  initialData?: Partial<CharacterSeed>;
}

export const CharacterForm: React.FC<CharacterFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<CharacterSeed>({
    name: initialData.name || '',
    country: 'azerbaijan',
    yearBase: initialData.yearBase || 1991,
    profession: initialData.profession || 'none',
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Валидация формы
  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Минимум 2 символа';
    } else if (formData.name.trim().length > 20) {
      newErrors.name = 'Максимум 20 символов';
    }

    if (!formData.yearBase || formData.yearBase < 1918 || formData.yearBase > 2024) {
      newErrors.yearBase = 'Год должен быть между 1918 и 2024';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Обработка отправки формы
  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit({
        ...formData,
        name: formData.name.trim(),
      });
    }
  }, [formData, validateForm, onSubmit]);

  // Обновление полей формы
  const updateField = useCallback((field: keyof CharacterSeed, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [errors]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Создание персонажа</Text>
      
      {/* Поле имени */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Имя персонажа</Text>
        <TextInput
          style={[
            styles.input,
            errors.name && styles.inputError
          ]}
          value={formData.name}
          onChangeText={(value) => updateField('name', value)}
          placeholder="Введите имя..."
          placeholderTextColor="#64748b"
          maxLength={20}
          editable={!isLoading}
          autoFocus
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name}</Text>
        )}
      </View>

      {/* Поле года рождения */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Год рождения</Text>
        <TextInput
          style={[
            styles.input,
            errors.yearBase && styles.inputError
          ]}
          value={formData.yearBase.toString()}
          onChangeText={(value) => updateField('yearBase', parseInt(value) || 1991)}
          placeholder="1991"
          placeholderTextColor="#64748b"
          keyboardType="numeric"
          maxLength={4}
          editable={!isLoading}
        />
        {errors.yearBase && (
          <Text style={styles.errorText}>{errors.yearBase}</Text>
        )}
        <Text style={styles.helperText}>
          Возраст: {2024 - formData.yearBase} лет
        </Text>
      </View>

      {/* Кнопка отправки */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          isLoading && styles.submitButtonDisabled
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>
          {isLoading ? 'Создание...' : 'Создать персонажа'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  fieldContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  inputError: {
    borderColor: '#ef4444',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  helperText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CharacterForm;
