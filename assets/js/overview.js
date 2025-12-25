// Publication Overview - Interactive Charts and Visuals

// Wait for DOM and Chart.js to load
document.addEventListener('DOMContentLoaded', function() {
  initializeCharts();
});

function initializeCharts() {
  // Initialize concept chart
  const conceptCtx = document.getElementById('conceptChart');
  if (conceptCtx) {
    createConceptChart(conceptCtx);
  }

  // Initialize premium chart
  const premiumCtx = document.getElementById('premiumChart');
  if (premiumCtx) {
    createPremiumChart(premiumCtx);
  }
}

// Concept Diagram Chart - Showing relationship between elevation and price
function createConceptChart(ctx) {
  new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Property Value vs Height Above Flood Elevation',
        data: generateConceptData(),
        backgroundColor: 'rgba(37, 99, 235, 0.6)',
        borderColor: 'rgba(37, 99, 235, 1)',
        pointRadius: 6,
        pointHoverRadius: 8
      },
      {
        label: 'Trend Line',
        data: [{x: 0, y: 100}, {x: 10, y: 130}],
        type: 'line',
        borderColor: 'rgba(14, 165, 233, 0.8)',
        borderWidth: 3,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `Height: ${context.parsed.x}m, Value: $${context.parsed.y}k`;
              }
              return '';
            }
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Height Above Flood Elevation (meters)',
            font: {
              size: 12,
              weight: '600'
            },
            color: '#475569'
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          },
          ticks: {
            color: '#64748b'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Property Value Index',
            font: {
              size: 12,
              weight: '600'
            },
            color: '#475569'
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)'
          },
          ticks: {
            color: '#64748b',
            callback: function(value) {
              return '$' + value + 'k';
            }
          }
        }
      }
    }
  });
}

// Generate sample data for concept chart
function generateConceptData() {
  const data = [];
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * 10;
    const y = 100 + (x * 3) + (Math.random() * 10 - 5);
    data.push({x: x, y: y});
  }
  return data;
}

// Premium Effect Chart - Showing pre and post flood premium
function createPremiumChart(ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['0-2m', '2-4m', '4-6m', '6-8m', '8-10m', '10m+'],
      datasets: [
        {
          label: 'Pre-Flood (2010-2013)',
          data: [2.1, 4.3, 6.2, 8.4, 10.1, 11.8],
          backgroundColor: 'rgba(100, 116, 139, 0.7)',
          borderColor: 'rgba(100, 116, 139, 1)',
          borderWidth: 1
        },
        {
          label: 'Post-Flood (2013-2016)',
          data: [3.2, 6.8, 10.1, 13.6, 16.2, 18.9],
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: 'rgba(37, 99, 235, 1)',
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
            font: {
              size: 13,
              weight: '500'
            },
            color: '#475569',
            padding: 15,
            usePointStyle: true
          }
        },
        title: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': +' + context.parsed.y + '% price premium';
            }
          },
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: 'rgba(226, 232, 240, 0.2)',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          boxPadding: 6
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Height Above Flood Elevation',
            font: {
              size: 13,
              weight: '600'
            },
            color: '#475569',
            padding: {top: 10}
          },
          grid: {
            display: false
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12
            }
          }
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Price Premium (%)',
            font: {
              size: 13,
              weight: '600'
            },
            color: '#475569'
          },
          grid: {
            color: 'rgba(226, 232, 240, 0.5)',
            lineWidth: 1
          },
          ticks: {
            color: '#64748b',
            font: {
              size: 12
            },
            callback: function(value) {
              return '+' + value + '%';
            }
          }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  });
}

// Add smooth scroll for breadcrumb
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// Add animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, observerOptions);

// Observe all content sections
document.addEventListener('DOMContentLoaded', function() {
  const sections = document.querySelectorAll('.content-section, .innovation-section, .cta-section');
  sections.forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
  });
});
