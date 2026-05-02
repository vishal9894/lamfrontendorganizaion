// WCAG 2.1 AA Accessibility Compliance System

// Accessibility manager
export class AccessibilityManager {
  constructor() {
    this.announcements = [];
    this.focusTrapElements = [];
    this.keyboardNavigation = true;
    this.highContrastMode = false;
    this.reducedMotion = false;
    this.screenReaderMode = false;
    this.fontSize = 'medium';
    this.initializeAccessibility();
  }

  // Initialize accessibility features
  initializeAccessibility() {
    this.detectUserPreferences();
    this.setupKeyboardNavigation();
    this.setupAriaLiveRegions();
    this.setupFocusManagement();
    this.setupColorContrast();
    this.setupReducedMotion();
  }

  // Detect user accessibility preferences
  detectUserPreferences() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.reducedMotion = true;
      document.body.classList.add('reduced-motion');
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      this.highContrastMode = true;
      document.body.classList.add('high-contrast');
    }

    // Check for screen reader
    this.screenReaderMode = this.detectScreenReader();
    if (this.screenReaderMode) {
      document.body.classList.add('screen-reader-mode');
    }

    // Check system font size preference
    const systemFontSize = window.getComputedStyle(document.body).fontSize;
    if (systemFontSize) {
      this.adjustFontSize(systemFontSize);
    }
  }

  // Detect screen reader usage
  detectScreenReader() {
    // Common screen reader detection methods
    return (
      window.speechSynthesis !== undefined ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('VoiceOver') ||
      window.navigator.userAgent.includes('ChromeVox')
    );
  }

  // Setup keyboard navigation
  setupKeyboardNavigation() {
    // Add keyboard navigation styles
    document.addEventListener('keydown', (e) => {
      // Skip to main content (Alt + M)
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        this.skipToMainContent();
      }

      // Focus trap management
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }

      // Escape key to close modals/menus
      if (e.key === 'Escape') {
        this.handleEscapeKey(e);
      }

      // Arrow key navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        this.handleArrowNavigation(e);
      }
    });

    // Add focus indicators
    this.addFocusIndicators();
  }

  // Skip to main content
  skipToMainContent() {
    const mainContent = document.querySelector('main, [role="main"], .main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      this.announceToScreenReader('Skipped to main content');
    }
  }

  // Handle Tab navigation
  handleTabNavigation(e) {
    // Ensure focus is visible
    document.body.classList.add('keyboard-navigation');
    
    // Remove keyboard navigation class after mouse interaction
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    }, { once: true });
  }

  // Handle Escape key
  handleEscapeKey(e) {
    // Close modals
    const openModal = document.querySelector('.modal[aria-hidden="false"]');
    if (openModal) {
      this.closeModal(openModal);
    }

    // Close dropdowns
    const openDropdown = document.querySelector('.dropdown[aria-expanded="true"]');
    if (openDropdown) {
      this.closeDropdown(openDropdown);
    }
  }

  // Handle arrow navigation
  handleArrowNavigation(e) {
    const target = e.target;
    
    // Handle menu navigation
    if (target.getAttribute('role') === 'menuitem') {
      this.navigateMenu(target, e.key);
    }

    // Handle tab navigation
    if (target.getAttribute('role') === 'tab') {
      this.navigateTabs(target, e.key);
    }

    // Handle list navigation
    if (target.getAttribute('role') === 'option') {
      this.navigateList(target, e.key);
    }
  }

  // Add focus indicators
  addFocusIndicators() {
    const style = document.createElement('style');
    style.textContent = `
      .keyboard-navigation *:focus {
        outline: 2px solid #0066cc;
        outline-offset: 2px;
      }
      
      .high-contrast *:focus {
        outline: 3px solid #ffffff;
        outline-offset: 2px;
      }
      
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
      
      .screen-reader-mode .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    document.head.appendChild(style);
  }

  // Setup ARIA live regions
  setupAriaLiveRegions() {
    // Create live regions for announcements
    this.createLiveRegion('polite', 'aria-live-polite');
    this.createLiveRegion('assertive', 'aria-live-assertive');
    this.createLiveRegion('status', 'aria-live-status');
  }

  // Create live region
  createLiveRegion(id, ariaLive) {
    if (!document.getElementById(id)) {
      const liveRegion = document.createElement('div');
      liveRegion.id = id;
      liveRegion.setAttribute('aria-live', ariaLive);
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      document.body.appendChild(liveRegion);
    }
  }

  // Setup focus management
  setupFocusManagement() {
    // Track focus for better keyboard navigation
    let lastFocusedElement = null;

    document.addEventListener('focusin', (e) => {
      lastFocusedElement = e.target;
      this.updateAriaCurrent(e.target);
    });

    // Restore focus when modal closes
    window.addEventListener('modal-closed', (e) => {
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    });
  }

  // Update aria-current
  updateAriaCurrent(element) {
    // Remove aria-current from siblings
    const siblings = element.parentElement?.children || [];
    Array.from(siblings).forEach(sibling => {
      sibling.removeAttribute('aria-current');
    });

    // Set aria-current on current element
    if (element.matches('[role="tab"], [role="menuitem"], [role="option"], [role="link"]')) {
      element.setAttribute('aria-current', 'true');
    }
  }

  // Setup color contrast
  setupColorContrast() {
    // Add high contrast styles
    if (this.highContrastMode) {
      const style = document.createElement('style');
      style.textContent = `
        .high-contrast {
          background: #000000 !important;
          color: #ffffff !important;
        }
        
        .high-contrast * {
          background: #000000 !important;
          color: #ffffff !important;
          border-color: #ffffff !important;
        }
        
        .high-contrast a,
        .high-contrast button {
          color: #ffff00 !important;
          font-weight: bold !important;
        }
        
        .high-contrast a:focus,
        .high-contrast button:focus {
          outline: 3px solid #ffffff !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Setup reduced motion
  setupReducedMotion() {
    if (this.reducedMotion) {
      // Disable animations and transitions
      const style = document.createElement('style');
      style.textContent = `
        .reduced-motion *,
        .reduced-motion *::before,
        .reduced-motion *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Announce to screen reader
  announceToScreenReader(message, priority = 'polite') {
    const liveRegion = document.getElementById(`aria-live-${priority}`);
    if (liveRegion) {
      liveRegion.textContent = message;
      
      // Clear after announcement
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }

  // Focus trap for modals
  createFocusTrap(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const trapFocus = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    element.addEventListener('keydown', trapFocus);
    this.focusTrapElements.push({ element, handler: trapFocus });

    // Focus first element
    if (firstElement) {
      firstElement.focus();
    }
  }

  // Remove focus trap
  removeFocusTrap(element) {
    const trap = this.focusTrapElements.find(t => t.element === element);
    if (trap) {
      element.removeEventListener('keydown', trap.handler);
      this.focusTrapElements = this.focusTrapElements.filter(t => t !== trap);
    }
  }

  // Adjust font size
  adjustFontSize(size) {
    const sizes = {
      'small': '14px',
      'medium': '16px',
      'large': '18px',
      'extra-large': '20px'
    };

    const fontSize = sizes[size] || sizes.medium;
    document.documentElement.style.fontSize = fontSize;
    this.fontSize = size;
  }

  // Toggle high contrast mode
  toggleHighContrast() {
    this.highContrastMode = !this.highContrastMode;
    document.body.classList.toggle('high-contrast');
    this.announceToScreenReader(
      `High contrast mode ${this.highContrastMode ? 'enabled' : 'disabled'}`
    );
  }

  // Toggle reduced motion
  toggleReducedMotion() {
    this.reducedMotion = !this.reducedMotion;
    document.body.classList.toggle('reduced-motion');
    this.announceToScreenReader(
      `Reduced motion ${this.reducedMotion ? 'enabled' : 'disabled'}`
    );
  }

  // Check accessibility compliance
  checkCompliance() {
    const issues = [];
    
    // Check for missing alt text
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push({
        type: 'missing-alt',
        count: imagesWithoutAlt.length,
        elements: imagesWithoutAlt
      });
    }

    // Check for missing labels
    const inputsWithoutLabels = document.querySelectorAll(
      'input:not([aria-label]):not([aria-labelledby]):not([id])'
    );
    if (inputsWithoutLabels.length > 0) {
      issues.push({
        type: 'missing-label',
        count: inputsWithoutLabels.length,
        elements: inputsWithoutLabels
      });
    }

    // Check for missing headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) {
      issues.push({
        type: 'missing-headings',
        count: 1,
        elements: [document.body]
      });
    }

    // Check for proper heading hierarchy
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (index > 0 && currentLevel > previousLevel + 1) {
        issues.push({
          type: 'heading-hierarchy',
          count: 1,
          elements: [heading]
        });
      }
      previousLevel = currentLevel;
    });

    // Check for color contrast
    const contrastIssues = this.checkColorContrast();
    if (contrastIssues.length > 0) {
      issues.push(...contrastIssues);
    }

    // Check for keyboard accessibility
    const keyboardIssues = this.checkKeyboardAccessibility();
    if (keyboardIssues.length > 0) {
      issues.push(...keyboardIssues);
    }

    return {
      compliant: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 5))
    };
  }

  // Check color contrast
  checkColorContrast() {
    const issues = [];
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      if (color && backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)') {
        const contrast = this.calculateContrast(color, backgroundColor);
        if (contrast < 4.5) { // WCAG AA standard
          issues.push({
            type: 'low-contrast',
            element,
            contrast,
            color,
            backgroundColor
          });
        }
      }
    });
    
    return issues;
  }

  // Calculate color contrast
  calculateContrast(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    const l1 = this.getRelativeLuminance(rgb1);
    const l2 = this.getRelativeLuminance(rgb2);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  // Convert color to RGB
  hexToRgb(color) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  // Get relative luminance
  getRelativeLuminance(rgb) {
    const rsRGB = rgb.r / 255;
    const gsRGB = rgb.g / 255;
    const bsRGB = rgb.b / 255;

    const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
    const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
    const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Check keyboard accessibility
  checkKeyboardAccessibility() {
    const issues = [];
    
    // Check for focusable elements
    const focusableElements = document.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      // Check if element is focusable
      if (element.tabIndex < 0) {
        issues.push({
          type: 'not-focusable',
          element
        });
      }
      
      // Check for keyboard event handlers
      if (element.tagName === 'BUTTON' && !element.onclick && !element.onkeydown) {
        issues.push({
          type: 'no-keyboard-handler',
          element
        });
      }
    });
    
    return issues;
  }

  // Generate accessibility report
  generateReport() {
    const compliance = this.checkCompliance();
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      compliance,
      settings: {
        highContrastMode: this.highContrastMode,
        reducedMotion: this.reducedMotion,
        screenReaderMode: this.screenReaderMode,
        fontSize: this.fontSize,
        keyboardNavigation: this.keyboardNavigation
      },
      recommendations: this.generateRecommendations(compliance.issues)
    };
    
    return report;
  }

  // Generate recommendations
  generateRecommendations(issues) {
    const recommendations = [];
    
    issues.forEach(issue => {
      switch (issue.type) {
        case 'missing-alt':
          recommendations.push({
            type: 'alt-text',
            message: `Add descriptive alt text to ${issue.count} image(s)`,
            priority: 'high'
          });
          break;
        case 'missing-label':
          recommendations.push({
            type: 'form-labels',
            message: `Add labels to ${issue.count} form element(s)`,
            priority: 'high'
          });
          break;
        case 'heading-hierarchy':
          recommendations.push({
            type: 'heading-structure',
            message: 'Fix heading hierarchy - headings should not skip levels',
            priority: 'medium'
          });
          break;
        case 'low-contrast':
          recommendations.push({
            type: 'color-contrast',
            message: 'Increase color contrast to meet WCAG AA standards (4.5:1)',
            priority: 'high'
          });
          break;
        case 'not-focusable':
          recommendations.push({
            type: 'focus-management',
            message: 'Ensure all interactive elements are keyboard accessible',
            priority: 'medium'
          });
          break;
        case 'no-keyboard-handler':
          recommendations.push({
            type: 'keyboard-events',
            message: 'Add keyboard event handlers to interactive elements',
            priority: 'medium'
          });
          break;
      }
    });
    
    return recommendations;
  }
}

// Accessibility utilities
export const accessibilityUtils = {
  // Check if element is visible to screen reader
  isVisibleToScreenReader: (element) => {
    const styles = window.getComputedStyle(element);
    return (
      styles.display !== 'none' &&
      styles.visibility !== 'hidden' &&
      styles.opacity !== '0' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  },

  // Get accessible name
  getAccessibleName: (element) => {
    return (
      element.getAttribute('aria-label') ||
      element.getAttribute('title') ||
      element.textContent?.trim() ||
      ''
    );
  },

  // Set accessible name
  setAccessibleName: (element, name) => {
    element.setAttribute('aria-label', name);
  },

  // Mark element as decorative
  markAsDecorative: (element) => {
    element.setAttribute('role', 'presentation');
    element.setAttribute('aria-hidden', 'true');
  },

  // Hide element from screen reader
  hideFromScreenReader: (element) => {
    element.setAttribute('aria-hidden', 'true');
  },

  // Show element to screen reader
  showToScreenReader: (element) => {
    element.removeAttribute('aria-hidden');
  },

  // Add landmark role
  addLandmarkRole: (element, role) => {
    element.setAttribute('role', role);
  },

  // Add navigation landmarks
  addNavigationLandmarks: () => {
    const header = document.querySelector('header');
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    const footer = document.querySelector('footer');
    const aside = document.querySelector('aside');

    if (header && !header.getAttribute('role')) {
      header.setAttribute('role', 'banner');
    }
    if (nav && !nav.getAttribute('role')) {
      nav.setAttribute('role', 'navigation');
    }
    if (main && !main.getAttribute('role')) {
      main.setAttribute('role', 'main');
    }
    if (footer && !footer.getAttribute('role')) {
      footer.setAttribute('role', 'contentinfo');
    }
    if (aside && !aside.getAttribute('role')) {
      aside.setAttribute('role', 'complementary');
    }
  }
};

// Initialize accessibility
export const initializeAccessibility = () => {
  const accessibilityManager = new AccessibilityManager();
  
  // Add navigation landmarks
  accessibilityUtils.addNavigationLandmarks();
  
  // Add skip links
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link sr-only';
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    accessibilityManager.skipToMainContent();
  });
  document.body.insertBefore(skipLink, document.body.firstChild);
  
  return accessibilityManager;
};

export default {
  AccessibilityManager,
  accessibilityUtils,
  initializeAccessibility
};
