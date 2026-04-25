import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

beforeEach(() => {
  axios.post.mockReset();
});

test('renders header and tabs', () => {
  render(<App />);
  expect(screen.getByText('Know Your Law AI')).toBeInTheDocument();
  expect(screen.getByText(/Ask a Question/i)).toBeInTheDocument();
  expect(screen.getByText(/Review Contract/i)).toBeInTheDocument();
});

test('renders quick topic buttons', () => {
  render(<App />);
  expect(screen.getByText('Fundamental Rights')).toBeInTheDocument();
  expect(screen.getByText('Criminal Law & FIR')).toBeInTheDocument();
});

test('clicking quick topic fills input', () => {
  render(<App />);
  fireEvent.click(screen.getByText('Fundamental Rights'));
  expect(screen.getByPlaceholderText(/Ask about Indian law/i).value).toBe(
    'What are my Fundamental Rights?'
  );
});

test('sends message and displays bot reply', async () => {
  axios.post.mockResolvedValue({ data: { reply: 'FIR is a legal document.' } });
  render(<App />);

  const input = screen.getByPlaceholderText(/Ask about Indian law/i);
  fireEvent.change(input, { target: { value: 'What is FIR?' } });
  fireEvent.click(screen.getByText('➤'));

  expect(screen.getByText('What is FIR?')).toBeInTheDocument();
  await waitFor(() =>
    expect(screen.getByText('FIR is a legal document.')).toBeInTheDocument()
  );
});

test('shows error when chat request fails', async () => {
  axios.post.mockRejectedValue(new Error('Network Error'));
  render(<App />);

  const input = screen.getByPlaceholderText(/Ask about Indian law/i);
  fireEvent.change(input, { target: { value: 'test' } });
  fireEvent.click(screen.getByText('➤'));

  await waitFor(() =>
    expect(screen.getByText(/Failed to get response/i)).toBeInTheDocument()
  );
});

test('switches to review tab and submits contract', async () => {
  axios.post.mockResolvedValue({ data: { review: 'Clause 3 is risky.' } });
  render(<App />);

  fireEvent.click(screen.getByText(/Review Contract/i));
  fireEvent.change(screen.getByPlaceholderText(/Paste contract text/i), {
    target: { value: 'This is a contract.' },
  });
  const reviewButtons = screen.getAllByText(/Review Contract/i);
  fireEvent.click(reviewButtons[reviewButtons.length - 1]);

  await waitFor(() =>
    expect(screen.getByText('Clause 3 is risky.')).toBeInTheDocument()
  );
});
