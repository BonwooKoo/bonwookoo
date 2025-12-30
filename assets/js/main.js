/**
 * Main JavaScript - Core site functionality
 *
 * What this does:
 * - Navbar scroll effect (shows logo when scrolled)
 * - Smooth scroll for anchor links
 *
 * Why separate file:
 * - Easier to debug and maintain
 * - Browser can cache separately
 * - Cleaner HTML structure
 */

(function() {
  'use strict';

  /**
   * NAVBAR SCROLL EFFECT
   *
   * How it works:
   * 1. Listen for scroll events
   * 2. Check if user scrolled past 60% of hero section
   * 3. Add/remove 'scrolled' class to navbar
   * 4. CSS handles the visual transition (logo fade-in, padding change)
   *
   * Common mistake: Using exact pixel values instead of percentages
   * makes the effect break on different screen sizes
   */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    const heroSection = document.getElementById('home');

    if (!navbar || !heroSection) {
      console.warn('Navbar or hero section not found');
      return;
    }

    window.addEventListener('scroll', function() {
      // Calculate when to trigger: 60% through hero section
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
      const scrollTrigger = heroBottom * 0.6;

      if (window.scrollY > scrollTrigger) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    });
  }

  /**
   * SMOOTH SCROLL FOR NAVIGATION
   *
   * How it works:
   * 1. Find all anchor links (href starting with #)
   * 2. Prevent default jump behavior
   * 3. Scroll smoothly to target element
   *
   * Why we do this:
   * - Better UX than instant jumping
   * - CSS scroll-behavior: smooth doesn't work in all browsers
   * - Gives us more control over scroll behavior
   */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');

        // Skip if it's just "#" (empty fragment)
        if (targetId.length <= 1) {
          return;
        }

        const target = document.querySelector(targetId);

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

  /**
   * SYNC MODAL LANGUAGE WITH MAIN PAGE
   *
   * Syncs the modal's language state to match the main page's current language.
   * Checks document.body classes (lang-ko or lang-en) and applies to modal.
   */
  function syncModalLanguageWithMain(modal) {
    const modalBody = modal.querySelector('.viz-modal-body');
    const langToggle = modal.querySelector('.lang-toggle');

    if (!modalBody || !langToggle) return;

    // Check main page language
    const isKorean = document.body.classList.contains('lang-ko');
    const langBtns = langToggle.querySelectorAll('.lang-btn');

    if (isKorean) {
      // Set to Korean
      modalBody.classList.add('lang-ko-active');
      modalBody.classList.remove('lang-en-active');

      // Update button states
      langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === 'ko') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    } else {
      // Set to English
      modalBody.classList.add('lang-en-active');
      modalBody.classList.remove('lang-ko-active');

      // Update button states
      langBtns.forEach(btn => {
        if (btn.getAttribute('data-lang') === 'en') {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }

  /**
   * CV MODAL
   *
   * How it works:
   * - Click on Bon Woo Koo's photo or member card to open CV modal
   * - Shows academic appointments, education, and research interests
   * - Close button or backdrop click closes the modal
   */
  function initCVModal() {
    const cvModal = document.getElementById('cv-modal');
    const aboutPhoto = document.querySelector('.about-photo');
    const memberCards = document.querySelectorAll('.member-card');

    if (!cvModal) return;

    // Open CV modal
    function openCVModal() {
      // Sync language with main page before showing
      syncModalLanguageWithMain(cvModal);

      cvModal.setAttribute('aria-hidden', 'false');
      cvModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    // Close CV modal
    function closeCVModal() {
      cvModal.setAttribute('aria-hidden', 'true');
      cvModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    // Add click event to about photo
    if (aboutPhoto) {
      aboutPhoto.addEventListener('click', openCVModal);
      aboutPhoto.style.cursor = 'pointer';
    }

    // Add click event to Bon Woo Koo's member card (first card)
    memberCards.forEach((card, index) => {
      // Only make the first card (Bon Woo Koo) clickable
      if (index === 0) {
        card.classList.add('clickable');
        card.addEventListener('click', openCVModal);
      }
    });

    // Close button
    const closeBtn = cvModal.querySelector('.viz-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeCVModal);
    }

    // Backdrop click
    const backdrop = cvModal.querySelector('.viz-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeCVModal);
    }

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && cvModal.getAttribute('aria-hidden') === 'false') {
        closeCVModal();
      }
    });
  }

  /**
   * PUBLICATION OVERVIEW MODAL
   *
   * How it works:
   * - Click "Overview" button on publications to see research summary with interactive visualizations
   * - Loads content from publication-overviews.json
   * - Displays in dark mode modal with Chart.js visualizations
   */
  function initOverviewModal() {
    const overviewModal = document.getElementById('overview-modal');
    const overviewBtns = document.querySelectorAll('.overview-btn');

    if (!overviewModal || overviewBtns.length === 0) return;

    // Load overview data
    let overviewData = {};
    fetch('assets/data/publication-overviews.json')
      .then(response => response.json())
      .then(data => {
        overviewData = data;
      })
      .catch(error => {
        console.log('Overview data not found, using fallback');
      });

    // Open overview modal
    function openOverviewModal(pubId) {
      const modalTitle = document.getElementById('overview-modal-title');
      const modalBody = overviewModal.querySelector('.overview-content');

      if (overviewData[pubId]) {
        modalTitle.textContent = overviewData[pubId].title;
        modalBody.innerHTML = overviewData[pubId].overview;

        // Initialize charts after content is loaded
        setTimeout(() => {
          if (pubId === 'vertical-premium') {
            initVerticalPremiumCharts();
          } else if (pubId === 'mental-health-covid') {
            initMentalHealthCovidCharts();
          } else if (pubId === 'urban-trees-safety') {
            initUrbanTreesSafetyCharts();
          } else if (pubId === 'streetscapes-servicescapes') {
            initStreetscapesServicescapesCharts();
          } else if (pubId === 'environmental-equity-atlanta') {
            initEnvironmentalEquityCharts();
          } else if (pubId === 'audio-sensors-pedestrian') {
            initAudioSensorsCharts();
          } else if (pubId === 'asped-dataset') {
            initAspedDatasetCharts();
          } else if (pubId === 'tree-crime-austin') {
            initTreeCrimeCharts();
          } else if (pubId === 'microscale-macroscale-streetscapes') {
            initMicroscaleMacroscaleCharts();
          } else if (pubId === 'automated-walkability-audit') {
            initAutomatedWalkabilityCharts();
          } else if (pubId === 'walkability-walking-behaviors') {
            initWalkabilityBehaviorsCharts();
          } else if (pubId === 'align-navigation') {
            initAlignNavigationCharts();
          } else if (pubId === 'spatial-modelling-forecasting') {
            initSpatialModellingCharts();
          } else if (pubId === 'pops-seoul') {
            initPopsSeoulCharts();
          }
        }, 100);
      } else {
        modalTitle.textContent = 'Publication Overview';
        modalBody.innerHTML = '<p>Overview content is being prepared. Please check back soon or refer to the PDF for full details.</p>';
      }

      // Sync language with main page before showing
      syncModalLanguageWithMain(overviewModal);

      overviewModal.setAttribute('aria-hidden', 'false');
      overviewModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Reset scroll position to top
      const modalContent = overviewModal.querySelector('.viz-modal-body');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }

    // Close overview modal
    function closeOverviewModal() {
      overviewModal.setAttribute('aria-hidden', 'true');
      overviewModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    // Add click events to overview buttons
    overviewBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const pubId = this.getAttribute('data-pub-id');
        openOverviewModal(pubId);
      });
    });

    // Close button
    const closeBtn = overviewModal.querySelector('.viz-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeOverviewModal);
    }

    // Backdrop click
    const backdrop = overviewModal.querySelector('.viz-modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', closeOverviewModal);
    }

    // ESC key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && overviewModal.getAttribute('aria-hidden') === 'false') {
        closeOverviewModal();
      }
    });
  }

  /**
   * Initialize charts for Vertical Premium publication
   */
  function initVerticalPremiumCharts() {
    // Premium effect chart
    const premiumCtx = document.getElementById('premium-chart');
    if (premiumCtx && typeof Chart !== 'undefined') {
      new Chart(premiumCtx, {
        type: 'bar',
        data: {
          labels: ['0-2m', '2-4m', '4-6m', '6-8m', '8-10m', '10m+'],
          datasets: [
            {
              label: 'Pre-Flood (2010-2013)',
              data: [2.1, 4.3, 6.2, 8.4, 10.1, 11.8],
              backgroundColor: 'rgba(148, 163, 184, 0.7)',
              borderColor: 'rgba(148, 163, 184, 1)',
              borderWidth: 1
            },
            {
              label: 'Post-Flood (2013-2016)',
              data: [3.2, 6.8, 10.1, 13.6, 16.2, 18.9],
              backgroundColor: 'rgba(78, 205, 196, 0.7)',
              borderColor: 'rgba(78, 205, 196, 1)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                color: '#1d1d1f',
                font: { size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return context.dataset.label + ': +' + context.parsed.y + '%';
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 } }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: {
                color: '#6E6E73',
                callback: function(value) {
                  return '+' + value + '%';
                }
              },
              title: {
                display: true,
                text: 'Price Premium (%)',
                color: '#E0E0E0'
              }
            }
          }
        }
      });
    }

    // Concept scatter chart
    const conceptCtx = document.getElementById('concept-chart');
    if (conceptCtx && typeof Chart !== 'undefined') {
      const scatterData = [];
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 10;
        const y = 100 + (x * 2.5) + (Math.random() * 8 - 4);
        scatterData.push({x: x, y: y});
      }

      new Chart(conceptCtx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Property Value vs Height',
            data: scatterData,
            backgroundColor: 'rgba(78, 205, 196, 0.6)',
            borderColor: 'rgba(78, 205, 196, 1)',
            pointRadius: 5
          },
          {
            label: 'Trend',
            data: [{x: 0, y: 100}, {x: 10, y: 125}],
            type: 'line',
            borderColor: 'rgba(255, 107, 107, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Height Above Flood Elevation (m)',
                color: '#1d1d1f'
              },
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 } }
            },
            y: {
              title: {
                display: true,
                text: 'Property Value Index',
                color: '#1d1d1f'
              },
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Mental Health COVID publication
   */
  function initMentalHealthCovidCharts() {
    const ctx = document.getElementById('mental-health-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Pre-COVID', 'Early COVID', 'Mid COVID', 'Late COVID'],
          datasets: [{
            label: 'High Walkability Areas',
            data: [100, 82, 75, 78],
            borderColor: 'rgba(78, 205, 196, 1)',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            tension: 0.3,
            fill: true
          }, {
            label: 'Low Walkability Areas',
            data: [100, 68, 58, 62],
            borderColor: 'rgba(255, 107, 107, 1)',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            tension: 0.3,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: {
            legend: { labels: { color: '#1d1d1f', font: { size: 11 } } }
          },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              beginAtZero: false,
              grid: { color: 'rgba(0, 0, 0, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 } },
              title: { display: true, text: 'Mental Health Facility Visits (Index)', color: '#1d1d1f', font: { size: 11 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Urban Trees Safety publication
   */
  function initUrbanTreesSafetyCharts() {
    const ctx = document.getElementById('trees-safety-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Well Maintained', 'Moderate', 'Poor Maintenance'],
          datasets: [{
            label: 'Safety Perception Change with Trees',
            data: [15, 3, -8],
            backgroundColor: ['rgba(78, 205, 196, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(255, 107, 107, 0.7)'],
            borderColor: ['rgba(78, 205, 196, 1)', 'rgba(255, 159, 64, 1)', 'rgba(255, 107, 107, 1)'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 }, callback: v => v + '%' },
              title: { display: true, text: 'Change in Safety Score (%)', color: '#1d1d1f' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Streetscapes Servicescapes publication
   */
  function initStreetscapesServicescapesCharts() {
    const ctx = document.getElementById('servicescape-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: [{
            label: 'Business Rating vs Walkability',
            data: Array.from({length: 40}, () => ({
              x: Math.random() * 100,
              y: 2 + (Math.random() * 100 * 0.025) + (Math.random() * 0.8)
            })),
            backgroundColor: 'rgba(78, 205, 196, 0.6)',
            borderColor: 'rgba(78, 205, 196, 1)'
          }, {
            label: 'Trend',
            data: [{x: 0, y: 2}, {x: 100, y: 4.5}],
            type: 'line',
            borderColor: 'rgba(255, 107, 107, 0.8)',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: {
              title: { display: true, text: 'Walkability Score', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            },
            y: {
              title: { display: true, text: 'Business Rating (Stars)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Environmental Equity publication
   */
  function initEnvironmentalEquityCharts() {
    const ctx = document.getElementById('equity-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['1996', '2008', '2014'],
          datasets: [{
            label: 'High Income Areas',
            data: [42, 45, 47],
            borderColor: 'rgba(78, 205, 196, 1)',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            fill: true
          }, {
            label: 'Low Income Areas',
            data: [30, 28, 29],
            borderColor: 'rgba(255, 107, 107, 1)',
            backgroundColor: 'rgba(255, 107, 107, 0.1)',
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { labels: { color: '#E0E0E0', font: { size: 11 } } } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Tree Canopy Coverage (%)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 }, callback: v => v + '%' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Audio Sensors publication
   */
  function initAudioSensorsCharts() {
    const ctx = document.getElementById('audio-sensor-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Correct Detection', 'False Positive', 'False Negative'],
          datasets: [{
            data: [85, 8, 7],
            backgroundColor: ['rgba(78, 205, 196, 0.7)', 'rgba(255, 159, 64, 0.7)', 'rgba(255, 107, 107, 0.7)']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: {
            legend: {
              labels: { color: '#1d1d1f', font: { size: 11 } },
              position: 'bottom'
            },
            tooltip: { callbacks: { label: ctx => ctx.label + ': ' + ctx.parsed + '%' } }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for ASPED Dataset publication
   */
  function initAspedDatasetCharts() {
    const ctx = document.getElementById('asped-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Urban Core', 'Residential', 'Commercial', 'Parks', 'Transit Hubs'],
          datasets: [{
            label: 'Hours of Audio Data',
            data: [28, 22, 18, 16, 18],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Hours', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Tree Crime publication
   */
  function initTreeCrimeCharts() {
    const ctx = document.getElementById('tree-crime-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Property Crime', 'Violent Crime', 'Daytime Crime', 'Nighttime Crime'],
          datasets: [{
            label: 'Effect of Large Trees',
            data: [-12, 3, -8, 5],
            backgroundColor: function(context) {
              return context.parsed.y < 0 ? 'rgba(78, 205, 196, 0.7)' : 'rgba(255, 107, 107, 0.7)';
            },
            borderColor: function(context) {
              return context.parsed.y < 0 ? 'rgba(78, 205, 196, 1)' : 'rgba(255, 107, 107, 1)';
            },
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Crime Rate Change (%)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 }, callback: v => v + '%' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Microscale Macroscale publication
   */
  function initMicroscaleMacroscaleCharts() {
    const ctx = document.getElementById('scale-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Good Macro\n+ Good Micro', 'Good Macro\n+ Poor Micro', 'Poor Macro\n+ Good Micro', 'Poor Macro\n+ Poor Micro'],
          datasets: [{
            label: 'Walking Likelihood',
            data: [100, 60, 55, 30],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Walking Propensity (Index)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Automated Walkability publication
   */
  function initAutomatedWalkabilityCharts() {
    const ctx = document.getElementById('automated-audit-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'radar',
        data: {
          labels: ['Sidewalks', 'Crossings', 'Trees', 'Lighting', 'Building Transparency', 'Street Furniture'],
          datasets: [{
            label: 'Automated Audit',
            data: [92, 88, 94, 86, 91, 89],
            borderColor: 'rgba(78, 205, 196, 1)',
            backgroundColor: 'rgba(78, 205, 196, 0.2)',
            pointBackgroundColor: 'rgba(78, 205, 196, 1)'
          }, {
            label: 'Manual Audit',
            data: [90, 91, 93, 88, 89, 92],
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.2)',
            pointBackgroundColor: 'rgba(255, 159, 64, 1)'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.5,
          plugins: { legend: { labels: { color: '#E0E0E0', font: { size: 11 } } } },
          scales: {
            r: {
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#6E6E73', font: { size: 10 }, backdropColor: 'transparent' },
              pointLabels: { color: '#1d1d1f' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Walkability Behaviors publication
   */
  function initWalkabilityBehaviorsCharts() {
    const ctx = document.getElementById('walkability-behavior-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Sidewalk Quality', 'Street Trees', 'Building Facade', 'Crossing Safety', 'Street Furniture'],
          datasets: [{
            label: 'Effect on Walking Frequency (%)',
            data: [35, 18, 12, 22, 8],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Variance Explained (%)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 }, callback: v => v + '%' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for ALIGN Navigation publication
   */
  function initAlignNavigationCharts() {
    const ctx = document.getElementById('align-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Shortest Path', 'Shade Priority', 'Safety Priority', 'Accessibility Priority'],
          datasets: [{
            label: 'Route Distance',
            data: [100, 105, 108, 112],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }, {
            label: 'User Satisfaction',
            data: [65, 92, 88, 94],
            backgroundColor: 'rgba(255, 159, 64, 0.7)',
            borderColor: 'rgba(255, 159, 64, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { labels: { color: '#1d1d1f' } } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Index (Shortest = 100)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for Spatial Modelling publication
   */
  function initSpatialModellingCharts() {
    const ctx = document.getElementById('spatial-model-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Statistical\nRegression', 'Agent-Based\nModel', 'Machine\nLearning', 'Integrated\nApproach'],
          datasets: [{
            label: 'Prediction Accuracy',
            data: [72, 68, 78, 85],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Prediction Accuracy (%)', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 }, callback: v => v + '%' }
            }
          }
        }
      });
    }
  }

  /**
   * Initialize charts for POPS Seoul publication
   */
  function initPopsSeoulCharts() {
    const ctx = document.getElementById('pops-chart');
    if (ctx && typeof Chart !== 'undefined') {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Food/Beverage\nDominant', 'Retail\nDominant', 'Office\nDominant', 'Mixed\nUse'],
          datasets: [{
            label: 'POPS Usage Rate (people/hour)',
            data: [42, 28, 12, 38],
            backgroundColor: 'rgba(78, 205, 196, 0.7)',
            borderColor: 'rgba(78, 205, 196, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 2,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: 'rgba(0, 0, 0, 0.1)' }, ticks: { color: '#6E6E73', font: { size: 10 } } },
            y: {
              title: { display: true, text: 'Average Users per Hour', color: '#1d1d1f' },
              grid: { color: 'rgba(255, 255, 255, 0.1)' },
              ticks: { color: '#B0B0B0', font: { size: 10 } }
            }
          }
        }
      });
    }
  }

  /**
   * INITIALIZATION
   *
   * Why DOMContentLoaded:
   * - Ensures all HTML is parsed before running JavaScript
   * - Prevents errors from trying to access elements that don't exist yet
   *
   * Common mistake: Running code before DOM is ready
   */
  /**
   * Initialize All Publications Modal
   */
  function initAllPublicationsModal() {
    const viewAllBtn = document.getElementById('view-all-publications-btn');
    const modal = document.getElementById('all-publications-modal');
    const closeBtn = modal?.querySelector('.viz-modal-close');
    const backdrop = modal?.querySelector('.viz-modal-backdrop');
    const modalList = document.getElementById('all-publications-list');

    if (!viewAllBtn || !modal || !modalList) return;

    // Get all publications (both visible and hidden)
    const allPublications = document.querySelectorAll('.publication-item');

    // Open modal and populate with all publications
    viewAllBtn.addEventListener('click', function() {
      // Clear existing content
      modalList.innerHTML = '';

      // Convert NodeList to Array and sort by year (descending)
      // Bike lanes paper comes first, then sort by year
      const sortedPublications = Array.from(allPublications).sort((a, b) => {
        const titleA = a.querySelector('.publication-title')?.textContent || '';
        const titleB = b.querySelector('.publication-title')?.textContent || '';

        // Check if either is the bike lanes paper
        const isBikeLanesA = titleA.includes('Automated Detection and Classification of Bike Lanes');
        const isBikeLanesB = titleB.includes('Automated Detection and Classification of Bike Lanes');

        // If one is bike lanes paper, it comes first
        if (isBikeLanesA && !isBikeLanesB) return -1;
        if (!isBikeLanesA && isBikeLanesB) return 1;

        // Otherwise, sort by year (descending)
        const yearA = parseInt(a.querySelector('.publication-number')?.textContent || '0');
        const yearB = parseInt(b.querySelector('.publication-number')?.textContent || '0');
        return yearB - yearA; // Descending order
      });

      // Clone all publication items into modal
      sortedPublications.forEach(pub => {
        const clone = pub.cloneNode(true);
        clone.classList.remove('hidden-publication');
        clone.style.display = 'flex';

        // Remove overview button from modal
        const overviewBtn = clone.querySelector('.overview-btn');
        if (overviewBtn) {
          overviewBtn.remove();
        }

        modalList.appendChild(clone);
      });

      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Scroll modal content to top
      const modalBody = modal.querySelector('.viz-modal-body');
      if (modalBody) {
        modalBody.scrollTop = 0;
      }
    });

    // Close modal
    function closeModal() {
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal();
      }
    });
  }

  /**
   * Initialize modal language toggle buttons
   */
  function initModalLangToggle() {
    // Setup language toggle for overview modal
    const overviewModal = document.getElementById('overview-modal');
    if (overviewModal) {
      const langToggle = overviewModal.querySelector('.lang-toggle');
      if (langToggle) {
        setupModalLanguageToggle(langToggle);
      }
    }

    // Setup language toggle for CV modal
    const cvModal = document.getElementById('cv-modal');
    if (cvModal) {
      const langToggle = cvModal.querySelector('.lang-toggle');
      if (langToggle) {
        setupModalLanguageToggle(langToggle);
      }
    }
  }

  /**
   * Setup language toggle functionality for a modal
   */
  function setupModalLanguageToggle(langToggle) {
    const langBtns = langToggle.querySelectorAll('.lang-btn');

    langBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedLang = this.getAttribute('data-lang');

        // Update active state
        langBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');

        // Get the modal element
        const modal = langToggle.closest('.viz-modal');
        const modalBody = modal.querySelector('.viz-modal-body');

        // Toggle language visibility
        if (selectedLang === 'en') {
          modalBody.classList.add('lang-en-active');
          modalBody.classList.remove('lang-ko-active');
        } else {
          modalBody.classList.add('lang-ko-active');
          modalBody.classList.remove('lang-en-active');
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    initNavbarScroll();
    initSmoothScroll();
    initCVModal();
    initOverviewModal();
    initAllPublicationsModal();
    initModalLangToggle();
  });

})();
