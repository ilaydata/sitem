(() => {
  const ustMenu = document.querySelector('.ust-menu');
  const menuDugmesi = document.getElementById('menu-dugmesi');
  const menuListesi = document.getElementById('menu-listesi');
  const menuBaglantilari = Array.from(document.querySelectorAll('.menu-baglantisi'));
  const icBaglantilar = Array.from(document.querySelectorAll('a[href^="#"]'));
  const bolumler = Array.from(document.querySelectorAll('main section[id]'));
  const kopyalaDugmesi = document.getElementById('kopyala-dugmesi');
  const kopyalaDurum = document.getElementById('kopyala-durum');
  const hareketiAzalt = window.matchMedia('(prefers-reduced-motion: reduce)');

  function menuyuKapat() {
    if (!menuDugmesi || !menuListesi) return;
    menuListesi.classList.remove('acik');
    menuDugmesi.setAttribute('aria-expanded', 'false');
    menuDugmesi.textContent = 'MENÜ';
  }

  function menuyuDegistir() {
    if (!menuDugmesi || !menuListesi) return;
    const acikMi = menuListesi.classList.toggle('acik');
    menuDugmesi.setAttribute('aria-expanded', String(acikMi));
    menuDugmesi.textContent = acikMi ? 'KAPAT' : 'MENÜ';
  }

  if (menuDugmesi && menuListesi) {
    menuDugmesi.addEventListener('click', menuyuDegistir);

    document.addEventListener('keydown', (olay) => {
      if (olay.key === 'Escape' && menuListesi.classList.contains('acik')) {
        menuyuKapat();
        menuDugmesi.focus();
      }
    });

    document.addEventListener('click', (olay) => {
      if (
        menuListesi.classList.contains('acik') &&
        ustMenu &&
        !ustMenu.contains(olay.target)
      ) {
        menuyuKapat();
      }
    });
  }

  function aktifBaglantiyiGuncelle(aktifId) {
    menuBaglantilari.forEach((baglanti) => {
      const hedef = baglanti.getAttribute('href');
      baglanti.classList.toggle('aktif', hedef === `#${aktifId}`);
    });
  }

  icBaglantilar.forEach((baglanti) => {
    baglanti.addEventListener('click', (olay) => {
      const hedefSecici = baglanti.getAttribute('href');
      if (!hedefSecici || hedefSecici === '#') return;

      const hedef = document.querySelector(hedefSecici);
      if (!hedef) return;

      olay.preventDefault();
      menuyuKapat();

      const menuYukseklik = ustMenu ? ustMenu.offsetHeight : 0;
      const hedefKonum = Math.max(
        0,
        hedef.getBoundingClientRect().top + window.scrollY - menuYukseklik
      );

      window.scrollTo({
        top: hedefKonum,
        behavior: hareketiAzalt.matches ? 'auto' : 'smooth',
      });

      if (hedef.id) {
        aktifBaglantiyiGuncelle(hedef.id);
      }
    });
  });

  if (bolumler.length > 0 && 'IntersectionObserver' in window) {
    const gozlemci = new IntersectionObserver(
      (girdiler) => {
        girdiler.forEach((girdi) => {
          if (girdi.isIntersecting) {
            aktifBaglantiyiGuncelle(girdi.target.id);
          }
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0,
      }
    );

    bolumler.forEach((bolum) => gozlemci.observe(bolum));

    window.addEventListener(
      'scroll',
      () => {
        const sayfaSonu =
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
        if (sayfaSonu) {
          aktifBaglantiyiGuncelle(bolumler[bolumler.length - 1].id);
        }
      },
      { passive: true }
    );
  }

  if (kopyalaDugmesi && kopyalaDurum) {
    let zamanlayici = null;

    kopyalaDugmesi.addEventListener('click', async () => {
      const eposta = kopyalaDugmesi.getAttribute('data-eposta');
      if (!eposta) return;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(eposta);
        } else {
          const gecici = document.createElement('textarea');
          gecici.value = eposta;
          gecici.setAttribute('readonly', '');
          gecici.style.position = 'fixed';
          gecici.style.opacity = '0';
          document.body.appendChild(gecici);
          gecici.select();
          document.execCommand('copy');
          document.body.removeChild(gecici);
        }

        kopyalaDurum.textContent = 'E-posta adresi panoya kopyalandı.';
        kopyalaDugmesi.textContent = 'Kopyalandı';

        if (zamanlayici) clearTimeout(zamanlayici);
        zamanlayici = setTimeout(() => {
          kopyalaDugmesi.textContent = 'E-postayı Kopyala';
        }, 2500);
      } catch {
        kopyalaDurum.textContent = 'Kopyalama başarısız oldu. Adresi doğrudan seçebilirsin.';
      }
    });
  }
})();
