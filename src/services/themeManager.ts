export interface HomepageTheme {
  id: string;
  name: string;
  banglaName: string;
  inspiredBy: string;
  primaryColor: string;     // Main brand color
  primaryHover: string;
  secondaryColor: string;   // Accent/secondary color
  headerBg: string;         // Header background classes/hex
  headerText: string;
  badgeBg: string;
  badgeText: string;
  accentBorder: string;
  cardAccent: string;
  buttonBg: string;
  buttonText: string;
  description: string;
}

export interface ChalanTemplate {
  id: string;
  name: string;
  banglaName: string;
  operatorGroup: string;
  styleClass: string;
  borderStyle: 'solid-black' | 'double-black' | 'thin-slate' | 'dashed-vintage' | 'heavy-bordered';
  headerLayout: 'centered-classic' | 'two-column-split' | 'boxed-banner' | 'modern-minimal' | 'vintage-ledger' | 'executive-roster';
  tableDensity: 'compact' | 'standard' | 'spacious' | 'ultra-dense';
  fontTheme: 'sans-bold' | 'mono-dispatch' | 'serif-classic' | 'condensed-fast';
  features: string[];
  description: string;
}

/* =========================================================================
   12 HOMEPAGE THEMES INSPIRED BY PROMINENT BANGLADESHI TRANSPORT COMPANIES
   ========================================================================= */
export const HOMEPAGE_THEMES: HomepageTheme[] = [
  {
    id: 'lal-sobuj-royal',
    name: 'Lal Sobuj Royal Signature',
    banglaName: 'Lal Sabuj Signature (Original)',
    inspiredBy: 'Lal Sabuj Paribahan (Flagship)',
    primaryColor: '#661d7a',
    primaryHover: '#521563',
    secondaryColor: '#006837',
    headerBg: 'bg-[#661d7a]',
    headerText: 'text-white',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    accentBorder: 'border-purple-300',
    cardAccent: 'hover:border-purple-500',
    buttonBg: 'bg-[#661d7a] hover:bg-[#521563]',
    buttonText: 'text-white',
    description: 'Iconic royal violet and emerald green palette with high-contrast administrative controls.'
  },
  {
    id: 'green-line-emerald',
    name: 'Green Line Prestige Gold',
    banglaName: 'Green Line Prestige Emerald',
    inspiredBy: 'Green Line Paribahan (Scania Multi-Axle)',
    primaryColor: '#004d25',
    primaryHover: '#00361a',
    secondaryColor: '#c59b27',
    headerBg: 'bg-[#004d25]',
    headerText: 'text-amber-100',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-950',
    accentBorder: 'border-emerald-300',
    cardAccent: 'hover:border-emerald-600',
    buttonBg: 'bg-[#004d25] hover:bg-[#00361a]',
    buttonText: 'text-white',
    description: 'Deep forest emerald green paired with warm luxury gold trim.'
  },
  {
    id: 'shohagh-maroon',
    name: 'Shohagh Scania Maroon',
    banglaName: 'Shohagh Scania Maroon',
    inspiredBy: 'Shohagh Paribahan (Comfort Class)',
    primaryColor: '#800020',
    primaryHover: '#600018',
    secondaryColor: '#f59e0b',
    headerBg: 'bg-[#800020]',
    headerText: 'text-amber-50',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentBorder: 'border-red-300',
    cardAccent: 'hover:border-red-600',
    buttonBg: 'bg-[#800020] hover:bg-[#600018]',
    buttonText: 'text-white',
    description: 'Executive deep burgundy maroon reflecting Pioneer Swedish coach service.'
  },
  {
    id: 'hanif-navy-flame',
    name: 'Hanif Enterprise Flame',
    banglaName: 'Hanif Enterprise Flame',
    inspiredBy: 'Hanif Enterprise (Nationwide Fleet)',
    primaryColor: '#0f2b5c',
    primaryHover: '#0a1d40',
    secondaryColor: '#ea580c',
    headerBg: 'bg-[#0f2b5c]',
    headerText: 'text-white',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-950',
    accentBorder: 'border-blue-300',
    cardAccent: 'hover:border-blue-600',
    buttonBg: 'bg-[#ea580c] hover:bg-[#c2410c]',
    buttonText: 'text-white',
    description: 'High-visibility maritime navy blue paired with energized flame orange buttons.'
  },
  {
    id: 'shyamoli-nr-indigo',
    name: 'Shyamoli NR Cross-Border',
    banglaName: 'Shyamoli N.R Cross-Border',
    inspiredBy: 'Shyamoli NR Travels (International Route)',
    primaryColor: '#1e3a8a',
    primaryHover: '#172554',
    secondaryColor: '#dc2626',
    headerBg: 'bg-[#1e3a8a]',
    headerText: 'text-white',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    accentBorder: 'border-blue-200',
    cardAccent: 'hover:border-blue-500',
    buttonBg: 'bg-[#1e3a8a] hover:bg-[#172554]',
    buttonText: 'text-white',
    description: 'Sharp international indigo with crisp scarlet accents for cross-district routing.'
  },
  {
    id: 'ena-crimson-express',
    name: 'Ena Express Crimson',
    banglaName: 'Ena Express Crimson',
    inspiredBy: 'Ena Transport (Highway Speed Fleet)',
    primaryColor: '#991b1b',
    primaryHover: '#7f1d1d',
    secondaryColor: '#eab308',
    headerBg: 'bg-[#991b1b]',
    headerText: 'text-white',
    badgeBg: 'bg-yellow-100',
    badgeText: 'text-yellow-950',
    accentBorder: 'border-red-200',
    cardAccent: 'hover:border-red-500',
    buttonBg: 'bg-[#991b1b] hover:bg-[#7f1d1d]',
    buttonText: 'text-white',
    description: 'High-contrast energetic crimson red with golden yellow turnaround badges.'
  },
  {
    id: 'saintmartin-cyan',
    name: 'Saintmartin Coastal Aqua',
    banglaName: 'Saintmartin Travels Coastal Aqua',
    inspiredBy: 'Saintmartin Paribahan (Hyundai Universe AC)',
    primaryColor: '#0e7490',
    primaryHover: '#155e75',
    secondaryColor: '#06b6d4',
    headerBg: 'bg-[#0e7490]',
    headerText: 'text-cyan-50',
    badgeBg: 'bg-cyan-100',
    badgeText: 'text-cyan-900',
    accentBorder: 'border-cyan-300',
    cardAccent: 'hover:border-cyan-600',
    buttonBg: 'bg-[#0e7490] hover:bg-[#155e75]',
    buttonText: 'text-white',
    description: 'Refreshing Bay of Bengal oceanic teal designed for coastal expressway lines.'
  },
  {
    id: 'desh-travels-slate',
    name: 'Desh Platinum Executive',
    banglaName: 'Desh Travels Platinum',
    inspiredBy: 'Desh Travels (VIP Business Class)',
    primaryColor: '#0f172a',
    primaryHover: '#1e293b',
    secondaryColor: '#be123c',
    headerBg: 'bg-[#0f172a]',
    headerText: 'text-slate-100',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900',
    accentBorder: 'border-slate-300',
    cardAccent: 'hover:border-slate-600',
    buttonBg: 'bg-[#be123c] hover:bg-[#9f1239]',
    buttonText: 'text-white',
    description: 'Ultra-modern carbon slate and brushed metallic red tailored for VIP business suites.'
  },
  {
    id: 'london-express-racing',
    name: 'London Express Racing Green',
    banglaName: 'London Express Racing Green',
    inspiredBy: 'London Express (MAN Sleeper Coaches)',
    primaryColor: '#064e3b',
    primaryHover: '#022c22',
    secondaryColor: '#d97706',
    headerBg: 'bg-[#064e3b]',
    headerText: 'text-emerald-50',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentBorder: 'border-emerald-300',
    cardAccent: 'hover:border-emerald-700',
    buttonBg: 'bg-[#064e3b] hover:bg-[#022c22]',
    buttonText: 'text-white',
    description: 'Classic British racing green inspired by long-haul sleeper coach cabins.'
  },
  {
    id: 'saudia-arabian-gold',
    name: 'Saudia Gold Heritage',
    banglaName: 'Saudia Gold Heritage',
    inspiredBy: 'Saudia Coach Service (Chittagong Corridor)',
    primaryColor: '#78350f',
    primaryHover: '#451a03',
    secondaryColor: '#047857',
    headerBg: 'bg-[#78350f]',
    headerText: 'text-amber-100',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-950',
    accentBorder: 'border-amber-300',
    cardAccent: 'hover:border-amber-600',
    buttonBg: 'bg-[#78350f] hover:bg-[#451a03]',
    buttonText: 'text-white',
    description: 'Traditional heritage ochre bronze honoring South-Eastern transport roots.'
  },
  {
    id: 'royal-express-violet',
    name: 'Royal Express Deep Electric',
    banglaName: 'Royal Express Deep Violet',
    inspiredBy: 'Royal Express (Kushtia - Dhaka Corridor)',
    primaryColor: '#4c1d95',
    primaryHover: '#3b0764',
    secondaryColor: '#f43f5e',
    headerBg: 'bg-[#4c1d95]',
    headerText: 'text-purple-100',
    badgeBg: 'bg-pink-100',
    badgeText: 'text-pink-900',
    accentBorder: 'border-purple-300',
    cardAccent: 'hover:border-purple-600',
    buttonBg: 'bg-[#f43f5e] hover:bg-[#e11d48]',
    buttonText: 'text-white',
    description: 'Vibrant modern electric violet with bright coral action highlights.'
  },
  {
    id: 's-alam-steel-blue',
    name: 'S. Alam Coastal Steel',
    banglaName: 'S. Alam Service Steel Blue',
    inspiredBy: 'S. Alam Service (High-Frequency Lines)',
    primaryColor: '#1e40af',
    primaryHover: '#1e3a8a',
    secondaryColor: '#b45309',
    headerBg: 'bg-[#1e40af]',
    headerText: 'text-white',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    accentBorder: 'border-blue-300',
    cardAccent: 'hover:border-blue-600',
    buttonBg: 'bg-[#1e40af] hover:bg-[#1e3a8a]',
    buttonText: 'text-white',
    description: 'Industrial steel blue tailored for high-frequency regional departures.'
  }
];

/* =========================================================================
   36 CHALAN SHEET TEMPLATES MIRRORING WELL-KNOWN BANGLADESHI TRANSPORT SERVICES
   ========================================================================= */
export const CHALAN_TEMPLATES: ChalanTemplate[] = [
  // --- Group 1: Lal Sabuj Paribahan Standards (1 to 5) ---
  {
    id: 'lsp-standard-half-a4',
    name: 'Lal Sabuj Official Half-A4 (Standard)',
    banglaName: 'Lal Sabuj Official Half-A4 (Standard)',
    operatorGroup: 'Lal Sabuj Paribahan',
    styleClass: 'template-lsp-standard',
    borderStyle: 'solid-black',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Half-A4 Base (5.85")', 'Due Amount Boxed', 'Group First-Row', 'Mirpur-10 Prominent'],
    description: 'The official certified half-page format with prominent brand title, clean group indicators, and bold due totals.'
  },
  {
    id: 'lsp-compact-express',
    name: 'Lal Sabuj Compact Turnaround',
    banglaName: 'Lal Sabuj Compact Turnaround',
    operatorGroup: 'Lal Sabuj Paribahan',
    styleClass: 'template-lsp-compact',
    borderStyle: 'solid-black',
    headerLayout: 'modern-minimal',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['High Row Density', 'Slim Cell Padding', 'Fast Terminal Clearance', 'Clear Cut Line'],
    description: 'Ultra-efficient compact grid designed for fast peak-hour terminal dispatches with 35+ passengers.'
  },
  {
    id: 'lsp-executive-double-deck',
    name: 'Lal Sabuj Double-Deck VIP Roster',
    banglaName: 'Lal Sabuj Double-Deck VIP Roster',
    operatorGroup: 'Lal Sabuj Paribahan',
    styleClass: 'template-lsp-double-deck',
    borderStyle: 'double-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Lower/Upper Deck Split', 'VIP Suite Identifiers', 'Supervisor Authorization Box'],
    description: 'Specially formatted for Scania Double-Decker coaches showing deck segregation and berth codes.'
  },
  {
    id: 'lsp-night-coach-chalan',
    name: 'Lal Sabuj Night Long-Haul Roster',
    banglaName: 'Lal Sabuj Night Long-Haul Roster',
    operatorGroup: 'Lal Sabuj Paribahan',
    styleClass: 'template-lsp-night',
    borderStyle: 'heavy-bordered',
    headerLayout: 'centered-classic',
    tableDensity: 'spacious',
    fontTheme: 'sans-bold',
    features: ['Highway Checkpost Stamp Areas', 'Fuel Advance Field', 'Driver/Guide Co-Signature'],
    description: 'Night service manifest featuring check-point verification stamps for Highway Police clearance.'
  },
  {
    id: 'lsp-minimal-ledger',
    name: 'Lal Sabuj Clean Monolithic Ledger',
    banglaName: 'Lal Sabuj Clean Monolithic Ledger',
    operatorGroup: 'Lal Sabuj Paribahan',
    styleClass: 'template-lsp-minimal',
    borderStyle: 'thin-slate',
    headerLayout: 'modern-minimal',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Zero Clutter', 'Light Grid Lines', 'Optimized Ink Saving'],
    description: 'Minimal ink-conserving dispatch sheet with maximum legibility for laser and thermal printers.'
  },

  // --- Group 2: Green Line Paribahan Inspired Formats (6 to 9) ---
  {
    id: 'gl-double-decker-suite',
    name: 'Green Line Scania Suite Format',
    banglaName: 'Green Line Scania Suite Format',
    operatorGroup: 'Green Line Style',
    styleClass: 'template-gl-scania',
    borderStyle: 'double-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Gold-Tone Headers in Greyscale', 'Double Deck Layout', 'Water Bottle & Snack Tracker'],
    description: 'Inspired by Green Line luxury sleeper coaches with dedicated steward and service checklists.'
  },
  {
    id: 'gl-dhaka-ctg-corridor',
    name: 'Green Line Expressway Express',
    banglaName: 'Green Line Expressway Express',
    operatorGroup: 'Green Line Style',
    styleClass: 'template-gl-expressway',
    borderStyle: 'solid-black',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['Toll Plaza Verification', 'Direct Non-Stop Log', 'Boarding Counter Codes'],
    description: 'Fast non-stop corridor manifest tuned for Meghna & Daudkandi expressway toll clearance.'
  },
  {
    id: 'gl-international-benapole',
    name: 'Green Line Transit Manifest',
    banglaName: 'Green Line Transit Manifest',
    operatorGroup: 'Green Line Style',
    styleClass: 'template-gl-transit',
    borderStyle: 'heavy-bordered',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Passport / ID Tag Columns', 'Customs Clearance Box', 'Border Cross-Reference'],
    description: 'Customs and immigration ready manifest format with dedicated travel document verification.'
  },
  {
    id: 'gl-terminal-counter-summary',
    name: 'Green Line Central Accounts Reconciled',
    banglaName: 'Green Line Accounts Reconciled',
    operatorGroup: 'Green Line Style',
    styleClass: 'template-gl-accounts',
    borderStyle: 'solid-black',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'mono-dispatch',
    features: ['Counter-wise Cash Aggregation', 'Due Reconciliation Footnote', 'Clerk Verification Signature'],
    description: 'Comprehensive financial reconciliation manifest displaying booking counter credit balances.'
  },

  // --- Group 3: Shohagh Paribahan Inspired Formats (10 to 13) ---
  {
    id: 'shohagh-comfort-class',
    name: 'Shohagh Scania Comfort Roster',
    banglaName: 'Shohagh Scania Comfort Roster',
    operatorGroup: 'Shohagh Style',
    styleClass: 'template-shohagh-comfort',
    borderStyle: 'solid-black',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Traditional Bold Header', 'Passenger Contact Masking', 'Clean Due Highlight'],
    description: 'Classic format modeled after Shohagh Paribahan Malibagh central dispatch sheets.'
  },
  {
    id: 'shohagh-benapole-sleeper',
    name: 'Shohagh Sleeper Coach Roster',
    banglaName: 'Shohagh Sleeper Coach Roster',
    operatorGroup: 'Shohagh Style',
    styleClass: 'template-shohagh-sleeper',
    borderStyle: 'double-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'spacious',
    fontTheme: 'sans-bold',
    features: ['Berth Numbering L-U', 'Blanket & Linen Inventory', 'Attendant Certification'],
    description: 'Dedicated luxury berth manifest with cabin allocations and passenger luggage tags.'
  },
  {
    id: 'shohagh-counter-collection',
    name: 'Shohagh Station Master Manifest',
    banglaName: 'Shohagh Station Master Manifest',
    operatorGroup: 'Shohagh Style',
    styleClass: 'template-shohagh-master',
    borderStyle: 'heavy-bordered',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['Station Master Countersign', 'Waybill Number Integration', 'Inter-terminal Handover'],
    description: 'Strict station master dispatch sheet tracking physical seat-ticket handover at terminals.'
  },
  {
    id: 'shohagh-vintage-typewriter',
    name: 'Shohagh Heritage Typewriter Ledger',
    banglaName: 'Shohagh Heritage Typewriter Ledger',
    operatorGroup: 'Shohagh Style',
    styleClass: 'template-shohagh-vintage',
    borderStyle: 'dashed-vintage',
    headerLayout: 'vintage-ledger',
    tableDensity: 'standard',
    fontTheme: 'mono-dispatch',
    features: ['Fixed-width Monospace Typography', 'Vintage Perforation Borders', 'Classic Box Layout'],
    description: 'Nostalgic 1990s typewriter aesthetic with authentic monospace grid and dot-matrix borders.'
  },

  // --- Group 4: Hanif Enterprise Inspired Formats (14 to 17) ---
  {
    id: 'hanif-fleet-master',
    name: 'Hanif High-Density Fleet Master',
    banglaName: 'Hanif High-Density Fleet Master',
    operatorGroup: 'Hanif Style',
    styleClass: 'template-hanif-master',
    borderStyle: 'solid-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'ultra-dense',
    fontTheme: 'condensed-fast',
    features: ['40-Seat Full Page Compression', 'Ultra-dense 1-sheet fit', 'Boarding Stamp Squares'],
    description: 'Designed for high-frequency operations, packing complete 40-seat manifests into a half-page without spillover.'
  },
  {
    id: 'hanif-sayedabad-division',
    name: 'Hanif Sayedabad Terminal Dispatch',
    banglaName: 'Hanif Sayedabad Terminal Dispatch',
    operatorGroup: 'Hanif Style',
    styleClass: 'template-hanif-sayedabad',
    borderStyle: 'heavy-bordered',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'sans-bold',
    features: ['Sayedabad Platform Gate Tag', 'Line Master Stamp', 'Quick Turnaround Seal'],
    description: 'Authentic Sayedabad inter-district central counter format with platform gate badges.'
  },
  {
    id: 'hanif-north-bengal',
    name: 'Hanif North Bengal Corridor Waybill',
    banglaName: 'Hanif North Bengal Corridor Waybill',
    operatorGroup: 'Hanif Style',
    styleClass: 'template-hanif-north',
    borderStyle: 'solid-black',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Jamuna Bridge Toll Segment', 'Bogra/Rangpur Dropping Grid', 'Fuel Allocation Log'],
    description: 'Tailored for long highway routes across Bangabandhu Bridge with waypoint stoppage trackers.'
  },
  {
    id: 'hanif-economy-fast',
    name: 'Hanif Economy Fast Chalan',
    banglaName: 'Hanif Economy Fast Chalan',
    operatorGroup: 'Hanif Style',
    styleClass: 'template-hanif-fast',
    borderStyle: 'thin-slate',
    headerLayout: 'modern-minimal',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['Zero Extra Ink', 'Fast DOT Printing', 'Clear Total Due Banner'],
    description: 'High-contrast rapid print layout specifically designed for dot-matrix terminal printers.'
  },

  // --- Group 5: Shyamoli NR Travels Inspired Formats (18 to 21) ---
  {
    id: 'shyamoli-interstate-manifest',
    name: 'Shyamoli NR Cross-District Waybill',
    banglaName: 'Shyamoli N.R Cross-District Waybill',
    operatorGroup: 'Shyamoli Style',
    styleClass: 'template-shyamoli-waybill',
    borderStyle: 'double-black',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Sub-Counter Dropping Breakdown', 'Luggage Tag Series', 'Supervisor Emergency Contacts'],
    description: 'Detailed route chalan showing sub-counters across Feni, Maijdee, and Sonapur.'
  },
  {
    id: 'shyamoli-arambagh-central',
    name: 'Shyamoli Arambagh Main Counter Sheet',
    banglaName: 'Shyamoli Arambagh Main Counter Sheet',
    operatorGroup: 'Shyamoli Style',
    styleClass: 'template-shyamoli-arambagh',
    borderStyle: 'solid-black',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'sans-bold',
    features: ['Arambagh Central Seal', 'Passenger Contact Directory', 'Advance Fare Summary'],
    description: 'Arambagh head booking counter standard with prominent counter authorization seals.'
  },
  {
    id: 'shyamoli-sylhet-line',
    name: 'Shyamoli Highway Passenger Roster',
    banglaName: 'Shyamoli Highway Passenger Roster',
    operatorGroup: 'Shyamoli Style',
    styleClass: 'template-shyamoli-highway',
    borderStyle: 'heavy-bordered',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Dropping Milestone Distance', 'Rest-Stop Verification', 'Night Guard Signoff'],
    description: 'Equipped with intermediate highway rest-stop checks and security guard signoffs.'
  },
  {
    id: 'shyamoli-courier-combo',
    name: 'Shyamoli Passenger & Courier Combined',
    banglaName: 'Shyamoli Combined Passenger & Parcel Manifest',
    operatorGroup: 'Shyamoli Style',
    styleClass: 'template-shyamoli-parcel',
    borderStyle: 'solid-black',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'mono-dispatch',
    features: ['Lower Luggage Belly Roster', 'Parcel Manifest Reference', 'Combined Total Ledger'],
    description: 'Dual-purpose manifest integrating boot luggage consignments with passenger bookings.'
  },

  // --- Group 6: Ena Transport Inspired Formats (22 to 24) ---
  {
    id: 'ena-sylhet-turnaround',
    name: 'Ena Mohakhali Rapid Turnaround',
    banglaName: 'Ena Mohakhali Rapid Turnaround',
    operatorGroup: 'Ena Transport Style',
    styleClass: 'template-ena-rapid',
    borderStyle: 'solid-black',
    headerLayout: 'modern-minimal',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['15-Minute Turnaround Stamp', 'Seat Occupation Summary', 'Driver Bonus Tracking'],
    description: 'High-frequency shuttle manifest modeled on Mohakhali terminal rapid dispatching.'
  },
  {
    id: 'ena-expressway-chalan',
    name: 'Ena Express Dhaka-Noakhali Chalan',
    banglaName: 'Ena Express Dhaka-Noakhali Chalan',
    operatorGroup: 'Ena Transport Style',
    styleClass: 'template-ena-express',
    borderStyle: 'heavy-bordered',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Coach Number Large Watermark', 'Padma/Meghna Crossing Stamp', 'Online Booking Highlight'],
    description: 'Features a large watermark bus registration header and clear online booking badges.'
  },
  {
    id: 'ena-fuel-audit-sheet',
    name: 'Ena Fleet Operations & Fuel Audit',
    banglaName: 'Ena Fleet Operations & Fuel Audit',
    operatorGroup: 'Ena Transport Style',
    styleClass: 'template-ena-fuel',
    borderStyle: 'double-black',
    headerLayout: 'two-column-split',
    tableDensity: 'compact',
    fontTheme: 'mono-dispatch',
    features: ['CNG / Diesel Pump Voucher Line', 'Mileage / Km Out-In Tracker', 'Clean Due Box'],
    description: 'Operational audit sheet integrating fuel pump receipts with total counter passenger dues.'
  },

  // --- Group 7: Saintmartin & Coastal Inspired Formats (25 to 27) ---
  {
    id: 'saintmartin-hyundai-universe',
    name: 'Saintmartin Hyundai Universe VIP Roster',
    banglaName: 'Saintmartin Hyundai Universe VIP',
    operatorGroup: 'Saintmartin Style',
    styleClass: 'template-sm-hyundai',
    borderStyle: 'double-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Hotel Dropoff Points', 'Tourist Group Tags', 'Coastal Night Escort Seal'],
    description: 'Specialized for luxury tourist routes with hotel dropping point annotations.'
  },
  {
    id: 'saintmartin-sleeper-suite',
    name: 'Saintmartin Executive Sleeper Roster',
    banglaName: 'Saintmartin Executive Sleeper Roster',
    operatorGroup: 'Saintmartin Style',
    styleClass: 'template-sm-sleeper',
    borderStyle: 'solid-black',
    headerLayout: 'two-column-split',
    tableDensity: 'spacious',
    fontTheme: 'sans-bold',
    features: ['Single & Double Bed Allocations', 'Curtain Lock Status', 'Mineral Water Roster'],
    description: 'Spacious berth roster with amenities checklist and emergency passenger contact numbers.'
  },
  {
    id: 'saintmartin-marine-drive',
    name: 'Saintmartin Marine Drive Express',
    banglaName: 'Saintmartin Marine Drive Express',
    operatorGroup: 'Saintmartin Style',
    styleClass: 'template-sm-marine',
    borderStyle: 'heavy-bordered',
    headerLayout: 'centered-classic',
    tableDensity: 'compact',
    fontTheme: 'sans-bold',
    features: ['Ferry / Bridge Waybill Check', 'Terminal Guard Stamp', 'Prominent Due Counter'],
    description: 'Coastal highway clearance document featuring multi-bridge inspection approvals.'
  },

  // --- Group 8: Desh Travels & London Express Inspired (28 to 30) ---
  {
    id: 'desh-platinum-suite',
    name: 'Desh Travels 1+2 Platinum Suite',
    banglaName: 'Desh Travels 1+2 Platinum Suite',
    operatorGroup: 'Desh Travels Style',
    styleClass: 'template-desh-platinum',
    borderStyle: 'double-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['VIP Business Single Seats', 'Corporate Account Codes', 'Printed Barcode Space'],
    description: 'Refined business-class manifest tailored for 28-seat 1+2 luxury executive configurations.'
  },
  {
    id: 'london-express-man',
    name: 'London Express MAN Luxury Sleeper',
    banglaName: 'London Express MAN Sleeper Chalan',
    operatorGroup: 'London Express Style',
    styleClass: 'template-london-sleeper',
    borderStyle: 'heavy-bordered',
    headerLayout: 'executive-roster',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['European Coach Roster', 'Upper/Lower Pod Grid', 'Wi-Fi Voucher Serial Field'],
    description: 'Sleek executive roster mirroring European MAN coach standards with pod berth designations.'
  },
  {
    id: 'desh-rajshahi-corridor',
    name: 'Desh Silk Route Fast Manifest',
    banglaName: 'Desh Silk Route Fast Manifest',
    operatorGroup: 'Desh Travels Style',
    styleClass: 'template-desh-silk',
    borderStyle: 'solid-black',
    headerLayout: 'modern-minimal',
    tableDensity: 'compact',
    fontTheme: 'condensed-fast',
    features: ['High Speed Toll Tags', 'Counter Wise Luggage Index', 'Driver Compliance Seal'],
    description: 'Streamlined corridor dispatch sheet prioritizing departure time adherence.'
  },

  // --- Group 9: Saudia, S. Alam & Unique Service (31 to 33) ---
  {
    id: 'saudia-ctg-traditional',
    name: 'Saudia Coach Traditional Ledger',
    banglaName: 'Saudia Coach Traditional Ledger',
    operatorGroup: 'Saudia Style',
    styleClass: 'template-saudia-traditional',
    borderStyle: 'solid-black',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'serif-classic',
    features: ['Classic Serif Headings', 'Traditional Bengali Numbering Support', 'Firm Ledger Borders'],
    description: 'Time-tested traditional transport ledger format with classic bordered columns.'
  },
  {
    id: 'salam-high-frequency',
    name: 'S. Alam High-Volume Station Sheet',
    banglaName: 'S. Alam High-Volume Station Sheet',
    operatorGroup: 'S. Alam Style',
    styleClass: 'template-salam-volume',
    borderStyle: 'heavy-bordered',
    headerLayout: 'two-column-split',
    tableDensity: 'ultra-dense',
    fontTheme: 'condensed-fast',
    features: ['Continuous Roll Optimized', 'Quick Cash Total', 'Checker Signature Stamp'],
    description: 'Ultra-condensed dispatch roll designed for high-frequency inter-city services.'
  },
  {
    id: 'unique-service-chalan',
    name: 'Unique Service Operational Chalan',
    banglaName: 'Unique Service Operational Chalan',
    operatorGroup: 'Unique Service Style',
    styleClass: 'template-unique-standard',
    borderStyle: 'solid-black',
    headerLayout: 'boxed-banner',
    tableDensity: 'standard',
    fontTheme: 'sans-bold',
    features: ['Clear Bold Black Due Badge', 'Counter Commission Notation', 'Supervisor Identity'],
    description: 'Clean dispatch chalan highlighting counter commissions and driver road expenses.'
  },

  // --- Group 10: Specialized Dispatch & Thermal Formats (34 to 36) ---
  {
    id: 'special-thermal-slip',
    name: 'Thermal Receipt Mini Manifest (4-Inch)',
    banglaName: 'Thermal Slip Mini Manifest (4-inch)',
    operatorGroup: 'Specialized Formats',
    styleClass: 'template-thermal-mini',
    borderStyle: 'dashed-vintage',
    headerLayout: 'modern-minimal',
    tableDensity: 'compact',
    fontTheme: 'mono-dispatch',
    features: ['Narrow Thermal Roll Format', 'POS Receipt Optimization', 'Scannable Summary'],
    description: 'Narrow layout formatted for mobile POS thermal printers used at boarding counter gates.'
  },
  {
    id: 'special-landscape-wide',
    name: 'Landscape Half-A4 Wide-Spread',
    banglaName: 'Landscape Half-A4 Wide-Spread',
    operatorGroup: 'Specialized Formats',
    styleClass: 'template-landscape-wide',
    borderStyle: 'double-black',
    headerLayout: 'two-column-split',
    tableDensity: 'spacious',
    fontTheme: 'sans-bold',
    features: ['Horizontal Sheet Orientation', 'Extended Passenger Name & Address', 'Direct Remarks Column'],
    description: 'Horizontal orientation allowing full passenger addresses, national ID, and supervisor remarks.'
  },
  {
    id: 'special-government-protocol',
    name: 'Official Executive Protocol Chalan',
    banglaName: 'Official Executive Protocol Chalan',
    operatorGroup: 'Specialized Formats',
    styleClass: 'template-gov-protocol',
    borderStyle: 'heavy-bordered',
    headerLayout: 'centered-classic',
    tableDensity: 'standard',
    fontTheme: 'serif-classic',
    features: ['Official Seal Watermark Space', 'Magistrate & Security Verification', 'Perforation Receipt Stubs'],
    description: 'Formal bureaucratic format equipped with security clearance seals and double perforation stubs.'
  }
];

const HOMEPAGE_THEME_STORAGE_KEY = 'lsp_active_homepage_theme_v2';
const CHALAN_TEMPLATE_STORAGE_KEY = 'lsp_active_chalan_template_v2';

class ThemeManagerService {
  private activeTheme: HomepageTheme = HOMEPAGE_THEMES[0];
  private activeTemplate: ChalanTemplate = CHALAN_TEMPLATES[0];
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadPersistedSettings();
  }

  private loadPersistedSettings() {
    if (typeof window === 'undefined') return;

    try {
      const savedThemeId = localStorage.getItem(HOMEPAGE_THEME_STORAGE_KEY);
      if (savedThemeId) {
        const found = HOMEPAGE_THEMES.find((t) => t.id === savedThemeId);
        if (found) this.activeTheme = found;
      }

      const savedTemplateId = localStorage.getItem(CHALAN_TEMPLATE_STORAGE_KEY);
      if (savedTemplateId) {
        const foundT = CHALAN_TEMPLATES.find((t) => t.id === savedTemplateId);
        if (foundT) this.activeTemplate = foundT;
      }
    } catch (e) {
      console.warn('Failed to load theme settings:', e);
    }
  }

  public getActiveTheme(): HomepageTheme {
    return this.activeTheme;
  }

  public getActiveTemplate(): ChalanTemplate {
    return this.activeTemplate;
  }

  public setHomepageTheme(themeId: string) {
    const found = HOMEPAGE_THEMES.find((t) => t.id === themeId);
    if (found) {
      this.activeTheme = found;
      try {
        localStorage.setItem(HOMEPAGE_THEME_STORAGE_KEY, themeId);
      } catch (e) {}
      this.notify();
    }
  }

  public setChalanTemplate(templateId: string) {
    const found = CHALAN_TEMPLATES.find((t) => t.id === templateId);
    if (found) {
      this.activeTemplate = found;
      try {
        localStorage.setItem(CHALAN_TEMPLATE_STORAGE_KEY, templateId);
      } catch (e) {}
      this.notify();
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (e) {
        console.error('Error in theme listener:', e);
      }
    });
  }
}

export const themeManager = new ThemeManagerService();
