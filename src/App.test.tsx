import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('Smoke test', () => {
  it('renders Hello test', () => {
    render(<div>Hello test</div>);
    expect(screen.getByText('Hello test')).toBeInTheDocument();
  });
}); 