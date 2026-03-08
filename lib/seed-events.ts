// Seed events — realistic OC family events used as fallback when no JSON data is present.
// Dates are relative so they always appear current.

export interface SeedEvent {
  id: string
  slug: string
  title: string
  description: string
  date: string          // ISO date string
  time: string
  location: string
  city: string
  price: string
  is_free: boolean
  url: string | null
  category: EventCategory
  tags: string[]
  // Placeholder visual — used until real images are provided
  placeholderEmoji: string
  placeholderGradient: string
}

export type EventCategory = 'outdoor' | 'museum' | 'market' | 'arts' | 'sports' | 'community'

// Returns next Saturday from today
function nextSat(offsetDays = 0): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilSat = (6 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilSat + offsetDays)
  return d.toISOString().split('T')[0]
}
function nextSun(offsetDays = 0): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilSun = (7 - day) % 7 || 7
  d.setDate(d.getDate() + daysUntilSun + offsetDays)
  return d.toISOString().split('T')[0]
}
function nextFri(offsetDays = 0): string {
  const d = new Date()
  const day = d.getDay()
  const daysUntilFri = (5 - day + 7) % 7 || 7
  d.setDate(d.getDate() + daysUntilFri + offsetDays)
  return d.toISOString().split('T')[0]
}

export const SEED_EVENTS: SeedEvent[] = [
  {
    id: 'evt-1',
    slug: 'irvine-great-park-farmers-market',
    title: 'Irvine Great Park Farmers Market',
    description:
      'One of OC\'s best weekly farmers markets, right inside the Great Park. Fresh produce, artisan food vendors, live music, and a dedicated kids\' activity area. Stroller-friendly with wide pathways and plenty of shade trees. Free parking, free entry — just budget for all the food you\'ll want to buy.',
    date: nextSat(),
    time: '8:00 AM – 1:00 PM',
    location: 'Great Park, 8000 Great Park Blvd',
    city: 'Irvine',
    price: 'Free',
    is_free: true,
    url: 'https://www.cityofirvine.org/great-park',
    category: 'market',
    tags: ['farmers market', 'food', 'free', 'weekly', 'stroller-friendly'],
    placeholderEmoji: '🥦',
    placeholderGradient: 'from-green-400 to-emerald-500',
  },
  {
    id: 'evt-2',
    slug: 'discovery-cube-oc-family-day',
    title: 'Discovery Cube OC — Family Science Day',
    description:
      'Orange County\'s top children\'s science museum, with hands-on exhibits across three floors. Kids can explore weather phenomena, dig for dinosaur fossils, navigate a water play area, and take part in live science demonstrations. Best for ages 2–12. Plan for at least 2–3 hours — there\'s a lot to explore.',
    date: nextSat(),
    time: '10:00 AM – 5:00 PM',
    location: 'Discovery Cube OC, 2500 N Main St',
    city: 'Santa Ana',
    price: '$19.95 / child',
    is_free: false,
    url: 'https://discoverycube.org/orange-county/',
    category: 'museum',
    tags: ['museum', 'science', 'kids', 'indoor', 'ages 2-12'],
    placeholderEmoji: '🔬',
    placeholderGradient: 'from-violet-400 to-purple-500',
  },
  {
    id: 'evt-3',
    slug: 'mile-square-park-movie-night',
    title: 'Family Movie Night at Mile Square Park',
    description:
      'Bring a blanket and settle in for an outdoor movie night under the stars. The park sets up a massive inflatable screen with a family-friendly film. Gates open at 6:30 PM — arrive early to claim your spot on the grass. Free popcorn for kids while supplies last. Concessions available on-site.',
    date: nextFri(),
    time: 'Gates 6:30 PM · Film 8:00 PM',
    location: 'Mile Square Regional Park, 16801 Euclid St',
    city: 'Fountain Valley',
    price: 'Free',
    is_free: true,
    url: 'https://ocparks.com/parks/mile-square',
    category: 'community',
    tags: ['movie night', 'outdoor', 'free', 'family', 'evening'],
    placeholderEmoji: '🎬',
    placeholderGradient: 'from-yellow-400 to-orange-400',
  },
  {
    id: 'evt-4',
    slug: 'pretend-city-childrens-museum',
    title: 'Pretend City Children\'s Museum',
    description:
      'A beloved OC staple for toddlers and young kids — Pretend City is a miniature walkable town where kids run the grocery store, the fire station, the art studio, the vet clinic, and more. Fully imaginative play in a safe, enclosed environment. Great for ages 1–8. Members get in free; non-members pay a small admission.',
    date: nextSat(),
    time: '9:00 AM – 5:00 PM',
    location: 'Pretend City, 29 Hubble',
    city: 'Irvine',
    price: '$15 / person',
    is_free: false,
    url: 'https://pretendcity.org',
    category: 'museum',
    tags: ['pretend play', 'toddlers', 'museum', 'indoor', 'ages 1-8'],
    placeholderEmoji: '🏙️',
    placeholderGradient: 'from-pink-400 to-rose-400',
  },
  {
    id: 'evt-5',
    slug: 'dana-point-whale-watching',
    title: 'Dana Point Whale Watching Cruise',
    description:
      'Dana Point is the whale watching capital of the world — and for good reason. Year-round you can spot blue whales, humpbacks, and dolphins. This 2.5-hour cruise runs mornings and afternoons, and kids under 3 are free. Bring layers — it gets breezy out on the water even on warm days. Motion sickness bands recommended for little ones.',
    date: nextSun(),
    time: '9:00 AM & 1:00 PM departures',
    location: 'Dana Point Harbor, 34380 Coast Hwy',
    city: 'Dana Point',
    price: '$38 adult / $28 child',
    is_free: false,
    url: 'https://www.danapointwhalewatch.com',
    category: 'outdoor',
    tags: ['whale watching', 'ocean', 'boat', 'nature', 'dana point'],
    placeholderEmoji: '🐋',
    placeholderGradient: 'from-blue-400 to-cyan-500',
  },
  {
    id: 'evt-6',
    slug: 'bowers-museum-family-sunday',
    title: 'Bowers Museum — Free Family Sunday',
    description:
      'On the first Sunday of each month, Bowers Museum in Santa Ana opens its doors for free family admission. The permanent collection spans world cultures — Egyptian mummies, Native American art, pre-Columbian gold — plus rotating special exhibitions. Family art-making activities run 11 AM–3 PM. Stroller-accessible throughout.',
    date: nextSun(),
    time: '10:00 AM – 4:00 PM',
    location: 'Bowers Museum, 2002 N Main St',
    city: 'Santa Ana',
    price: 'Free (1st Sunday)',
    is_free: true,
    url: 'https://www.bowers.org',
    category: 'museum',
    tags: ['museum', 'art', 'free', 'culture', 'family Sunday'],
    placeholderEmoji: '🏛️',
    placeholderGradient: 'from-amber-400 to-yellow-400',
  },
  {
    id: 'evt-7',
    slug: 'crystal-cove-tide-pooling',
    title: 'Crystal Cove Tide Pooling Adventure',
    description:
      'Tide pooling at Crystal Cove is one of the best free nature experiences in Southern California. Low tide exposes a rocky reef filled with hermit crabs, sea anemones, urchins, and occasionally octopus. The park rangers run a guided tide pool tour on weekend mornings — perfect for curious kids ages 4 and up. Parking reservations are required; book ahead online.',
    date: nextSat(),
    time: 'Guided tour 8:00 AM · Self-guided all day',
    location: 'Crystal Cove State Park, 8471 N Coast Hwy',
    city: 'Newport Beach',
    price: '$15 parking / tours free',
    is_free: false,
    url: 'https://crystalcovestatepark.org',
    category: 'outdoor',
    tags: ['tide pools', 'nature', 'beach', 'science', 'newport beach'],
    placeholderEmoji: '🦀',
    placeholderGradient: 'from-teal-400 to-cyan-400',
  },
  {
    id: 'evt-8',
    slug: 'fullerton-packing-house-market',
    title: 'Fullerton Packing House Saturday Market',
    description:
      'The historic Fullerton Packing House hosts a weekly artisan market in their outdoor courtyard. Local makers, specialty food vendors, vintage finds, and live acoustic music every Saturday. The indoor food hall is open too — great brunch options while the kids explore. North OC\'s best weekend hangout spot.',
    date: nextSat(),
    time: '9:00 AM – 2:00 PM',
    location: 'Fullerton Packing House, 305 N Pomona Ave',
    city: 'Fullerton',
    price: 'Free entry',
    is_free: true,
    url: null,
    category: 'market',
    tags: ['market', 'artisan', 'food', 'fullerton', 'north OC'],
    placeholderEmoji: '🛍️',
    placeholderGradient: 'from-orange-400 to-amber-400',
  },
  {
    id: 'evt-9',
    slug: 'irvine-spectrum-kids-carousel',
    title: 'Irvine Spectrum Free Carousel & Play Area',
    description:
      'The Irvine Spectrum\'s giant Ferris wheel and carousel are a hit with little ones, and the outdoor play area is completely free. Grab coffee from one of the many cafés while the kids run around the open courtyard. On weekend mornings it\'s relatively uncrowded — by noon it fills up fast. Great for a casual half-morning outing without a lot of planning.',
    date: nextSun(),
    time: 'Open 10:00 AM (Carousel rides $3)',
    location: 'Irvine Spectrum Center, 670 Spectrum Center Dr',
    city: 'Irvine',
    price: 'Free (rides $3)',
    is_free: true,
    url: 'https://www.irvinespectrumcenter.com',
    category: 'community',
    tags: ['carousel', 'play area', 'free', 'shopping center', 'irvine'],
    placeholderEmoji: '🎡',
    placeholderGradient: 'from-red-400 to-pink-400',
  },
  {
    id: 'evt-10',
    slug: 'san-clemente-kids-surf-clinic',
    title: 'San Clemente Kids Surf Clinic',
    description:
      'T-Street in San Clemente is one of the most beginner-friendly surf breaks in Southern California. This weekend surf clinic for kids ages 5–12 covers ocean safety, paddling basics, and standing up on the board — all in the whitewash. Board and wetsuit rental included. Instructors are certified and keep groups small (6 kids max per instructor).',
    date: nextSat(),
    time: '8:00 AM – 10:00 AM',
    location: 'T-Street Beach, Avenida Victoria',
    city: 'San Clemente',
    price: '$65 / child',
    is_free: false,
    url: null,
    category: 'sports',
    tags: ['surfing', 'beach', 'sports', 'kids', 'san clemente'],
    placeholderEmoji: '🏄',
    placeholderGradient: 'from-sky-400 to-blue-500',
  },
]

export function getSeedEvent(slug: string): SeedEvent | undefined {
  return SEED_EVENTS.find(e => e.slug === slug)
}
