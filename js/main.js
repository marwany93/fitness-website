// ===================================
// Mobile Menu Toggle
// ===================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a nav link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menuToggle.contains(e.target) && !navMenu.contains(e.target)) {
                menuToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

// ===================================
// Smooth Scrolling
// ===================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');

            // Skip if href is just "#"
            if (href === '#') {
                e.preventDefault();
                return;
            }

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Active Navigation Link
// ===================================
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage ||
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// ===================================
// Scroll to Top Button
// ===================================
function initScrollToTop() {
    // Create scroll to top button if it doesn't exist
    let scrollBtn = document.getElementById('scrollToTop');

    if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scrollToTop';
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        document.body.appendChild(scrollBtn);

        // Add styles dynamically
        const style = document.createElement('style');
        style.textContent = `
      .scroll-to-top {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: var(--primary-blue);
        color: white;
        border: none;
        border-radius: var(--radius-full);
        font-size: 24px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all var(--transition-base);
        box-shadow: var(--shadow-lg);
        z-index: 999;
      }
      
      .scroll-to-top.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .scroll-to-top:hover {
        background: var(--primary-blue-dark);
        transform: translateY(-5px);
      }
      
      body[dir="rtl"] .scroll-to-top {
        right: auto;
        left: 30px;
      }
    `;
        document.head.appendChild(style);
    }

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    });

    // Scroll to top when clicked
    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ===================================
// Form Validation & Submission
// ===================================
function initContactForm() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name');
            const email = formData.get('email');
            const message = formData.get('message');

            // Basic validation
            if (!name || !email || !message) {
                showMessage(window.langManager.t('contact.errorMessage'), 'error');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showMessage('Please enter a valid email address.', 'error');
                return;
            }

            // Simulate form submission (replace with actual backend call)
            console.log('Form submitted:', { name, email, message });

            // Show success message
            showMessage(window.langManager.t('contact.successMessage'), 'success');

            // Reset form
            contactForm.reset();

            // In production, you would send this to a backend or use a service like Formspree
            // Example: sendToWhatsApp(name, email, message);
        });
    }
}

// ===================================
// Message Display
// ===================================
function showMessage(message, type = 'info') {
    // Remove existing messages
    const existingMsg = document.querySelector('.alert-message');
    if (existingMsg) {
        existingMsg.remove();
    }

    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `alert-message alert-${type}`;
    messageDiv.textContent = message;

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
    .alert-message {
      position: fixed;
      top: 100px;
      left: 50%;
      transform: translateX(-50%);
      padding: var(--space-md) var(--space-xl);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-xl);
      z-index: 9999;
      animation: slideDown 0.3s ease-out;
      max-width: 90%;
      text-align: center;
      font-weight: 600;
    }
    
    .alert-success {
      background: var(--success);
      color: white;
    }
    
    .alert-error {
      background: var(--error);
      color: white;
    }
    
    .alert-info {
      background: var(--info);
      color: white;
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
  `;

    if (!document.getElementById('alert-styles')) {
        style.id = 'alert-styles';
        document.head.appendChild(style);
    }

    // Add to page
    document.body.appendChild(messageDiv);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => messageDiv.remove(), 300);
    }, 5000);
}

// ===================================
// WhatsApp Contact Helper
// ===================================
function sendToWhatsApp(name, email, message) {
    const phoneNumber = '1234567890'; // Replace with actual WhatsApp number
    const text = `Name: ${name}%0AEmail: ${email}%0AMessage: ${message}`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${text}`;
    window.open(whatsappUrl, '_blank');
}

// ===================================
// Video Player Enhancement
// ===================================
function initVideoPlayers() {
    const videos = document.querySelectorAll('video');

    videos.forEach(video => {
        // Add play/pause on click
        video.addEventListener('click', () => {
            if (video.paused) {
                video.play();
            } else {
                video.pause();
            }
        });

        // Add loading state
        video.addEventListener('loadstart', () => {
            video.classList.add('loading');
        });

        video.addEventListener('canplay', () => {
            video.classList.remove('loading');
        });
    });
}

// ===================================
// Intersection Observer for Animations
// ===================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.card, .section').forEach(el => {
        observer.observe(el);
    });
}

// ===================================
// Initialize All Features
// ===================================
function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

function initializeApp() {
    console.log('Initializing FitLife app...');

    initMobileMenu();
    initSmoothScroll();
    updateActiveNavLink();
    initScrollToTop();
    initContactForm();
    initVideoPlayers();
    initScrollAnimations();

    console.log('FitLife app initialized successfully!');
}

// Start the app
init();

// ===================================
// Utility Functions
// ===================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Export utility functions
window.utils = {
    showMessage,
    sendToWhatsApp,
    debounce
};
