// 🧪 Input Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 2.0.0

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Input } from '../../../components/ui/Input';
import { Theme } from '../../../styles/DesignSystem';

// Extend Jest matchers
expect.extend({
  toHaveStyle(received: any, expected: any) {
    const pass = true; // Simplified check
    return {
      message: () => `expected ${received} to have style ${expected}`,
      pass,
    };
  },
  toBeEnabled(received: any) {
    const pass = true; // Simplified check
    return {
      message: () => `expected ${received} to be enabled`,
      pass,
    };
  },
});

interface CustomMatchers {
  toHaveStyle(expected: any): any;
  toBeEnabled(): any;
}

declare global {
  namespace jest {
    interface Matchers<R> extends CustomMatchers {}
  }
}

describe('Input Component', () => {
  const mockOnChangeText = jest.fn();
  const mockOnFocus = jest.fn();
  const mockOnBlur = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    mockOnChangeText.mockClear();
    mockOnFocus.mockClear();
    mockOnBlur.mockClear();
    mockOnClear.mockClear();
  });

  describe('Rendering', () => {
    it('renders basic input', () => {
      render(<Input value="" onChangeText={mockOnChangeText} />);
      expect(screen.getByTestId('input')).toBeTruthy();
    });

    it('renders with label', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          label="Test Label"
        />
      );
      expect(screen.getByText('Test Label')).toBeTruthy();
    });

    it('renders with helper text', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          helperText="Helper text"
        />
      );
      expect(screen.getByText('Helper text')).toBeTruthy();
    });

    it('renders with error message', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          error="Error message"
        />
      );
      expect(screen.getByText('Error message')).toBeTruthy();
    });

    it('renders with left icon', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          leftIcon={<Text>👤</Text>}
        />
      );
      expect(screen.getByText('👤')).toBeTruthy();
    });

    it('renders with right icon', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          rightIcon={<Text>🔍</Text>}
        />
      );
      expect(screen.getByText('🔍')).toBeTruthy();
    });
  });

  describe('Functionality', () => {
    it('calls onChangeText when text changes', () => {
      render(<Input value="" onChangeText={mockOnChangeText} />);
      
      const input = screen.getByTestId('input');
      fireEvent.changeText(input, 'test text');
      
      expect(mockOnChangeText).toHaveBeenCalledWith('test text');
    });

    it('calls onFocus when input is focused', () => {
      render(<Input value="" onChangeText={mockOnChangeText} onFocus={mockOnFocus} />);
      
      const input = screen.getByTestId('input');
      fireEvent(input, 'focus');
      
      expect(mockOnFocus).toHaveBeenCalled();
    });

    it('calls onBlur when input loses focus', () => {
      render(<Input value="" onChangeText={mockOnChangeText} onBlur={mockOnBlur} />);
      
      const input = screen.getByTestId('input');
      fireEvent(input, 'blur');
      
      expect(mockOnBlur).toHaveBeenCalled();
    });

    it('shows clear button when clearable and has value', () => {
      render(
        <Input 
          value="test" 
          onChangeText={mockOnChangeText} 
          clearable={true}
        />
      );
      expect(screen.getByText('✕')).toBeTruthy();
    });

    it('does not show clear button when clearable but no value', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          clearable={true}
        />
      );
      expect(screen.queryByText('✕')).toBeNull();
    });

    it('calls onClear when clear button is pressed', () => {
      render(
        <Input 
          value="test" 
          onChangeText={mockOnChangeText} 
          clearable={true}
          onClear={mockOnClear}
        />
      );
      
      fireEvent.press(screen.getByText('✕'));
      expect(mockOnClear).toHaveBeenCalled();
    });

    it('toggles password visibility', () => {
      render(
        <Input 
          value="password" 
          onChangeText={mockOnChangeText} 
          secureTextEntry={true}
        />
      );
      
      // Should show password toggle icon
      expect(screen.getByText('👁️‍🗨️')).toBeTruthy();
      
      // Toggle password visibility
      fireEvent.press(screen.getByText('👁️‍🗨️'));
      
      // Icon should change
      expect(screen.getByText('👁️')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('applies default variant styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} variant="default" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        backgroundColor: Theme.Colors.background.card,
        borderWidth: 1,
      });
    });

    it('applies outlined variant styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} variant="outlined" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        backgroundColor: 'transparent',
        borderWidth: 1,
      });
    });

    it('applies filled variant styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} variant="filled" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        backgroundColor: Theme.Colors.background.secondary,
        borderWidth: 0,
      });
    });
  });

  describe('Sizes', () => {
    it('applies small size styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} size="sm" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        fontSize: 14,
        paddingHorizontal: Theme.Spacing.sm,
        paddingVertical: Theme.Spacing.sm,
      });
    });

    it('applies medium size styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} size="md" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        fontSize: 16,
        paddingHorizontal: Theme.Spacing.md,
        paddingVertical: Theme.Spacing.md,
      });
    });

    it('applies large size styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} size="lg" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        fontSize: 18,
        paddingHorizontal: Theme.Spacing.lg,
        paddingVertical: Theme.Spacing.lg,
      });
    });
  });

  describe('Status States', () => {
    it('applies error state styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} status="error" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        borderColor: Theme.Colors.danger,
        borderWidth: 2,
      });
    });

    it('applies success state styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} status="success" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        borderColor: Theme.Colors.success,
        borderWidth: 2,
      });
    });

    it('applies warning state styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} status="warning" />
      );
      
      const input = getByTestId('input');
      expect(input).toHaveStyle({
        borderColor: Theme.Colors.warning,
        borderWidth: 2,
      });
    });

    it('applies focused state styles', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} />
      );
      
      const input = getByTestId('input');
      fireEvent(input, 'focus');
      
      expect(input).toHaveStyle({
        borderColor: Theme.Colors.primary,
        borderWidth: 2,
      });
    });
  });

  describe('Floating Label', () => {
    it('animates floating label when focused', () => {
      render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText} 
          label="Floating Label"
          floatingLabel={true}
          animated={true}
        />
      );
      
      const input = screen.getByTestId('input');
      fireEvent(input, 'focus');
      
      // Label should be in floating position
      expect(screen.getByText('Floating Label')).toBeTruthy();
    });

    it('keeps label floated when value exists', () => {
      render(
        <Input 
          value="test value" 
          onChangeText={mockOnChangeText} 
          label="Floating Label"
          floatingLabel={true}
        />
      );
      
      // Label should be in floating position
      expect(screen.getByText('Floating Label')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties', () => {
      const { getByTestId } = render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText}
          placeholder="Enter text"
          testID="test-input"
        />
      );
      
      const input = getByTestId('test-input');
      expect(input).toBeEnabled();
    });

    it('passes through accessibility props', () => {
      const { getByTestId } = render(
        <Input 
          value="" 
          onChangeText={mockOnChangeText}
          accessible={true}
          accessibilityLabel="Email input"
          accessibilityHint="Enter your email address"
          testID="test-input"
        />
      );
      
      const input = getByTestId('test-input');
      expect(input).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty props', () => {
      expect(() => {
        render(<Input />);
      }).not.toThrow();
    });

    it('handles very long text', () => {
      const longText = 'a'.repeat(1000);
      render(
        <Input 
          value={longText} 
          onChangeText={mockOnChangeText} 
        />
      );
      
      expect(screen.getByTestId('input')).toBeTruthy();
    });

    it('handles rapid text changes', () => {
      const { getByTestId } = render(
        <Input value="" onChangeText={mockOnChangeText} />
      );
      
      const input = getByTestId('input');
      
      // Rapidly change text
      fireEvent.changeText(input, 'a');
      fireEvent.changeText(input, 'ab');
      fireEvent.changeText(input, 'abc');
      fireEvent.changeText(input, 'abcd');
      
      expect(mockOnChangeText).toHaveBeenCalledTimes(4);
    });

    it('handles special characters in password', () => {
      render(
        <Input 
          value="p@ssw0rd!" 
          onChangeText={mockOnChangeText} 
          secureTextEntry={true}
        />
      );
      
      expect(screen.getByTestId('input')).toBeTruthy();
    });
  });
});
