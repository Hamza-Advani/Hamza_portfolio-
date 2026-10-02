/**
 * Muhammad Hamza - Portfolio JavaScript
 * Provides responsive navigation, clipboard utilities, toast notifications,
 * and contact form interaction. Beginner-friendly and dependency-free.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Navigation Toggle
  initMobileNav();

  // 2. Dynamic Copyright Year
  initFooterYear();

  // 3. Email Copy Functionality
  initEmailCopy();

  // 4. Contact Form Handling
  initContactForm();

  // 5. Active Nav Link Helper
  highlightCurrentNavLink();

  // 6. Certificate Lightbox Modal
  initCertificateLightbox();
});

/**
 * Handles mobile hamburger menu toggle, backdrop interactions,
 * and closing on Escape key or outside click.
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (!toggleBtn || !navMenu) return;

  toggleBtn.addEventListener('click', () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    toggleBtn.setAttribute('aria-expanded', !isExpanded);
    toggleBtn.classList.toggle('open');
    navMenu.classList.toggle('open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!navMenu.contains(e.target) && !toggleBtn.contains(e.target) && navMenu.classList.contains('open')) {
      toggleBtn.classList.remove('open');
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Close menu on pressing Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('open')) {
      toggleBtn.classList.remove('open');
      navMenu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    }
  });
}

/**
 * Highlights current active navigation link based on current URL file name.
 */
function highlightCurrentNavLink() {
  const currentPath = window.location.pathname;
  const pageName = currentPath.split(/[/\\]/).pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  if (!pageName) return;

  navLinks.forEach((link) => {
    const href = link.getAttribute('href');
    if (href === pageName || (pageName === '' && href === 'index.html')) {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

/**
 * Automatically sets the current year in the footer copyright notice.
 */
function initFooterYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Enables copying email address to clipboard with user feedback.
 */
function initEmailCopy() {
  const copyBtns = document.querySelectorAll('[data-copy-email]');

  copyBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = btn.getAttribute('data-copy-email') || 'hamzaadvani2006@gmail.com';

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(() => {
            showToast(`Copied to clipboard: ${email}`);
          })
          .catch(() => {
            fallbackCopy(email);
          });
      } else {
        fallbackCopy(email);
      }
    });
  });
}

/**
 * Fallback clipboard copy for older browsers
 */
function fallbackCopy(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    document.execCommand('copy');
    showToast(`Copied to clipboard: ${text}`);
  } catch (err) {
    showToast(`Email: ${text}`);
  }

  document.body.removeChild(textArea);
}

/**
 * Handles the contact form submission on contact.html
 * Opens default email client with prefilled details and provides user confirmation.
 */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nameInput = document.getElementById('senderName');
    const emailInput = document.getElementById('senderEmail');
    const subjectInput = document.getElementById('senderSubject');
    const messageInput = document.getElementById('senderMessage');

    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Contact';
    const message = messageInput ? messageInput.value.trim() : '';

    if (!name || !email || !message) {
      showToast('Please fill out all required fields.');
      return;
    }

    // Build mailto link
    const mailtoRecipient = 'hamzaadvani2006@gmail.com';
    const bodyContent = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;
    const mailtoUrl = `mailto:${mailtoRecipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyContent)}`;

    showToast('Opening your email client to send message...');

    // Trigger mail client
    window.location.href = mailtoUrl;

    // Reset form after short delay
    setTimeout(() => {
      form.reset();
    }, 1500);
  });
}

/**
 * Displays a non-intrusive floating toast notification on screen
 */
function showToast(message) {
  let toast = document.getElementById('portfolioToast');

  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'portfolioToast';
    toast.className = 'toast-notification';
    toast.innerHTML = `
      <svg class="toast-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 14 14"></polyline>
      </svg>
      <span class="toast-text"></span>
    `;
    document.body.appendChild(toast);
  }

  const textEl = toast.querySelector('.toast-text');
  if (textEl) {
    textEl.textContent = message;
  }

  toast.classList.add('show');

  // Auto hide after 3.5 seconds
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }

  window.toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/**
 * Initializes Lightbox Modal for Certificate Image Previews
 */
function initCertificateLightbox() {
  const certTriggers = document.querySelectorAll('[data-cert-preview]');
  const modal = document.getElementById('certModal');
  const modalImg = document.getElementById('certModalImg');
  const modalCaption = document.getElementById('certModalCaption');
  const modalClose = document.getElementById('certModalClose');

  if (!modal || !modalImg) return;

  certTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const imgSrc = trigger.getAttribute('data-cert-preview');
      const caption = trigger.getAttribute('data-cert-title') || 'Certificate View';

      modalImg.src = imgSrc;
      modalImg.alt = caption;
      if (modalCaption) {
        modalCaption.textContent = caption;
      }

      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
}
