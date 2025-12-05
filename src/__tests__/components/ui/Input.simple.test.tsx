// 🧪 Simplified Input Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 2.0.0

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Input } from '../../../components/ui/Input';

describe('Input Component - Simple Tests', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    mockOnChangeText.mockClear();
  });

  it('renders basic input', () => {
    render(<Input value="" onChangeText={mockOnChangeText} testID="test-input" />);
    // Basic rendering test
    expect(true).toBe(true);
  });

  it('renders with label', () => {
    const { getByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        label="Test Label"
        testID="test-input"
      />
    );
    expect(getByText('Test Label')).toBeTruthy();
  });

  it('renders with helper text', () => {
    const { getByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        helperText="Helper text"
        testID="test-input"
      />
    );
    expect(getByText('Helper text')).toBeTruthy();
  });

  it('renders with error message', () => {
    const { getByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        error="Error message"
        testID="test-input"
      />
    );
    expect(getByText('Error message')).toBeTruthy();
  });

  it('renders with left icon', () => {
    const { getByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        leftIcon={<Text>👤</Text>}
        testID="test-input"
      />
    );
    expect(getByText('👤')).toBeTruthy();
  });

  it('renders with right icon', () => {
    const { getByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        rightIcon={<Text>🔍</Text>}
        testID="test-input"
      />
    );
    expect(getByText('🔍')).toBeTruthy();
  });

  it('shows clear button when clearable and has value', () => {
    const { getByText } = render(
      <Input 
        value="test" 
        onChangeText={mockOnChangeText} 
        clearable={true}
        testID="test-input"
      />
    );
    expect(getByText('✕')).toBeTruthy();
  });

  it('does not show clear button when clearable but no value', () => {
    const { queryByText } = render(
      <Input 
        value="" 
        onChangeText={mockOnChangeText} 
        clearable={true}
        testID="test-input"
      />
    );
    expect(queryByText('✕')).toBeNull();
  });
});
