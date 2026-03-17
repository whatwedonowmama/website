// Seed craft projects — recipe-style format with materials + step-by-step instructions.
// Structured like a cooking recipe: time, age range, difficulty, materials list, numbered steps.

export interface CraftProject {
  id: string
  slug: string
  title: string
  excerpt: string
  age_range: string         // display label, e.g. "Ages 2–5"
  age_min: number           // for filtering
  age_max: number           // for filtering
  prep_time_minutes: number
  total_time_minutes: number
  difficulty: 'easy' | 'medium'
  materials: string[]       // like recipe ingredients
  instructions: string[]    // numbered steps
  tips: string | null
  category: 'household' | 'seasonal' | 'nature' | 'sensory'
  tags: string[]
  featured: boolean
  hero_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  published_at: string
  created_at: string
  updated_at: string
  author: string
}

export const SEED_CRAFTS: CraftProject[] = [

  // ─────────────────────────────────────────────────────────────────
  // 1. Paper Plate Sunshine
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'craft-001',
    slug: 'paper-plate-sunshine',
    title: 'Paper Plate Sunshine',
    excerpt: 'A classic first craft for little hands — paint a paper plate yellow, add paper strip rays, and make a sunshine that looks great on any fridge.',
    age_range: 'Ages 2–5',
    age_min: 2,
    age_max: 5,
    prep_time_minutes: 5,
    total_time_minutes: 30,
    difficulty: 'easy',
    materials: [
      '1 paper plate (any size)',
      'Yellow and orange paint (washable)',
      'Yellow or orange construction paper',
      'Scissors (adult)',
      'Glue stick or white glue',
      'Paintbrush',
      'Optional: googly eyes, orange marker for a face',
    ],
    instructions: [
      'Lay the paper plate face-up on a protected surface. Paint the entire front of the plate yellow. Let dry completely — about 15–20 minutes.',
      'While the plate dries, cut 10–14 strips from your construction paper, each about 1 inch wide and 4–5 inches long. These are your sun rays.',
      'Once the plate is dry, flip it over. Apply glue around the back edge and press the paper strips on evenly, pointing outward, all the way around.',
      'Let the glue set for a few minutes, then flip the plate right-side up.',
      'Optional: add two googly eyes and use a marker to draw a big smile for a sunshine face.',
      'Let everything dry fully, then hang on a window or the fridge.',
    ],
    tips: 'Use a sponge brush instead of a bristle brush for easier coverage with toddlers. If you want extra texture, let kids use their hands to paint the plate. Washable paint is a must — this one gets messy.',
    category: 'household',
    tags: ['Toddlers', 'Preschool', 'Paper Plate', 'Painting', 'Easy', 'Household Materials'],
    featured: true,
    hero_image_url: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=1200&q=80',
    meta_title: 'Paper Plate Sunshine Craft for Toddlers & Preschoolers | whatwedonowmama',
    meta_description: 'Easy paper plate sunshine craft for kids ages 2–5. All you need is a paper plate, yellow paint, and construction paper. Step-by-step instructions.',
    published_at: '2026-03-17T08:00:00Z',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    author: 'whatwedonowmama team',
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. Toilet Roll Butterfly
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'craft-002',
    slug: 'toilet-roll-butterfly',
    title: 'Toilet Roll Butterfly',
    excerpt: 'Turn an empty toilet paper roll into a colorful butterfly with tissue paper wings. A perfect way to use up those cardboard rolls — zero cost, totally cute.',
    age_range: 'Ages 3–7',
    age_min: 3,
    age_max: 7,
    prep_time_minutes: 5,
    total_time_minutes: 25,
    difficulty: 'easy',
    materials: [
      '1 empty toilet paper roll (or cut a paper towel roll in half)',
      'Acrylic or washable paint — any colors you like',
      '2 sheets of tissue paper or thin craft paper (different colors)',
      '2 pipe cleaners',
      'Googly eyes (optional)',
      'Paintbrush',
      'White glue or glue gun (adult use only for glue gun)',
      'Scissors',
    ],
    instructions: [
      'Paint the outside of the toilet roll in your chosen color. Use stripes, dots, or solid — let your child decide. Set aside to dry (about 10–15 minutes).',
      'Scrunch each sheet of tissue paper in the middle to create a bow/wing shape. These become the butterfly wings. You can use two sheets side by side for fuller wings.',
      'Once the roll is dry, apply glue to the inside center of the roll and press both wing shapes in through the roll, one from each side, so they poke out on either side.',
      'Fold one pipe cleaner in half and curl each end outward to make antennae. Tuck the folded middle into the top of the roll opening.',
      'Glue googly eyes to the front of the roll, near the top.',
      'Let everything dry fully. Your butterfly can stand on its own or be hung from string.',
    ],
    tips: 'This is a great one for using up holiday tissue paper. You can skip the googly eyes and just draw eyes with a marker. For younger toddlers, do the gluing yourself and let them focus on the painting and tissue paper scrunching.',
    category: 'household',
    tags: ['Toddlers', 'Preschool', 'Recycled Materials', 'Toilet Roll', 'Butterfly', 'Easy'],
    featured: false,
    hero_image_url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=80',
    meta_title: 'Toilet Roll Butterfly Craft for Kids | Easy Recycled Craft | whatwedonowmama',
    meta_description: 'Make a beautiful butterfly from an empty toilet roll, tissue paper, and pipe cleaners. Easy craft for kids ages 3–7, step-by-step instructions.',
    published_at: '2026-03-17T08:00:00Z',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    author: 'whatwedonowmama team',
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Leaf Print Art
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'craft-003',
    slug: 'leaf-print-art',
    title: 'Leaf Print Art',
    excerpt: 'Collect leaves from the yard or a walk, paint the backs, and press them onto paper for beautiful nature prints. Great for spring and fall — and no two prints are ever the same.',
    age_range: 'Ages 3–8',
    age_min: 3,
    age_max: 8,
    prep_time_minutes: 10,
    total_time_minutes: 30,
    difficulty: 'easy',
    materials: [
      '6–10 fresh leaves in different shapes and sizes (collected from the yard or a walk)',
      'Washable paint in 3–4 colors',
      'White cardstock or thick white paper (printer paper works too)',
      'Foam brush or paintbrush',
      'Paper plate or palette (for loading paint)',
      'Paper towels for cleanup',
      'Optional: black fine-tip marker to add outlines after printing',
    ],
    instructions: [
      'Collect leaves with your child — different shapes, sizes, and textures make the most interesting prints. Ferns, oak leaves, and maple leaves all work well. Look for leaves with pronounced veins on the back.',
      'Lay a leaf face-down (veined side up) on your paper plate. Using a foam brush, apply paint over the entire surface of the leaf. Cover it well but don\'t glob it on.',
      'Carefully pick up the painted leaf and press it paint-side-down firmly onto your paper. Press with your whole hand to get the veins and edges.',
      'Peel the leaf back slowly to reveal the print. Set the leaf aside (you can re-paint and reuse it).',
      'Repeat with different leaves and different colors, overlapping prints or spacing them out — both look great.',
      'Let dry completely. Optional: once dry, use a fine-tip marker to add small details like stems, dots, or a simple scene around the prints.',
    ],
    tips: 'Fresh leaves print much better than dry ones. For the most detailed prints, look for leaves where the veins on the back are raised and prominent. This activity pairs nicely with a walk to collect the leaves first — the whole outing becomes part of the craft.',
    category: 'nature',
    tags: ['Nature', 'Preschool', 'Elementary', 'Painting', 'Seasonal', 'Outdoor Prep'],
    featured: true,
    hero_image_url: 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=80',
    meta_title: 'Leaf Print Art for Kids | Nature Craft Ages 3–8 | whatwedonowmama',
    meta_description: 'Collect leaves on a walk and create beautiful nature print art. Easy leaf printing craft for kids ages 3–8 — all you need is paint, paper, and leaves from the yard.',
    published_at: '2026-03-17T08:00:00Z',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    author: 'whatwedonowmama team',
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Salt Dough Handprint Keepsake
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'craft-004',
    slug: 'salt-dough-handprint',
    title: 'Salt Dough Handprint Keepsake',
    excerpt: 'Three pantry ingredients, 20 minutes of oven time, and a handprint your family will keep forever. The recipe is foolproof — and kids love the squishing.',
    age_range: 'Ages 2–6',
    age_min: 2,
    age_max: 6,
    prep_time_minutes: 10,
    total_time_minutes: 180,
    difficulty: 'easy',
    materials: [
      '2 cups all-purpose flour',
      '1 cup salt (table salt)',
      '¾ cup water (add slowly — you may not need it all)',
      'Rolling pin (or a sturdy cup)',
      'Cookie cutter or sharp knife (adult use)',
      'Straw or pencil (for making a hanging hole)',
      'Oven',
      'Optional: acrylic paint + clear sealant spray for finishing',
      'Optional: permanent marker or paint pens for writing name and date',
    ],
    instructions: [
      'Preheat your oven to 250°F (120°C). Mix flour and salt together in a large bowl.',
      'Add water a little at a time, stirring until the dough comes together into a smooth, firm ball. It should feel like play dough — not sticky, not crumbly. Add a tiny bit more water or flour to adjust.',
      'On a lightly floured surface, roll the dough out to about ½ inch thick.',
      'Press your child\'s hand firmly into the center of the dough. Hold it steady and press evenly — you want all five fingers to leave a clear impression.',
      'Use a cookie cutter (heart, circle, or any shape) around the handprint, or cut a shape freehand with a knife. Leave at least ½ inch of dough border around the print.',
      'Use a straw to poke a hole near the top — you\'ll use this to hang it later.',
      'Transfer to a parchment-lined baking sheet. Bake at 250°F for 2–3 hours, until completely hard and dry. The low temperature prevents cracking.',
      'Let cool fully (at least 30 minutes). Then paint, if desired — acrylic paint works best. Once the paint is dry, spray with a clear sealant to protect it.',
      'Thread ribbon or twine through the hole to hang.',
    ],
    tips: 'The #1 mistake is rushing the bake — low and slow prevents cracking. If you see cracks forming, the oven is too hot. You can also air-dry (48–72 hours) instead of baking. Write the child\'s name and age on the back before baking with a toothpick.',
    category: 'sensory',
    tags: ['Toddlers', 'Keepsake', 'Sensory', 'Household Materials', 'Gift', 'Easy'],
    featured: false,
    hero_image_url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=80',
    meta_title: 'Salt Dough Handprint Recipe for Kids | Keepsake Craft | whatwedonowmama',
    meta_description: 'Make a lasting handprint keepsake with just flour, salt, and water. Foolproof salt dough recipe for kids ages 2–6 — step-by-step instructions and tips.',
    published_at: '2026-03-17T08:00:00Z',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    author: 'whatwedonowmama team',
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. Egg Carton Caterpillar
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'craft-005',
    slug: 'egg-carton-caterpillar',
    title: 'Egg Carton Caterpillar',
    excerpt: 'An egg carton, some paint, and a couple of pipe cleaners are all you need to make an adorable caterpillar. A great way to teach color mixing and reuse something that would otherwise be recycled.',
    age_range: 'Ages 3–7',
    age_min: 3,
    age_max: 7,
    prep_time_minutes: 5,
    total_time_minutes: 35,
    difficulty: 'easy',
    materials: [
      '1 cardboard egg carton (12-cup)',
      'Washable or acrylic paint in bright colors',
      '2 pipe cleaners (for antennae)',
      '12 googly eyes (or draw them with a marker)',
      'White glue',
      'Paintbrushes',
      'Scissors (adult)',
      'Optional: small pom-poms, foam stickers for decoration',
    ],
    instructions: [
      'Cut the egg carton in half lengthwise so you have two rows of 6 cups each. Set one aside. The row of 6 cups is your caterpillar body.',
      'Paint each cup a different bright color — red, orange, yellow, green, blue, purple. Let kids go wild with the color choices. Set aside to dry (15–20 minutes).',
      'Once dry, glue two googly eyes on the front cup (the head). If you don\'t have googly eyes, cut two small circles from white paper and add black dots with a marker.',
      'For antennae: fold a pipe cleaner in half so you have two equal lengths. Push or poke the middle through a small hole you make in the top of the head cup. Curl the ends outward to make little loops.',
      'Optional: glue on pom-poms, foam stickers, or stripes to each body segment.',
      'Let everything dry completely. Your caterpillar can sit on a shelf, a windowsill, or become a puppet with a stick taped underneath.',
    ],
    tips: 'This is a great recycling lesson — mention to kids that you\'re turning something that would be thrown away into art. If you have extra egg cartons, make multiple caterpillars and connect them for a super-long version. Works great as a classroom or rainy-day activity.',
    category: 'household',
    tags: ['Preschool', 'Elementary', 'Recycled Materials', 'Egg Carton', 'Bugs', 'Easy'],
    featured: false,
    hero_image_url: 'https://images.unsplash.com/photo-1560421683-6856ea585c78?auto=format&fit=crop&w=1200&q=80',
    meta_title: 'Egg Carton Caterpillar Craft for Kids | Easy Recycled Craft | whatwedonowmama',
    meta_description: 'Turn an egg carton into an adorable caterpillar with paint and pipe cleaners. Easy kids craft for ages 3–7 using recycled household materials.',
    published_at: '2026-03-17T08:00:00Z',
    created_at: '2026-03-17T08:00:00Z',
    updated_at: '2026-03-17T08:00:00Z',
    author: 'whatwedonowmama team',
  },

]

/** Look up a craft by slug */
export function getSeedCraft(slug: string): CraftProject | undefined {
  return SEED_CRAFTS.find(c => c.slug === slug)
}

/** Format minutes as a readable string: 30 → "30 min", 180 → "3 hr" */
export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`
}
