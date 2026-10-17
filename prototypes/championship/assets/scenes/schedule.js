// Spartans1st Countdown — Scenic page daily schedule (single source of truth).
// The page reads this file and, at midnight Oklahoma time (America/Chicago),
// shows the slot assigned to that date: poster + Word + Champion's Mindset + phrase together.
// To add a scene: put the approved poster at assets/scenes/<slot>.jpg and fill in its entry below.
// A slot with no "image" shows the approved entry poster; empty text fields hide their cards.
window.SPARTANS1ST_SCHEDULE = {
  fallbackImage: 'assets/scenes/daily-01.jpg', fallbackCrop: 'middle', // most recent approved scene; Page 2 never repeats the Page 1 poster
  firstDate: '2026-10-15',
  // date -> slot
  days: {
    '2026-10-15': 'daily-01', '2026-10-16': 'daily-02', '2026-10-17': 'daily-03', '2026-10-18': 'daily-04',
    '2026-10-19': 'daily-05', '2026-10-20': 'daily-06', '2026-10-21': 'daily-07', '2026-10-22': 'daily-08',
    '2026-10-23': 'eve-regionals', '2026-10-24': 'race-regionals',
    '2026-10-25': 'daily-09', '2026-10-26': 'daily-10', '2026-10-27': 'daily-11', '2026-10-28': 'daily-12',
    '2026-10-29': 'daily-13', '2026-10-30': 'eve-state', '2026-10-31': 'race-state'
  },
  // after the last scheduled date these alternate daily
  afterSeason: ['welldone-01', 'welldone-02'],
  // before the first scheduled date
  beforeSeason: 'daily-01',
  slots: {
    'daily-01': {
      image: 'assets/scenes/daily-01.jpg',
      crop: 'middle', // current Day 1 has poster branding painted on; show only the runner/mountain middle until the simplified scene arrives
      verse: 'I press toward the mark for the prize of the high calling of God in Christ Jesus.',
      ref: 'Philippians 3:14 (KJV)',
      mindset: 'Great things are done by a series of small things brought together.',
      source: 'Vincent van Gogh',
      phrase: 'Every step has a purpose. Keep pressing toward the mark.'
    },
    'daily-02': {}, 'daily-03': {}, 'daily-04': {}, 'daily-05': {}, 'daily-06': {}, 'daily-07': {},
    'daily-08': {}, 'daily-09': {}, 'daily-10': {}, 'daily-11': {}, 'daily-12': {}, 'daily-13': {},
    'daily-14': {},
    'eve-regionals': {}, 'race-regionals': {}, 'eve-state': {}, 'race-state': {},
    'welldone-01': {}, 'welldone-02': {}
  }
};

// Visual refinement for the Living Journey cards. Keep Scripture primary, while
// distinguishing the application/commentary as a separate illuminated inset.
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .journey-home .scene-cards .card,
    .journey-home .rv-cards .card {
      background: linear-gradient(145deg, rgba(18,63,162,.94), rgba(8,31,102,.96));
      border-color: rgba(126,199,255,.48);
      box-shadow: 0 12px 30px rgba(0,20,60,.42), inset 0 1px 0 rgba(255,255,255,.04);
    }
    .journey-home .insight,
    .journey-home #rvInsight {
      position: relative;
      margin-top: 14px !important;
      padding: 13px 14px 13px 18px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(20,85,190,.34), rgba(13,49,126,.46));
      border: 1px solid rgba(91,178,255,.25);
      color: #e5f1ff !important;
      font-style: normal !important;
      line-height: 1.55 !important;
      box-shadow: inset 0 1px 12px rgba(69,153,255,.08);
    }
    .journey-home .insight::before,
    .journey-home #rvInsight::before {
      content: '';
      position: absolute;
      left: 0;
      top: 10px;
      bottom: 10px;
      width: 3px;
      border-radius: 3px;
      background: linear-gradient(#ffe6a0, #f3bf42, #b8780a);
      box-shadow: 0 0 8px rgba(243,191,66,.35);
    }
  `;
  document.head.appendChild(style);
})();
