/**
 * BACKSTAGE - VIDEO INTRO
 * Sistema de vídeo de abertura inteligente
 * - Mostra apenas na primeira visita (localStorage)
 * - Apenas em desktop (não mobile/tablet)
 * - Botão "Pular" sempre visível
 * - Fade out suave
 * - Preload com timeout
 */

(function() {
  'use strict';

  // Constantes
  const INTRO_STORAGE_KEY = 'backstage_intro_shown';
  const PRELOAD_TIMEOUT = 3000; // 3 segundos max para carregar
  const FADE_OUT_DURATION = 800; // Duração do fade out em ms

  /**
   * Detecta se é um dispositivo mobile/tablet
   */
  function isMobileDevice() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

    // Verificar user agent
    if (mobileRegex.test(userAgent)) {
      return true;
    }

    // Verificar largura da tela
    if (window.innerWidth <= 768) {
      return true;
    }

    // Verificar touch support
    if ('maxTouchPoints' in navigator && navigator.maxTouchPoints > 0) {
      return true;
    }

    return false;
  }

  /**
   * Verifica se deve mostrar o intro
   */
  function shouldShowIntro() {
    // Não mostrar em mobile
    if (isMobileDevice()) {
      console.log('[Intro] Mobile detectado - pulando intro');
      return false;
    }

    // Verificar se já foi mostrado
    const introShown = localStorage.getItem(INTRO_STORAGE_KEY);
    if (introShown === 'true') {
      console.log('[Intro] Já foi exibido anteriormente - pulando');
      return false;
    }

    return true;
  }

  /**
   * Marca o intro como exibido
   */
  function markIntroAsShown() {
    try {
      localStorage.setItem(INTRO_STORAGE_KEY, 'true');
      console.log('[Intro] Marcado como exibido');
    } catch (e) {
      console.error('[Intro] Erro ao salvar no localStorage:', e);
    }
  }

  /**
   * Remove o overlay com fade out suave
   */
  function hideIntro() {
    const overlay = document.querySelector('.intro-overlay');
    if (!overlay) return;

    console.log('[Intro] Ocultando overlay...');

    // Adicionar classe hidden para fade out
    overlay.classList.add('hidden');

    // Remover body class
    document.body.classList.remove('intro-active');

    // Remover do DOM após a animação
    setTimeout(() => {
      if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
        console.log('[Intro] Overlay removido do DOM');
      }
    }, FADE_OUT_DURATION);

    // Marcar como exibido
    markIntroAsShown();
  }

  /**
   * Pula o intro imediatamente
   */
  function skipIntro() {
    console.log('[Intro] Pulando intro...');
    const video = document.querySelector('.intro-video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    hideIntro();
  }

  /**
   * Inicializa o sistema de intro
   */
  function initIntro() {
    // Pegar referência ao overlay primeiro
    const overlay = document.querySelector('.intro-overlay');

    // Verificar se deve mostrar
    if (!shouldShowIntro()) {
      // Remover overlay imediatamente se não deve mostrar
      if (overlay && overlay.parentNode) {
        overlay.style.display = 'none'; // Ocultar instantaneamente
        overlay.parentNode.removeChild(overlay);
      }
      return;
    }

    console.log('[Intro] Inicializando vídeo de intro...');

    const video = document.querySelector('.intro-video');
    const skipBtn = document.querySelector('.intro-skip-btn');

    if (!overlay || !video) {
      console.error('[Intro] Elementos não encontrados');
      return;
    }

    // Adicionar classe ao body para prevenir scroll
    document.body.classList.add('intro-active');

    // Configurar botão de pular
    if (skipBtn) {
      skipBtn.addEventListener('click', skipIntro);
    }

    // Atalho de teclado (ESC ou SPACE)
    function handleKeyPress(e) {
      if (e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        skipIntro();
        document.removeEventListener('keydown', handleKeyPress);
      }
    }
    document.addEventListener('keydown', handleKeyPress);

    // Timeout para preload (se demorar muito, pula)
    const preloadTimeout = setTimeout(() => {
      console.warn('[Intro] Timeout de preload - pulando intro');
      skipIntro();
    }, PRELOAD_TIMEOUT);

    // Quando o vídeo estiver pronto para tocar
    video.addEventListener('canplay', function onCanPlay() {
      clearTimeout(preloadTimeout);
      console.log('[Intro] Vídeo pronto - iniciando reprodução');

      // Tentar tocar o vídeo
      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('[Intro] Reprodução iniciada com sucesso');
          })
          .catch(error => {
            console.error('[Intro] Erro ao reproduzir:', error);
            skipIntro();
          });
      }

      // Remover o listener para não executar múltiplas vezes
      video.removeEventListener('canplay', onCanPlay);
    });

    // Quando o vídeo terminar
    video.addEventListener('ended', function() {
      console.log('[Intro] Vídeo finalizado');
      hideIntro();
    });

    // Tratamento de erros
    video.addEventListener('error', function(e) {
      console.error('[Intro] Erro ao carregar vídeo:', e);
      skipIntro();
    });

    // Forçar load do vídeo
    video.load();
  }

  // Inicializar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }

  // Expor função para debug (pode ser útil durante desenvolvimento)
  window.resetIntro = function() {
    localStorage.removeItem(INTRO_STORAGE_KEY);
    console.log('[Intro] Reset realizado - recarregue a página para ver o intro novamente');
  };

})();
