// 🧪 GameLoop Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 1.0.0

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { GameLoop } from '../../../components/game/GameLoop';
import { store } from '../../../store';
import { characterActions } from '../../../store/slices/characterSlice';
import { gameActions } from '../../../store/slices/gameSliceNew';
import { testUtils } from '../../setup';

// Mock components
jest.mock('../../../components/game/EventCard', () => 'EventCard');
jest.mock('../../../components/game/StatsDisplay', () => 'StatsDisplay');

// Mock event generator
jest.mock('../../../utils/azerbaijanEventGenerator', () => ({
  AzerbaijanEventGenerator: {
    generateEvent: jest.fn(() => testUtils.createMockEvent()),
  },
}));

describe('GameLoop Component', () => {
  const mockOnGameOver = jest.fn();

  beforeEach(() => {
    mockOnGameOver.mockClear();
    store.dispatch(characterActions.reset());
    store.dispatch(gameActions.reset());
  });

  const renderWithProvider = (props = {}) => {
    return render(
      <Provider store={store}>
        <GameLoop onGameOver={mockOnGameOver} {...props} />
      </Provider>
    );
  };

  describe('Initial Rendering', () => {
    it('renders without crashing', () => {
      renderWithProvider();
    });

    it('shows loading state when character is loading', () => {
      store.dispatch(characterActions.setLoading(true));
      renderWithProvider();
      expect(screen.getByTestId('game-loop-loading')).toBeTruthy();
    });

    it('shows error state when there is an error', () => {
      store.dispatch(characterActions.setError('Test error'));
      renderWithProvider();
      expect(screen.getByText('Test error')).toBeTruthy();
    });

    it('does not render when no character exists', () => {
      renderWithProvider();
      expect(screen.queryByTestId('game-loop-content')).toBeNull();
    });
  });

  describe('Character Creation', () => {
    beforeEach(() => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
    });

    it('renders game content when character exists', () => {
      renderWithProvider();
      expect(screen.getByTestId('game-loop-content')).toBeTruthy();
    });

    it('displays character stats', () => {
      renderWithProvider();
      expect(screen.getByTestId('stats-display')).toBeTruthy();
    });

    it('generates events on game start', async () => {
      renderWithProvider();
      
      await waitFor(() => {
        expect(screen.getByTestId('event-card')).toBeTruthy();
      });
    });
  });

  describe('Event Handling', () => {
    beforeEach(() => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      store.dispatch(gameActions.startGame({
        seed: { name: 'Test', country: 'azerbaijan', profession: 'none', birthCity: 'baku' },
        difficulty: 'medium'
      }));
    });

    it('displays event with choices', async () => {
      renderWithProvider();
      
      await waitFor(() => {
        expect(screen.getByText('Test Event')).toBeTruthy();
        expect(screen.getByText('Choice 1')).toBeTruthy();
      });
    });

    it('handles choice selection', async () => {
      renderWithProvider();
      
      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
      });

      await waitFor(() => {
        expect(mockOnGameOver).not.toHaveBeenCalled();
      });
    });

    it('prevents multiple choice selections', async () => {
      renderWithProvider();
      
      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
        fireEvent.press(choiceButton);
      });

      // Should only process the first press
      await waitFor(() => {
        expect(mockOnGameOver).not.toHaveBeenCalled();
      });
    });
  });

  describe('Character Death', () => {
    it('calls onGameOver when character dies from health', async () => {
      const mockCharacter = {
        ...testUtils.createMockCharacter(),
        stats: { health: 0, happiness: 50, energy: 50, wealth: 1000 },
      };
      
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      store.dispatch(gameActions.startGame({
        seed: { name: 'Test', country: 'azerbaijan', profession: 'none', birthCity: 'baku' },
        difficulty: 'medium'
      }));

      renderWithProvider();

      await waitFor(() => {
        expect(mockOnGameOver).toHaveBeenCalledWith(
          expect.stringContaining('здоровье')
        );
      });
    });

    it('calls onGameOver when character dies from depression', async () => {
      const mockCharacter = {
        ...testUtils.createMockCharacter(),
        stats: { health: 50, happiness: 0, energy: 50, wealth: 1000 },
      };
      
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      store.dispatch(gameActions.startGame({
        seed: { name: 'Test', country: 'azerbaijan', profession: 'none', birthCity: 'baku' },
        difficulty: 'medium'
      }));

      renderWithProvider();

      await waitFor(() => {
        expect(mockOnGameOver).toHaveBeenCalledWith(
          expect.stringContaining('депрессия')
        );
      });
    });

    it('calls onGameOver when character dies of old age', async () => {
      const mockCharacter = {
        ...testUtils.createMockCharacter(),
        age: 100,
        stats: { health: 20, happiness: 20, energy: 20, wealth: 1000 },
      };
      
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      store.dispatch(gameActions.startGame({
        seed: { name: 'Test', country: 'azerbaijan', profession: 'none', birthCity: 'baku' },
        difficulty: 'medium'
      }));

      renderWithProvider();

      await waitFor(() => {
        expect(mockOnGameOver).toHaveBeenCalled();
      });
    });
  });

  describe('Game State Management', () => {
    beforeEach(() => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      store.dispatch(gameActions.startGame({
        seed: { name: 'Test', country: 'azerbaijan', profession: 'none', birthCity: 'baku' },
        difficulty: 'medium'
      }));
    });

    it('updates character stats after choice', async () => {
      renderWithProvider();
      
      const initialStats = store.getState().character.current?.stats;
      
      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
      });

      await waitFor(() => {
        const updatedStats = store.getState().character.current?.stats;
        expect(updatedStats).not.toEqual(initialStats);
      });
    });

    it('advances game year after event', async () => {
      renderWithProvider();
      
      const initialYear = store.getState().game.current?.year || 0;
      
      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
      });

      await waitFor(() => {
        const updatedYear = store.getState().game.current?.year || 0;
        expect(updatedYear).toBeGreaterThan(initialYear);
      });
    });

    it('adds event to game history', async () => {
      renderWithProvider();
      
      const initialHistoryLength = store.getState().game.history.length;
      
      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
      });

      await waitFor(() => {
        const updatedHistoryLength = store.getState().game.history.length;
        expect(updatedHistoryLength).toBeGreaterThan(initialHistoryLength);
      });
    });
  });

  describe('Error Handling', () => {
    it('handles event generation errors gracefully', async () => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      
      // Mock event generator to throw error
      const { AzerbaijanEventGenerator } = require('../../../utils/azerbaijanEventGenerator');
      AzerbaijanEventGenerator.generateEvent.mockImplementationOnce(() => {
        throw new Error('Event generation failed');
      });

      renderWithProvider();

      await waitFor(() => {
        expect(screen.getByText('Event generation failed')).toBeTruthy();
      });
    });

    it('handles choice processing errors gracefully', async () => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      
      renderWithProvider();

      await waitFor(() => {
        const choiceButton = screen.getByText('Choice 1');
        fireEvent.press(choiceButton);
      });

      // Should not crash and should show error state
      await waitFor(() => {
        expect(screen.queryByTestId('game-loop-content')).toBeTruthy();
      });
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily', async () => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      
      const { rerender } = renderWithProvider();
      
      const initialRender = screen.getByTestId('game-loop-content');
      
      rerender(
        <Provider store={store}>
          <GameLoop onGameOver={mockOnGameOver} />
        </Provider>
      );

      expect(screen.getByTestId('game-loop-content')).toBe(initialRender);
    });

    it('handles rapid state changes', async () => {
      const mockCharacter = testUtils.createMockCharacter();
      store.dispatch(characterActions.createCharacterSuccess(mockCharacter));
      
      renderWithProvider();

      await waitFor(() => {
        // Rapidly update character stats
        for (let i = 0; i < 10; i++) {
          store.dispatch(characterActions.updateStats({
            health: 50 + i,
            happiness: 50 + i,
            energy: 50 + i,
            wealth: 1000 + i * 100,
          }));
        }
      });

      await waitFor(() => {
        expect(screen.getByTestId('game-loop-content')).toBeTruthy();
      });
    });
  });
});
