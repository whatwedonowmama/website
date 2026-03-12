export type MarketDay =
  | 'Sunday'
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'

export interface FarmersMarket {
  slug: string
  name: string
  city: string
  location: string
  address?: string
  day: MarketDay
  startTime: string
  endTime: string
  description: string
  longDescription?: string
  image?: string         // absolute URL
  affiliate?: string
  notes?: string         // e.g. "Seasonal", "Closed for season"
  website?: string
  tags?: string[]
}

// Image base URLs from source site
const IMG  = 'https://www.orangecounty.net/images/information/'
const IMG2 = 'https://www.orangecounty.net/images2/'

export const FARMERS_MARKETS: FarmersMarket[] = [

  // ── SUNDAY ────────────────────────────────────────────────────────────────

  {
    slug:            'garden-grove-farmers-market',
    name:            'Garden Grove Farmers Market',
    city:            'Garden Grove',
    location:        'Historic Main Street',
    address:         'Main St. & Garden Grove Blvd., Garden Grove, CA',
    day:             'Sunday',
    startTime:       '10:00 AM',
    endTime:         '2:00 PM',
    description:     'Farm-fresh certified California-grown fruits and vegetables, along with a variety of gourmet specialty foods on Historic Main Street.',
    longDescription: 'The Garden Grove Farmers Market takes place every Sunday on Historic Main Street. Browse certified California-grown produce, gourmet specialty foods, artisan products, and local vendors in a charming small-town setting. Perfect for families exploring Old Town Garden Grove.',
    image:           `${IMG}GGMarket.jpg`,
    tags:            ['produce', 'specialty foods', 'historic district'],
  },

  {
    slug:            'irvine-great-park-farmers-market',
    name:            'Irvine Great Park Farmers Market',
    city:            'Irvine',
    location:        'The Great Park',
    address:         'Marine Way off Sand Canyon, Irvine, CA',
    day:             'Sunday',
    startTime:       '10:00 AM',
    endTime:         '2:00 PM',
    description:     'Locally grown produce, artisan products, live music, and food trucks at the iconic Irvine Great Park.',
    longDescription: 'Set against the backdrop of the historic Irvine Great Park, this Sunday market features locally grown produce, artisan products, live music, and food trucks. The open-air setting is ideal for families, with the iconic orange balloon and wide green spaces to explore after shopping. Weather permitting.',
    image:           `${IMG}greatparkmarket.jpg`,
    notes:           'Weather permitting',
    tags:            ['live music', 'food trucks', 'artisan', 'outdoor'],
  },

  {
    slug:            'ladera-ranch-farm-craft-market',
    name:            'Ladera Ranch Farm & Craft Market',
    city:            'Ladera Ranch',
    location:        'Founders Park & Avendale Clubhouse',
    address:         '28275 Avendale, Ladera Ranch, CA',
    day:             'Sunday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round market with farm-fresh eggs, seasonal produce, artisan breads, organic options, and local crafters.',
    longDescription: 'The Ladera Ranch Farm & Craft Market is a beloved year-round Sunday destination. Shop farm-fresh eggs, seasonal produce, artisan breads, organic options, and a rotating selection of local crafters. The market is family-friendly and set in the scenic Founders Park area of Ladera Ranch.',
    image:           `${IMG2}farmandcraftmarketLR.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'organic', 'artisan', 'craft'],
  },

  {
    slug:            'laguna-niguel-farmers-market',
    name:            'Laguna Niguel Certified Farmers Market',
    city:            'Laguna Niguel',
    location:        'Plaza de Paz Shopping Center',
    address:         '27271 La Paz Rd, Laguna Niguel, CA',
    day:             'Sunday',
    startTime:       '8:00 AM',
    endTime:         '12:00 PM',
    description:     'A genuine certified farmers market affiliated with the Orange County Farm Bureau — farmers sell their produce directly to you, rain or shine.',
    longDescription: 'The Laguna Niguel Certified Farmers Market is open every Sunday, rain or shine, at the Plaza de Paz Shopping Center. Affiliated with the Orange County Farm Bureau, this is a genuine certified farmers market where farmers sell their produce directly to shoppers — no resellers allowed.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'rain or shine', 'direct from farmer'],
  },

  {
    slug:            'newport-beach-pier-farmers-market',
    name:            'Newport Beach Pier Farmers Market',
    city:            'Newport Beach',
    location:        'Newport Beach Pier',
    address:         'Newport Beach Pier, Newport Beach, CA',
    day:             'Sunday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Exotic fruits, seasonal vegetables, eggs, honey, nuts, and specialty foods with a stunning ocean backdrop at the Newport Beach Pier.',
    longDescription: 'Every Sunday at the Newport Beach Pier, this charming farmers market offers a selection of exotic fruits, seasonal vegetables, fresh eggs, local honey, nuts, and specialty foods — all with the Pacific Ocean as your backdrop. A perfect family morning combining fresh shopping and a seaside stroll.',
    image:           `${IMG}NBmarket.jpg`,
    tags:            ['ocean view', 'specialty foods', 'honey', 'nuts'],
  },

  {
    slug:            'san-clemente-farmers-market',
    name:            'San Clemente Certified Farmers Market',
    city:            'San Clemente',
    location:        '200 Block Avenida Del Mar',
    address:         '200 Avenida Del Mar, San Clemente, CA',
    day:             'Sunday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Rain-or-shine certified farmers market on charming Avenida Del Mar in downtown San Clemente, affiliated with the California Federation of Certified Farmers Markets.',
    longDescription: 'The San Clemente Certified Farmers Market is a Sunday staple on the iconic Avenida Del Mar — the heart of downtown San Clemente. Affiliated with the California Federation of Certified Farmers Markets, this market runs rain or shine and offers fresh produce, artisan goods, and a relaxed coastal atmosphere that pairs perfectly with San Clemente\'s beach-town vibe.',
    image:           `${IMG}CFMarketLogo.jpg`,
    affiliate:       'California Federation of Certified Farmers Markets',
    tags:            ['certified', 'coastal', 'rain or shine', 'downtown'],
  },

  {
    slug:            'tustin-farm-craft-market-sunday',
    name:            'Tustin Farm & Craft Market',
    city:            'Tustin',
    location:        '2411 Park Avenue',
    address:         '2411 Park Avenue, Tustin, CA',
    day:             'Sunday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round Sunday market with farm-fresh eggs, seasonal produce, artisan breads, and local crafters.',
    longDescription: 'The Tustin Farm & Craft Market at Park Avenue is a year-round Sunday market offering farm-fresh eggs, seasonal produce, artisan breads, organic options, and a variety of local crafters. A great weekly ritual for Tustin families looking for fresh, locally sourced goods.',
    image:           `${IMG2}farmandcraftmarketTUSTIN.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'artisan', 'organic', 'craft'],
  },

  // ── TUESDAY ───────────────────────────────────────────────────────────────

  {
    slug:            'huntington-beach-surf-city-nights',
    name:            'Huntington Beach Surf City Nights',
    city:            'Huntington Beach',
    location:        'Main Street, Downtown Huntington Beach',
    address:         'Main Street, Huntington Beach, CA',
    day:             'Tuesday',
    startTime:       '5:00 PM',
    endTime:         '9:00 PM',
    description:     "Orange County's largest weekly street fair and certified farmers market with 90 vendors, live music, handcrafted items, and street performers.",
    longDescription: "Surf City Nights is Orange County's largest weekly street fair and certified farmers market, running every Tuesday evening on Main Street in downtown Huntington Beach. With over 90 vendors, the market features handcrafted items, live music, street performers, and a full farmers market section with fresh produce. The evening timing makes it a perfect after-work family outing.",
    image:           `${IMG2}HB-surfcitynights.jpg`,
    tags:            ['evening', 'street fair', 'live music', 'largest in OC', 'entertainment'],
  },

  {
    slug:            'orange-irvine-regional-park-farmers-market',
    name:            'Irvine Regional Park Farmers Market',
    city:            'Orange',
    location:        'Irvine Regional Park',
    address:         '1 Irvine Park Road, Orange, CA',
    day:             'Tuesday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Orange County Farm Bureau certified farmers market held inside the beautiful Irvine Regional Park, rain or shine.',
    longDescription: 'The Irvine Regional Park Farmers Market is a certified market affiliated with the Orange County Farm Bureau, held every Tuesday inside the scenic Irvine Regional Park in the city of Orange. Shop for fresh produce from local farmers in a beautiful natural setting — the park\'s trails, historic carousel, and petting zoo make it an easy family outing after your market run.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'park setting', 'family', 'rain or shine'],
  },

  {
    slug:            'placentia-farmers-market',
    name:            'Placentia Farmers Market',
    city:            'Placentia',
    location:        'Placentia Town Center',
    address:         '130 E Yorba Linda Blvd., Placentia, CA',
    day:             'Tuesday',
    startTime:       '3:00 PM',
    endTime:         '7:00 PM',
    description:     'Approximately 30 vendors at Placentia Town Center every Tuesday afternoon. Free shuttle service available.',
    longDescription: 'The Placentia Farmers Market runs every Tuesday afternoon at the Placentia Town Center. With approximately 30 vendors, shoppers can find fresh produce, specialty foods, and artisan goods. A free shuttle service is available, making it easy to get to the market from around the area.',
    image:           `${IMG}placentiamarket.jpg`,
    tags:            ['afternoon', 'free shuttle', 'local vendors'],
  },

  {
    slug:            'seal-beach-farmers-market',
    name:            'Seal Beach Farmers Market',
    city:            'Seal Beach',
    location:        'Seal Beach Village',
    address:         '13904 Seal Beach Blvd., Seal Beach, CA',
    day:             'Tuesday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'A neighborhood farmers market with around 15 vendors in Seal Beach Village, open since 2010.',
    longDescription: 'The Seal Beach Farmers Market opened in 2010 and has been a neighborhood staple ever since. Located at Seal Beach Village, the market features approximately 15 vendors selling fresh produce and specialty goods. Its intimate size makes for a friendly, community-oriented shopping experience every Tuesday morning.',
    tags:            ['small market', 'neighborhood', 'community'],
  },

  // ── WEDNESDAY ─────────────────────────────────────────────────────────────

  {
    slug:            'dana-point-farm-craft-market-wednesday',
    name:            'Dana Point Farm & Craft Market',
    city:            'Dana Point',
    location:        '34555 Golden Lantern St.',
    address:         '34555 Golden Lantern St., Dana Point, CA',
    day:             'Wednesday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round farm-to-table Wednesday market with produce, artisan breads, organic options, and local crafters in Dana Point.',
    longDescription: 'The Dana Point Farm & Craft Market brings a year-round farm-to-table experience to Golden Lantern Street every Wednesday. Shop seasonal produce, artisan breads, organic options, and local crafters in one of Orange County\'s most scenic coastal cities. A great midweek tradition for Dana Point families and visitors alike.',
    image:           `${IMG2}farmandcraftmarketDP.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'coastal', 'organic', 'artisan'],
  },

  {
    slug:            'fullerton-farmers-market-wednesday',
    name:            'Fullerton Certified Farmers Market',
    city:            'Fullerton',
    location:        'Independence Park',
    address:         '801 W. Valencia Dr., Fullerton, CA',
    day:             'Wednesday',
    startTime:       '8:30 AM',
    endTime:         '12:30 PM',
    description:     "Believed to be the oldest farmers market in Orange County, renowned for the freshness of its produce. A true OC institution.",
    longDescription: 'The Fullerton Certified Farmers Market at Independence Park holds the distinction of being believed to be the oldest farmers market in Orange County. Renowned for the exceptional freshness of its produce, this Wednesday morning market is a true OC institution. Early birds are rewarded with the best selection of seasonal fruits, vegetables, and farm-direct goods.',
    image:           `${IMG}fullertonfarmers.jpg`,
    tags:            ['oldest in OC', 'certified', 'historic', 'produce'],
  },

  {
    slug:            'irvine-kaiser-farmers-market',
    name:            'Irvine Kaiser Permanente Farmers Market',
    city:            'Irvine',
    location:        'Kaiser Permanente Medical Offices',
    address:         '6640 Alton Parkway, Irvine, CA',
    day:             'Wednesday',
    startTime:       '9:00 AM',
    endTime:         '2:00 PM',
    description:     'Certified farmers market in front of the Kaiser Permanente Medical Office Building in Irvine, affiliated with the California Federation of Certified Farmers Markets.',
    longDescription: 'The Irvine Kaiser Permanente Farmers Market operates every Wednesday in front of the Kaiser Permanente Medical Office Building. Affiliated with the California Federation of Certified Farmers Markets, this convenient midweek market offers fresh produce and certified goods to Irvine residents and the surrounding business community.',
    image:           `${IMG}kaisermarkets.jpg`,
    affiliate:       'California Federation of Certified Farmers Markets',
    tags:            ['certified', 'convenient', 'midweek'],
  },

  {
    slug:            'tustin-farmers-market-wednesday',
    name:            'Tustin Certified Farmers Market',
    city:            'Tustin',
    location:        'Corner of El Camino Real & 3rd Street',
    address:         'El Camino Real & 3rd Street, Tustin, CA',
    day:             'Wednesday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Orange County Farm Bureau certified farmers market at the heart of Old Town Tustin, rain or shine.',
    longDescription: 'The Tustin Certified Farmers Market takes place every Wednesday at the corner of El Camino Real and 3rd Street in historic Old Town Tustin. Affiliated with the Orange County Farm Bureau, this certified market offers fresh produce directly from local farmers. It runs rain or shine, making it a reliable weekly tradition for Tustin families.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'old town', 'rain or shine', 'historic district'],
  },

  // ── THURSDAY ──────────────────────────────────────────────────────────────

  {
    slug:            'anaheim-center-st-farmers-market',
    name:            'Anaheim Center Street Farmers Market',
    city:            'Anaheim',
    location:        'Center St. Promenade & Lemon St.',
    address:         'Center St. Promenade & Lemon St., Anaheim, CA',
    day:             'Thursday',
    startTime:       '11:00 AM',
    endTime:         '3:00 PM',
    description:     'Local California certified farmers, international foods, a craft fair, and the Homegrown Music series every Thursday in downtown Anaheim.',
    longDescription: 'The Anaheim Center Street Farmers Market brings downtown Anaheim to life every Thursday midday. Shop local California certified farmers alongside international food vendors, a craft fair, and live performances as part of the Homegrown Music series. Located at the Center Street Promenade, it\'s a vibrant midweek market experience with a strong community feel.',
    image:           `${IMG}anaheimmarket.jpg`,
    tags:            ['live music', 'international food', 'craft fair', 'downtown'],
  },

  {
    slug:            'brea-farmers-market',
    name:            'Brea Certified Farmers Market',
    city:            'Brea',
    location:        'Brea Place Parking Lot',
    address:         '135 S. State College Blvd., Brea, CA',
    day:             'Thursday',
    startTime:       '3:00 PM',
    endTime:         '7:00 PM',
    description:     'Thursday afternoon market presented by the Orange County Farm Bureau with fresh produce, flowers, and breads.',
    longDescription: 'The Brea Certified Farmers Market operates every Thursday afternoon in the Brea Place parking lot on State College Boulevard. Presented by the Orange County Farm Bureau, the market features fresh produce, flowers, artisan breads, and seasonal goods — perfect for grabbing fresh ingredients for a Thursday dinner.',
    image:           `${IMG}CFMarketLogo.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['afternoon', 'certified', 'produce', 'flowers'],
  },

  {
    slug:            'costa-mesa-fairgrounds-farmers-market',
    name:            'Costa Mesa Certified Farmers Market',
    city:            'Costa Mesa',
    location:        'OC Fairgrounds',
    address:         '88 Fair Drive, Costa Mesa, CA',
    day:             'Thursday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Orange County Farm Bureau certified farmers market at the iconic OC Fairgrounds, rain or shine.',
    longDescription: 'The Costa Mesa Certified Farmers Market is held every Thursday at the famous OC Fairgrounds. Affiliated with the Orange County Farm Bureau, this certified market offers fresh produce directly from local farmers. The fairgrounds location provides ample parking, and the market runs rain or shine, making it one of the most reliable weekly markets in south OC.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'fairgrounds', 'rain or shine', 'parking'],
  },

  {
    slug:            'fullerton-downtown-farmers-market',
    name:            'Fullerton Downtown Farmers Market',
    city:            'Fullerton',
    location:        'Downtown Plaza',
    address:         'Wilshire & Pomona Ave., Fullerton, CA',
    day:             'Thursday',
    startTime:       '4:30 PM',
    endTime:         '8:30 PM',
    description:     'Seasonal evening market in downtown Fullerton (April–August) with prepared food, arts & crafts, jewelry, live entertainment, and free parking.',
    longDescription: 'The Fullerton Downtown Farmers Market is an evening market that runs Thursday nights from April through August in the Downtown Plaza. With prepared food vendors, arts and crafts, jewelry, and live entertainment, it\'s as much a community event as a shopping destination. Free parking makes it an easy and fun choice for families on Thursday evenings.',
    image:           `${IMG}fullertonmarket.jpg`,
    notes:           'Seasonal — April through August only',
    tags:            ['seasonal', 'evening', 'live entertainment', 'free parking', 'arts & crafts'],
  },

  // ── FRIDAY ────────────────────────────────────────────────────────────────

  {
    slug:            'anaheim-kaiser-farmers-market',
    name:            'Anaheim Kaiser Permanente Farmers Market',
    city:            'Anaheim',
    location:        '3440 E. La Palma Ave',
    address:         '3440 E. La Palma Ave (across from parking structure), Anaheim, CA',
    day:             'Friday',
    startTime:       '9:00 AM',
    endTime:         '2:00 PM',
    description:     'Certified farmers market affiliated with the Southland Farmers Market Association, held every Friday at the Anaheim Kaiser Permanente campus.',
    longDescription: 'The Anaheim Kaiser Permanente Farmers Market runs every Friday across from the Kaiser parking structure on La Palma Avenue. Affiliated with the Southland Farmers Market Association, this convenient Friday market serves the surrounding Anaheim community with fresh, certified produce and specialty goods.',
    image:           `${IMG}kaisermarkets.jpg`,
    affiliate:       "Southland Farmers' Market Association",
    tags:            ['certified', 'convenient', 'TGIF market'],
  },

  {
    slug:            'laguna-hills-farmers-market',
    name:            'Laguna Hills Certified Farmers Market',
    city:            'Laguna Hills',
    location:        'Laguna Hills Mall Parking Lot',
    address:         'Laguna Hills Mall, 5 Freeway & El Toro Road, Laguna Hills, CA',
    day:             'Friday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Orange County Farm Bureau certified market at the Laguna Hills Mall, rain or shine every Friday morning.',
    longDescription: 'The Laguna Hills Certified Farmers Market is conveniently located in the Laguna Hills Mall parking lot at the 5 Freeway and El Toro Road intersection. Affiliated with the Orange County Farm Bureau, this certified market runs every Friday morning, rain or shine, making it a dependable spot for south OC families to pick up fresh produce at the end of the week.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'rain or shine', 'convenient parking', 'mall location'],
  },

  {
    slug:            'san-juan-capistrano-farmakis-farms',
    name:            'Farmakis Farms Certified Farmers Market',
    city:            'San Juan Capistrano',
    location:        'Farmakis Farms',
    address:         '29932 Camino Capistrano, San Juan Capistrano, CA',
    day:             'Friday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'A family-owned Christmas tree farm and certified farmers market with local produce, artisan breads, and specialty items in San Juan Capistrano.',
    longDescription: 'Farmakis Farms is a family-owned certified farmers market and Christmas tree farm in San Juan Capistrano. Every Friday, the farm opens its certified market featuring produce from local farmers, artisan breads, and specialty products. The farm setting makes for a uniquely charming shopping experience — especially during the holiday season.',
    image:           `${IMG}farmakis.jpg`,
    tags:            ['family farm', 'certified', 'artisan', 'unique setting'],
  },

  // ── SATURDAY ──────────────────────────────────────────────────────────────

  {
    slug:            'buena-park-farmers-market',
    name:            'Buena Park Farmers Market',
    city:            'Buena Park',
    location:        'Corner of La Palma & Stanton',
    address:         'La Palma & Stanton (Sears Parking Lot), Buena Park, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '2:00 PM',
    description:     'Fresh fruits & vegetables, free-range eggs, raw honey, baked goods, and hot prepared foods every Saturday in Buena Park.',
    longDescription: 'The Buena Park Farmers Market sets up every Saturday in the Sears parking lot at the corner of La Palma and Stanton. Shop farm-fresh fruits and vegetables, free-range eggs, raw honey, freshly baked goods, and hot prepared food options. A great Saturday morning stop for north OC families.',
    image:           `${IMG}BPMarket.jpg`,
    tags:            ['produce', 'eggs', 'honey', 'hot food', 'baked goods'],
  },

  {
    slug:            'corona-del-mar-farm-craft-market',
    name:            'Corona del Mar Farm & Craft Market',
    city:            'Corona del Mar',
    location:        '3201 E. Pacific Coast Hwy',
    address:         '3201 E. Pacific Coast Hwy, Corona del Mar, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round farm-to-table Saturday market with seasonal produce, artisan breads, and local crafters on Pacific Coast Highway.',
    longDescription: 'The Corona del Mar Farm & Craft Market brings a year-round farm-to-table experience to Pacific Coast Highway every Saturday. Shop seasonal produce, artisan breads, organic options, and local crafters — all in one of Orange County\'s most beautiful coastal communities. Pair your market visit with a stroll through the charming village of Corona del Mar.',
    image:           `${IMG2}farmandcraftmarketCDM.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'coastal', 'artisan', 'craft', 'PCH'],
  },

  {
    slug:            'corona-del-mar-certified-farmers-market',
    name:            'Corona del Mar Certified Farmers Market',
    city:            'Corona del Mar',
    location:        'Marguerite & Pacific Coast Hwy',
    address:         '3201 Pacific Coast Hwy, Corona del Mar, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Open since 1996, this market features prepared foods, local honey, fresh fish, flowers, and produce from premier OC growers.',
    longDescription: 'One of Orange County\'s most established markets, the Corona del Mar Certified Farmers Market has been running since 1996. Located at Marguerite and Pacific Coast Highway, it features prepared foods, local honey, fresh fish, flowers, and produce from premier local growers. A Saturday tradition for Newport Beach and Corona del Mar residents.',
    image:           `${IMG}CFMarketLogo.jpg`,
    affiliate:       'California Federation of Certified Farmers Markets',
    tags:            ['established 1996', 'fresh fish', 'flowers', 'honey', 'PCH'],
  },

  {
    slug:            'costa-mesa-soco-farmers-market',
    name:            'Costa Mesa SoCo Farmers Market',
    city:            'Costa Mesa',
    location:        'SoCo Collection',
    address:         '3315 Hyland Ave, Costa Mesa, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '2:00 PM',
    description:     'Fruits, vegetables, specialty foods, and ready-to-eat items at SoCo Collection. CalFresh and EBT accepted. Free parking.',
    longDescription: 'The Costa Mesa SoCo Farmers Market is held every Saturday at the SoCo Collection shopping center. Browse fruits, vegetables, specialty foods, and ready-to-eat items from a diverse selection of vendors. CalFresh and EBT are accepted, and free parking is available — making this one of the most accessible farmers markets in Orange County.',
    image:           `${IMG}socomarket.jpg`,
    tags:            ['EBT accepted', 'free parking', 'specialty foods', 'ready-to-eat'],
  },

  {
    slug:            'cypress-farmers-market',
    name:            'Cypress Farmers Market',
    city:            'Cypress',
    location:        'Cottonwood Church Parking Lot',
    address:         '4505 Katella Ave, Cypress, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '2:00 PM',
    description:     'Fresh produce, prepared foods including tamales and BBQ, and artisanal vendors every Saturday at Cottonwood Church in Cypress.',
    longDescription: 'The Cypress Farmers Market operates every Saturday in the Cottonwood Church parking lot on Katella Avenue. Shoppers can find fresh produce alongside a great selection of prepared foods — including tamales and BBQ — plus artisanal vendors. It\'s a flavorful Saturday morning destination for families in north Orange County.',
    image:           `${IMG}cypressmarket.jpg`,
    tags:            ['tamales', 'BBQ', 'artisan', 'prepared food'],
  },

  {
    slug:            'dana-point-farmers-market-saturday',
    name:            'Dana Point Saturday Farmers Market',
    city:            'Dana Point',
    location:        'La Plaza Park',
    address:         'Pacific Coast Hwy & Golden Lantern, Dana Point, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Produce, flowers, breads, fresh fish, arts & crafts, and specialty items at La Plaza Park overlooking the Dana Point Harbor area.',
    longDescription: 'The Dana Point Saturday Farmers Market at La Plaza Park offers a scenic shopping experience near the harbor. Browse produce, flowers, artisan breads, fresh fish, arts & crafts, and specialty items. The park setting with views toward the Dana Point Harbor makes this one of the more picturesque farmers markets in Orange County.',
    image:           `${IMG}CFMarketLogo.jpg`,
    affiliate:       'California Federation of Certified Farmers Markets',
    tags:            ['coastal', 'fresh fish', 'flowers', 'arts & crafts', 'harbor views'],
  },

  {
    slug:            'irvine-mariners-farmers-market',
    name:            'Irvine Certified Farmers Market',
    city:            'Irvine',
    location:        "Mariners Church Parking Lot",
    address:         '5001 Newport Coast Dr, Irvine, CA',
    day:             'Saturday',
    startTime:       '8:00 AM',
    endTime:         '12:00 PM',
    description:     'Orange County Farm Bureau certified Saturday market at Mariners Church — an early morning Irvine tradition, rain or shine.',
    longDescription: 'The Irvine Certified Farmers Market at Mariners Church is an early-morning Saturday tradition for Irvine families. Affiliated with the Orange County Farm Bureau, this certified market runs rain or shine and offers fresh produce directly from local farmers. Get there early for the best selection before noon.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'early morning', 'rain or shine', 'direct from farmer'],
  },

  {
    slug:            'laguna-beach-farmers-market',
    name:            'Laguna Beach Certified Farmers Market',
    city:            'Laguna Beach',
    location:        '521 Forest Ave',
    address:         '521 Forest Ave (across from Lumberyard Shopping Center), Laguna Beach, CA',
    day:             'Saturday',
    startTime:       '8:00 AM',
    endTime:         '12:00 PM',
    description:     'Orange County Farm Bureau certified market in the heart of Laguna Beach, steps from the art galleries and boutiques of Forest Avenue.',
    longDescription: 'The Laguna Beach Certified Farmers Market is a beloved Saturday morning institution. Located across from the Lumberyard Shopping Center on Forest Avenue, this Orange County Farm Bureau affiliated market puts you in the heart of one of California\'s most celebrated art towns. Shop fresh produce, then explore Laguna Beach\'s galleries and shops.',
    image:           `${IMG}ocfarmbureau.jpg`,
    affiliate:       'Orange County Farm Bureau',
    tags:            ['certified', 'art district', 'coastal', 'village'],
  },

  {
    slug:            'mission-viejo-farm-craft-market',
    name:            'Mission Viejo Farm & Craft Market',
    city:            'Mission Viejo',
    location:        '25282 Marguerite Pkwy',
    address:         '25282 Marguerite Pkwy, Mission Viejo, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round farm-to-table Saturday market with seasonal produce, organic options, and local crafters in Mission Viejo.',
    longDescription: 'The Mission Viejo Farm & Craft Market is a year-round Saturday market on Marguerite Parkway. Shop seasonal produce, organic options, artisan breads, and local crafters in a convenient, family-friendly setting. A reliable weekly stop for south OC families seeking fresh, locally sourced products.',
    image:           `${IMG2}farmandcraftmarketMV.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'organic', 'artisan', 'craft'],
  },

  {
    slug:            'orange-home-grown-farmers-market',
    name:            'Orange Home Grown Farmers & Artisans Market',
    city:            'Orange',
    location:        'Old Towne Orange',
    address:         '303 W. Palm Avenue (Cypress & Palm), Orange, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     "Started in 2011 in historic Old Towne Orange. Features grass-fed beef, poultry, seafood, artisan vendors, and live music — rain or shine.",
    longDescription: 'The Orange Home Grown Farmers & Artisans Market has been a Saturday staple in historic Old Towne Orange since 2011. Located at the corner of Cypress and Palm, the market boasts a large selection including grass-fed beef, poultry, seafood, and a thriving community of artisan vendors. Live music adds to the atmosphere. It\'s a rain-or-shine market that has become one of the most beloved in Orange County.',
    image:           `${IMG2}orangefarmersmarket-s.jpg`,
    tags:            ['established 2011', 'grass-fed beef', 'seafood', 'live music', 'old town', 'artisan'],
  },

  {
    slug:            'yorba-linda-farm-craft-market',
    name:            'Yorba Linda Farm & Craft Market',
    city:            'Yorba Linda',
    location:        'Yorba Linda Friends Church',
    address:         '5091 Mountain View Ave, Yorba Linda, CA',
    day:             'Saturday',
    startTime:       '9:00 AM',
    endTime:         '1:00 PM',
    description:     'Year-round farm-to-table Saturday market with seasonal produce, organic options, and local crafters in Yorba Linda.',
    longDescription: 'The Yorba Linda Farm & Craft Market at the Friends Church parking lot is a year-round Saturday market serving the Yorba Linda community. Shop seasonal produce, organic options, artisan breads, and local crafters. A welcoming, family-friendly market in the rolling hills of north Orange County.',
    image:           `${IMG2}farmandcraftmarketYL.jpg`,
    affiliate:       'Farm and Craft Market',
    tags:            ['year-round', 'organic', 'artisan', 'craft'],
  },
]

// ── Helper utilities ──────────────────────────────────────────────────────────

export const DAYS_ORDER: MarketDay[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

export function getMarketBySlug(slug: string): FarmersMarket | undefined {
  return FARMERS_MARKETS.find(m => m.slug === slug)
}

export function getMarketsByDay(day: MarketDay): FarmersMarket[] {
  return FARMERS_MARKETS.filter(m => m.day === day)
}

export function getMarketsByCity(city: string): FarmersMarket[] {
  return FARMERS_MARKETS.filter(m => m.city.toLowerCase() === city.toLowerCase())
}

export function getAllCities(): string[] {
  return [...new Set(FARMERS_MARKETS.map(m => m.city))].sort()
}

export function getAllActiveDays(): MarketDay[] {
  const used = new Set(FARMERS_MARKETS.map(m => m.day))
  return DAYS_ORDER.filter(d => used.has(d))
}
