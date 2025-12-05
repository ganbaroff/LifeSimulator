// Game Loop Manager - Управление игровым временем
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { 
  startGameLoop, 
  stopGameLoop, 
  tick, 
  generateEvent 
} from '../../store/slices/gameLoopSlice';
import { updatePlayerStats } from '../../store/slices/characterSlice';
import EventGenerator from '../../services/eventGenerator';

interface GameLoopManagerProps {
  children?: React.ReactNode;
}

const GameLoopManager: React.FC<GameLoopManagerProps> = ({ children }) => {
  const dispatch = useDispatch();
  const gameStatus = useSelector((state: RootState) => state.game.status);
  const character = useSelector((state: RootState) => state.character.current);
  const gameLoop = useSelector((state: RootState) => state.gameLoop);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Start/stop game loop based on game status
  useEffect(() => {
    if (gameStatus === 'playing' && character) {
      dispatch(startGameLoop());
    } else {
      dispatch(stopGameLoop());
    }
  }, [gameStatus, character, dispatch]);

  // Game tick interval
  useEffect(() => {
    if (gameLoop.isRunning) {
      intervalRef.current = setInterval(() => {
        dispatch(tick());
      }, 1000 / gameLoop.gameSpeed); // Adjust interval based on game speed
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [gameLoop.isRunning, gameLoop.gameSpeed, dispatch]);

  // Generate events when interval is reached
  useEffect(() => {
    if (gameLoop.lastEventTime >= gameLoop.eventInterval && !gameLoop.currentEvent && character) {
      const event = EventGenerator.generateEvent(character);
      if (event) {
        dispatch(generateEvent(event));
      }
    }
  }, [gameLoop.lastEventTime, gameLoop.eventInterval, gameLoop.currentEvent, character, dispatch]);

  // Handle character aging (every 30 seconds = 1 year)
  useEffect(() => {
    if (!character || !gameLoop.isRunning) return;

    const agingInterval = setInterval(() => {
      // Age up character
      const newAge = character.age + 1;
      
      // Check for birthday event
      const birthdayEvent = EventGenerator.generateBirthdayEvent({ ...character, age: newAge });
      dispatch(generateEvent(birthdayEvent));
      
      // Update character age (this would be handled by character slice)
      // For now, just log it
      console.log(`🎂 Character aged to ${newAge}`);
      
      // Check for death conditions
      if (newAge >= 80) {
        const deathChance = (newAge - 80) * 0.1; // 10% chance per year after 80
        if (Math.random() < deathChance) {
          const gameOverEvent = EventGenerator.generateGameOverEvent('старость');
          dispatch(generateEvent(gameOverEvent));
        }
      }
    }, 30000 / gameLoop.gameSpeed); // 30 seconds per year

    return () => clearInterval(agingInterval);
  }, [character, gameLoop.isRunning, gameLoop.gameSpeed, dispatch]);

  return <>{children}</>;
};

export default GameLoopManager;
