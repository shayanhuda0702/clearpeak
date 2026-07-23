document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".page");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".site-header__toggle");
  const navigation = document.querySelector(".site-header__nav");
  const navigationLinks = document.querySelectorAll(".site-header__link");
  const faqButtons = document.querySelectorAll(".faq__question");
  const revealElements = document.querySelectorAll(".reveal");
  const counters = document.querySelectorAll(".stats__number");
  const quoteForm = document.querySelector("#quote-form");
  const formStatus = document.querySelector("#form-status");
  const year = document.querySelector("#year");

  page?.classList.add("page--js");

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  const updateHeader = () => {
    header?.classList.toggle("site-header--scrolled", window.scrollY > 10);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const openNavigation = () => {
    if (!navigation || !navToggle) return;

    navigation.classList.add("site-header__nav--open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close navigation menu");
  };

  const closeNavigation = () => {
    if (!navigation || !navToggle) return;

    navigation.classList.remove("site-header__nav--open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation menu");
  };

  navToggle?.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpen = navigation?.classList.contains("site-header__nav--open");

    if (isOpen) {
      closeNavigation();
    } else {
      openNavigation();
    }
  });

  navigation?.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  navigationLinks.forEach((link) => {
    link.addEventListener("click", closeNavigation);
  });

  document.addEventListener("click", closeNavigation);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeNavigation();
      navToggle?.focus();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeNavigation();
    }
  });

  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const currentItem = button.closest(".faq__item");
      if (!currentItem) return;

      const willOpen = !currentItem.classList.contains("faq__item--open");

      document.querySelectorAll(".faq__item").forEach((item) => {
        item.classList.remove("faq__item--open");

        const itemButton = item.querySelector(".faq__question");
        itemButton?.setAttribute("aria-expanded", "false");
      });

      if (willOpen) {
        currentItem.classList.add("faq__item--open");
        button.setAttribute("aria-expanded", "true");
      }
    });
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          entry.target.classList.add("reveal--visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -24px 0px"
      }
    );

    revealElements.forEach((element) => {
      revealObserver.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("reveal--visible");
    });
  }

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target);
    if (!Number.isFinite(target)) return;

    const duration = 1000;
    const start = performance.now();

    const update = (time) => {
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      counter.textContent = String(Math.round(target * eased));

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        counter.textContent = String(target);
      }
    };

    requestAnimationFrame(update);
  };

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          animateCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => {
      counterObserver.observe(counter);
    });
  } else {
    counters.forEach(animateCounter);
  }

  const navSections = document.querySelectorAll(
    "#services, #industries, #why-us, #process, #contact"
  );

  if ("IntersectionObserver" in window && navSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          navigationLinks.forEach((link) => {
            const pointsToSection =
              link.getAttribute("href") === `#${entry.target.id}`;

            link.classList.toggle(
              "site-header__link--active",
              pointsToSection
            );
          });
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
        threshold: 0
      }
    );

    navSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  quoteForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = quoteForm.querySelector(".quote-form__button");
    const buttonText = quoteForm.querySelector(".quote-form__button-text");
    const action = quoteForm.getAttribute("action") || "";
    const isConfigured = !action.includes("YOUR_FORM_ID");
    const formData = new FormData(quoteForm);
    const name = String(formData.get("name") || "").trim();

    submitButton?.classList.add("quote-form__button--loading");
    submitButton?.setAttribute("aria-busy", "true");

    if (buttonText) {
      buttonText.textContent = isConfigured ? "Sending request…" : "Checking form…";
    }

    if (!isConfigured) {
      window.setTimeout(() => {
        if (formStatus) {
          formStatus.textContent = name
            ? `Thank you, ${name}. The page is working correctly. Add your Formspree ID when you are ready to activate submissions.`
            : "The page is working correctly. Add your Formspree ID when you are ready to activate submissions.";
        }
        submitButton?.classList.remove("quote-form__button--loading");
        submitButton?.removeAttribute("aria-busy");
        if (buttonText) buttonText.textContent = "Request My Quote";
      }, 450);
      return;
    }

    try {
      const response = await fetch(action, { method: "POST", body: formData, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Submission failed");
      window.location.href = "thank-you.html";
    } catch (error) {
      if (formStatus) formStatus.textContent = "We could not send the request. Please try again or contact us directly.";
      submitButton?.classList.remove("quote-form__button--loading");
      submitButton?.removeAttribute("aria-busy");
      if (buttonText) buttonText.textContent = "Request My Quote";
    }
  });
});
