// ════════════════════════════════════════════
// H4SX SENSI FREE FIRE — APP LOGIC v2026
//  + Model Auto-Detect
//  + Max Sensitivity 0-200 (FF Latest Patch)
//  + Auto DPI suggestion
// ════════════════════════════════════════════

(function () {
  'use strict';

  // ──────────────────────────────────────────
  // TOAST
  // ──────────────────────────────────────────
  var toastStack = document.getElementById('toastStack');
  function showToast(msg, type, icon) {
    if (type === undefined) type = 'success';
    if (icon === undefined) icon = '✅';
    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.innerHTML = '<span class="toast-icon">' + icon + '</span><span>' + msg + '</span>';
    if (toastStack) toastStack.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('out');
      setTimeout(function () { if (toast.parentNode) toast.remove(); }, 350);
    }, 2600);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      return Promise.resolve();
    } catch (e) { return Promise.reject(e); }
  }

  // ──────────────────────────────────────────
  // PAGE LOADER
  // ──────────────────────────────────────────
  window.addEventListener('load', function () {
    setTimeout(function () {
      var loader = document.getElementById('pageLoader');
      if (loader) loader.classList.add('hidden');
    }, 900);
  });

  // ──────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────
  var state = {
    brand: 'samsung',
    ram: 4,
    style: 'balanced',
    dpi: 480,
    dpiEnabled: false,
	emulator: false,
    proPreset: null,
    modelName: '',
    suggestedDpi: 480,
    detectedLabel: ''
  };

  // ──────────────────────────────────────────
  // 🔥 MODEL DEVICE DATABASE 🔥
  // (match: any substring keyword → brand + ram + dpi + label)
  // ──────────────────────────────────────────
  var MODEL_DB = [
    // ═══ SAMSUNG ═══
    { k: ['galaxy a03','sm-a035'],            b: 'samsung',  r: 3, d: 380, l: 'Samsung Galaxy A03 (Entry)' },
    { k: ['galaxy a04','sm-a045'],            b: 'samsung',  r: 3, d: 390, l: 'Samsung Galaxy A04 (Entry)' },
    { k: ['galaxy a04s','sm-a047'],           b: 'samsung',  r: 4, d: 400, l: 'Samsung Galaxy A04s' },
    { k: ['galaxy a05','sm-a055'],            b: 'samsung',  r: 4, d: 410, l: 'Samsung Galaxy A05' },
    { k: ['galaxy a05s','sm-a057'],           b: 'samsung',  r: 6, d: 420, l: 'Samsung Galaxy A05s' },
    { k: ['galaxy a13','sm-a135','sm-a137'],  b: 'samsung',  r: 4, d: 410, l: 'Samsung Galaxy A13' },
    { k: ['galaxy a14','sm-a145','sm-a146'],  b: 'samsung',  r: 6, d: 420, l: 'Samsung Galaxy A14' },
    { k: ['galaxy a15','sm-a155','sm-a156'],  b: 'samsung',  r: 8, d: 440, l: 'Samsung Galaxy A15' },
    { k: ['galaxy a23','sm-a235','sm-a236'],  b: 'samsung',  r: 6, d: 430, l: 'Samsung Galaxy A23' },
    { k: ['galaxy a24','sm-a245'],            b: 'samsung',  r: 8, d: 450, l: 'Samsung Galaxy A24' },
    { k: ['galaxy a25','sm-a256'],            b: 'samsung',  r: 8, d: 470, l: 'Samsung Galaxy A25 5G' },
    { k: ['galaxy a33','sm-a336'],            b: 'samsung',  r: 8, d: 470, l: 'Samsung Galaxy A33 5G' },
    { k: ['galaxy a34','sm-a346'],            b: 'samsung',  r: 8, d: 480, l: 'Samsung Galaxy A34 5G' },
    { k: ['galaxy a35','sm-a356'],            b: 'samsung',  r: 8, d: 490, l: 'Samsung Galaxy A35 5G' },
    { k: ['galaxy a53','sm-a536'],            b: 'samsung',  r: 8, d: 490, l: 'Samsung Galaxy A53 5G' },
    { k: ['galaxy a54','sm-a546'],            b: 'samsung',  r: 8, d: 500, l: 'Samsung Galaxy A54 5G' },
    { k: ['galaxy a55','sm-a556'],            b: 'samsung',  r: 8, d: 520, l: 'Samsung Galaxy A55 5G' },
    { k: ['galaxy s21'],                      b: 'samsung',  r: 8, d: 520, l: 'Samsung Galaxy S21' },
    { k: ['galaxy s21 plus','galaxy s21+'],   b: 'samsung',  r: 8, d: 530, l: 'Samsung Galaxy S21 Plus' },
    { k: ['galaxy s21 ultra'],                b: 'samsung',  r: 8, d: 540, l: 'Samsung Galaxy S21 Ultra' },
    { k: ['galaxy s22 ultra'],                b: 'samsung',  r: 8, d: 560, l: 'Samsung Galaxy S22 Ultra' },
    { k: ['galaxy s22 plus','galaxy s22+'],   b: 'samsung',  r: 8, d: 550, l: 'Samsung Galaxy S22 Plus' },
    { k: ['galaxy s22'],                      b: 'samsung',  r: 8, d: 540, l: 'Samsung Galaxy S22' },
    { k: ['galaxy s23 ultra'],                b: 'samsung',  r: 8, d: 580, l: 'Samsung Galaxy S23 Ultra' },
    { k: ['galaxy s23 plus','galaxy s23+'],   b: 'samsung',  r: 8, d: 570, l: 'Samsung Galaxy S23 Plus' },
    { k: ['galaxy s23 fe'],                   b: 'samsung',  r: 8, d: 540, l: 'Samsung Galaxy S23 FE' },
    { k: ['galaxy s23'],                      b: 'samsung',  r: 8, d: 560, l: 'Samsung Galaxy S23' },
    { k: ['galaxy s24 ultra'],                b: 'samsung',  r: 8, d: 600, l: 'Samsung Galaxy S24 Ultra' },
    { k: ['galaxy s24 plus','galaxy s24+'],   b: 'samsung',  r: 8, d: 590, l: 'Samsung Galaxy S24 Plus' },
    { k: ['galaxy s24'],                      b: 'samsung',  r: 8, d: 580, l: 'Samsung Galaxy S24' },
    { k: ['galaxy m13','sm-m135'],            b: 'samsung',  r: 4, d: 400, l: 'Samsung Galaxy M13' },
    { k: ['galaxy m23','sm-m236'],            b: 'samsung',  r: 6, d: 420, l: 'Samsung Galaxy M23' },
    { k: ['galaxy m33'],                      b: 'samsung',  r: 6, d: 440, l: 'Samsung Galaxy M33 5G' },
    { k: ['galaxy m34','sm-m346'],            b: 'samsung',  r: 8, d: 460, l: 'Samsung Galaxy M34 5G' },
    { k: ['samsung note 20','galaxy note 20'],b: 'samsung',  r: 8, d: 520, l: 'Samsung Note 20 Series' },
    { k: ['samsung z fold','galaxy z fold'],  b: 'samsung',  r: 8, d: 560, l: 'Samsung Z Fold' },
    { k: ['samsung z flip','galaxy z flip'],  b: 'samsung',  r: 8, d: 520, l: 'Samsung Z Flip' },

    // ═══ XIAOMI + REDMI + POCO ═══
    { k: ['redmi a1'],                        b: 'xiaomi',   r: 2, d: 340, l: 'Xiaomi Redmi A1 (Ultra Entry)' },
    { k: ['redmi a2'],                        b: 'xiaomi',   r: 3, d: 350, l: 'Xiaomi Redmi A2 (Entry)' },
    { k: ['redmi 10a'],                       b: 'xiaomi',   r: 3, d: 360, l: 'Xiaomi Redmi 10A' },
    { k: ['redmi 10c'],                       b: 'xiaomi',   r: 4, d: 380, l: 'Xiaomi Redmi 10C' },
    { k: ['redmi 12c'],                       b: 'xiaomi',   r: 4, d: 390, l: 'Xiaomi Redmi 12C' },
    { k: ['redmi 13c'],                       b: 'xiaomi',   r: 6, d: 410, l: 'Xiaomi Redmi 13C' },
    { k: ['redmi 9'],                         b: 'xiaomi',   r: 4, d: 380, l: 'Xiaomi Redmi 9' },
    { k: ['redmi 10 5g','redmi 10 (5g)'],     b: 'xiaomi',   r: 6, d: 420, l: 'Xiaomi Redmi 10 5G' },
    { k: ['redmi 10'],                        b: 'xiaomi',   r: 6, d: 400, l: 'Xiaomi Redmi 10' },
    { k: ['redmi 12 5g'],                     b: 'xiaomi',   r: 8, d: 460, l: 'Xiaomi Redmi 12 5G' },
    { k: ['redmi 12'],                        b: 'xiaomi',   r: 8, d: 440, l: 'Xiaomi Redmi 12' },
    { k: ['redmi 13 5g'],                     b: 'xiaomi',   r: 8, d: 480, l: 'Xiaomi Redmi 13 5G' },
    { k: ['redmi 13'],                        b: 'xiaomi',   r: 8, d: 460, l: 'Xiaomi Redmi 13' },
    { k: ['redmi note 9 pro','redmi note9 pro'], b: 'xiaomi',r: 6, d: 420, l: 'Xiaomi Redmi Note 9 Pro' },
    { k: ['redmi note 9'],                    b: 'xiaomi',   r: 4, d: 390, l: 'Xiaomi Redmi Note 9' },
    { k: ['redmi note 10 pro'],               b: 'xiaomi',   r: 8, d: 450, l: 'Xiaomi Redmi Note 10 Pro' },
    { k: ['redmi note 10'],                   b: 'xiaomi',   r: 4, d: 400, l: 'Xiaomi Redmi Note 10' },
    { k: ['redmi note 11 pro','note 11 pro+'],b: 'xiaomi',   r: 8, d: 460, l: 'Xiaomi Redmi Note 11 Pro' },
    { k: ['redmi note 11'],                   b: 'xiaomi',   r: 6, d: 420, l: 'Xiaomi Redmi Note 11' },
    { k: ['redmi note 12 pro 5g','note 12 pro 5g'], b: 'xiaomi', r: 8, d: 480, l: 'Xiaomi Redmi Note 12 Pro 5G' },
    { k: ['redmi note 12 pro'],               b: 'xiaomi',   r: 8, d: 470, l: 'Xiaomi Redmi Note 12 Pro' },
    { k: ['redmi note 12'],                   b: 'xiaomi',   r: 8, d: 450, l: 'Xiaomi Redmi Note 12' },
    { k: ['redmi note 13 pro plus','note 13 pro+'], b: 'xiaomi', r: 8, d: 500, l: 'Xiaomi Redmi Note 13 Pro Plus' },
    { k: ['redmi note 13 pro'],               b: 'xiaomi',   r: 8, d: 490, l: 'Xiaomi Redmi Note 13 Pro' },
    { k: ['redmi note 13'],                   b: 'xiaomi',   r: 8, d: 460, l: 'Xiaomi Redmi Note 13' },
    { k: ['poco c65'],                        b: 'xiaomi',   r: 6, d: 410, l: 'Xiaomi POCO C65' },
    { k: ['poco m6 pro'],                     b: 'xiaomi',   r: 8, d: 460, l: 'Xiaomi POCO M6 Pro' },
    { k: ['poco x5 pro'],                     b: 'xiaomi',   r: 8, d: 480, l: 'Xiaomi POCO X5 Pro 5G' },
    { k: ['poco x6 pro'],                     b: 'xiaomi',   r: 8, d: 500, l: 'Xiaomi POCO X6 Pro 5G' },
    { k: ['poco x6 neo','poco x6'],           b: 'xiaomi',   r: 8, d: 490, l: 'Xiaomi POCO X6 Series' },
    { k: ['poco f5 pro'],                     b: 'xiaomi',   r: 8, d: 520, l: 'Xiaomi POCO F5 Pro' },
    { k: ['poco f5'],                         b: 'xiaomi',   r: 8, d: 510, l: 'Xiaomi POCO F5' },
    { k: ['poco f6 pro'],                     b: 'xiaomi',   r: 8, d: 540, l: 'Xiaomi POCO F6 Pro' },
    { k: ['poco f6'],                         b: 'xiaomi',   r: 8, d: 530, l: 'Xiaomi POCO F6' },
    { k: ['xiaomi 13t pro'],                  b: 'xiaomi',   r: 8, d: 540, l: 'Xiaomi 13T Pro' },
    { k: ['xiaomi 13t'],                      b: 'xiaomi',   r: 8, d: 520, l: 'Xiaomi 13T' },
    { k: ['xiaomi 13'],                       b: 'xiaomi',   r: 8, d: 530, l: 'Xiaomi 13' },
    { k: ['xiaomi 14 ultra'],                 b: 'xiaomi',   r: 8, d: 600, l: 'Xiaomi 14 Ultra' },
    { k: ['xiaomi 14 pro'],                   b: 'xiaomi',   r: 8, d: 580, l: 'Xiaomi 14 Pro' },
    { k: ['xiaomi 14'],                       b: 'xiaomi',   r: 8, d: 560, l: 'Xiaomi 14' },

    // ═══ REALME ═══
    { k: ['realme c11'],                      b: 'realme',   r: 2, d: 340, l: 'Realme C11 (Entry)' },
    { k: ['realme c15'],                      b: 'realme',   r: 4, d: 370, l: 'Realme C15' },
    { k: ['realme c30'],                      b: 'realme',   r: 3, d: 350, l: 'Realme C30' },
    { k: ['realme c30s'],                     b: 'realme',   r: 4, d: 360, l: 'Realme C30s' },
    { k: ['realme c35'],                      b: 'realme',   r: 6, d: 400, l: 'Realme C35' },
    { k: ['realme c51'],                      b: 'realme',   r: 6, d: 410, l: 'Realme C51' },
    { k: ['realme c53'],                      b: 'realme',   r: 6, d: 420, l: 'Realme C53' },
    { k: ['realme c55'],                      b: 'realme',   r: 8, d: 440, l: 'Realme C55' },
    { k: ['realme c65'],                      b: 'realme',   r: 8, d: 450, l: 'Realme C65 5G' },
    { k: ['realme narzo n53'],                b: 'realme',   r: 8, d: 440, l: 'Realme Narzo N53' },
    { k: ['realme narzo 60x'],                b: 'realme',   r: 8, d: 460, l: 'Realme Narzo 60X' },
    { k: ['realme 11 pro+','realme 11 pro plus'], b: 'realme', r: 8, d: 480, l: 'Realme 11 Pro Plus' },
    { k: ['realme 11 pro'],                   b: 'realme',   r: 8, d: 470, l: 'Realme 11 Pro' },
    { k: ['realme 11'],                       b: 'realme',   r: 8, d: 450, l: 'Realme 11' },
    { k: ['realme 12 pro+','realme 12 pro plus'], b: 'realme', r: 8, d: 500, l: 'Realme 12 Pro Plus' },
    { k: ['realme 12 pro'],                   b: 'realme',   r: 8, d: 490, l: 'Realme 12 Pro' },
    { k: ['realme gt neo 5'],                 b: 'realme',   r: 8, d: 520, l: 'Realme GT Neo 5' },
    { k: ['realme gt 5'],                     b: 'realme',   r: 8, d: 530, l: 'Realme GT 5' },
    { k: ['realme gt 6t'],                    b: 'realme',   r: 8, d: 550, l: 'Realme GT 6T' },
    { k: ['realme gt 6'],                     b: 'realme',   r: 8, d: 560, l: 'Realme GT 6' },

    // ═══ MOTOROLA ═══
    { k: ['moto g13'],                        b: 'motorola', r: 4, d: 380, l: 'Motorola Moto G13' },
    { k: ['moto g22'],                        b: 'motorola', r: 4, d: 390, l: 'Motorola Moto G22' },
    { k: ['moto g32'],                        b: 'motorola', r: 6, d: 410, l: 'Motorola Moto G32' },
    { k: ['moto g52'],                        b: 'motorola', r: 6, d: 420, l: 'Motorola Moto G52' },
    { k: ['moto g54'],                        b: 'motorola', r: 8, d: 440, l: 'Motorola Moto G54 5G' },
    { k: ['moto g62'],                        b: 'motorola', r: 6, d: 430, l: 'Motorola Moto G62 5G' },
    { k: ['moto g73'],                        b: 'motorola', r: 8, d: 450, l: 'Motorola Moto G73 5G' },
    { k: ['moto g84'],                        b: 'motorola', r: 8, d: 470, l: 'Motorola Moto G84 5G' },
    { k: ['moto edge 40 neo'],                b: 'motorola', r: 8, d: 520, l: 'Motorola Edge 40 Neo' },
    { k: ['moto edge 40 pro','edge 40 pro'],  b: 'motorola', r: 8, d: 540, l: 'Motorola Edge 40 Pro' },
    { k: ['moto edge 40'],                    b: 'motorola', r: 8, d: 520, l: 'Motorola Edge 40' },
    { k: ['motorola edge 50','moto edge 50'], b: 'motorola', r: 8, d: 550, l: 'Motorola Edge 50 Series' },

    // ═══ APPLE / iPHONE ═══
    { k: ['iphone 11'],                       b: 'apple',    r: 4, d: 520, l: 'iPhone 11' },
    { k: ['iphone 12 pro max'],               b: 'apple',    r: 6, d: 560, l: 'iPhone 12 Pro Max' },
    { k: ['iphone 12 pro'],                   b: 'apple',    r: 6, d: 550, l: 'iPhone 12 Pro' },
    { k: ['iphone 12'],                       b: 'apple',    r: 4, d: 540, l: 'iPhone 12' },
    { k: ['iphone 13 pro max'],               b: 'apple',    r: 6, d: 580, l: 'iPhone 13 Pro Max' },
    { k: ['iphone 13 pro'],                   b: 'apple',    r: 6, d: 570, l: 'iPhone 13 Pro' },
    { k: ['iphone 13'],                       b: 'apple',    r: 4, d: 560, l: 'iPhone 13' },
    { k: ['iphone 14 pro max'],               b: 'apple',    r: 6, d: 600, l: 'iPhone 14 Pro Max' },
    { k: ['iphone 14 pro'],                   b: 'apple',    r: 6, d: 590, l: 'iPhone 14 Pro' },
    { k: ['iphone 14 plus'],                  b: 'apple',    r: 6, d: 570, l: 'iPhone 14 Plus' },
    { k: ['iphone 14'],                       b: 'apple',    r: 6, d: 560, l: 'iPhone 14' },
    { k: ['iphone 15 pro max'],               b: 'apple',    r: 8, d: 620, l: 'iPhone 15 Pro Max' },
    { k: ['iphone 15 pro'],                   b: 'apple',    r: 8, d: 610, l: 'iPhone 15 Pro' },
    { k: ['iphone 15 plus'],                  b: 'apple',    r: 8, d: 590, l: 'iPhone 15 Plus' },
    { k: ['iphone 15'],                       b: 'apple',    r: 8, d: 580, l: 'iPhone 15' },
    { k: ['ipad mini 6','ipad mini6'],        b: 'apple',    r: 8, d: 600, l: 'iPad Mini 6' },
    { k: ['ipad air 4','ipad air4'],          b: 'apple',    r: 8, d: 560, l: 'iPad Air 4' },
    { k: ['ipad air 5','ipad air5'],          b: 'apple',    r: 8, d: 580, l: 'iPad Air 5' },
    { k: ['ipad 9th','ipad gen 9'],           b: 'apple',    r: 8, d: 540, l: 'iPad 9th Gen' },
    { k: ['ipad 10th','ipad gen 10'],         b: 'apple',    r: 8, d: 560, l: 'iPad 10th Gen' },
    { k: ['ipad pro 11 m4','ipad pro m4 11'], b: 'apple',    r: 8, d: 640, l: 'iPad Pro 11" M4' },
    { k: ['ipad pro 12.9 m4','ipad pro m4'],  b: 'apple',    r: 8, d: 650, l: 'iPad Pro 12.9" M4' },
    { k: ['ipad pro 11 m2','ipad pro m2'],    b: 'apple',    r: 8, d: 620, l: 'iPad Pro 11" M2' },
    { k: ['ipad pro 12.9 m2','ipad m2'],      b: 'apple',    r: 8, d: 630, l: 'iPad Pro 12.9" M2' },

    // ═══ ASUS ROG PHONE / ZENFONE (Gaming Flagship) ═══
    // Codename keys (e.g. "asus_ai2201") match what browsers report via
    // User-Agent Client Hints / Android UA for these models.
    { k: ['rog phone 8 pro','ai2401_h'],      b: 'other', r: 8, d: 620, l: 'ASUS ROG Phone 8 Pro' },
    { k: ['rog phone 8','ai2401'],            b: 'other', r: 8, d: 610, l: 'ASUS ROG Phone 8' },
    { k: ['rog phone 7 ultimate','ai2302'],   b: 'other', r: 8, d: 610, l: 'ASUS ROG Phone 7 Ultimate' },
    { k: ['rog phone 7','ai2301'],            b: 'other', r: 8, d: 600, l: 'ASUS ROG Phone 7' },
    { k: ['rog phone 6d','ai2201_b'],         b: 'other', r: 8, d: 590, l: 'ASUS ROG Phone 6D' },
    { k: ['rog phone 6 pro','ai2205'],        b: 'other', r: 8, d: 590, l: 'ASUS ROG Phone 6 Pro' },
    { k: ['rog phone 6','ai2201'],            b: 'other', r: 8, d: 580, l: 'ASUS ROG Phone 6' },
    { k: ['rog phone 5s pro','i006d_pro'],    b: 'other', r: 8, d: 580, l: 'ASUS ROG Phone 5s Pro' },
    { k: ['rog phone 5s','i006d'],            b: 'other', r: 8, d: 570, l: 'ASUS ROG Phone 5s' },
    { k: ['rog phone 5','i003d'],             b: 'other', r: 8, d: 560, l: 'ASUS ROG Phone 5' },
    { k: ['rog phone 3','i003dd','i003d'],    b: 'other', r: 8, d: 540, l: 'ASUS ROG Phone 3' },
    { k: ['rog phone 2','i001d'],             b: 'other', r: 8, d: 520, l: 'ASUS ROG Phone 2' },
    { k: ['rog phone','asus_ai2','asus_i00'], b: 'other', r: 8, d: 570, l: 'ASUS ROG Phone (Gaming Flagship)' },
    { k: ['zenfone 11'],                      b: 'other', r: 8, d: 540, l: 'ASUS Zenfone 11' },
    { k: ['zenfone 10'],                      b: 'other', r: 8, d: 520, l: 'ASUS Zenfone 10' },
    { k: ['zenfone 9'],                       b: 'other', r: 8, d: 500, l: 'ASUS Zenfone 9' },
    { k: ['asus'],                            b: 'other', r: 8, d: 480, l: 'ASUS (Generic)' },

    // ═══ OTHER GAMING PHONES ═══
    { k: ['redmagic 9','red magic 9'],        b: 'other', r: 8, d: 610, l: 'Nubia RedMagic 9 (Gaming)' },
    { k: ['redmagic 8','red magic 8'],        b: 'other', r: 8, d: 590, l: 'Nubia RedMagic 8 (Gaming)' },
    { k: ['redmagic 7','red magic 7'],        b: 'other', r: 8, d: 570, l: 'Nubia RedMagic 7 (Gaming)' },
    { k: ['redmagic','red magic'],            b: 'other', r: 8, d: 560, l: 'Nubia RedMagic (Gaming Generic)' },
    { k: ['black shark 5','black shark 4'],   b: 'other', r: 8, d: 570, l: 'Black Shark (Gaming)' },
    { k: ['black shark'],                     b: 'other', r: 8, d: 550, l: 'Black Shark (Gaming Generic)' },
    { k: ['pixel 8'],                         b: 'other', r: 8, d: 520, l: 'Google Pixel 8 Series' },
    { k: ['pixel 7'],                         b: 'other', r: 8, d: 500, l: 'Google Pixel 7 Series' },
    { k: ['pixel 6'],                         b: 'other', r: 8, d: 480, l: 'Google Pixel 6 Series' },
    { k: ['pixel'],                           b: 'other', r: 6, d: 460, l: 'Google Pixel (Generic)' },

    // ═══ GENERIC FALLBACK DETECT BY BRAND NAME ONLY ═══
    { k: ['samsung','galaxy'],                b: 'samsung',  r: 6, d: 440, l: 'Samsung (Generic)' },
    { k: ['xiaomi','redmi','poco','mi 13','mi 14'], b: 'xiaomi', r: 6, d: 450, l: 'Xiaomi / Redmi (Generic)' },
    { k: ['realme','oppo','oneplus','narzo'], b: 'realme',   r: 8, d: 460, l: 'Realme / OPPO (Generic)' },
    { k: ['motorola','moto g','moto edge'],   b: 'motorola', r: 6, d: 430, l: 'Motorola (Generic)' },
    { k: ['iphone','ipad','apple','ios'],     b: 'apple',    r: 6, d: 560, l: 'Apple iPhone / iPad (Generic)' },
    { k: ['infinix','tecno','itel'],          b: 'other',    r: 4, d: 380, l: 'Infinix / Tecno (Entry Android)' },
    { k: ['honor','huawei','nova','mate'],    b: 'other',    r: 8, d: 470, l: 'Honor / Huawei (Generic)' },
    { k: ['vivo','iqoo','v29','v30'],         b: 'other',    r: 8, d: 480, l: 'ViVO / iQOO (Generic)' },
    { k: ['oneplus','nord','one plus'],       b: 'other',    r: 8, d: 500, l: 'OnePlus (Generic)' },
    { k: ['sony xperia','xperia'],            b: 'other',    r: 8, d: 480, l: 'Sony Xperia (Generic)' }
  ];

  function findModelInDB(rawName) {
    if (!rawName || rawName.length < 2) return null;
    var q = rawName.trim().toLowerCase();
    // First pass: exact-match entries have more specific keywords
    var found = null;
    for (var i = 0; i < MODEL_DB.length; i++) {
      var entry = MODEL_DB[i];
      var matched = false;
      for (var j = 0; j < entry.k.length; j++) {
        if (q.indexOf(entry.k[j]) !== -1) { matched = true; break; }
      }
      if (matched) { found = entry; break; }
    }
    return found;
  }

  // ──────────────────────────────────────────
  // 🆕 BROWSER-BASED DEVICE DETECTION
  // Instead of relying only on manual typing + a fixed DB, we read
  // real signals the browser (pelayar) exposes:
  //   1) navigator.userAgentData.getHighEntropyValues(['model']) — on
  //      Chromium-based Android browsers (Chrome/Edge/Opera Android)
  //      this returns the EXACT device model code (e.g. "ASUS_AI2201"),
  //      even for devices not in any hand-written list.
  //   2) Fallback: parse the classic User-Agent string, which Android
  //      WebViews always embed as "...; MODEL Build/...".
  //   3) iOS/Safari never exposes a model in the UA, so we fall back to
  //      screen resolution + pixel ratio which is unique per iPhone.
  //   4) Hardware signals (deviceMemory, hardwareConcurrency, WebGL GPU
  //      renderer string) are used to auto-ESTIMATE a sensible tier for
  //      any device that still isn't found in MODEL_DB — so an unknown
  //      or brand-new phone still gets real numbers, not a dead end.
  // ──────────────────────────────────────────
  var IOS_SCREEN_MAP = [
    // [screenW, screenH, dpr] → label (portrait CSS px, longest known list first)
    { w: 430, h: 932, dpr: 3, l: 'iPhone 15/14 Pro Max Series', d: 620 },
    { w: 393, h: 852, dpr: 3, l: 'iPhone 15/14 Pro Series', d: 600 },
    { w: 428, h: 926, dpr: 3, l: 'iPhone 13/12 Pro Max Series', d: 580 },
    { w: 390, h: 844, dpr: 3, l: 'iPhone 13/12/14 Series', d: 560 },
    { w: 414, h: 896, dpr: 2, l: 'iPhone 11 / XR Series', d: 520 },
    { w: 414, h: 896, dpr: 3, l: 'iPhone 11 Pro Max / XS Max', d: 560 },
    { w: 375, h: 812, dpr: 3, l: 'iPhone 13 mini / X / XS Series', d: 550 },
    { w: 375, h: 667, dpr: 2, l: 'iPhone SE / 8 Series', d: 500 },
    { w: 320, h: 568, dpr: 2, l: 'iPhone SE (1st Gen) / 5 Series', d: 460 }
  ];

  function normalizeRaw(s) {
    return (s || '').toString().trim();
  }

  // Parse Android model out of the classic User-Agent string as a fallback
  // for browsers without the userAgentData API (Firefox, older Chrome, etc).
  function parseModelFromUA(ua) {
    ua = ua || '';
    var m = ua.match(/Android[^;]*;\s*([^;)]+?)\s*(?:Build\/|\))/i);
    if (m && m[1]) {
      var model = m[1].trim();
      if (model && !/^(K|wv|Mobile|Tablet)$/i.test(model)) return model;
    }
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPhone/i.test(ua)) return 'iPhone';
    return '';
  }

  function guessIphoneFromScreen() {
    var w = Math.min(window.screen.width, window.screen.height);
    var h = Math.max(window.screen.width, window.screen.height);
    var dpr = window.devicePixelRatio || 2;
    for (var i = 0; i < IOS_SCREEN_MAP.length; i++) {
      var e = IOS_SCREEN_MAP[i];
      if (e.w === w && e.h === h && Math.round(e.dpr) === Math.round(dpr)) return e;
    }
    return null;
  }

  function getGPURenderer() {
    try {
      var canvas = document.createElement('canvas');
      var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) return '';
      var dbg = gl.getExtension('WEBGL_debug_renderer_info');
      if (!dbg) return '';
      return (gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) || '').toString();
    } catch (e) { return ''; }
  }

  // When the exact model isn't in MODEL_DB, estimate a fair tier from
  // raw hardware signals so we still hand back a usable DPI/RAM guess
  // instead of forcing the player to pick blind.
  function estimateTierFromHardware(hw) {
    var score = 0;
    var mem = hw.deviceMemory || 0;   // GB, Chrome caps this at 8
    var cores = hw.cores || 0;
    var gpu = (hw.gpu || '').toLowerCase();

    if (mem >= 8) score += 3; else if (mem >= 6) score += 2; else if (mem >= 4) score += 1;
    if (cores >= 8) score += 2; else if (cores >= 6) score += 1;
    if (/adreno 7|adreno 6[5-9]|apple gpu|mali-g7|xclipse|immortalis/.test(gpu)) score += 3;
    else if (/adreno 6[0-4]|mali-g5|mali-g6/.test(gpu)) score += 1;
    else if (/adreno [1-5]|mali-t|mali-g3|mali-g4/.test(gpu)) score -= 1;

    if (score >= 6) return { r: 8, d: 560, tier: 'Flagship' };
    if (score >= 4) return { r: 8, d: 500, tier: 'High-end' };
    if (score >= 2) return { r: 6, d: 440, tier: 'Mid-range' };
    return { r: 4, d: 390, tier: 'Entry-level' };
  }

  // Main entry: gathers everything the browser will give us.
  // Returns a Promise resolving to { raw, source, hw }.
  function detectFromBrowser() {
    var hw = {
      deviceMemory: navigator.deviceMemory || null,
      cores: navigator.hardwareConcurrency || null,
      gpu: getGPURenderer(),
      dpr: window.devicePixelRatio || 1
    };

    function finishWithUAFallback() {
      var raw = parseModelFromUA(navigator.userAgent);
      if (raw === 'iPhone' || raw === 'iPad') {
        var guess = guessIphoneFromScreen();
        if (guess) return Promise.resolve({ raw: guess.l, source: 'screen', hw: hw, screenDpi: guess.d });
        return Promise.resolve({ raw: raw, source: 'ua-generic', hw: hw });
      }
      return Promise.resolve({ raw: normalizeRaw(raw), source: raw ? 'ua' : 'none', hw: hw });
    }

    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
      return navigator.userAgentData.getHighEntropyValues(['model', 'platform'])
        .then(function (ua) {
          if (ua && ua.model) {
            return { raw: normalizeRaw(ua.model), source: 'uach', hw: hw };
          }
          return finishWithUAFallback();
        })
        .catch(finishWithUAFallback);
    }
    return finishWithUAFallback();
  }

  // ──────────────────────────────────────────
  // SET BRAND / RAM UI HELPERS
  // ──────────────────────────────────────────
  function selectBrandUI(brandKey) {
    state.brand = brandKey;
    var bs = document.querySelectorAll('.brand-btn');
    bs.forEach(function (b) {
      if (b.getAttribute('data-brand') === brandKey) b.classList.add('active');
      else b.classList.remove('active');
    });
  }
  function selectRamUI(ramVal) {
    // Ram bucket = 3 / 4 / 6 / 8+; we accept raw int and clamp to nearest valid bucket
    var bucket = 8;
    if (ramVal <= 3) bucket = 3;
    else if (ramVal <= 4) bucket = 4;
    else if (ramVal <= 6) bucket = 6;
    state.ram = bucket;
    var rs = document.querySelectorAll('.ram-btn');
    rs.forEach(function (r) {
      if (parseInt(r.getAttribute('data-ram'), 10) === bucket) r.classList.add('active');
      else r.classList.remove('active');
    });
  }

  // ──────────────────────────────────────────
  // BRAND SELECT UI EVENTS
  // ──────────────────────────────────────────
  var brandBtns = document.querySelectorAll('.brand-btn');
  brandBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      brandBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.brand = btn.getAttribute('data-brand');
      state.proPreset = null;
      document.querySelectorAll('.pro-btn').forEach(function (p) { p.classList.remove('active'); });
    });
  });
  var ramBtns = document.querySelectorAll('.ram-btn');
  ramBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      ramBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      state.ram = parseInt(btn.getAttribute('data-ram'), 10) || 4;
      state.proPreset = null;
      document.querySelectorAll('.pro-btn').forEach(function (p) { p.classList.remove('active'); });
    });
  });

  // ──────────────────────────────────────────
  // STYLE SELECT EVENTS
  // ──────────────────────────────────────────
  var styleCards = document.querySelectorAll('.style-card');
  styleCards.forEach(function (card) {
    var input = card.querySelector('input');
    card.addEventListener('click', function (e) {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (input) input.checked = true;
      styleCards.forEach(function (c) { c.classList.remove('active'); });
      card.classList.add('active');
      if (input) state.style = input.value;
      state.proPreset = null;
      document.querySelectorAll('.pro-btn').forEach(function (p) { p.classList.remove('active'); });
    });
    if (input) {
      input.addEventListener('change', function () {
        styleCards.forEach(function (c) { c.classList.remove('active'); });
        if (input.checked) card.classList.add('active');
        state.style = input.value;
      });
    }
  });

  // ──────────────────────────────────────────
  // DPI TOGGLE
  // ──────────────────────────────────────────
  var dpiToggle = document.getElementById('dpiToggle');
  var dpiPanel = document.getElementById('dpiPanel');
  var dpiInput = document.getElementById('dpiValue');
  if (dpiToggle) {
    dpiToggle.addEventListener('change', function () {
      state.dpiEnabled = dpiToggle.checked;
      if (dpiToggle.checked) {
        if (dpiPanel) dpiPanel.style.display = 'block';
        state.dpi = parseInt((dpiInput && dpiInput.value) || 480, 10);
      } else {
        if (dpiPanel) dpiPanel.style.display = 'none';
      }
    });
  }
  if (dpiInput) {
    dpiInput.addEventListener('input', function () {
      var v = parseInt(dpiInput.value || 480, 10);
      state.dpi = Math.max(320, Math.min(960, v));
    });
  }
  
    var emuToggle = document.getElementById('emuToggle');
  var emuHint = document.getElementById('emuHint');
  if (emuToggle) {
    emuToggle.addEventListener('change', function () {
      state.emulator = emuToggle.checked;
      if (emuHint) emuHint.style.display = emuToggle.checked ? 'block' : 'none';
      if (!state.emulator) {
        var tabMouse = document.getElementById('tabMouse');
        if (tabMouse) tabMouse.style.display = 'none';
        var activeMouse = document.querySelector('.r-tab.active[data-tab="mouse"]');
        if (activeMouse) {
          var sensTab = document.querySelector('.r-tab[data-tab="sens"]');
          if (sensTab) sensTab.click();
        }
      }
    });
  }
  

  // ──────────────────────────────────────────
  // 🆕 MODEL INPUT + AUTO-DETECT
  // ──────────────────────────────────────────
  var modelInput = document.getElementById('modelDeviceInput');
  var btnModelDetect = document.getElementById('btnModelDetect');
  var modelHint = document.getElementById('modelHint');

  function runAutoDetect(silent) {
    if (silent === undefined) silent = false;
    var raw = (modelInput ? (modelInput.value || '') : '').trim();
    if (!raw) {
      if (!silent) showToast('Taip nama model dulu! Contoh: "Galaxy A54"', 'error', '⚠️');
      return;
    }
    var match = findModelInDB(raw);
    if (match) {
      state.modelName = match.l;
      state.detectedLabel = match.l;
      state.suggestedDpi = match.d;
      selectBrandUI(match.b);
      selectRamUI(match.r);
      if (dpiInput) dpiInput.value = String(match.d);
      state.dpi = match.d;
      if (!dpiToggle) {} else if (!state.dpiEnabled) { dpiToggle.checked = true; state.dpiEnabled = true; if (dpiPanel) dpiPanel.style.display = 'block'; }
      if (modelHint) {
        modelHint.innerHTML = '<span style="color:var(--success);font-weight:700;">✅ Berjaya dikesan: ' + match.l + ' · ' + match.r + 'GB RAM · DPI ' + match.d + '</span>';
      }
      if (!silent) showToast('Berjaya dikesan: ' + match.l + '. Jenama + RAM + DPI auto-set!', 'success', '🎯');
    } else {
      // 🆕 Not in the hand-written DB — instead of a dead end, estimate a
      // fair tier from real hardware signals (RAM, CPU cores, GPU) so the
      // player still gets usable numbers, e.g. for an ASUS ROG Phone or
      // any device we haven't hard-coded a name for.
      var hw = { deviceMemory: navigator.deviceMemory || null, cores: navigator.hardwareConcurrency || null, gpu: getGPURenderer() };
      var est = estimateTierFromHardware(hw);
      state.modelName = raw;
      state.detectedLabel = raw + ' (Auto-anggar: ' + est.tier + ')';
      state.suggestedDpi = est.d;
      selectRamUI(est.r);
      if (dpiInput) dpiInput.value = String(est.d);
      state.dpi = est.d;
      if (!dpiToggle) {} else if (!state.dpiEnabled) { dpiToggle.checked = true; state.dpiEnabled = true; if (dpiPanel) dpiPanel.style.display = 'block'; }
      if (modelHint) {
        modelHint.innerHTML = '<span style="color:var(--fire);font-weight:600;">⚠️ "' + raw + '" tiada nama dalam DB kami — tapi RAM/DPI dah auto-anggar (' + est.tier + ') guna spec pelayar peranti anda. Boleh adjust jenama/RAM manual atas jika tak tepat.</span>';
      }
      if (!silent) showToast('"' + raw + '" xdak dalam DB, tapi auto-anggar guna spec peranti: ' + est.tier + '.', 'info', '📡');
    }
  }
  if (btnModelDetect) {
    btnModelDetect.addEventListener('click', function () { runAutoDetect(false); });
  }

  // ──────────────────────────────────────────
  // 🆕 AUTO-DETECT DARI PELAYAR (BROWSER)
  // ──────────────────────────────────────────
  var btnBrowserDetect = document.getElementById('btnBrowserDetect');
  var browserDetectResult = document.getElementById('browserDetectResult');

  function runBrowserDetect(silent) {
    if (silent === undefined) silent = false;
    if (btnBrowserDetect) { btnBrowserDetect.classList.add('is-loading'); btnBrowserDetect.textContent = '📡 Mengesan...'; }
    detectFromBrowser().then(function (info) {
      if (btnBrowserDetect) { btnBrowserDetect.classList.remove('is-loading'); btnBrowserDetect.textContent = '🛰️ Auto-Detect Pelayar'; }
      if (!info.raw) {
        if (browserDetectResult) {
          browserDetectResult.style.display = 'block';
          browserDetectResult.innerHTML = '<span class="bd-tag estimate">⚠️ Terhad</span>Pelayar anda tidak dedahkan nama model (biasa pada iOS/Safari atau mod privasi). Sila taip model secara manual bawah.';
        }
        if (!silent) showToast('Pelayar tidak dapat dedahkan model peranti. Taip manual je.', 'info', 'ℹ️');
        return;
      }
      if (modelInput) modelInput.value = info.raw;
      var match = findModelInDB(info.raw);
      if (match) {
        state.modelName = match.l;
        state.detectedLabel = match.l + ' (dari pelayar)';
        state.suggestedDpi = match.d;
        selectBrandUI(match.b);
        selectRamUI(match.r);
        if (dpiInput) dpiInput.value = String(match.d);
        state.dpi = match.d;
        if (!dpiToggle) {} else if (!state.dpiEnabled) { dpiToggle.checked = true; state.dpiEnabled = true; if (dpiPanel) dpiPanel.style.display = 'block'; }
        if (modelHint) modelHint.innerHTML = '<span style="color:var(--success);font-weight:700;">✅ Dikesan dari pelayar: ' + match.l + ' · ' + match.r + 'GB RAM · DPI ' + match.d + '</span>';
        if (browserDetectResult) {
          browserDetectResult.style.display = 'block';
          browserDetectResult.innerHTML = '<span class="bd-tag">✅ Padan DB</span>Raw signal pelayar: "' + info.raw + '" → ' + match.l;
        }
        if (!silent) showToast('Dikesan dari pelayar: ' + match.l + '!', 'success', '🛰️');
      } else {
        var est = estimateTierFromHardware(info.hw || {});
        var dpiFinal = info.screenDpi || est.d;
        state.modelName = info.raw;
        state.detectedLabel = info.raw + ' (Auto-anggar: ' + est.tier + ')';
        state.suggestedDpi = dpiFinal;
        selectRamUI(est.r);
        if (dpiInput) dpiInput.value = String(dpiFinal);
        state.dpi = dpiFinal;
        if (!dpiToggle) {} else if (!state.dpiEnabled) { dpiToggle.checked = true; state.dpiEnabled = true; if (dpiPanel) dpiPanel.style.display = 'block'; }
        if (modelHint) modelHint.innerHTML = '<span style="color:var(--fire);font-weight:600;">⚠️ "' + info.raw + '" (dari pelayar) tiada dalam DB nama — RAM/DPI auto-anggar guna spec hardware (' + est.tier + ').</span>';
        if (browserDetectResult) {
          browserDetectResult.style.display = 'block';
          var hwBits = [];
          if (info.hw && info.hw.deviceMemory) hwBits.push(info.hw.deviceMemory + 'GB RAM');
          if (info.hw && info.hw.cores) hwBits.push(info.hw.cores + ' cores');
          browserDetectResult.innerHTML = '<span class="bd-tag estimate">📡 Auto-anggar</span>Raw signal: "' + info.raw + '"' + (hwBits.length ? ' · ' + hwBits.join(' · ') : '') + ' → tier ' + est.tier;
        }
        if (!silent) showToast('Raw model "' + info.raw + '" xdak dalam DB nama, tapi auto-anggar: ' + est.tier + '.', 'info', '📡');
      }
    });
  }
  if (btnBrowserDetect) {
    btnBrowserDetect.addEventListener('click', function () { runBrowserDetect(false); });
  }
  // Quietly try once on page load so the field is pre-filled — the
  // player can still edit or re-run manually, nothing is forced.
  runBrowserDetect(true);
  if (modelInput) {
    // Auto-detect on Enter key
    modelInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); runAutoDetect(false); }
    });
    // Also live-preview hint as they type (every 600ms debounced)
    var _deb;
    modelInput.addEventListener('input', function () {
      clearTimeout(_deb);
      _deb = setTimeout(function () {
        var v = (modelInput.value || '').trim();
        if (!v) {
          if (modelHint) modelHint.innerHTML = '💡 Taip model anda → tekan Auto-Detect → jenama + RAM + DPI akan auto set!';
          return;
        }
        var match = findModelInDB(v);
        if (match) {
          modelHint.innerHTML = '<span style="color:var(--accent-2);font-weight:600;">🔎 Didapati dalam DB: <strong>' + match.l + '</strong> · Tekan Enter atau Auto-Detect!</span>';
        }
      }, 500);
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔥 FREE FIRE LATEST PATCH (v2026) — SENSITIVITY SCALE = 0-200 🔥
  // ═══════════════════════════════════════════════════════════════
  // All presets below are for NEW SCALE (max 200)
  var SENS_PRESETS = {
    control:    { general: 156, redDot: 150, x2: 140, x4: 132, sniper: 82,  freelook: 92 },
    balanced:   { general: 168, redDot: 162, x2: 154, x4: 144, sniper: 88,  freelook: 100 },
    aggressive: { general: 184, redDot: 178, x2: 170, x4: 160, sniper: 98,  freelook: 118 }
  };
  var SCOPE_PRESETS = {
    control:    { general: 92,  redDot: 82,  x2: 68,  x4: 54, awp: 46 },
    balanced:   { general: 114, redDot: 106, x2: 92,  x4: 74, awp: 64 },
    aggressive: { general: 132, redDot: 126, x2: 114, x4: 96, awp: 84 }
  };
  var GYRO_PRESETS = {
    control:    { general: 38,  redDot: 52,  x2: 70,  x4: 86, sniper: 106 },
    balanced:   { general: 60,  redDot: 76,  x2: 94,  x4: 110,sniper: 136 },
    aggressive: { general: 88,  redDot: 104, x2: 124, x4: 142,sniper: 164 }
  };
  
    var MOUSE_PRESETS = {
    control:    { x: 1.60, y: 1.20 },
    balanced:   { x: 2.00, y: 1.45 },
    aggressive: { x: 2.40, y: 1.75 }
  };
  var PRO_MOUSE = {
    raistar:      { x: 2.35, y: 1.70 },
    asc:          { x: 1.90, y: 1.40 },
    aditech:      { x: 1.55, y: 1.15 },
    white444:     { x: 2.50, y: 1.85 },
    totalgaming:  { x: 1.95, y: 1.42 },
    h4sx:         { x: 2.10, y: 1.50 }
  };

  // Brand modifier for the 0-200 scale
  var BRAND_MOD = {
    samsung:  { control: 0, balanced: 0, aggressive: 0 },
    xiaomi:   { control: +3, balanced: +3, aggressive: +5 },
    realme:   { control: +5, balanced: +6, aggressive: +7 },
    apple:    { control: -4, balanced: -4, aggressive: -3 },
    motorola: { control: +2, balanced: +3, aggressive: +3 },
    other:    { control: 0, balanced: +2, aggressive: +3 }
  };
  function ramMultiplier(ram) {
    // Low-RAM devices = need higher sensitivity for finger drags
    if (ram <= 3) return 1.04;
    if (ram === 4) return 1.00;
    if (ram === 6) return 0.98;
    return 0.96;
  }
  function dpiMultiplier(dpi) {
    if (dpi <= 380) return 1.18;
    if (dpi <= 440) return 1.08;
    if (dpi <= 480) return 1.00;
    if (dpi <= 560) return 0.93;
    if (dpi <= 620) return 0.87;
    return 0.82;
  }
  function clampSensi(n) {
    return Math.max(10, Math.min(200, Math.round(n)));
  }

  // ═══ PRO PLAYER PRESETS (SCALE 0-200) ═══
  var PRO_PRESETS = {
    raistar: {
      name: 'Raistar',
      sens:  { general: 180, redDot: 176, x2: 168, x4: 156, sniper: 96, freelook: 114 },
      scope: { general: 124, redDot: 120, x2: 110, x4: 92, awp: 82 },
      gyro:  { general: 70,  redDot: 86,  x2: 106, x4: 130, sniper: 156 }
    },
    asc: {
      name: 'ASC Gaming',
      sens:  { general: 164, redDot: 160, x2: 150, x4: 140, sniper: 86, freelook: 98 },
      scope: { general: 112, redDot: 102, x2: 88,  x4: 72, awp: 62 },
      gyro:  { general: 52,  redDot: 72,  x2: 90,  x4: 106,sniper: 134 }
    },
    aditech: {
      name: 'Aditech',
      sens:  { general: 148, redDot: 142, x2: 132, x4: 124, sniper: 74, freelook: 84 },
      scope: { general: 86,  redDot: 76,  x2: 62,  x4: 52, awp: 44 },
      gyro:  { general: 34,  redDot: 48,  x2: 66,  x4: 82, sniper: 104 }
    },
    white444: {
      name: 'White444',
      sens:  { general: 190, redDot: 184, x2: 174, x4: 164, sniper: 102,freelook: 124 },
      scope: { general: 140, redDot: 134, x2: 122, x4: 106,awp: 92 },
      gyro:  { general: 94,  redDot: 110, x2: 130, x4: 148,sniper: 170 }
    },
    totalgaming: {
      name: 'Total Gaming',
      sens:  { general: 160, redDot: 156, x2: 146, x4: 136, sniper: 86, freelook: 96 },
      scope: { general: 108, redDot: 98,  x2: 84,  x4: 68, awp: 58 },
      gyro:  { general: 54,  redDot: 74,  x2: 92,  x4: 112,sniper: 140 }
    },
    h4sx: {
      name: 'H4SX Official',
      sens:  { general: 172, redDot: 166, x2: 158, x4: 148, sniper: 92, freelook: 110 },
      scope: { general: 118, redDot: 110, x2: 96,  x4: 80, awp: 68 },
      gyro:  { general: 64,  redDot: 82,  x2: 100, x4: 118,sniper: 144 }
    }
  };

  // ──────────────────────────────────────────
  // COMPUTE SENSITIVITY
  // ──────────────────────────────────────────
  function computeSensitivity() {
    // If user selected a pro preset directly, use it (no scaling)
    if (state.proPreset && PRO_PRESETS[state.proPreset]) {
      var p = PRO_PRESETS[state.proPreset];
      return {
        sens:  JSON.parse(JSON.stringify(p.sens)),
        scope: JSON.parse(JSON.stringify(p.scope)),
        gyro:  JSON.parse(JSON.stringify(p.gyro)),
        // ✅ PRO BRANCH — guna nilai PRO_MOUSE kalau ada
        mouse: {
          x: (PRO_MOUSE[state.proPreset] || MOUSE_PRESETS[state.style] || MOUSE_PRESETS.balanced).x,
          y: (PRO_MOUSE[state.proPreset] || MOUSE_PRESETS[state.style] || MOUSE_PRESETS.balanced).y
        }
      };
    }

    var style = state.style in SENS_PRESETS ? state.style : 'balanced';
    var brand = state.brand in BRAND_MOD ? state.brand : 'other';
    var modObj = BRAND_MOD[brand];
    var mod = modObj[style] || 0;
    var ramM = ramMultiplier(state.ram);
    var dpiM = state.dpiEnabled ? dpiMultiplier(state.dpi) : dpiMultiplier(state.suggestedDpi || 480);
    function applyMod(v) {
      return clampSensi((v + mod) * ramM * dpiM);
    }
    var sB = SENS_PRESETS[style];
    var cB = SCOPE_PRESETS[style];
    var gB = GYRO_PRESETS[style];

    // ✅ KIRA NILAI MOUSE BIASA (NORMAL BRANCH)
    var mouseBase = MOUSE_PRESETS[style] || MOUSE_PRESETS.balanced;

    return {
      sens: {
        general: applyMod(sB.general),
        redDot:  applyMod(sB.redDot),
        x2:      applyMod(sB.x2),
        x4:      applyMod(sB.x4),
        sniper:  applyMod(sB.sniper),
        freelook:applyMod(sB.freelook)
      },
      scope: {
        general: applyMod(cB.general),
        redDot:  applyMod(cB.redDot),
        x2:      applyMod(cB.x2),
        x4:      applyMod(cB.x4),
        awp:     applyMod(cB.awp)
      },
      gyro: {
        general: applyMod(gB.general),
        redDot:  applyMod(gB.redDot),
        x2:      applyMod(gB.x2),
        x4:      applyMod(gB.x4),
        sniper:  applyMod(gB.sniper)
      },
      // ✅ NORMAL BRANCH — guna nilai biasa
      mouse: {
        x: mouseBase.x,
        y: mouseBase.y
      }
    };
  }

  function setValue(id, v) {
    var el = document.getElementById(id);
    if (el) el.value = v;
  }
  function applySensiToUI(result) {
    setValue('valGeneral',   result.sens.general);
    setValue('valRedDot',    result.sens.redDot);
    setValue('val2x',        result.sens.x2);
    setValue('val4x',        result.sens.x4);
    setValue('valSniper',    result.sens.sniper);
    setValue('valFreeLook',  result.sens.freelook);
    setValue('valScopeGen',  result.scope.general);
    setValue('valScopeRed',  result.scope.redDot);
    setValue('valScope2x',   result.scope.x2);
    setValue('valScope4x',   result.scope.x4);
    setValue('valScopeAwp',  result.scope.awp);
    setValue('valGyroGen',   result.gyro.general);
    setValue('valGyroRed',   result.gyro.redDot);
    setValue('valGyro2x',    result.gyro.x2);
    setValue('valGyro4x',    result.gyro.x4);
    setValue('valGyroSniper',result.gyro.sniper);

    // 🆕 Populate new device & DPI info UI
    var devEl = document.getElementById('dinfoDeviceName');
    if (devEl) {
      var label = state.detectedLabel || state.modelName || (state.brand.charAt(0).toUpperCase() + state.brand.slice(1)) + ' · ' + state.ram + 'GB';
      devEl.textContent = label;
    }
    var dpiEl = document.getElementById('dinfoSuggestedDpi');
    if (dpiEl) {
      var finalDpi = state.dpiEnabled ? state.dpi : (state.suggestedDpi || (dpiInput ? parseInt(dpiInput.value||480,10): 480));
      dpiEl.textContent = finalDpi;
      state.suggestedDpi = finalDpi;
    }
	    var tabMouse = document.getElementById('tabMouse');
    if (state.emulator && result.mouse) {
      setValue('valMouseX', result.mouse.x.toFixed(2));
      setValue('valMouseY', result.mouse.y.toFixed(2));
      if (tabMouse) tabMouse.style.display = '';
    } else {
      if (tabMouse) tabMouse.style.display = 'none';
      var activeMouse = document.querySelector('.r-tab.active[data-tab="mouse"]');
      if (activeMouse) {
        var sensTab = document.querySelector('.r-tab[data-tab="sens"]');
        if (sensTab) sensTab.click();
      }
    }
  }

  // ──────────────────────────────────────────
  // GENERATE BUTTON
  // ──────────────────────────────────────────
  var btnGenerate = document.getElementById('btnGenerate');
  var resultSection = document.getElementById('resultSection');
  function fireConfettiBurst() {
    if (typeof confetti === 'undefined') return;
    var duration = 2000;
    var end = Date.now() + duration;
    var colors = ['#cba14f', '#b3122f', '#f2c14e', '#e2672b', '#f0d998'];
    (function frame() {
      try {
        confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: colors });
        confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: colors });
      } catch (e) {}
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
  if (btnGenerate) {
    btnGenerate.addEventListener('click', function () {
      var result = computeSensitivity();
      applySensiToUI(result);
      if (resultSection) resultSection.style.display = 'block';
      fireConfettiBurst();
      setTimeout(function () {
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('Preset sensitiviti 0-200 telah dijana! Scroll bawah untuk copy.', 'success', '🎯');
      }, 300);
    });
  }

  // ──────────────────────────────────────────
  // PRO PRESET BUTTONS
  // ──────────────────────────────────────────
  var proBtns = document.querySelectorAll('.pro-btn');
  proBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var preset = btn.getAttribute('data-preset');
      state.proPreset = preset;
      proBtns.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var result = computeSensitivity();
      applySensiToUI(result);
      if (resultSection) resultSection.style.display = 'block';
      if (typeof confetti !== 'undefined') {
        try { confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#cba14f', '#b3122f', '#f2c14e', '#e2672b'] }); } catch (e) {}
      }
      setTimeout(function () {
        if (resultSection) resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        var nm = (PRO_PRESETS[preset] && PRO_PRESETS[preset].name) || preset;
        showToast('Preset ' + nm + ' aktif! (Scale 0-200)', 'success', '⭐');
      }, 250);
    });
  });

  // ──────────────────────────────────────────
  // RESULT TABS
  // ──────────────────────────────────────────
  var rTabs = document.querySelectorAll('.r-tab');
  var rPanels = document.querySelectorAll('.r-panel');
  rTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-tab');
      rTabs.forEach(function (t) { t.classList.remove('active'); });
      rPanels.forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.querySelector('.r-panel[data-panel="' + target + '"]');
      if (panel) panel.classList.add('active');
    });
  });

  // ──────────────────────────────────────────
  // COPY TO CLIPBOARD (individual)
  // ──────────────────────────────────────────
  document.querySelectorAll('.btn-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var inputId = btn.getAttribute('data-copy');
      var input = inputId ? document.getElementById(inputId) : null;
      if (!input) return;
      var value = input.value;
      copyText(String(value)).then(function () {
        var orig = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        showToast('Nilai ' + value + ' disalin! Paste dekat Free Fire je.', 'success', '📋');
        setTimeout(function () {
          btn.textContent = (orig && orig.indexOf('Copied') === -1) ? orig : 'Copy';
          btn.classList.remove('copied');
        }, 1600);
      }).catch(function () {
        showToast('Gagal copy — sila copy manually.', 'error', '⚠️');
      });
    });
  });

  // ──────────────────────────────────────────
  // 🆕 COPY DPI SUGGESTION BUTTON
  // ──────────────────────────────────────────
  var btnCopyDpi = document.getElementById('btnCopyDpi');
  if (btnCopyDpi) {
    btnCopyDpi.addEventListener('click', function () {
      var dpiVal = document.getElementById('dinfoSuggestedDpi');
      if (!dpiVal) return;
      var v = dpiVal.textContent;
      copyText(v).then(function () {
        var orig = btnCopyDpi.textContent;
        btnCopyDpi.textContent = '✓';
        setTimeout(function () { btnCopyDpi.textContent = orig; }, 1200);
        showToast('DPI ' + v + ' disalin! Ubah dalam Settings > Developer Options.', 'success', '🔍');
      });
    });
  }

  // ──────────────────────────────────────────
  // COPY ALL BUTTON
  // ──────────────────────────────────────────
  var btnCopyAll = document.getElementById('btnCopyAll');
  if (btnCopyAll) {
    btnCopyAll.addEventListener('click', function () {
      function gv(id) { var e = document.getElementById(id); return e ? (e.value || '') : ''; }
      var lines = [];
      lines.push('═══ H4SX SENSI FREE FIRE — SKALA 0-200 (v2026) ═══');
      var dpi = document.getElementById('dinfoSuggestedDpi');
      var dev = document.getElementById('dinfoDeviceName');
      if (dev) lines.push('Peranti: ' + dev.textContent);
      if (dpi) lines.push('Cadangan DPI: ' + dpi.textContent);
      lines.push('');
      lines.push('── Camera Sensitivity ──');
      lines.push('General: '   + gv('valGeneral'));
      lines.push('Red Dot: '   + gv('valRedDot'));
      lines.push('2x Scope: '  + gv('val2x'));
      lines.push('4x Scope: '  + gv('val4x'));
      lines.push('AWM: '       + gv('valSniper'));
      lines.push('Free Look: ' + gv('valFreeLook'));
      lines.push('');
      lines.push('── Scope Sensitivity ──');
      lines.push('General: '  + gv('valScopeGen'));
      lines.push('Red Dot: '  + gv('valScopeRed'));
      lines.push('2x Scope: ' + gv('valScope2x'));
      lines.push('4x Scope: ' + gv('valScope4x'));
      lines.push('AWM: '      + gv('valScopeAwp'));
      lines.push('');
      lines.push('── Gyroscope Sensitivity ──');
      lines.push('General: '  + gv('valGyroGen'));
      lines.push('Red Dot: '  + gv('valGyroRed'));
      lines.push('2x Scope: ' + gv('valGyro2x'));
      lines.push('4x Scope: ' + gv('valGyro4x'));
      lines.push('Sniper: '   + gv('valGyroSniper'));

      // ✅ TAMBAH BAHAGIAN MOUSE EMULATOR DI SINI
      if (state.emulator) {
        lines.push('');
        lines.push('── Mouse Sensitivity (Emulator) ──');
        lines.push('X: ' + gv('valMouseX'));
        lines.push('Y: ' + gv('valMouseY'));
      }

      lines.push('');
      lines.push('══════════════════════════════');
      lines.push('Dijana oleh: H4SX STORE');
      lines.push('https://h4sx-store.vercel.app');
      var fullText = lines.join('\n');
      copyText(fullText).then(function () {
        showToast('Semua nilai + DPI disalin! Skala 0-200 terkini FF 2026.', 'success', '✨');
        if (typeof confetti !== 'undefined') {
          try { confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 }, colors: ['#f2c14e', '#b3122f', '#cba14f'] }); } catch (e) {}
        }
      }).catch(function () { alert(fullText); });
    });
  }

  // ──────────────────────────────────────────
  // SMOOTH SCROLLS
  // ──────────────────────────────────────────
  var btnScrollUlasan = document.getElementById('btnScrollUlasan');
  if (btnScrollUlasan) {
    btnScrollUlasan.addEventListener('click', function (e) {
      e.preventDefault();
      var gen = document.getElementById('generator');
      if (gen) gen.scrollIntoView({ behavior: 'smooth' });
    });
  }
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href.length <= 1) return;
      var el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ──────────────────────────────────────────
  // HERO CTA: mini confetti on hover
  // ──────────────────────────────────────────
  var heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    var hoverTimer = null;
    heroCta.addEventListener('mouseenter', function () {
      if (typeof confetti === 'undefined') return;
      if (hoverTimer) clearInterval(hoverTimer);
      hoverTimer = setInterval(function () {
        try {
          confetti({ particleCount: 5, angle: 60, spread: 40, origin: { x: 0, y: 0.95 }, colors: ['#b3122f', '#cba14f', '#f2c14e'], startVelocity: 25 });
        } catch (e) {}
      }, 150);
    });
    heroCta.addEventListener('mouseleave', function () {
      if (hoverTimer) { clearInterval(hoverTimer); hoverTimer = null; }
    });
  }

  // ──────────────────────────────────────────
  // COMPAT: logoutAdmin, window globals
  // ──────────────────────────────────────────
  window.logoutAdmin = function () {
    try { sessionStorage.removeItem('h4sx_admin_ok'); } catch (e) {}
    try { location.reload(); } catch (e) {}
  };

})();
