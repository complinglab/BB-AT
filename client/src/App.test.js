import React from 'react';
import { render, screen } from './test-utils';
import App from './App';

describe('App', () => {
  test('renders app component', () => {
    render(<App />);
  });
});
