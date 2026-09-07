// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { App } from '../main';

describe('App', () => {
  beforeEach(() => localStorage.clear());

  it('muestra el acceso y explica el requisito de contraseña', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Virus! Marvel' })).toBeVisible();
    expect(screen.getByPlaceholderText('Contraseña (8 caracteres)')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Registrarme' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeEnabled();
  });
});
