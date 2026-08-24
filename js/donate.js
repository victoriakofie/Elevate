/* =========================================================
   donate.js — donation form: amount picker, field validation,
   and a simulated "payment received" phone notification.

   IMPORTANT (read me): a static front-end cannot actually charge
   a card or send a real SMS. In production, the form's data would
   POST to a server, which would call a payment gateway (e.g.
   Paystack/Flutterwave/Stripe) and, on a successful webhook, call
   an SMS API (e.g. Africa's Talking or Twilio) to text the donor.
   Below, that final step is simulated in the browser so the flow
   can be demoed end-to-end: we try the real Web Notification API
   first (this is the closest a browser can get to "the user's
   phone"), and always show an on-screen confirmation as well.
   ========================================================= */
(function () {
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('donation-form');
    if (!form) return;

    /* ---------- amount picker ---------- */
    var amountOpts = document.querySelectorAll('.amount-opt');
    var amountInput = document.getElementById('amount');
    amountOpts.forEach(function (opt) {
      opt.addEventListener('click', function () {
        amountOpts.forEach(function (o) { o.classList.remove('selected'); });
        opt.classList.add('selected');
        amountInput.value = opt.dataset.value;
      });
    });

    /* ---------- validation rules ---------- */
    var rules = {
      fullname: {
        // letters and symbols only — no digits
        test: function (v) { return /^[A-Za-z\s.,'\-&]+$/.test(v.trim()) && v.trim().length > 1; },
        message: 'Use letters and symbols only (no numbers).'
      },
      phone: {
        // numbers only
        test: function (v) { return /^[0-9]{7,15}$/.test(v.trim()); },
        message: 'Numbers only, 7–15 digits, no spaces or letters.'
      },
      email: {
        // letters, numbers and symbols in a valid email shape
        test: function (v) { return /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(v.trim()); },
        message: 'Enter a valid email address.'
      },
      bankname: {
        // letters only
        test: function (v) { return /^[A-Za-z\s]+$/.test(v.trim()) && v.trim().length > 1; },
        message: 'Bank name should contain letters only.'
      }
    };

    function fieldWrap(input) { return input.closest('.field'); }

    function validateField(input) {
      var rule = rules[input.name];
      if (!rule) return true;
      var wrap = fieldWrap(input);
      var ok = rule.test(input.value);
      wrap.classList.toggle('invalid', !ok && input.value.length > 0);
      wrap.classList.toggle('valid', ok);
      var msg = wrap.querySelector('.error-msg');
      if (msg) msg.textContent = rule.message;
      return ok;
    }

    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      // block characters that are outright disallowed as the person types
      input.addEventListener('input', function () {
        if (name === 'phone') {
          input.value = input.value.replace(/[^0-9]/g, '');
        }
        if (name === 'bankname') {
          input.value = input.value.replace(/[^A-Za-z\s]/g, '');
        }
        if (name === 'fullname') {
          input.value = input.value.replace(/[0-9]/g, '');
        }
        validateField(input);
      });
      input.addEventListener('blur', function () { validateField(input); });
    });

    /* ---------- submit: validate everything, then "process" ---------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var allValid = true;
      Object.keys(rules).forEach(function (name) {
        var input = form.elements[name];
        if (input && !validateField(input)) allValid = false;
      });
      if (!amountInput.value) {
        alert('Please choose or enter a donation amount.');
        return;
      }
      if (!allValid) return;

      var submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing payment…';

      // simulate gateway round-trip
      setTimeout(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Give donation';
        showPaymentReceived();
        notifyPhone();
        form.reset();
        amountOpts.forEach(function (o) { o.classList.remove('selected'); });
        document.querySelectorAll('.field').forEach(function (w) {
          w.classList.remove('valid', 'invalid');
        });
      }, 1200);
    });

    function showPaymentReceived() {
      var toast = document.getElementById('pay-toast');
      toast.classList.add('show');
    }

    function notifyPhone() {
      var mock = document.getElementById('phone-mock');
      mock.classList.add('show');

      // Best-effort real browser notification, standing in for an SMS/push
      // to the donor's phone. Requires the user's permission; silently
      // does nothing if unsupported or denied — the on-screen mock above
      // always covers that case.
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Elevate', { body: 'Thank you! Your donation was received.' });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(function (perm) {
            if (perm === 'granted') {
              new Notification('Elevate', { body: 'Thank you! Your donation was received.' });
            }
          });
        }
      }
    }
  });
})();
