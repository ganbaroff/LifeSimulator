// Компонент выбора года рождения - Sprint 2 Task 3
import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

interface YearData {
  year: number;
  description: string;
  events: string[];
}

interface YearSelectorProps {
  selectedYear: number;
  onYearSelect: (year: number) => void;
  isLoading?: boolean;
}

export const YearSelector: React.FC<YearSelectorProps> = ({
  selectedYear,
  onYearSelect,
  isLoading = false
}) => {
  // Исторические периоды Азербайджана
  const years: YearData[] = [
    {
      year: 1918,
      description: 'Азербайджанская Демократическая Республика',
      events: ['Провозглашение АДР', 'Битва за Баку', 'Международное признание']
    },
    {
      year: 1920,
      description: 'Установление Советской власти',
      events: ['Красная армия в Баку', 'Конец АДР', 'Начало советской эпохи']
    },
    {
      year: 1930,
      description: 'Индустриализация',
      events: ['Первые пятилетки', 'Промышленное развитие', 'Коллективизация']
    },
    {
      year: 1940,
      description: 'Великая Отечественная война',
      events: ['Нефтяной бум', 'Баку - главный поставщик нефти', 'Тыл фронта']
    },
    {
      year: 1950,
      description: 'Послевоенное восстановление',
      events: ['Мингечевирская ГЭС', 'Восстановление экономики', 'Жилищное строительство']
    },
    {
      year: 1960,
      description: 'Развитие промышленности',
      events: ['Рост Сумгаита', 'Научные центры', 'Космическая программа']
    },
    {
      year: 1970,
      description: 'Эпоха нефти и газа',
      events: ['Нефтяные месторождения', 'Экономический рост', 'Социальные программы']
    },
    {
      year: 1991,
      description: 'Обретение независимости',
      events: ['Независимый Азербайджан', 'Первые выборы', 'Вступление в ООН']
    },
    {
      year: 2000,
      description: 'Нефтяной контракт века',
      events: ['Международные контракты', 'Экономический бум', 'Модернизация']
    },
    {
      year: 2010,
      description: 'Современный Азербайджан',
      events: ['Развитие инфраструктуры', 'Европейские игры', 'IT технологии']
    },
    {
      year: 2020,
      description: 'Победа в Карабахской войне',
      events: ['44-дневная война', 'Возвращение территорий', 'Национальное единство']
    }
  ];

  const handleYearSelect = useCallback((year: number) => {
    if (!isLoading) {
      onYearSelect(year);
    }
  }, [isLoading, onYearSelect]);

  const calculateAge = (year: number): number => {
    return 2024 - year;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Выберите год рождения</Text>
      <Text style={styles.subtitle}>
        Год определяет исторический контекст и доступные события
      </Text>

      <ScrollView 
        style={styles.yearsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.yearsListContent}
      >
        {years.map((yearData) => (
          <TouchableOpacity
            key={yearData.year}
            style={[
              styles.yearCard,
              selectedYear === yearData.year && styles.selectedYearCard,
              isLoading && styles.disabledCard
            ]}
            onPress={() => handleYearSelect(yearData.year)}
            disabled={isLoading}
          >
            <View style={styles.yearHeader}>
              <View style={styles.yearInfo}>
                <Text style={styles.yearNumber}>{yearData.year} год</Text>
                <Text style={styles.ageText}>
                  Начальный возраст: {calculateAge(yearData.year)} лет
                </Text>
              </View>
              <View style={styles.radioButton}>
                <Text style={[
                  styles.radioText,
                  selectedYear === yearData.year && styles.radioTextSelected
                ]}>
                  {selectedYear === yearData.year ? '●' : '○'}
                </Text>
              </View>
            </View>

            <Text style={styles.yearDescription}>{yearData.description}</Text>

            <View style={styles.eventsContainer}>
              <Text style={styles.eventsTitle}>Ключевые события:</Text>
              {yearData.events.map((event, index) => (
                <Text key={index} style={styles.eventText}>
                  • {event}
                </Text>
              ))}
            </View>

            <View style={styles.ageIndicator}>
              <Text style={styles.ageLabel}>
                {calculateAge(yearData.year) < 18 && '👶 Детство'}
                {calculateAge(yearData.year) >= 18 && calculateAge(yearData.year) < 30 && '👤 Молодость'}
                {calculateAge(yearData.year) >= 30 && calculateAge(yearData.year) < 50 && '👨‍💼 Зрелость'}
                {calculateAge(yearData.year) >= 50 && '👴 Пожилой возраст'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  yearsList: {
    flex: 1,
  },
  yearsListContent: {
    gap: 12,
  },
  yearCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedYearCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  disabledCard: {
    opacity: 0.5,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  yearInfo: {
    flex: 1,
  },
  yearNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  ageText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  radioButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  radioText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: 'bold',
  },
  radioTextSelected: {
    color: '#3b82f6',
  },
  yearDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: '500',
  },
  eventsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  eventsTitle: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 6,
  },
  eventText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    lineHeight: 14,
  },
  ageIndicator: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  ageLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500',
  },
});

export default YearSelector;
