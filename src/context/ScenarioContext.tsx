import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Scenario = {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  initialStats: {
    health: number;
    happiness: number;
    wealth: number;
    skills: number;
  };
};

type ScenarioContextType = {
  selectedScenario: Scenario | null;
  selectScenario: (scenario: Scenario) => void;
  clearScenario: () => void;
};

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

  const selectScenario = (scenario: Scenario) => {
    setSelectedScenario(scenario);
  };

  const clearScenario = () => {
    setSelectedScenario(null);
  };

  return (
    <ScenarioContext.Provider value={{ selectedScenario, selectScenario, clearScenario }}>
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};

export const defaultScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Начало пути',
    description: 'Вы только что родились. Время строить свою историю с чистого листа!',
    difficulty: 'easy',
    initialStats: {
      health: 80,
      happiness: 70,
      wealth: 50,
      skills: 30,
    },
  },
  {
    id: '2',
    title: 'Испытание богатством',
    description: 'Вы родились в богатой семье. Сможете ли вы сохранить и приумножить состояние?',
    difficulty: 'medium',
    initialStats: {
      health: 90,
      happiness: 60,
      wealth: 90,
      skills: 40,
    },
  },
  {
    id: '3',
    title: 'Выживание',
    description: 'Тяжелые времена. Каждый день - борьба за существование.',
    difficulty: 'hard',
    initialStats: {
      health: 50,
      happiness: 30,
      wealth: 20,
      skills: 60,
    },
  },
];
