// Spartans1st Countdown — Scenic page daily schedule (single source of truth).
// The page reads this file and, at midnight Oklahoma time (America/Chicago),
// shows the slot assigned to that date: poster + Word + Champion's Mindset + phrase together.
// To add a scene: put the approved poster at assets/scenes/<slot>.jpg and fill in its entry below.
// A slot with no "image" shows the approved entry poster; empty text fields hide their cards.
window.SPARTANS1ST_SCHEDULE = {
  fallbackImage: 'assets/championship-entry.jpg',
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
