import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App, { loadLocalUsers, validate } from './App';
import { vi } from 'vitest';

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

test('validate returns errors for empty and invalid fields', () => {
  const errors = validate({ name: '', email: 'invalid', phone: '123' });
  expect(errors).toEqual({
    name: 'Name is required.',
    email: 'Enter a valid email address.',
    phone: 'Enter a valid phone number.',
  });
});

test('loadLocalUsers parses stored local users', () => {
  localStorage.setItem('localUsers', JSON.stringify([{ id: 1, name: 'Test User' }]));
  expect(loadLocalUsers()).toEqual([{ id: 1, name: 'Test User' }]);
});

test('fetches API users when clicking Fetch Users from API', async () => {
  const mockUsers = [
    { id: 1, name: 'API User', email: 'api@example.com', phone: '123-456-7890' },
  ];

  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: async () => mockUsers,
    })
  ));

  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /fetch users/i }));
  expect(await screen.findByText('API User')).toBeInTheDocument();
});

test('adds a local user and persists it after rerender', async () => {
  vi.stubGlobal('fetch', vi.fn((url, options) => {
    if (options?.method === 'POST') {
      return Promise.resolve({ ok: true, json: async () => ({ id: 11 }) });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  }));

  const { unmount } = render(<App />);

  await userEvent.type(screen.getByLabelText(/Full Name/i), 'Persist User');
  await userEvent.type(screen.getByLabelText(/Email Address/i), 'persist@example.com');
  await userEvent.type(screen.getByLabelText(/Phone Number/i), '+1 800 000 0000');
  await userEvent.click(screen.getByRole('button', { name: /add user/i }));

  expect(await screen.findByText('Persist User')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem('localUsers'))).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'Persist User',
        email: 'persist@example.com',
      }),
    ])
  );

  unmount();
  render(<App />);
  expect(await screen.findByText('Persist User')).toBeInTheDocument();
});

test('deletes a local user and clears storage', async () => {
  localStorage.setItem(
    'localUsers',
    JSON.stringify([
      {
        id: 'local_1',
        name: 'Delete Me',
        email: 'delete@example.com',
        phone: '+1 000 000 0000',
        isLocal: true,
        apiResponseId: 11,
      },
    ])
  );

  render(<App />);
  expect(await screen.findByText('Delete Me')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: /delete/i }));

  await waitFor(() => {
    expect(screen.queryByText('Delete Me')).not.toBeInTheDocument();
  });

  expect(JSON.parse(localStorage.getItem('localUsers'))).toEqual([]);
});
