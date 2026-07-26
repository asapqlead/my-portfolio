/**
 * Interactive functionality for Neobrutalist Portfolio
 * Enhances user interaction while preserving exact layout & visual fidelity.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- Navigation & Section Highlight ---
  const navItems = document.querySelectorAll('.nav-item');
  const mainContent = document.getElementById('mainContent');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Remove active class from all navigation items
      navItems.forEach(nav => nav.classList.remove('active'));
      // Add active class to clicked item
      item.classList.add('active');

      // Optional: Show toast notification for interactive feel
      const sectionName = item.querySelector('span').innerText;
      showToast(`Navigated to ${sectionName}`);
    });
  });


  // --- Resume Button Interactive Feedback ---
  const resumeBtn = document.getElementById('resumeBtn');
  if (resumeBtn) {
    resumeBtn.addEventListener('click', () => {
      showToast('Opening Resume document...');
      window.open('files/CHHOM_ALEAD_CV.pdf', '_blank');
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

  // --- Smooth Card Click Effects ---
  const cards = document.querySelectorAll('.card-proj, .card-item');
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.zIndex = '5';
    });
    card.addEventListener('mouseleave', () => {
      card.style.zIndex = '1';
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
      const message = document.getElementById('senderMessage').value.trim();

      if (!name || !contact || !message) {
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
          body: JSON.stringify({ name, contact, message })
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
});
