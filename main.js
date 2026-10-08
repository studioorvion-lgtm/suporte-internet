/**
 * AJUDA COM SUA CONEXÃO — GESTÃO DE CONVERSÃO & WHATSAPP
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
   * Constrói a mensagem padrão do WhatsApp conforme especificação exata:
   * “Olá! Estou com problema na minha internet.
   *
   * Problema: [problema]
   * Cidade/Bairro:
   * Internet atual:”
   */
  function buildWhatsAppMessage(problemSelected) {
    let msg = 'Olá! Estou com problema na minha internet.\n\n';
    msg += 'Problema: ' + (problemSelected ? problemSelected : '') + '\n';
    msg += 'Cidade/Bairro:\n';
    msg += 'Internet atual:';

    // Se houver termo de pesquisa ou campanha vindo do Google Ads, preserva
    if (currentTracking.utm_term) {
      msg += '\n\nRef: ' + currentTracking.utm_term;
    }

    return msg;
  }

  /**
   * Dispara evento de conversão do Google Ads e dataLayer sem duplicidade
   */
  let lastConversionTime = 0;
  function trackConversion(label, problem) {
    const now = Date.now();
    // Previne disparos repetidos acidentais no mesmo clique
    if (now - lastConversionTime < 500) {
      return;
    }
    lastConversionTime = now;

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
  function getWhatsAppUrl(problem) {
    const text = buildWhatsAppMessage(problem);
    const encoded = encodeURIComponent(text);
    return 'https://wa.me/' + activePhone + '?text=' + encoded;
  }

  /**
   * Abre o WhatsApp disparando conversão
   */
  function openWhatsApp(problem, buttonLabel) {
    trackConversion(buttonLabel || 'whatsapp_button', problem);

    const url = getWhatsAppUrl(problem);

    // Delay de 120ms para garantir envio da tag do Google Ads
    setTimeout(function () {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 120);
  }

  // Inicialização no DOM
  document.addEventListener('DOMContentLoaded', function () {
    // 1. Atualiza todos os botões e links com data-wa-trigger
    const buttons = document.querySelectorAll('[data-wa-trigger]');
    buttons.forEach(function (btn) {
      const problem = btn.getAttribute('data-problem') || '';
      const label = btn.getAttribute('data-label') || 'cta_click';
      const url = getWhatsAppUrl(problem);
      
      btn.setAttribute('href', url);
      btn.setAttribute('target', '_blank');
      btn.setAttribute('rel', 'noopener noreferrer');

      btn.addEventListener('click', function (e) {
        trackConversion(label, problem);
      });
    });

    // 2. Cards de problemas da Seção 2 (toque no card abre WhatsApp com o problema específico)
    const problemCards = document.querySelectorAll('.problem-card');
    problemCards.forEach(function (card) {
      card.addEventListener('click', function (e) {
        if (e.target.tagName.toLowerCase() !== 'a' && !e.target.closest('a')) {
          const problem = card.getAttribute('data-problem') || '';
          openWhatsApp(problem, 'card_' + (problem.toLowerCase().replace(/\s+/g, '_')));
        }
      });
    });

    // 3. Controle de visibilidade da barra fixa mobile
    const stickyBar = document.getElementById('mobile-sticky-bar');
    const heroSection = document.querySelector('.hero-section');

    if (stickyBar && heroSection) {
      function checkStickyVisibility() {
        const heroBottom = heroSection.getBoundingClientRect().bottom;
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

  // Exporta função global
  window.openWhatsApp = openWhatsApp;
})();
