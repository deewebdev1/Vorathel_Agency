const navbar = document.querySelector('.navbar');
const logo = document.querySelector('.logo');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-nav-link');
const dropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');

// Navbar scroll & logo change
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
    logo.src = 'Vorathel.png';
  } else {
    navbar.classList.remove('scrolled');
    logo.src = 'Vorathel2.png';
  }
});

// Hamburger click - toggle menu & X animation
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');  // X animation
  mobileMenu.classList.toggle('open'); // dropdown menu
});

// Close menu when clicking a link
mobileLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
  });
});

// Toggle dropdown (Solutions)
dropdownBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const parent = btn.parentElement; // .mobile-dropdown
    parent.classList.toggle('open');
  });
});



const counters = document.querySelectorAll('.counter');
let counterStarted = false;

const runCounters = () => {
  counters.forEach(counter => {
    const target = +counter.dataset.target;
    const suffix = counter.dataset.suffix || '';
    let current = 0;

    const updateCounter = () => {
      const increment = target / 80;

      if (current < target) {
        current += increment;
        counter.textContent = Math.ceil(current);
        setTimeout(updateCounter, 20);
      } else {
        counter.textContent = target + suffix;
      }
    };

    updateCounter();
  });
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !counterStarted) {
      counterStarted = true;
      runCounters();
    }
  });
}, { threshold: 0.4 });

observer.observe(document.querySelector('#about'));



const slider = document.getElementById("testimonial-scroll");

let isDown = false;
let startX;
let scrollLeft;

slider.addEventListener("mousedown", (e) => {
  isDown = true;
  slider.classList.add("active");
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
});

slider.addEventListener("mouseleave", () => {
  isDown = false;
});

slider.addEventListener("mouseup", () => {
  isDown = false;
});

slider.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 1.8;
  slider.scrollLeft = scrollLeft - walk;
});


document.querySelectorAll("#faq .faq-question").forEach(btn => {
  btn.addEventListener("click", () => {
    const item = btn.parentElement;

    document.querySelectorAll("#faq .faq-item").forEach(i => {
      if (i !== item) i.classList.remove("active");
    });

    item.classList.toggle("active");
  });
});




const faqCards = document.querySelectorAll('.faq-card');

  faqCards.forEach(card => {
    const button = card.querySelector('.faq-button');

    button.addEventListener('click', () => {
      faqCards.forEach(c => {
        if (c !== card) c.classList.remove('active');
      });
      card.classList.toggle('active');
    });
  });
  
  
  // ANIMATE ON SCROLL
const faders = document.querySelectorAll('.slide-left, .slide-right, .slide-up, .slide-down');

const appearOptions = {
  threshold: 0.2
};

const appearOnScroll = new IntersectionObserver(function(entries, observer){
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, appearOptions);

faders.forEach(fader => {
  appearOnScroll.observe(fader);
});

// FORM SUBMIT WITH FORM SUBMIT.CO
const contactForm = document.getElementById('contactForm');
const successPopup = document.getElementById('contact-success');

contactForm.addEventListener('submit', function(e) {
  e.preventDefault(); // prevent default reload

  const formData = new FormData(contactForm);

  fetch(contactForm.action, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (response.ok) {
      // Success popup
      successPopup.style.display = 'block';
      successPopup.querySelector('.progress-bar').style.width = '0%';
      setTimeout(() => {
        successPopup.querySelector('.progress-bar').style.width = '100%';
      }, 50);

      setTimeout(() => {
        successPopup.style.display = 'none';
        successPopup.querySelector('.progress-bar').style.width = '0%';
        contactForm.reset();
      }, 3500);
    } else {
      alert('Oops! Something went wrong. Please try again.');
    }
  })
  .catch(error => {
    console.error(error);
    alert('Network error! Please try again.');
  });
});



// === Vorathel Contact Form Popup ===
(function() {
  const form = document.getElementById('contactForm');
  const popup = document.getElementById('contact-success');

  if (!form || !popup) return; // safety check

  form.addEventListener('submit', function(event) {
    event.preventDefault(); // prevent default submit for JS animation

    // Show popup under the submit button
    popup.classList.add('visible'); // new unique class
    popup.querySelector('.progress-bar').style.width = '0%';

    // Animate the progress bar
    setTimeout(() => {
      popup.querySelector('.progress-bar').style.width = '100%';
    }, 30);

    // Hide popup after 3 seconds
    setTimeout(() => {
      popup.classList.remove('visible');
      popup.querySelector('.progress-bar').style.width = '0%';
      form.reset();
    }, 3000);

    // Optional: If you want real submission with FormSubmit
    // form.submit(); // uncomment this line to actually submit
  });
})();



