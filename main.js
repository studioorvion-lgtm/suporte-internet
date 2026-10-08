/**
 * SUPORTE DE INTERNET — GESTÃO DE CONVERSÃO & WHATSAPP
 * Otimizado para tráfego do Google Ads
 */

(function () {
  'use strict';

  // Configuração padrão do WhatsApp
  const DEFAULT_PHONE = '5511964322774';
  const GOOGLE_ADS_CONVERSION_ID = 'AW-18476149806/1u9PCI-jhYcdEK7YjupE';

  // Recupera parâmetros de URL (UTMs e GCLID) e persiste no sessionStorage
  const UTM_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'tel'
  ];

  function getTrackingParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const tracking = {};

    UTM_KEYS.forEach(function (key) {
      const val = urlParams.get(key);
      if (val) {
        tracking[key] = val;
        try {
          sessionStorage.setItem('trk_' + key, val);
          localStorage.setItem('trk_' + key, val);
        } catch (e) {}
      } else {
        try {
          const stored = sessionStorage.getItem('trk_' + key) || localStorage.getItem('trk_' + key);
          if (stored) {
            tracking[key] = stored;
          }
        } catch (e) {}
      }
    });

    return tracking;
  }

  const currentTracking = getTrackingParams();
  const activePhone = currentTracking.tel || DEFAULT_PHONE;

  /**
   * Constrói a mensagem padrão do WhatsApp conforme requisito:
   * “Olá! Estou com problema na minha internet e preciso de atendimento.
   *
   * Problema: [problema]
   * Cidade/Bairro:
   * Internet atual:”
   */
  function buildWhatsAppMessage(problemSelected) {
    let msg = 'Olá! Estou com problema na minha internet e preciso de atendimento.\n\n';
    msg += 'Problema: ' + (problemSelected ? problemSelected : '') + '\n';
    msg += 'Cidade/Bairro:\n';
    msg += 'Internet atual:';

    // Se houver termo de pesquisa ou campanha vindo do Google Ads, registra discretamente
    if (currentTracking.utm_term) {
      msg += '\n\nRef: ' + currentTracking.utm_term;
    }

    return msg;
  }

  /**
   * Dispara evento de conversão do Google Ads e dataLayer
   */
  function trackConversion(label, problem) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'whatsapp_conversion',
        conversion_label: label || 'cta_click',
        problem_type: problem || 'geral',
        gclid: currentTracking.gclid || null,
        utm_source: currentTracking.utm_source || 'direct',
        utm_campaign: currentTracking.utm_campaign || null,
        timestamp: new Date().toISOString()
      });

      if (typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: GOOGLE_ADS_CONVERSION_ID,
          event_category: 'WhatsApp',
          event_label: label || 'cta_click',
          value: 1.0,
          currency: 'BRL'
        });
      }
    } catch (err) {
      console.warn('Erro ao registrar conversão:', err);
    }
  }

  /**
   * Gera o link do WhatsApp com mensagem codificada
   */
  function getWhatsAppUrl(problem, buttonId) {
    const text = buildWhatsAppMessage(problem);
    const encoded = encodeURIComponent(text);
    return 'https://wa.me/' + activePhone + '?text=' + encoded;
  }

  /**
   * Abre o WhatsApp disparando conversão
   */
  function openWhatsApp(problem, buttonLabel) {
    trackConversion(buttonLabel || 'whatsapp_button', problem);

    const url = getWhatsAppUrl(problem, buttonLabel);

    // Pequeno delay de 120ms para garantir envio da tag do Google Ads
    setTimeout(function () {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 120);
  }

  // Inicialização no DOM
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Atualiza todos os links com classe .btn-whatsapp
    const buttons = document.querySelectorAll('[data-wa-trigger]');
    buttons.forEach(function (btn) {
      const problem = btn.getAttribute('data-problem') || '';
      const label = btn.getAttribute('data-label') || 'cta_click';
      const url = getWhatsAppUrl(problem, label);
      
      btn.setAttribute('href', url);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');

      btn.addEventListener('click', function (e) {
        trackConversion(label, problem);
      });
    });

    // 2. Cards de problemas da Seção 2
    const problemCards = document.querySelectorAll('.problem-card');
    problemCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        // Se já não clicou direto na tag <a>
        if (e.target.tagName.toLowerCase() !== 'a') {
          const problem = card.getAttribute('data-problem') || '';
          openWhatsApp(problem, 'card_' + (problem.toLowerCase().replace(/\s+/g, '_')));
        }
      });
    });

    // 3. Indicador dinâmico de horário e atendimento online
    const liveTimeEl = document.getElementById('live-time');
    if (liveTimeEl) {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      liveTimeEl.textContent = hours + ':' + minutes;
    }

    // 4. Controle de visibilidade da barra fixa mobile
    const stickyBar = document.getElementById('mobile-sticky-bar');
    const heroSection = document.querySelector('.hero-section');

    if (stickyBar && heroSection) {
      function checkStickyVisibility() {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
        // Mostra a barra fixa no mobile após scrollar levemente ou logo abaixo da primeira dobra
        if (window.innerWidth <= 768) {
          if (heroBottom < 100) {
            stickyBar.classList.add('is-active');
          } else {
            stickyBar.classList.remove('is-active');
          }
        } else {
          stickyBar.classList.remove('is-active');
        }
      }

      window.addEventListener('scroll', checkStickyVisibility, { passive: true });
      window.addEventListener('resize', checkStickyVisibility, { passive: true });
      checkStickyVisibility();
    }
  });

  // Exporta para escopo global se necessário
  window.openWhatsApp = openWhatsApp;
})();
