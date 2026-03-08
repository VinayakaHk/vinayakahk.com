import { describe, it, expect, vi, beforeEach } from 'vitest';
import { webGLSupported, initScene } from '../main.js';

describe('ThreeJS Environment Configuration', () => {
  beforeEach(() => {
    // Reset DOM entirely for each test
    document.body.innerHTML = '';
  });

  it('webGLSupported returns true when WebGL is available', () => {
    const mockGetContext = vi.fn().mockReturnValue({});
    HTMLCanvasElement.prototype.getContext = mockGetContext;
    
    const originalGL = window.WebGLRenderingContext;
    window.WebGLRenderingContext = function() {};
    
    expect(webGLSupported()).toBe(true);
    expect(mockGetContext).toHaveBeenCalledWith('webgl');
    
    window.WebGLRenderingContext = originalGL;
  });

  it('webGLSupported returns false when WebGL is unavailable', () => {
    const mockGetContext = vi.fn().mockReturnValue(null);
    HTMLCanvasElement.prototype.getContext = mockGetContext;
    
    const originalGL = window.WebGLRenderingContext;
    window.WebGLRenderingContext = undefined;
    
    expect(webGLSupported()).toBe(false);
    
    window.WebGLRenderingContext = originalGL;
  });

  it('initScene activates the HTML fallback if WebGL is missing', () => {
    // Force webGL check to fail
    HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue(null);
    const originalGL = window.WebGLRenderingContext;
    window.WebGLRenderingContext = undefined;
    
    // Setup necessary DOM nodes used by initScene
    document.body.innerHTML = `
      <canvas id="webgl"></canvas>
      <div id="webgl-fallback" class="webgl-fallback"></div>
    `;

    const result = initScene();
    
    // Function should return early 
    expect(result).toBeNull();
    
    const fallback = document.getElementById('webgl-fallback');
    const webgl = document.getElementById('webgl');
    
    expect(fallback.classList.contains('active')).toBe(true);
    expect(webgl.style.display).toBe('none');
    
    window.WebGLRenderingContext = originalGL;
  });
});
