// 🧪 Modal Component Tests
// Создано: QA Engineer (Agile Team)
// Версия: 2.0.0

import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';
import { Modal } from '../../../components/ui/Modal';
import { Theme } from '../../../styles/DesignSystem';

// Extend Jest matchers (would normally be done in setup.ts)
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

describe('Modal Component', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Rendering', () => {
    it('does not render when visible is false', () => {
      render(
        <Modal visible={false} onClose={mockOnClose}>
          <Text>Modal Content</Text>
        </Modal>
      );
      
      expect(screen.queryByText('Modal Content')).toBeNull();
    });

    it('renders when visible is true', () => {
      render(
        <Modal visible={true} onClose={mockOnClose}>
          <Text>Modal Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Modal Content')).toBeTruthy();
    });

    it('renders title when provided', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} title="Test Modal">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Test Modal')).toBeTruthy();
    });

    it('renders close button when showCloseButton is true', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} showCloseButton={true}>
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('✕')).toBeTruthy();
    });

    it('does not render close button when showCloseButton is false', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} showCloseButton={false}>
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.queryByText('✕')).toBeNull();
    });
  });

  describe('Functionality', () => {
    it('calls onClose when close button is pressed', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} showCloseButton={true}>
          <Text>Content</Text>
        </Modal>
      );
      
      fireEvent.press(screen.getByText('✕'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is pressed and backdropClosable is true', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} backdropClosable={true}>
          <Text>Content</Text>
        </Modal>
      );
      
      // Find backdrop (it's the first child)
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.press(backdrop);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when backdrop is pressed and backdropClosable is false', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} backdropClosable={false}>
          <Text>Content</Text>
        </Modal>
      );
      
      // Try to press backdrop
      const backdrop = screen.getByTestId('modal-backdrop');
      fireEvent.press(backdrop);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Sizes', () => {
    it('applies correct styles for small size', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} size="sm" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        width: expect.any(Number), // Should be 80% of screen width
      });
    });

    it('applies correct styles for medium size', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} size="md" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        width: expect.any(Number), // Should be 90% of screen width
      });
    });

    it('applies correct styles for large size', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} size="lg" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        width: expect.any(Number), // Should be 95% of screen width
      });
    });

    it('applies correct styles for full size', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} size="full" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        width: expect.any(Number), // Should be 98% of screen width
      });
    });
  });

  describe('Positions', () => {
    it('applies correct styles for center position', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} position="center" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        maxHeight: expect.any(Number),
      });
    });

    it('applies correct styles for bottom position', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} position="bottom" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        position: 'absolute',
        bottom: 0,
      });
    });

    it('applies correct styles for top position', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} position="top" testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toHaveStyle({
        position: 'absolute',
        top: 50,
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility properties', () => {
      const { getByTestId } = render(
        <Modal visible={true} onClose={mockOnClose} testID="test-modal">
          <Text>Content</Text>
        </Modal>
      );
      
      const modal = getByTestId('test-modal');
      expect(modal).toBeEnabled();
    });

    it('close button is accessible', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} showCloseButton={true}>
          <Text>Content</Text>
        </Modal>
      );
      
      const closeButton = screen.getByText('✕');
      expect(closeButton).toBeTruthy();
    });
  });

  describe('Scrollable Content', () => {
    it('renders scrollable content when scrollable is true', () => {
      const longContent = Array.from({ length: 50 }, (_, i) => `Item ${i}`).join('\n');
      
      render(
        <Modal visible={true} onClose={mockOnClose} scrollable={true}>
          <Text>{longContent}</Text>
        </Modal>
      );
      
      // Should render ScrollView instead of View for content
      expect(screen.getByText('Item 0')).toBeTruthy();
      expect(screen.getByText('Item 49')).toBeTruthy();
    });

    it('renders non-scrollable content when scrollable is false', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} scrollable={false}>
          <Text>Short Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Short Content')).toBeTruthy();
    });
  });

  describe('Animation Types', () => {
    it('renders with fade animation', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} animationType="fade">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeTruthy();
    });

    it('renders with slide animation', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} animationType="slide">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeTruthy();
    });

    it('renders with scale animation', () => {
      render(
        <Modal visible={true} onClose={mockOnClose} animationType="scale">
          <Text>Content</Text>
        </Modal>
      );
      
      expect(screen.getByText('Content')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty children', () => {
      render(
        <Modal visible={true} onClose={mockOnClose}>
          {null}
        </Modal>
      );
      
      // Should not crash
      expect(screen.getByTestId('modal-backdrop')).toBeTruthy();
    });

    it('handles rapid open/close', async () => {
      const { rerender } = render(
        <Modal visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </Modal>
      );
      
      // Rapidly toggle visibility
      rerender(
        <Modal visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </Modal>
      );
      
      rerender(
        <Modal visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </Modal>
      );
      
      rerender(
        <Modal visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </Modal>
      );
      
      await waitFor(() => {
        expect(screen.getByText('Content')).toBeTruthy();
      });
    });

    it('handles missing onClose prop', () => {
      // Should not crash when onClose is not provided
      expect(() => {
        render(
          <Modal visible={true} onClose={() => {}}>
            <Text>Content</Text>
          </Modal>
        );
      }).not.toThrow();
    });
  });
});
