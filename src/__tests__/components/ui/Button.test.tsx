// 🧪 Button Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 1.0.0

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Button } from '../../../components/ui/Button';
import { Theme } from '../../../styles/DesignSystem';

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  describe('Rendering', () => {
    it('renders with correct title', () => {
      render(<Button title="Test Button" onPress={mockOnPress} />);
      expect(screen.getByText('Test Button')).toBeTruthy();
    });

    it('applies correct styles for primary variant', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        backgroundColor: Theme.Colors.primary,
      });
    });

    it('applies correct styles for secondary variant', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} variant="secondary" testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        backgroundColor: Theme.Colors.background.card,
        borderWidth: 1,
        borderColor: Theme.Colors.border.primary,
      });
    });

    it('applies correct styles for danger variant', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} variant="danger" testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        backgroundColor: Theme.Colors.danger,
      });
    });
  });

  describe('Functionality', () => {
    it('calls onPress when pressed', () => {
      render(<Button title="Test Button" onPress={mockOnPress} />);
      fireEvent.press(screen.getByText('Test Button'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('does not call onPress when disabled', () => {
      render(<Button title="Test Button" onPress={mockOnPress} disabled />);
      fireEvent.press(screen.getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('does not call onPress when loading', () => {
      render(<Button title="Test Button" onPress={mockOnPress} loading />);
      fireEvent.press(screen.getByText('Test Button'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('shows loading text when loading', () => {
      render(<Button title="Test Button" onPress={mockOnPress} loading />);
      expect(screen.getByText('Загрузка...')).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('applies correct styles for small size', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} size="sm" testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        paddingVertical: Theme.Spacing.sm,
        paddingHorizontal: Theme.Spacing.md,
      });
    });

    it('applies correct styles for medium size', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} size="md" testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        paddingVertical: Theme.Spacing.md,
        paddingHorizontal: Theme.Spacing.xl,
      });
    });

    it('applies correct styles for large size', () => {
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} size="lg" testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle({
        paddingVertical: Theme.Spacing.lg,
        paddingHorizontal: Theme.Spacing.xxl,
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties', () => {
      const { getByTestId } = render(
        <Button title="Test Button" onPress={mockOnPress} testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toBeEnabled();
    });

    it('is disabled when disabled prop is true', () => {
      const { getByTestId } = render(
        <Button title="Test Button" onPress={mockOnPress} disabled testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).not.toBeEnabled();
    });

    it('is disabled when loading prop is true', () => {
      const { getByTestId } = render(
        <Button title="Test Button" onPress={mockOnPress} loading testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).not.toBeEnabled();
    });
  });

  describe('Custom Styles', () => {
    it('applies custom container style', () => {
      const customStyle = { marginTop: 20 };
      const { getByTestId } = render(
        <Button title="Test" onPress={mockOnPress} style={customStyle} testID="test-button" />
      );
      const button = getByTestId('test-button');
      expect(button).toHaveStyle(customStyle);
    });

    it('applies custom text style', () => {
      const customTextStyle = { fontSize: 20 };
      render(
        <Button title="Test" onPress={mockOnPress} textStyle={customTextStyle} />
      );
      const text = screen.getByText('Test');
      expect(text).toHaveStyle(customTextStyle);
    });
  });

  describe('Edge Cases', () => {
    it('handles empty title', () => {
      render(<Button title="" onPress={mockOnPress} />);
      expect(screen.getByText('')).toBeTruthy();
    });

    it('handles very long title', () => {
      const longTitle = 'This is a very long button title that should wrap properly';
      render(<Button title={longTitle} onPress={mockOnPress} />);
      expect(screen.getByText(longTitle)).toBeTruthy();
    });

    it('handles rapid presses', () => {
      render(<Button title="Test" onPress={mockOnPress} />);
      const button = screen.getByText('Test');
      
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      
      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });
});
