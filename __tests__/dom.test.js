import { describe, it, expect, beforeEach } from 'vitest';
import { getByText } from '@testing-library/dom';
import fs from 'fs';
import path from 'path';

describe('DOM Structure', () => {
  let container;

  beforeEach(() => {
    const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
    document.documentElement.innerHTML = html.toString();
    container = document.body;
  });

  it('contains the loading screen with proper accessibility', () => {
    const loader = document.getElementById('loading-screen');
    expect(loader).not.toBeNull();
    expect(loader.getAttribute('aria-live')).toBe('polite');
    expect(loader.getAttribute('role')).toBe('status');
  });

  it('loads the correct hero section info', () => {
    expect(getByText(container, 'Vinayaka HK')).toBeTruthy();
    expect(getByText(container, 'Full Stack Software Engineer')).toBeTruthy();
  });

  it('contains all tech stack badges in the hero section', () => {
    const stack = container.querySelector('.hero-stack');
    expect(stack).not.toBeNull();
    expect(getByText(stack, 'Vue')).toBeTruthy();
    expect(getByText(stack, 'React')).toBeTruthy();
    expect(getByText(stack, 'Node.js')).toBeTruthy();
    expect(getByText(stack, 'Go')).toBeTruthy();
  });

  it('has semantic experience section with correct items', () => {
    const expSection = document.getElementById('experience');
    expect(expSection).not.toBeNull();
    const items = expSection.querySelectorAll('.experience-item');
    expect(items.length).toBe(3);
  });

  it('has semantic projects section with correct items', () => {
    const projSection = document.getElementById('projects');
    expect(projSection).not.toBeNull();
    const items = projSection.querySelectorAll('.project-item');
    expect(items.length).toBe(3);
  });
});
