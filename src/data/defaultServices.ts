import { ServiceItem } from '../types';

// ─── Default Services (first-run seed) ─────────────────────────
// This replaces the old backend DB seed for the `services` table.
// Only used the very first time the site loads on a given browser
// (i.e. when localStorage has no services saved yet). After that,
// whatever the admin has added/edited/deleted from the Services
// Management modal is what persists.
export const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 'svc-1',  icon: 'fa-hands-praying', name: 'Prabhu Bhakti',            gujarati: 'પ્રભુ ભક્તિ',            desc: "Divine Lord Adoration. Elevating devotional bhajan, stavan, and kirtan evenings sung live with captivating synthesizer instrumentals to move every devotee's heart.", timestamp: Date.now() - 11 * 60 * 60 * 1000 },
  { id: 'svc-2',  icon: 'fa-dharmachakra',  name: 'Guru Bhakti',              gujarati: 'ગુરુ ભક્તિ',              desc: 'Spiritual Master Veneration. Deeply respectful musical programs dedicated to thanking, honoring, and commemorating Jain spiritual leaders.', timestamp: Date.now() - 10 * 60 * 60 * 1000 },
  { id: 'svc-3',  icon: 'fa-heart',         name: 'Diksha Mahotsav',          gujarati: 'દિક્ષા મહોત્સવ',          desc: 'Renunciation Ceremony Celebration. Providing majestic, grand traditional soundtracks for those committing their life to ascetism.', timestamp: Date.now() - 9 * 60 * 60 * 1000 },
  { id: 'svc-4',  icon: 'fa-sun',           name: 'Tap Vandana',              gujarati: 'તપ વંદના',              desc: 'Celebrating and validating the power of physical penance and fasts, with soul-strengthening chants, stotra rhythms, and spiritual praises.', timestamp: Date.now() - 8 * 60 * 60 * 1000 },
  { id: 'svc-5',  icon: 'fa-water',         name: 'Snatra Mahotsav',          gujarati: 'સ્નાત્ર મહોત્સવ',          desc: 'Holy Bathing Ceremony Orchestration. Authentic rhythms and continuous Sanskrit & Prakrit chanting to synchronize perfectly with ritual practices.', timestamp: Date.now() - 7 * 60 * 60 * 1000 },
  { id: 'svc-6',  icon: 'fa-dove',          name: 'Shradhanjali',             gujarati: 'શ્રદ્ધાંજલિ',             desc: 'Prayer & Remembrance Tributes. Peaceful, calming acoustic sets and respectful stavan melodies to help families remember their beloved passed ones.', timestamp: Date.now() - 6 * 60 * 60 * 1000 },
  { id: 'svc-7',  icon: 'fa-leaf',          name: 'Jain Pooja (Pujan)',       gujarati: 'જૈન પૂજા - પૂજન',       desc: 'Sacred Ritual Music. Custom orchestrations, stotras, and classical ragas tailored beautifully for complex Jain rituals, Pujas, and vidhis.', timestamp: Date.now() - 5 * 60 * 60 * 1000 },
  { id: 'svc-8',  icon: 'fa-users',         name: 'Matru-Pitru Vandana',      gujarati: 'માતૃ-પિતૃ વંદના',      desc: 'Parental Reverence. Emotionally moving stavan performances celebrating parental love, respect, values, and strong family legacies.', timestamp: Date.now() - 4 * 60 * 60 * 1000 },
  { id: 'svc-9',  icon: 'fa-crown',         name: 'Shakrastav Abhishek',      gujarati: 'શક્રસ્તવ અભિષેક',      desc: 'Sacred Bathing Chants. Powerfully synchronized live audio-visual stotras, mantras, and devotional high-energy singing for the divine Abhishek ritual.', timestamp: Date.now() - 3 * 60 * 60 * 1000 },
  { id: 'svc-10', icon: 'fa-mountain',      name: 'Shetrunjay Bhav Yatra',    gujarati: 'શેત્રુંજય ભાવ યાત્રા', desc: 'Sacred Pilgrimage Musical Journey. Devotional compositions and spiritual chants celebrating the divine journey to Shetrunjay.', timestamp: Date.now() - 2 * 60 * 60 * 1000 },
  { id: 'svc-11', icon: 'fa-star',          name: 'Other Religious Programs', gujarati: 'અન્ય ધાર્મિક પ્રોગ્રામ', desc: 'Custom Celebrations. Tailor-made classical, semi-classical, stavan sandhyas, and customized Jain music sequences for any local or national holy events.', timestamp: Date.now() - 1 * 60 * 60 * 1000 },
];