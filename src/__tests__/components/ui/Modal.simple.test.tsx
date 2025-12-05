// 🧪 Simplified Modal Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 2.0.0

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Modal } from '../../../components/ui/Modal';

describe('Modal Component - Simple Tests', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('renders when visible is true', () => {
    const { getByText } = render(
      <Modal visible={true} onClose={mockOnClose}>
        <Text>Modal Content</Text>
      </Modal>
    );
    
    expect(getByText('Modal Content')).toBeTruthy();
  });

  it('does not render when visible is false', () => {
    const { queryByText } = render(
      <Modal visible={false} onClose={mockOnClose}>
        <Text>Modal Content</Text>
      </Modal>
    );
    
    expect(queryByText('Modal Content')).toBeNull();
  });

  it('calls onClose when close button is pressed', () => {
    const { getByText } = render(
      <Modal visible={true} onClose={mockOnClose} showCloseButton={true}>
        <Text>Content</Text>
      </Modal>
    );
    
    fireEvent.press(getByText('✕'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('renders title when provided', () => {
    const { getByText } = render(
      <Modal visible={true} onClose={mockOnClose} title="Test Modal">
        <Text>Content</Text>
      </Modal>
    );
    
    expect(getByText('Test Modal')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
});
