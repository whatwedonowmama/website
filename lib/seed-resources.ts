// Seed articles — used as fallback when Supabase has no data.
// These also serve as the live content until articles are migrated to Supabase.
// To show these on the live site, they are rendered directly from this file
// in both /resources and /resources/[slug] when Supabase returns an empty result.

export interface SeedResource {
  id: string
  slug: string
  title: string
  excerpt: string
  body: string       // HTML content
  category: string
  access_level: 'free' | 'plus'
  status: 'published'
  featured: boolean
  read_time_minutes: number
  hero_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  published_at: string
  created_at: string
  updated_at: string
  tags: string[]
  author: string
}

export const SEED_RESOURCES: SeedResource[] = [
  // ─────────────────────────────────────────────────────────────────
  // 0. Summer Camps Orange County 2026
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-0',
    slug: 'summer-camps-orange-county-2026',
    title: 'The 2026 Guide to Summer Camps in Orange County',
    excerpt:
      'Good camps fill up fast — waitlists-in-April fast. We\'ve rounded up the best OC summer camps across sports, arts, STEM, and outdoor programs so you can stop Googling and start registering.',
    category: 'oc-guides',
    access_level: 'free',
    status: 'published',
    featured: true,
    read_time_minutes: 8,
    hero_image_url: null,
    meta_title: 'Best Summer Camps in Orange County 2026 | whatwedonowmama',
    meta_description:
      'The complete guide to summer camps in Orange County 2026 — sports, arts, STEM, and outdoor camps for kids ages 4–17, organized by city with registration tips.',
    published_at: '2026-03-15T08:00:00Z',
    created_at: '2026-03-15T08:00:00Z',
    updated_at: '2026-03-15T08:00:00Z',
    tags: ['Summer', 'OC Guide', 'Activities', 'Events'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">Summer is almost here, and if you're an OC parent, you already know: good camps fill up fast. We're talking waitlists-in-April fast.</p>

<p>Whether you're looking for a week of beach science, a robotics deep dive, or just somewhere your kid can run around with friends until August, Orange County has some genuinely great options. We've rounded up the best summer camps across all categories — sports, arts, STEM, outdoor, and full-day programs — so you can stop Googling and start registering.</p>

<h2>What to Know Before You Register</h2>

<p>A few things that'll save you headaches:</p>

<ul>
  <li><strong>Book early.</strong> Most OC camps open registration in February or March for summer sessions running June through August. If you're reading this in April or May, some popular camps will already have waitlists — but plenty of spots remain, especially for mid-July and August weeks.</li>
  <li><strong>Early bird discounts are real.</strong> Programs like Camp Newport and several city recreation departments offer 10% off for registrations before late April.</li>
  <li><strong>City rec programs are the best-kept secret.</strong> Huntington Beach, Newport Beach, Irvine, and Tustin all run city-operated summer camps that are significantly cheaper than private options — often $150–$300 per week versus $400–$700 at specialty camps. They're worth checking first.</li>
  <li><strong>Age ranges vary widely.</strong> Most camps serve ages 5–12, but a growing number have strong teen programs (6th–8th grade) that are worth knowing about.</li>
</ul>

<h2>🏅 Sports Camps in Orange County</h2>

<h3>YMCA of Orange County — Teen Sports &amp; Day Camps</h3>
<p>The Y runs summer camps out of multiple OC locations including Huntington Beach, Aliso Viejo, Laguna Niguel, and Mission Viejo. Sports offerings include swim, esports, adventure, and team sports. Their Teen Summer Camps are specifically designed for grades 6–8 and take a more independent, leadership-focused approach than typical day camps. <a href="https://www.ymcaoc.org" target="_blank" rel="noopener noreferrer">ymcaoc.org</a></p>

<h3>Huntington Beach City Parks &amp; Recreation — Camp HB</h3>
<p>One of the best deals in the city. Camp HB runs weekly themed programs Monday–Friday with games, creative crafts, and off-site excursions. Choose between a 3-day version (Mon/Wed/Fri) or a full 5-day week. It's run by the city, so pricing is much lower than private camps. Check huntingtonbeachca.gov for the current session calendar — registration opens each spring.</p>

<h3>Grip N Rip Junior Tennis (Huntington Beach)</h3>
<p>A local favorite for junior tennis development. Weekly sessions, multiple age groups, and available throughout the summer. Great option for kids who've been playing a year or more and want structured instruction.</p>

<h3>SCATS Gymnastics (multiple OC locations)</h3>
<p>Gymnastics-focused summer camps for ages 4 and up, with sessions available across several OC cities. Half-day and full-day options. Particularly popular for kids who want to train seriously over the summer without committing to year-round competitive gymnastics.</p>

<h2>🎨 Arts &amp; Creative Camps in Orange County</h2>

<h3>Aspire Art Studios (Newport Beach)</h3>
<p>A boutique art camp focused on drawing, painting, mixed media, and sculpture. Small class sizes and a genuine focus on creative development rather than just keeping kids busy. One of the more consistently well-reviewed arts camps in the Newport Beach area.</p>

<h3>Camp HB — Creative Themes (Huntington Beach)</h3>
<p>Camp HB's weekly themes lean heavily into creative arts and crafts alongside outdoor play. Take-home projects are a feature, not an afterthought. Good low-pressure intro to arts-focused summer programming for younger kids (K–5th grade).</p>

<h3>Irvine Fine Arts Center</h3>
<p>The City of Irvine's Fine Arts Center runs summer workshops in visual art, ceramics, and drawing for kids and teens. These aren't just keep-busy camps — they're structured around real art instruction. Check the City of Irvine community services calendar in the spring for session dates.</p>

<h3>Boys &amp; Girls Club of Newport Beach</h3>
<p>The Newport Beach club runs summer programs that include arts and music alongside sports and academic enrichment. Sliding scale pricing makes this accessible to a wider range of families. Ages 6–18.</p>

<h2>🔬 STEM &amp; Tech Camps in Orange County</h2>

<h3>Newport Sea Base (Newport Beach)</h3>
<p>This is one of the most unique STEM experiences in OC — and it uses the water. Newport Sea Base runs quarter-day, half-day, and full-day sessions covering sailing, kayaking, oceanography, STEM design and build workshops, bay and ocean fishing, robotics, and even cooking. The marine science angle makes it stand out from every other tech camp in the county. Ages vary by program. <a href="https://www.newportseabase.org" target="_blank" rel="noopener noreferrer">newportseabase.org</a></p>

<h3>Camp Tech Revolution (multiple OC locations)</h3>
<p>Running June 15 through August 14, Camp Tech Revolution is a weekly camp covering robotics, coding, game design, Minecraft, Roblox, AI, 3D printing, YouTube content creation, filmmaking, digital art, and more. Over 70 themed weeks for ages 4–15, led by certified teachers. One of the most comprehensive STEM camp offerings in the county. <a href="https://www.lavnercampsandprograms.com" target="_blank" rel="noopener noreferrer">lavnercampsandprograms.com</a></p>

<h3>Galileo Camp (Newport Beach &amp; Irvine)</h3>
<p>Galileo is a nationally recognized STEAM camp with OC locations in Newport Beach (accessible from Costa Mesa, HB, Santa Ana, and Tustin) and Irvine. Their curriculum blends science, technology, art, and entrepreneurship in a project-based format. Camp Galileo is now enrolling for Summer 2026. <a href="https://www.galileo-camps.com" target="_blank" rel="noopener noreferrer">galileo-camps.com</a></p>

<h3>Irvine Ranch Outdoor Education Center — STEM + Adventure</h3>
<p>Don't let the "outdoor" name fool you — IROC runs structured STEM sessions alongside adventure activities like rock climbing, ziplining, archery, and team building. For kids who want more than a screen-based tech camp. Ages 6–17, June through August. One of the most well-rounded programs in the Irvine area.</p>

<h2>🌲 Outdoor &amp; Nature Camps in Orange County</h2>

<h3>Inside the Outdoors at Shipley Nature Center (Huntington Beach)</h3>
<p>This is a hidden gem. Shipley Nature Center in Huntington Beach hosts classic outdoor day camps in June and throughout July, with themes like Campology, Adventures in the Wild, and Camp Castaway. It's an in-person nature immersion camp — hands-on, screen-free, and genuinely educational. Run by the OC Department of Education. Limited spots each week, so register early. <a href="https://www.insidetheoutdoors.org" target="_blank" rel="noopener noreferrer">insidetheoutdoors.org</a></p>

<h3>Environmental Nature Center (Newport Beach)</h3>
<p>The ENC runs nature-focused summer camps for younger kids centered on their 3.5-acre native plant sanctuary. It's a genuinely special setting — the kind of camp where your kid comes home covered in dirt and talking about beetles. Ages K–6th grade.</p>

<h3>Ocean Institute (Dana Point)</h3>
<p>One of the premier marine science programs in Southern California. Camps for ages 5–17 include time on boats, marine biology labs, and oceanography research. The overnight programs are particularly memorable for older kids (ages 10+). Member registration opens early February. <a href="https://www.ocean-institute.org" target="_blank" rel="noopener noreferrer">ocean-institute.org</a></p>

<h3>OC Council Boy Scouts — Camp Wilderness (multiple locations)</h3>
<p>The OC Boy Scouts runs summer camps with serious outdoor programming including shelter-building, archery, first aid, and wilderness survival across desert, mountain, and wetlands terrain themes. Ages 12–15 for the survival-focused tracks, younger options also available. <a href="https://www.ocbsa.org" target="_blank" rel="noopener noreferrer">ocbsa.org</a></p>

<h3>Camp Oakes — YMCA (Big Bear)</h3>
<p>Technically a sleepaway camp, but it consistently ranks among the best overnight options for OC families. Located in Big Bear, run by the YMCA, ages 8–17. If your kid is ready for their first overnight camp experience, this is a trustworthy, well-structured option with decades of history.</p>

<h2>📍 Summer Camp Quick Picks by City</h2>

<p>Not sure where to start? Here's the fastest path by city:</p>

<ul>
  <li><strong>Huntington Beach:</strong> Camp HB (city rec, best value) · Shipley Nature Center · YMCA HB · SCATS Gymnastics</li>
  <li><strong>Newport Beach:</strong> Newport Sea Base · Environmental Nature Center · Camp Galileo · Boys &amp; Girls Club · Aspire Art Studios</li>
  <li><strong>Irvine:</strong> Camp Galileo Irvine · IROC · Irvine Fine Arts Center · YMCA enrichment camps</li>
  <li><strong>Tustin:</strong> Camp Galileo (accessible from Tustin) · YMCA Tustin-area locations</li>
  <li><strong>Garden Grove &amp; Fountain Valley:</strong> YMCA enrichment programs · City recreation department day camps (check city websites in March/April for sign-ups)</li>
</ul>

<h2>Frequently Asked Questions</h2>

<h3>When should I register for summer camps in Orange County?</h3>
<p>As early as possible — ideally February or March. City recreation programs and popular specialty camps like Newport Sea Base and Camp Galileo often fill their best weeks by April. That said, most programs have openings well into May and June, especially for August sessions.</p>

<h3>Are there free or low-cost summer camps in Orange County?</h3>
<p>Yes. City-run programs through Huntington Beach, Irvine, and Tustin Parks &amp; Recreation are significantly cheaper than private camps, often $150–$300 per week. The Boys &amp; Girls Club also offers sliding-scale pricing. Look for "scholarship" options on YMCA registrations — the Y doesn't advertise it heavily, but financial assistance is available.</p>

<h3>What age groups do most OC summer camps serve?</h3>
<p>Most day camps serve K–6th grade (roughly ages 5–12). Teen-specific programs for grades 6–8 are offered by the YMCA, OC BSA, and IROC. For the youngest kids (ages 3–5), YMCA enrichment camps and Camp HB are the most inclusive options.</p>

<h3>Do OC summer camps require kids to be vaccinated?</h3>
<p>Policies vary by program. City-run and YMCA camps generally follow local school district guidelines. Specialty and private camps set their own policies. Check the individual program's registration FAQ — it's usually answered there.</p>

<h2>Stay in the Loop</h2>

<p>Summer camp sign-ups move fast. We update our <a href="/events">OC events calendar</a> every week with new openings, registration dates, and local family activities — <a href="/signup">subscribe for free</a> and we'll send them straight to your inbox.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 1. Sleep Training
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-1',
    slug: 'how-to-sleep-train-your-little-one',
    title: 'How to Sleep Train Your Little One',
    excerpt:
      'Sleep training can feel overwhelming — but it doesn\'t have to be a fight. Here\'s what actually works, which methods suit which babies, and how to stay consistent without losing your mind.',
    category: 'sleep',
    access_level: 'free',
    status: 'published',
    featured: false,
    read_time_minutes: 8,
    hero_image_url: null,
    meta_title: 'How to Sleep Train Your Baby | whatwedonowmama',
    meta_description:
      'A practical, judgment-free guide to sleep training — from Ferber to chair method to no-cry approaches. Real advice for OC parents.',
    published_at: '2024-11-01T08:00:00Z',
    created_at: '2024-11-01T08:00:00Z',
    updated_at: '2024-11-01T08:00:00Z',
    tags: ['sleep', 'newborns', 'toddlers', 'schedules', 'methods'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">Sleep training is one of those parenting topics that somehow manages to be both completely necessary and extremely loaded. Everyone has an opinion. Your mother-in-law has a stronger one. And meanwhile, you're staring at the ceiling at 3am wondering if you've already messed everything up.</p>

<p>You haven't. Let's talk about what actually works — without the guilt trip.</p>

<h2>What Is Sleep Training, Really?</h2>

<p>Sleep training is simply the process of helping your baby learn to fall asleep independently — and more importantly, to fall <em>back</em> asleep on their own when they naturally stir between sleep cycles. It's not about ignoring your baby. It's about giving them a skill they'll use for life.</p>

<p>Most pediatric sleep specialists agree that babies are typically ready to begin sleep training somewhere between <strong>4–6 months</strong> of age, once their circadian rhythm has started to develop and they no longer physiologically need to feed every 2–3 hours through the night.</p>

<h2>The Main Methods</h2>

<p>There's no single right way to sleep train. Here's an honest look at the most common approaches:</p>

<h3>The Ferber Method (Graduated Extinction)</h3>

<p>This is the "cry it out lite" approach. You put baby down awake, then check in at increasing intervals — 3 minutes, 5 minutes, 10 minutes — to briefly reassure them without picking them up. The intervals grow over several nights.</p>

<p><strong>Works well for:</strong> Parents who want a faster result and can handle some crying. Most families see meaningful improvement in 3–7 nights.</p>

<p><strong>Common mistake:</strong> Going in too frequently or picking baby up during check-ins, which can actually make things harder by rewarding the crying.</p>

<h3>Full Extinction ("Cry It Out")</h3>

<p>You put baby down awake and don't go in until morning (or a set wake time). This sounds harsh, but research — including a widely cited 2016 study published in Pediatrics — shows it causes no lasting psychological harm and often works fastest.</p>

<p><strong>Works well for:</strong> Parents who find that check-ins make things worse (some babies escalate with partial attention).</p>

<h3>The Chair Method (Sleep Lady Shuffle)</h3>

<p>You sit next to the crib on night 1, move to the doorway on night 3, then further away every few nights until you're out of the room. You stay present but gradually withdraw your physical presence.</p>

<p><strong>Works well for:</strong> Parents who want a gentler transition and can commit to consistency over 2–3 weeks. Takes longer, but feels less abrupt.</p>

<h3>Fading / No-Cry Methods</h3>

<p>You gradually reduce the amount of assistance you give at bedtime — for example, instead of rocking to sleep, you rock until drowsy, then put down. Over days or weeks, you reduce the rocking.</p>

<p><strong>Works well for:</strong> Younger babies or families who want minimal tears. Requires patience — it can take 4–6 weeks to see results.</p>

<h2>Setting Up for Success</h2>

<p>Regardless of which method you choose, these fundamentals make a huge difference:</p>

<ul>
  <li><strong>Consistent bedtime routine:</strong> Bath, book, song — whatever works — done in the same order every night. Predictability is everything for baby brains.</li>
  <li><strong>Early enough bedtime:</strong> Most babies do best between 6:30–7:30pm. Overtired babies actually fight sleep harder.</li>
  <li><strong>Dark room:</strong> As dark as you can make it. Invest in blackout curtains — the $30 kind from Amazon works fine.</li>
  <li><strong>White noise:</strong> A consistent sound machine drowns out household noise and signals sleep time. Run it all night, not just at bedtime.</li>
  <li><strong>Awake but drowsy:</strong> The whole method depends on putting baby down when they're drowsy but still awake, so they can practice falling asleep on their own.</li>
</ul>

<h2>What to Expect</h2>

<p>Night 1–2 are usually the hardest. Crying often peaks around 45–60 minutes on the first night, then drops significantly on nights 3–4. By night 7, most babies have turned a corner. If you're not seeing any improvement after 2 weeks of true consistency, it's worth talking to your pediatrician to rule out any underlying issues.</p>

<h2>A Word on "Consistency"</h2>

<p>This is the part nobody talks about enough: sleep training doesn't actually fail — <em>inconsistency</em> does. If you do Ferber on Monday and then bring baby into your bed on Wednesday because you're exhausted, you're not getting the outcome, and you're also teaching baby that persistence gets results. Pick a method and commit to at least 5–7 nights.</p>

<h2>OC Resources</h2>

<p>Looking for local support? Orange County has several pediatric sleep consultants who do in-home and virtual consultations. Many OC pediatricians (especially in Irvine and Newport Beach) can also refer you to sleep specialists. And of course, our community is always here — drop a question in the group.</p>

<p>You've got this. Your baby will sleep. And so will you.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 2. Baby-Led Weaning
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-2',
    slug: 'baby-led-weaning-tips-and-tricks',
    title: 'Baby-Led Weaning: Tips and Tricks for Stress-Free Solids',
    excerpt:
      'Forget the purées. Baby-led weaning lets your little one explore real food from the start — building independence, reducing picky eating, and making mealtimes way more fun. Here\'s everything you need to know.',
    category: 'feeding',
    access_level: 'free',
    status: 'published',
    featured: false,
    read_time_minutes: 7,
    hero_image_url: null,
    meta_title: 'Baby-Led Weaning Guide | whatwedonowmama',
    meta_description:
      'A practical guide to starting baby-led weaning at 6 months — safe first foods, gagging vs choking, and tips from OC parents who\'ve done it.',
    published_at: '2024-11-08T08:00:00Z',
    created_at: '2024-11-08T08:00:00Z',
    updated_at: '2024-11-08T08:00:00Z',
    tags: ['feeding', 'weaning', 'baby food', 'nutrition', '6 months'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">Somewhere between the perfectly smooth purée and the panicked Google search about gagging, many parents discover baby-led weaning — and it changes everything. BLW is about letting babies feed themselves actual food from day one of starting solids. No spoon. No puréed mush. Just avocado strips and soft-cooked broccoli and a baby who's absolutely delighted about it.</p>

<p>If that sounds terrifying, keep reading. It becomes second nature fast.</p>

<h2>What Is Baby-Led Weaning?</h2>

<p>Baby-led weaning (BLW) is an approach to introducing solid foods where babies feed themselves from the very beginning, rather than being spoon-fed purées. The term was popularized by UK midwife and health visitor Gill Rapley, who noticed that babies allowed to self-feed from around 6 months showed better self-regulation, more food variety acceptance, and less picky eating later on.</p>

<p>Breast milk or formula remains the main nutrition source through the first year — solids are about exploration and skill-building, not calories.</p>

<h2>When to Start</h2>

<p>Look for these three readiness signs — all three need to be present before you begin:</p>

<ul>
  <li><strong>Around 6 months of age</strong> (corrected for premature babies)</li>
  <li><strong>Sitting upright with minimal support</strong> — baby can hold their head steady without slumping</li>
  <li><strong>Loss of tongue-thrust reflex</strong> — when you put food in, baby pushes it out with their tongue less often</li>
</ul>

<p>Don't start before 6 months regardless of how interested they seem. Their gut simply isn't ready.</p>

<h2>First Foods to Try</h2>

<p>Start with soft, easy-to-grasp shapes. Think "finger-length sticks" that baby can hold in their fist with some sticking out the top.</p>

<ul>
  <li><strong>Avocado</strong> — slice into long spears, or roll in crushed puffs for grip</li>
  <li><strong>Soft-roasted sweet potato</strong> — cut in sticks, roasted until completely tender</li>
  <li><strong>Steamed broccoli florets</strong> — leave a long stem for a natural handle</li>
  <li><strong>Ripe banana</strong> — peeled but with some peel left as a holder</li>
  <li><strong>Soft-cooked pasta</strong> — large rigatoni or penne works well</li>
  <li><strong>Scrambled eggs</strong> — small soft curds</li>
  <li><strong>Ripe mango or peach spears</strong></li>
</ul>

<p>Introduce allergens — eggs, peanut products, tree nuts, fish — early and repeatedly. The evidence now strongly supports early introduction to <em>reduce</em> allergy risk.</p>

<h2>The Gagging Question Everyone Has</h2>

<p>This is the thing that stops most parents: the gag reflex. Here's what's critical to understand.</p>

<p><strong>Gagging is not choking.</strong></p>

<p>A baby's gag reflex is positioned much further forward on the tongue than an adult's — it's a safety mechanism. When baby gags, they're actively working to move food to a safer position. It looks alarming (the eyes water, the face goes red, they might make retching sounds) but it's their airway protection system doing its job.</p>

<p>Choking is silent. A choking baby cannot make sounds because their airway is blocked. This is the emergency.</p>

<p>As long as baby is making noise — coughing, spluttering, crying — they are not choking. Stay calm, stay close, and let them work through it. Taking a first aid course that covers infant choking is highly recommended before starting BLW.</p>

<h2>Foods to Avoid in Year One</h2>

<ul>
  <li><strong>Honey</strong> — risk of infant botulism until age 1</li>
  <li><strong>Whole cow's milk as a drink</strong> (dairy in cooking is fine)</li>
  <li><strong>Added salt and sugar</strong> — their kidneys can't handle it</li>
  <li><strong>Whole nuts, grapes, cherry tomatoes</strong> — choking hazard; always halve or quarter</li>
  <li><strong>Hard raw vegetables</strong> — carrots, celery sticks — until baby has a full set of molars</li>
</ul>

<h2>Making It Less Messy (or Just Accepting the Mess)</h2>

<p>BLW is messy. That's not a bug, it's a feature — babies need to explore texture, smell, and squish. But you can mitigate the chaos:</p>

<ul>
  <li>Long-sleeve bibs are game-changers. The ones with a catch-tray on the bottom earn their keep.</li>
  <li>A splat mat or old shower curtain under the high chair saves your floors.</li>
  <li>Silicone suction bowls and plates stick to the tray — for about 45 seconds, after which they become projectiles.</li>
  <li>Strip baby down to a diaper at mealtimes for easier cleanup.</li>
</ul>

<h2>Combining BLW with Purées</h2>

<p>Many families do a hybrid approach — offering some purées (especially high-iron foods like lentil purée) alongside self-fed finger foods. This is totally valid. The goal is to give baby agency and practice with self-feeding, not to be dogmatic about it.</p>

<h2>The Real Long-Term Benefit</h2>

<p>Research suggests BLW babies develop better appetite self-regulation — they're less likely to overeat and more likely to accept a wider range of foods by age 3. When you let babies decide when they're full from the very first bite, you're building a healthy relationship with food from day one.</p>

<p>Messy? Absolutely. Worth it? Ask any parent six months in — the answer is almost always yes.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 3. Sports and Science
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-3',
    slug: 'sports-and-the-science-behind-them',
    title: 'Sports and the Science Behind Them: A Parent\'s Guide to Youth Athletics',
    excerpt:
      'Should your 4-year-old start soccer? What does the research say about early specialization? How do you balance competitive sports with letting kids be kids? The science — and the practical takeaways — are here.',
    category: 'development',
    access_level: 'free',
    status: 'published',
    featured: false,
    read_time_minutes: 9,
    hero_image_url: null,
    meta_title: 'Youth Sports Science: A Parent\'s Guide | whatwedonowmama',
    meta_description:
      'What does science say about kids and sports? Early specialization, burnout, benefits, and how to choose the right sport for your child.',
    published_at: '2024-11-15T08:00:00Z',
    created_at: '2024-11-15T08:00:00Z',
    updated_at: '2024-11-15T08:00:00Z',
    tags: ['sports', 'development', 'activities', 'youth athletics', 'physical health'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">Orange County has no shortage of youth sports leagues, travel teams, and club programs starting as young as age 3. The pressure to sign up — and to specialize early — can feel enormous. But what does the research actually say about kids, sports, and what's truly best for their development?</p>

<p>Spoiler: the science is more reassuring than the youth soccer recruiting culture would have you believe.</p>

<h2>The Real Benefits of Youth Sports</h2>

<p>Before getting into the nuances, let's acknowledge: organized sports are genuinely good for kids. The evidence on this is strong.</p>

<ul>
  <li><strong>Physical health:</strong> Active kids have better cardiovascular health, stronger bones and muscles, and healthier weights. Kids in organized sports accumulate significantly more moderate-to-vigorous physical activity than non-sports kids.</li>
  <li><strong>Mental health:</strong> A 2019 study in JAMA Pediatrics found that children who participated in team sports had lower rates of depression, anxiety, and social withdrawal at ages 11–15.</li>
  <li><strong>Academic performance:</strong> Contrary to "they spend too much time at practice" fears, sports participants consistently show comparable or slightly better academic performance than non-participants, likely due to improved executive function, sleep, and goal orientation.</li>
  <li><strong>Life skills:</strong> Coachability, resilience, how to win gracefully and lose respectfully, working as part of a team — these are things kids absorb on the field in ways that are hard to replicate anywhere else.</li>
</ul>

<h2>The Early Specialization Problem</h2>

<p>Here's where things get more complicated — and where many OC families unknowingly do harm chasing the college scholarship dream.</p>

<p>Early specialization means focusing on a single sport year-round, typically before age 12. The push to "identify talent early" has led to travel teams for 6-year-olds and year-round league commitments that would have been unimaginable a generation ago.</p>

<p>The research on early specialization is actually quite clear, and it doesn't support what we're doing:</p>

<ul>
  <li>A 2019 review in the British Journal of Sports Medicine found that early specializers had <strong>significantly higher injury rates</strong> — particularly overuse injuries from repetitive stress on growing bodies.</li>
  <li>Early specializers report higher rates of <strong>burnout</strong> — emotional exhaustion, reduced motivation, dropout — by their mid-teens, precisely when college scouts start watching.</li>
  <li>Studies of elite athletes in most sports (basketball, soccer, tennis) find that the <strong>majority of Olympic and professional athletes were multi-sport athletes</strong> through age 14–15. Early specializers are actually underrepresented at the elite level.</li>
</ul>

<p>The American Academy of Pediatrics recommends that children avoid single-sport specialization before age 15–16, take at least one to two seasons off per year from each sport, and not spend more hours per week in organized sports than their age in years.</p>

<h2>The Right Age for Each Sport</h2>

<p>Different sports have different optimal starting windows based on the physical and cognitive skills required:</p>

<ul>
  <li><strong>Ages 2–4:</strong> Gymnastics, swimming basics, dance, T-ball. Focus on fun movement and body awareness, not competition.</li>
  <li><strong>Ages 5–7:</strong> Soccer, martial arts, tennis, basketball (modified). Begin learning rules, basic teamwork, taking turns.</li>
  <li><strong>Ages 8–12:</strong> All sports accessible. Good age to try multiple activities and find genuine passion and fit.</li>
  <li><strong>Ages 12+:</strong> Narrowing to a primary sport makes sense if the child has strong intrinsic motivation — meaning they're driving the interest, not you.</li>
</ul>

<h2>Signs of Healthy vs. Unhealthy Sports Participation</h2>

<p>Every parent should know these. <strong>Healthy signs:</strong> child looks forward to practice, has positive relationships with teammates and coaches, handles losses reasonably, talks about sports with excitement, wants to go even on hard days.</p>

<p><strong>Warning signs:</strong> dreads going, complains of frequent stomachaches before games (anxiety), mentions wanting to quit but is afraid to tell you, stops enjoying other activities they used to love, or shows chronic injury pain they've started hiding.</p>

<h2>The OC Context</h2>

<p>In Orange County specifically, the youth sports industrial complex is particularly intense. Club soccer in particular starts recruiting kids into "elite" travel programs at ages 5–6 with multi-thousand-dollar annual fees. This creates a real pressure cooker.</p>

<p>A few things worth knowing locally:</p>

<ul>
  <li>AYSO (American Youth Soccer Organization) offers recreational leagues across OC that explicitly prioritize fun and equal playing time over competition. Great for kids under 10.</li>
  <li>Many OC parks and recreation departments offer intro-level programs at a fraction of the cost of club sports — the instruction quality is often comparable for young children.</li>
  <li>For swimming, the number of strong club programs in OC (Mission Viejo Nadadores, etc.) makes this a particularly OC-appropriate sport to explore.</li>
</ul>

<h2>The Bottom Line</h2>

<p>Let young kids try lots of things. Prioritize joy over achievement for as long as possible. Watch for your child's interest, not your own dreams. Take the "my 7-year-old is being recruited" urgency culture with a generous grain of salt — it's mostly invented pressure.</p>

<p>The kids who play well into their teens are almost always the ones who chose to, because they love it.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 4. Best Parks in OC
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-4',
    slug: 'best-parks-in-orange-county-for-toddlers',
    title: 'The Best Parks in Orange County for Toddlers (2025 Edition)',
    excerpt:
      'A curated, parent-tested list of the best toddler-friendly parks across OC — from Irvine\'s massive nature play areas to hidden gems in Anaheim and San Clemente.',
    category: 'oc-guides',
    access_level: 'free',
    status: 'published',
    featured: false,
    read_time_minutes: 6,
    hero_image_url: null,
    meta_title: 'Best Parks for Toddlers in Orange County | whatwedonowmama',
    meta_description:
      'Parent-tested guide to the best OC parks for toddlers and young kids — playgrounds, splash pads, shade, and parking tips included.',
    published_at: '2024-11-22T08:00:00Z',
    created_at: '2024-11-22T08:00:00Z',
    updated_at: '2024-11-22T08:00:00Z',
    tags: ['parks', 'OC', 'outdoor', 'toddlers', 'free activities'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">One of the best things about raising kids in Orange County is that the outdoor options are genuinely exceptional — if you know where to go. This list is parent-tested, toddler-approved, and updated for 2025. We've noted parking, shade, restrooms, and splash pads because those are the things that actually matter when you're wrangling a two-year-old.</p>

<h2>Heritage Community Park — Irvine</h2>

<p>This is frequently cited as one of the best playgrounds in all of Southern California, and it earns the reputation. The nature-themed play structures are imaginative without being overwhelming — wooden climbing elements, slides built into a small hill, a dedicated toddler section with lower structures and soft rubber surfacing. There's ample shade from mature trees, clean restrooms, and good parking. Takes about 90 minutes to fully exhaust a toddler.</p>

<p><em>Tip:</em> Go before 10am on weekends to beat crowds. Gets very busy by 11am.</p>

<h2>Irvine Regional Park</h2>

<p>More of a destination than a quick playground run. There's a small zoo (free entry), pony rides, a train ride that loops the park, and a large playground area. Bring a picnic — the picnic areas are spacious and shaded. Lake for feeding ducks. This is a solid 3-hour adventure for toddlers.</p>

<p><em>Parking fee:</em> $3 weekdays, $5 weekends per vehicle. Worth every dollar.</p>

<h2>Craig Regional Park — Brea/Fullerton</h2>

<p>Hugely underrated in the north OC area. Large shaded playground, a splash pad that runs spring through fall, wide grassy areas, and a walking path around a small lake. The splash pad is free and doesn't require a reservation — rare in OC. Restrooms are well-maintained.</p>

<h2>Aliso & Wood Canyons Wilderness Park — Laguna Niguel</h2>

<p>Best for slightly older toddlers (2.5+) who can walk a bit. Easy paved trail along the creek at the park entrance is stroller-friendly. Older toddlers love the "nature exploration" feel. Butterflies, lizards, birds everywhere. Free parking. Bring a snack and water.</p>

<h2>Yorba Linda Regional Park</h2>

<p>A gem in the north. The playground is well-maintained and has great shade structures. There's also a small pond, paddle boat rentals, and wide-open grass fields perfect for chasing toddlers. Gets less crowded than the Irvine parks. Free parking on weekdays.</p>

<h2>San Clemente's Linda Lane Park</h2>

<p>If you're in south OC, this beach-adjacent park with a newly renovated playground is excellent. Toddler-specific play areas, views of the ocean bluffs, and walkable to the beach path. The ocean breeze keeps it cool even in summer. Parking can be tight on weekends — arrive early.</p>

<h2>Mason Regional Park — Irvine</h2>

<p>Often overlooked because it's off the main roads. A large lake (fishing allowed), wide open fields, and a good playground with newer equipment. The paths around the lake are stroller-friendly and long enough for a nice walk. Fewer crowds than Heritage or Regional Park.</p>

<h2>Handy Tips for Any OC Park Run</h2>

<ul>
  <li><strong>Timing:</strong> October–April are golden. May–September: plan for mornings only unless there's a splash pad.</li>
  <li><strong>Sun protection:</strong> Even in winter, OC sun is strong. Hat, SPF, and a long-sleeve layer are standard.</li>
  <li><strong>Snacks:</strong> Hungry toddlers melt down. A small snack bag can add 45 minutes to any outing.</li>
  <li><strong>Parking apps:</strong> Many OC parks use the ParkMobile app for payment. Have it downloaded before you arrive.</li>
</ul>

<p>Got a favorite park we didn't mention? Drop it in the community — we update this list quarterly based on member recommendations.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 5. Milestones: Baby's First Year
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-5',
    slug: 'babys-first-year-milestone-guide',
    title: "Your Baby's First Year: A Month-by-Month Milestone Guide",
    excerpt:
      "From first smile to first steps — what to expect each month in the first year. We cover physical, social, and cognitive milestones, and when to check in with your pediatrician.",
    category: 'milestones',
    access_level: 'free',
    status: 'published',
    featured: false,
    read_time_minutes: 10,
    hero_image_url: null,
    meta_title: "Baby's First Year Milestone Guide | whatwedonowmama",
    meta_description:
      "Month-by-month guide to your baby's first year milestones — physical development, social skills, what's normal and when to ask your pediatrician.",
    published_at: '2024-12-01T08:00:00Z',
    created_at: '2024-12-01T08:00:00Z',
    updated_at: '2024-12-01T08:00:00Z',
    tags: ['milestones', 'newborn', 'development', 'first year', 'growth'],
    author: 'whatwedonowmama team',
    body: `
<p class="lead">Your baby's first year is a blur of growth. Every month brings something new — and every month brings a fresh round of wondering if your baby is on track. This guide walks through what to expect month by month, what's a normal range, and when to mention something to your pediatrician.</p>

<p>One important note up front: milestones are <em>ranges</em>, not deadlines. The CDC uses "by 2 months" or "by 6 months" language for a reason — there's a wide window of normal. Use this as a guide, not a scoreboard.</p>

<h2>Months 1–2: The Fourth Trimester</h2>

<p>Your newborn is adjusting to being outside the womb, and so are you. Development in these weeks is mostly internal — nervous system stabilization, gut maturation, sleep-wake cycle beginning to develop.</p>

<p><strong>You'll likely see:</strong></p>
<ul>
  <li>Social smile appears — usually by 6–8 weeks, this first intentional smile is one of the best moments of parenthood</li>
  <li>Starts tracking a face or object slowly with their eyes</li>
  <li>Makes cooing sounds in response to your voice</li>
  <li>Begins lifting head briefly during tummy time</li>
</ul>

<p><strong>Worth mentioning to pediatrician if:</strong> No smile by 3 months, doesn't track objects, or seems to startle at nothing or everything in equal measure.</p>

<h2>Months 3–4</h2>

<p>Things get noticeably more interactive. Your baby is becoming a person right in front of you.</p>

<ul>
  <li>Laughs out loud — a genuinely joyful milestone</li>
  <li>Holds head steady when upright</li>
  <li>Pushes up on elbows during tummy time</li>
  <li>Reaches for and bats at dangling toys</li>
  <li>Recognizes familiar faces; may show wariness with strangers</li>
</ul>

<h2>Months 5–6</h2>

<p>The mobile phase is approaching. Also, probably time to start sleep training if you haven't already.</p>

<ul>
  <li>Rolls over — usually tummy to back first, then back to tummy</li>
  <li>Sits briefly with support; working toward sitting unsupported</li>
  <li>Transfers objects between hands</li>
  <li>Babbles with consonant sounds ("ba," "ma," "da") — not intentional yet</li>
  <li>Shows clear preference for familiar people; stranger anxiety begins</li>
  <li>Ready to begin solids around 6 months (with pediatrician confirmation)</li>
</ul>

<h2>Months 7–9</h2>

<p>Motor development explodes during this period. Baby proofing becomes urgent.</p>

<ul>
  <li>Sits independently without support</li>
  <li>Begins crawling — though some babies skip crawling and go straight to cruising, which is fine</li>
  <li>Pulls to standing, cruises along furniture</li>
  <li>Pincer grasp develops — baby can pick up small objects with thumb and forefinger</li>
  <li>Object permanence emerges — baby now understands things exist when out of sight (hence: peekaboo becomes genuinely exciting)</li>
  <li>Says "mama" and "dada" — still not specifically directed, but getting there</li>
</ul>

<h2>Months 10–12</h2>

<p>Approaching the first birthday. "Baby" is transitioning to "toddler" in both behavior and capability.</p>

<ul>
  <li>Walks — the average age for first steps is 12 months, with 9–15 months being the completely normal range</li>
  <li>Waves bye-bye, claps, points at objects of interest</li>
  <li>Follows simple one-step commands ("come here," "give me that")</li>
  <li>Says at least 1–3 recognizable words by 12 months</li>
  <li>Uses objects correctly — holds a spoon, "talks" into a toy phone</li>
  <li>Shows clear preferences, favorites, and opinions. Very strong opinions. About everything.</li>
</ul>

<h2>When to Contact Your Pediatrician</h2>

<p>The American Academy of Pediatrics has clear developmental surveillance recommendations. Bring up concerns at any well visit — but especially reach out if you notice:</p>

<ul>
  <li>No social smile by 3 months</li>
  <li>Not reaching for objects by 6 months</li>
  <li>Not sitting by 9 months</li>
  <li>Not babbling by 12 months</li>
  <li>Not walking by 15 months</li>
  <li>Any loss of previously acquired skills at any age (regression is always worth mentioning)</li>
</ul>

<p>Early intervention services in California are excellent and free — if your pediatrician suggests an evaluation through Regional Center, it's worth pursuing. Early support can make a significant difference.</p>

<p>And remember: you know your baby better than any chart does. Trust your gut, bring your questions to your pediatrician, and enjoy the wildly beautiful chaos of year one.</p>
    `,
  },

  // ─────────────────────────────────────────────────────────────────
  // 6. Screen Time — Plus article example
  // ─────────────────────────────────────────────────────────────────
  {
    id: 'seed-6',
    slug: 'screen-time-and-kids-what-research-says',
    title: 'Screen Time and Kids: What the Research Actually Says',
    excerpt:
      'The guidelines say "no screens under 2." But your toddler found the YouTube Kids app and your preschooler wants three hours of Bluey. What does the science actually say — and how worried should you be?',
    category: 'development',
    access_level: 'plus',
    status: 'published',
    featured: false,
    read_time_minutes: 8,
    hero_image_url: null,
    meta_title: 'Screen Time and Kids: What the Research Says | whatwedonowmama',
    meta_description:
      'A research-based look at screen time for toddlers and young children — what actually matters, what the limits should be, and how to approach it without guilt.',
    published_at: '2024-12-08T08:00:00Z',
    created_at: '2024-12-08T08:00:00Z',
    updated_at: '2024-12-08T08:00:00Z',
    tags: ['screen time', 'technology', 'research', 'toddlers', 'development'],
    author: 'whatwedonowmama team',
    body: `<p>This article is available to Plus members. Join Plus for access to the full research breakdown, practical screen time frameworks for each age, and our OC parent discussion thread on this topic.</p>`,
  },
]

/** Look up a seed resource by slug */
export function getSeedResource(slug: string): SeedResource | undefined {
  return SEED_RESOURCES.find(r => r.slug === slug)
}
