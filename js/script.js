/**
 * Interactive functionality for Neobrutalist Portfolio
 * Enhances user interaction while preserving exact layout & visual fidelity.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Scroll Spy Highlight ---
  const navItems = document.querySelectorAll('.nav-item');
  const mainContent = document.getElementById('mainContent');
  const sectionsData = [];

  navItems.forEach(item => {
    const href = item.getAttribute('href');
    if (href && href.includes('#')) {
      const targetId = href.substring(href.indexOf('#'));
      const sectionElem = document.querySelector(targetId);
      if (sectionElem) {
        sectionsData.push({ navItem: item, section: sectionElem });
      }
    }

    item.addEventListener('click', () => {
      // Remove active class from all navigation items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      // Optional: Show toast notification for interactive feel
      const spanElem = item.querySelector('span');
      if (spanElem && typeof showToast === 'function') {
        showToast(`Navigated to ${spanElem.innerText}`);
      }
    });
  });

  function updateActiveSection() {
    if (sectionsData.length === 0) return;

    // Detect whether desktop container (mainContent) or window/document is scrolling
    const isDesktop = window.innerWidth > 900 && mainContent && mainContent.scrollHeight > mainContent.clientHeight;
    const scrollTop = isDesktop ? mainContent.scrollTop : (window.scrollY || document.documentElement.scrollTop);
    const scrollHeight = isDesktop ? mainContent.scrollHeight : document.documentElement.scrollHeight;
    const clientHeight = isDesktop ? mainContent.clientHeight : window.innerHeight;

    let activeIndex = -1;

    // Check if scrolled to the absolute bottom of the scroll container
    if (scrollTop + clientHeight >= scrollHeight - 10 && scrollHeight > clientHeight) {
      activeIndex = sectionsData.length - 1;
    } else {
      // Trigger point around 35% down the visible viewport
      const topOffset = isDesktop && mainContent ? mainContent.getBoundingClientRect().top : 0;
      const triggerPoint = topOffset + (clientHeight * 0.35);

      sectionsData.forEach((item, index) => {
        const rect = item.section.getBoundingClientRect();
        if (rect.top <= triggerPoint) {
          activeIndex = index;
        }
      });
    }

    if (activeIndex === -1 && sectionsData.length > 0) {
      activeIndex = 0; // Default to first section when near top
    }

    // Apply active state to navigation items
    sectionsData.forEach((item, index) => {
      if (index === activeIndex) {
        if (!item.navItem.classList.contains('active')) {
          navItems.forEach(nav => nav.classList.remove('active'));
          item.navItem.classList.add('active');
        }
      } else {
        item.navItem.classList.remove('active');
      }
    });
  }

  // Attach scroll spy listeners to both mainContent (desktop) and window (mobile)
  if (mainContent) {
    mainContent.addEventListener('scroll', updateActiveSection, { passive: true });
  }
  window.addEventListener('scroll', updateActiveSection, { passive: true });
  window.addEventListener('resize', updateActiveSection, { passive: true });
  updateActiveSection();


  // --- Resume Button Interactive Feedback ---
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      showToast('Opening Resume document...');
      window.open('files/CHHOM_ALEAD_RESUME.pdf', '_blank');
    });
  }

  // --- Toast Notification System ---
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  let toastTimeout = null;

  function showToast(message) {
    if (!toast || !toastMessage) return;

    // Clear any pending timeout
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }

    toastMessage.textContent = message;
    toast.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toast.classList.add('hidden');
    }, 3000);
  }

  // --- Smooth Card Click Effects & Project Flip ---
  const cards = document.querySelectorAll('.card-proj, .card-item');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '5';
    });
    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '1';
    });
  });

  const projCards = document.querySelectorAll('.card-proj');
  projCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Prevent flipping if a link, button, or the live annotation is clicked
      if (e.target.closest('a') || e.target.closest('button') || e.target.closest('.live-annotation')) {
        return;
      }
      card.classList.toggle('is-flipped');
    });
  });

  // --- Collaboration Form Handler (via Vercel Serverless Function Backend) ---
  const API_ENDPOINT_URL = '/api/contact';

  const collabForm = document.getElementById('collabForm');
  const submitCollabBtn = document.getElementById('submitCollabBtn');

  if (collabForm) {
    collabForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('senderName').value.trim();
      const contact = document.getElementById('senderContact').value.trim();
      const subjectInput = document.getElementById('senderSubject');
      const subject = subjectInput ? subjectInput.value.trim() : 'Portfolio Collaboration Inquiry';
      const message = document.getElementById('senderMessage').value.trim();

      if (!name || !contact || !subject || !message) {
        showToast('Please complete all form fields.');
        return;
      }

      // Send form payload securely to Vercel Serverless backend
      const originalText = submitCollabBtn ? submitCollabBtn.innerHTML : '';
      if (submitCollabBtn) {
        submitCollabBtn.disabled = true;
        submitCollabBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" style="margin-right: 8px;"></i> Sending...';
      }

      try {
        const response = await fetch(API_ENDPOINT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, contact, subject, message })
        });

        const data = await response.json().catch(() => ({}));
        if (response.ok && (data.success || response.status === 200)) {
          showToast('Message sent!');
          collabForm.reset();
        } else {
          console.error('Backend submission error:', data);
          showToast(data.error || 'Failed to send message. Please try again.');
        }
      } catch (error) {
        console.error('Network error communicating with worker:', error);
        showToast('Network error while sending message.');
      } finally {
        if (submitCollabBtn) {
          submitCollabBtn.disabled = false;
          submitCollabBtn.innerHTML = originalText;
        }
      }
    });
  }

  // --- Mobile Smart Navigation Bar (Hide on Scroll Down, Show on Scroll Up) ---
  const sidebar = document.getElementById('sidebar');
  let lastScrollTop = 0;

  window.addEventListener('scroll', () => {
    if (window.innerWidth > 900 || !sidebar) return;

    const currentScrollTop = window.scrollY || document.documentElement.scrollTop;

    // Always reveal the navbar when near the top of the page
    if (currentScrollTop < 50) {
      sidebar.classList.remove('nav-hidden-mobile');
      lastScrollTop = Math.max(0, currentScrollTop);
      return;
    }

    const scrollDifference = currentScrollTop - lastScrollTop;

    if (scrollDifference > 10 && currentScrollTop > (sidebar.offsetHeight || 100)) {
      // Scrolling DOWN -> Hide Navbar
      sidebar.classList.add('nav-hidden-mobile');
      lastScrollTop = currentScrollTop;
    } else if (scrollDifference < -50) {
      // Scrolling UP deliberately by at least 50px -> Reveal Navbar
      sidebar.classList.remove('nav-hidden-mobile');
      lastScrollTop = currentScrollTop;
    }
  }, { passive: true });

  // Ensure navbar resets when resizing back to desktop viewports
  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && sidebar) {
      sidebar.classList.remove('nav-hidden-mobile');
    }
  });
});
