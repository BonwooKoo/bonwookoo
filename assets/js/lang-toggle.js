/**
 * Language Toggle & Email Copy Functionality
 *
 * What this does:
 * - Switches between Korean (KR) and English (EN) content
 * - Copies email to clipboard when user clicks email links
 *
 * How language switching works:
 * 1. CSS already has .lang-en and .lang-ko classes on content
 * 2. Body has class 'lang-en' or 'lang-ko'
 * 3. We just toggle the body class
 * 4. CSS show/hide rules handle the rest
 *
 * Why this approach:
 * - No page reload needed
 * - All content pre-loaded (better for SEO)
 * - Simple and performant
 */

(function() {
  'use strict';

  /**
   * EMAIL COPY TO CLIPBOARD
   *
   * How it works:
   * 1. Find elements with data-email attribute
   * 2. On click, copy email to clipboard
   * 3. Show brief "Copied!" notification
   * 4. Hide notification after 1.5 seconds
   *
   * Why two methods:
   * - Modern browsers: navigator.clipboard.writeText (preferred)
   * - Older browsers: document.execCommand fallback
   *
   * Common mistakes:
   * - Forgetting to handle clipboard permissions
   * - Not providing fallback for older browsers
   */
  function setupEmailCopy(spanId, notificationId) {
    const emailElement = document.getElementById(spanId);
    const notification = document.getElementById(notificationId);

    if (!emailElement) {
      return; // Element doesn't exist on this page
    }

    const email = emailElement.getAttribute('data-email') || 'bonwookoo@yonsei.ac.kr';

    emailElement.addEventListener('click', function(event) {
      event.preventDefault();
      event.stopPropagation();

      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
          .then(function() {
            showNotification(notification);
          })
          .catch(function() {
            // If modern API fails, use fallback
            fallbackCopy(email, notification);
          });
      } else {
        // Older browsers: use fallback immediately
        fallbackCopy(email, notification);
      }
    });
  }

  /**
   * FALLBACK COPY METHOD
   *
   * How it works:
   * 1. Create invisible textarea
   * 2. Put email text in it
   * 3. Select the text
   * 4. Execute copy command
   * 5. Remove textarea
   *
   * Why this works:
   * - document.execCommand is old but widely supported
   * - Required for iOS Safari and older browsers
   */
  function fallbackCopy(email, notification) {
    const textarea = document.createElement('textarea');
    textarea.value = email;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';

    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand('copy');
      showNotification(notification);
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }

    document.body.removeChild(textarea);
  }

  /**
   * SHOW COPY NOTIFICATION
   *
   * Simple fade-in/fade-out animation
   * CSS handles the transition, we just toggle opacity
   */
  function showNotification(notification) {
    if (!notification) {
      return;
    }

    notification.style.opacity = '1';

    setTimeout(function() {
      notification.style.opacity = '0';
    }, 1500);
  }

  /**
   * LANGUAGE TOGGLE
   *
   * How it works:
   * 1. Find KR and EN buttons
   * 2. On click, change body class
   * 3. Update active button styling
   *
   * What happens:
   * - body.lang-en → shows .lang-en content, hides .lang-ko
   * - body.lang-ko → shows .lang-ko content, hides .lang-en
   *
   * Common mistake: Forgetting to update button active states
   */
  function initLanguageToggle() {
    const body = document.body;
    const btnKR = document.getElementById('lang-kr-btn');
    const btnEN = document.getElementById('lang-en-btn');

    if (!btnKR || !btnEN) {
      console.warn('Language toggle buttons not found');
      return;
    }

    // Korean button click
    btnKR.addEventListener('click', function() {
      body.classList.remove('lang-en');
      body.classList.add('lang-ko');
      btnKR.classList.add('active');
      btnEN.classList.remove('active');
    });

    // English button click
    btnEN.addEventListener('click', function() {
      body.classList.remove('lang-ko');
      body.classList.add('lang-en');
      btnEN.classList.add('active');
      btnKR.classList.remove('active');
    });
  }

  /**
   * INITIALIZATION
   *
   * Setup both email copy handlers:
   * - Hero section email link
   * - Contact section email link
   *
   * Then initialize language toggle
   */
  document.addEventListener('DOMContentLoaded', function() {
    // Email copy in hero section
    setupEmailCopy('hero-email-link', 'hero-copy-notification');

    // Email copy in contact section
    setupEmailCopy('email-link', 'copy-notification');

    // Email copy in member card (using class selector)
    const memberEmailIcon = document.querySelector('.member-links .clickable-email');
    if (memberEmailIcon) {
      const email = memberEmailIcon.getAttribute('data-email') || 'bonwookoo@yonsei.ac.kr';
      memberEmailIcon.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email)
            .then(function() {
              // Show notification message
              showMemberEmailNotification();
            })
            .catch(function() {
              fallbackCopy(email);
            });
        } else {
          fallbackCopy(email);
        }
      });
    }

    // Function to show email copied notification for member card
    function showMemberEmailNotification() {
      // Create notification element if it doesn't exist
      let notification = document.getElementById('member-email-notification');
      if (!notification) {
        notification = document.createElement('div');
        notification.id = 'member-email-notification';
        notification.className = 'member-email-notification';
        notification.innerHTML = '<span class="lang-en">E-mail address copied.</span><span class="lang-ko">이메일 주소 복사 완료</span>';
        document.body.appendChild(notification);
      }

      // Show notification
      notification.classList.add('show');

      // Hide after 2 seconds
      setTimeout(function() {
        notification.classList.remove('show');
      }, 2000);
    }

    // Stop propagation for all member link icons to prevent CV modal from opening
    const allMemberLinks = document.querySelectorAll('.member-link-icon');
    allMemberLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        event.stopPropagation();
      });
    });

    // Email copy in CV modal
    const cvEmailIcon = document.querySelector('.cv-modal-links .clickable-email');
    if (cvEmailIcon) {
      const email = cvEmailIcon.getAttribute('data-email') || 'bonwookoo@yonsei.ac.kr';
      cvEmailIcon.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email)
            .then(function() {
              showMemberEmailNotification();
            })
            .catch(function() {
              fallbackCopy(email);
            });
        } else {
          fallbackCopy(email);
        }
      });
    }

    // Language switcher
    initLanguageToggle();
  });

})();
