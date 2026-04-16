/* ========================================
   MADAO Dashboard — Navigation
   ======================================== */

(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.getElementById('nav-toggle');
  var links = document.getElementById('nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });

    // Close mobile menu when clicking a link
    var anchors = links.querySelectorAll('a');
    for (var i = 0; i < anchors.length; i++) {
      anchors[i].addEventListener('click', function () {
        links.classList.remove('open');
      });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!toggle.contains(e.target) && !links.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }

  // Set active nav link based on current page
  var currentPage = window.location.pathname.split('/').pop() || 'index.html';
  var navAnchors = document.querySelectorAll('.nav-links a');
  for (var j = 0; j < navAnchors.length; j++) {
    var href = navAnchors[j].getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      navAnchors[j].classList.add('active');
    }
  }
})();
