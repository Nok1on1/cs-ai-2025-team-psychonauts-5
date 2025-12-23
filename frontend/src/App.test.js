import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Dialogos title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Dialogos/i);
  expect(linkElement).toBeInTheDocument();
});
