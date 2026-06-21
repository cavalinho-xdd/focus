import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Toast from '../Toast';

describe('Toast Component', () => {
  it('renders message correctly', () => {
    render(<Toast message="Test Info" onDismiss={() => {}} />);
    expect(screen.getByText('Test Info')).toBeInTheDocument();
  });

  it('renders action button and triggers callback', () => {
    const handleAction = vi.fn();
    const handleDismiss = vi.fn();
    
    render(
      <Toast 
        message="Error occurred" 
        type="error"
        action={{ label: 'Retry', onClick: handleAction }}
        onDismiss={handleDismiss}
      />
    );

    const button = screen.getByText('Retry');
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    
    expect(handleAction).toHaveBeenCalledOnce();
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it('renders dismiss button when no action provided', () => {
    const handleDismiss = vi.fn();
    render(<Toast message="Just info" onDismiss={handleDismiss} />);
    
    const dismissButton = screen.getByText('✕');
    expect(dismissButton).toBeInTheDocument();
    
    fireEvent.click(dismissButton);
    expect(handleDismiss).toHaveBeenCalledOnce();
  });
});
