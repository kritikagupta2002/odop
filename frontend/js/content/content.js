/* Product-wise catalogue text.
   Every product (Kota Doria / Kota Stone / Sandstone / Garlic) has its own headlines, benefits, finishes, uses, promises and so on.
   Some lines have 2-3 alternatives; one is picked from the company name, so two companies selling the same product
   do not get the same words. The customer can change any of it in the "Catalogue text" box.                       */
(function () {
  const TOKEN = (s, d) => String(s).replace(/\{district\}/g, d);
  const hash = s => { let x = 2166136261; for (const ch of String(s || '')) { x ^= ch.charCodeAt(0); x = Math.imul(x, 16777619); } x ^= x >>> 15; x = Math.imul(x, 2246822507); x ^= x >>> 13; x = Math.imul(x, 3266489909); x ^= x >>> 16; return x >>> 0; };
  const pick = (arr, seed, off) => arr[(seed + (off || 0)) % arr.length];

  const PACKS = {
    'Kota Doria': {
      key: 'textile', badge: 'Handwoven',
      tagline: ['Handwoven in {district}, light as air.', 'Fine cotton and silk, woven the slow way.', 'A weave with a name, made by hand.'],
      story: [['Woven in {district},', 'by hand.'], ['Light as a', 'breath of air.'], ['Threads of', 'tradition.']],
      hero: [['Woven slowly,', 'by hand.'], ['Fine cotton,', 'finer silk.'], ['Soft as', 'a memory.']],
      dense: [['Printed', 'by hand.'], ['Drawn', 'thread by thread.'], ['Made for', 'every festival.']],
      edit: ['The Doria Edit', "The Weaver's Edit", 'The Festive Edit'],
      values: [[['By hand', 'Woven and finished by skilled weavers of {district}.'], ['Honestly told', 'Clear fabric, length and price. No surprises.'], ['With care', 'Folded, packed and sent with care.']],
               [['Hand-woven', 'Every piece comes off a real loom.'], ['True to colour', 'We show the fabric as it is.'], ['Made to last', 'Soft, light and easy to care for.']]],
      why: ['Authentic handwoven fabric', 'Direct from the weaver', 'Clear sizes and prices', 'Fine finish and borders', 'Small or bulk orders', 'Careful packing'],
      what: ['Sarees', 'Suit sets and dress material', 'Dupattas and stoles', 'Fabric by the metre', 'Custom orders'],
      legacy: 'Built on years of weaving, {ent} stands for honest cloth, fair prices and a finish you can feel.',
      isText: 'Doria fabric is woven on handlooms in cotton and silk. Its open square-check weave keeps the cloth light, airy and comfortable to wear, with a soft, slightly translucent look.',
      understand: 'UNDERSTANDING DORIA',
      benefits: [['leaf', 'Light & breathable', 'The open weave keeps the fabric airy and comfortable in warm weather.'], ['shield', 'Strong yarn', 'Cotton and silk together give a fabric that holds its shape.'], ['drop', 'Easy care', 'A gentle hand wash keeps the weave soft. Avoid hard scrubbing.']],
      fin: { title: ['Weaves &', 'Finishes'], intro: 'The weaves and finishes we make. Ask us which one suits your need.', items: [['Plain doria', 'Classic square-check weave in a single colour.'], ['Block print', 'Hand-printed motifs on the doria base.'], ['Zari border', 'A fine metallic thread border.'], ['Dyed', 'Soft, even colour across the cloth.']] },
      appsTitle: 'WAYS TO WEAR IT', apps: ['Sarees', 'Suit sets', 'Dupattas & stoles', 'Dress material', 'Home furnishing'],
      steps: ['Yarn selected', 'Woven on the loom', 'Finished & packed'], process: [['Yarn', 'Cotton & silk'], ['Weave', 'On the loom'], ['Check', 'Piece by piece'], ['Pack', 'Folded with care']],
      seal: ['HAND', 'WOVEN'], coverLine: 'Handwoven fabric, supplied across India with careful packing.',
      promise: { title: ['Packed by hand,', 'sent with care.'], text: 'Every piece is checked before it leaves {district}. We pack it to arrive clean, and we tell you plainly what you are buying.' },
      care: [['Caring for it', 'Wash gently in cold water and dry in shade. Iron on a low setting.'], ['Exchange', 'If a piece is not as described, tell us within 7 days and we will make it right.'], ['Honest pictures', 'Colours can look slightly different on screen. Small weaving variations are natural.']],
      note: 'Natural fabric varies a little in shade and weave from piece to piece. Photos are indicative.', formats: null
    },
    'Kota Stone': {
      key: 'stone', badge: 'Direct from the quarry', stone: true,
      tagline: ['Natural. Durable. Timeless.', 'Strong stone, honest prices.', 'Strong stone with a quiet look.'],
      story: [['Cut from Hadoti,', 'built to last.'], ['Natural stone,', 'honestly told.'], ['Cool underfoot,', 'strong for years.']],
      hero: [['Cool underfoot,', 'strong for life.'], ['Texture you', 'can feel.'], ['Honed by time,', 'finished by hand.']],
      dense: [['Slabs &', 'tiles.'], ['Every', 'finish.'], ['The', 'collection.']],
      edit: ['The Floor Edit', 'The Stone Edit', 'The Slab Edit'],
      values: [[['Natural', 'Quarried and cut from real Kota stone.'], ['Honestly told', 'Clear size, finish and price.'], ['Delivered with care', 'Packed to arrive safely, on time.']],
               [['Built to last', 'Strong stone for heavy daily use.'], ['Clear details', 'Size, thickness and finish listed for every piece.'], ['On schedule', 'We plan dispatch around your site.']]],
      why: ['Quality assurance', 'Timely delivery', 'Durable material', 'Competitive pricing', 'Customer satisfaction', 'Eco-friendly practices'],
      what: ['Residential projects', 'Hospitality projects', 'Commercial developments', 'Landscaping & outdoor works', 'Architectural & decorative works'],
      legacy: 'Built on experience, {ent} stands for reliability, honest dealing and stone that lasts.',
      isText: 'Kota Stone is a fine-grained limestone from the Hadoti region of Rajasthan. It forms in natural layers and is known for its grey and green shades. It is quarried directly from the earth and is widely used for its strength and natural look.',
      understand: 'UNDERSTANDING KOTA STONE',
      benefits: [['shield', 'Exceptional durability', 'Strong enough for heavy foot traffic and daily use.'], ['foot', 'Naturally non-slip', 'The surface keeps its grip even when wet, so it suits walkways and wet areas.'], ['leaf', 'Natural & eco-friendly', 'A natural material that stays cool to the touch with little impact on the environment.']],
      fin: { title: ['Surface', 'Finishes'], intro: 'Our surface finishes bring out the natural character of the stone and give you the right look for every space.', items: [['Leather finish', 'A refined matte texture with extra grip and a modern look.'], ['Semi-polish', 'A soft sheen that brings out the stone while keeping its natural look.'], ['Mirror polish', 'A high-gloss finish with deep reflection for a rich look.'], ['Rough / natural', 'The raw, textured surface straight from the cut, best for outdoors.']] },
      finAll: [['Natural / Cleft', 'The raw split face with a natural, textured look.'], ['Sawn', 'Machine cut with a flat, even surface.'], ['Honed', 'Smooth matte surface with no shine.'], ['Brushed', 'Soft, aged feel with light texture.'], ['Flamed', 'Heat-treated for a rough, anti-slip finish.'], ['Tumbled', 'Softened edges and an antique look.'], ['Sandblasted', 'Fine textured, matte surface.'], ['Bush-hammered', 'Coarse textured surface for good grip.'], ['Polished', 'Glossy surface that shows the colour and grain.']],
      appsTitle: 'VERSATILE APPLICATIONS', apps: ['Staircases', 'Interior flooring', 'Hospitality & outdoor leisure', 'Outdoor pathways & landscaping', 'Commercial spaces'],
      steps: ['Quarried & selected', 'Cut & finished', 'Checked & dispatched'], process: [['Quarry', 'Selected blocks'], ['Cut', 'Calibrated sizes'], ['Check', 'Every slab'], ['Pack', 'Safe dispatch']],
      seal: ['HAND', 'FINISHED'], coverLine: 'Quarried in Hadoti. We supply across India, with careful selection from start to finish.',
      promise: { title: ['Packed with care,', 'delivered on time.'], text: 'Every lot is checked before it leaves {district}. We pack it to arrive safely, and we tell you plainly what you are buying.' },
      care: [['Caring for it', 'Clean with a damp cloth and a mild cleaner. Seal natural finishes if needed.'], ['Breakage', 'Order 10-15% extra for cuts and breakage. Tell us within 7 days if a lot is not as described.'], ['Natural variation', 'Shade, veining and size vary naturally. Photos are indicative.']],
      note: 'Natural stone varies in shade, grain and size from piece to piece. Photos and samples are indicative.',
      formats: [['Paving', null], ['Step', '50 - 200 x 35 x 15 cm'], ['Kerbstone', '100 x 20 x 5 - 7 cm'], ['Walling', '20 - 40 x 20 x 10 / 15 cm'], ['Cobble / tumble', '10 x 10, 14 x 14, 20 x 20 cm'], ['Palisade', '230 x 50 x 5 - 7 cm']],
      patterns: ['Radial X', 'Diamond layout', 'Plus pattern', 'Single diagonal', 'Brick strips', 'Square grid']
    },
    'Sandstone': {
      key: 'sandstone', badge: 'Hand-carved', stone: true,
      tagline: ['Carved by hand, one cut at a time.', 'Warm stone with a story.', 'Cut, carved and finished to order.'],
      story: [['Carved in {district},', 'one cut at a time.'], ['A palace', 'in stone.'], ['Stone from', 'the earth.']],
      hero: [['Shaped by hand,', 'kept for ages.'], ['Fit for', 'a haveli.'], ['Grain, shade', 'and shadow.']],
      dense: [['Carved &', 'cut to order.'], ['The royal', 'collection.'], ['Gardens &', 'facades.']],
      edit: ['The Carved Edit', 'The Royal Edit', 'The Dune Edit'],
      values: [[['By hand', 'Cut and carved by craftsmen of {district}.'], ['Honestly told', 'Clear colour, size and price.'], ['With care', 'Packed and sent safely.']],
               [['Made to order', 'Send us a drawing or photo and we will quote.'], ['True colours', 'We show the stone as it is.'], ['Built to last', 'Strong stone for the weather.']]],
      why: ['Direct from the quarry', 'Skilled carving', 'Custom sizes and designs', 'Careful packing', 'Fair prices', 'On-time dispatch'],
      what: ['Facades and wall cladding', 'Jali screens and carvings', 'Pillars and arches', 'Garden and landscape pieces', 'Flooring and paving'],
      legacy: 'Built on generations of stone craft, {ent} stands for honest work and pieces that last.',
      isText: 'Sandstone is a natural stone formed from layers of sand pressed together over time. It comes in warm red, pink, beige and brown shades and is easy to carve, which is why it has long been used for palaces, temples and gardens.',
      understand: 'UNDERSTANDING SANDSTONE',
      benefits: [['shield', 'Strong & long lasting', 'A solid stone that stands up to sun, rain and daily use.'], ['leaf', 'Warm natural look', 'Natural shades and grain make every piece a little different.'], ['star', 'Easy to carve', 'Fine detail and jali work can be cut by hand to your design.']],
      fin: { title: ['Surface', 'Finishes'], intro: 'The surface finishes we offer. Tell us the look you want and we will suggest one.', items: [['Natural / cleft', 'The raw split face with a natural, textured look.'], ['Honed', 'Smooth matte surface with no shine.'], ['Sandblasted', 'Fine textured, matte surface with good grip.'], ['Hand-carved', 'Pattern and relief cut by hand.']] },
      finAll: [['Natural / Cleft', 'The raw split face with a natural, textured look.'], ['Sawn', 'Machine cut with a flat, even surface.'], ['Honed', 'Smooth matte surface with no shine.'], ['Brushed', 'Soft, aged feel with light texture.'], ['Flamed', 'Heat-treated for a rough, anti-slip finish.'], ['Tumbled', 'Softened edges and an antique look.'], ['Sandblasted', 'Fine textured, matte surface.'], ['Bush-hammered', 'Coarse textured surface for good grip.'], ['Polished', 'Glossy surface that shows the colour and grain.']],
      appsTitle: 'WHERE IT IS USED', apps: ['Facades & cladding', 'Jali screens', 'Pillars & carvings', 'Garden & landscape', 'Flooring & paving'],
      steps: ['Quarried & selected', 'Hand-carved', 'Finished & dispatched'], process: [['Quarry', 'Selected stone'], ['Carve', 'By hand'], ['Check', 'Every piece'], ['Pack', 'Safe dispatch']],
      seal: ['HAND', 'CARVED'], coverLine: 'Hand-carved stone, supplied across India with careful packing.',
      promise: { title: ['Packed with care,', 'sent on time.'], text: 'Every piece is checked before it leaves {district}. We pack it to arrive safely, and we tell you plainly what you are buying.' },
      care: [['Caring for it', 'Brush off dust and wash with water. Seal the surface if used outdoors.'], ['Breakage', 'Tell us within 7 days if a piece arrives damaged and we will make it right.'], ['Natural variation', 'Colour, grain and carving vary by piece. Photos are indicative.']],
      note: 'Natural stone varies in shade, grain and size from piece to piece. Photos and samples are indicative.',
      formats: [['Paving', null], ['Cobble / tumble', '10 x 10, 14 x 14, 20 x 20 cm'], ['Step', '50 - 200 x 35 x 15 cm'], ['Walling', '20 - 40 x 20 x 10 / 15 cm'], ['Kerbstone', '100 x 20 x 5 - 7 cm'], ['Palisade', '230 x 50 x 5 - 7 cm']],
      patterns: ['Floral jali', 'Diamond jali', 'Star pattern', 'Arch border', 'Lotus carving', 'Geometric grid']
    },
    'Garlic': {
      key: 'garlic', badge: 'Farm-direct',
      tagline: ['Fresh from the fields of {district}.', 'Honest farming, every season.', 'Graded, cleaned and packed with care.'],
      story: [['Grown in {district},', 'packed with care.'], ['From our fields,', 'to your table.'], ['Strong flavour,', 'honest farming.']],
      hero: [['Full of flavour,', 'full of freshness.'], ['Dried in the sun,', 'sorted by hand.'], ['Small bulbs,', 'big taste.']],
      dense: [['From field', 'to kitchen.'], ['Bulk &', 'retail.'], ['Our', 'range.']],
      edit: ['The Harvest Edit', 'The Golden Edit', 'The Orchid Edit'],
      values: [[['Farm fresh', 'Cured, cleaned and graded in {district}.'], ['Honestly told', 'Clear size, pack and price.'], ['With care', 'Packed to arrive dry and fresh.']],
               [['Direct from source', 'No middle layers between the farm and you.'], ['Graded', 'Sorted by bulb size for consistent lots.'], ['On time', 'We plan dispatch around your order.']]],
      why: ['Fresh, naturally cured stock', 'Graded by bulb size', 'Clean, ventilated packing', 'Direct from the farm', 'Steady supply in bulk', 'Clear price and MOQ'],
      what: ['Whole garlic bulbs', 'Peeled cloves', 'Dehydrated flakes and granules', 'Garlic powder', 'Bulk and retail packs'],
      legacy: 'Built on years of farming, {ent} stands for fresh produce, fair weight and honest prices.',
      isText: 'Garlic is a bulb crop grown for its strong flavour and aroma. After harvest the bulbs are dried (cured), cleaned and graded by size before packing, so they keep well and reach the buyer in good condition.',
      understand: 'UNDERSTANDING GARLIC',
      benefits: [['leaf', 'Naturally grown', 'Grown on the farm and sold as it is, with nothing added.'], ['shield', 'Graded quality', 'Sorted by bulb size so every bag is consistent.'], ['box', 'Packed to travel', 'Ventilated bags and cartons keep the bulbs dry in transit.']],
      fin: { title: ['Grades &', 'Types'], intro: 'The forms of garlic we supply. Ask us for the right pack and size for your use.', items: [['Whole bulbs', 'Dry, cured bulbs sorted by size.'], ['Peeled cloves', 'Cloves peeled and cleaned, ready to use.'], ['Flakes & granules', 'Dehydrated for a long shelf life.'], ['Powder', 'Finely ground for spice blends and food processing.']] },
      appsTitle: 'WHO USES IT', apps: ['Home kitchens', 'Restaurants & caterers', 'Pickles & spice blends', 'Food processors', 'Traders & mandi buyers'],
      steps: ['Harvested & cured', 'Cleaned & graded', 'Packed & dispatched'], process: [['Harvest', 'Fields of {district}'], ['Cure', 'Dried naturally'], ['Grade', 'By bulb size'], ['Pack', 'Mesh bags / cartons']],
      seal: ['FARM', 'FRESH'], coverLine: 'Fresh garlic, supplied across India in clean, ventilated packing.',
      promise: { title: ['Packed fresh,', 'sent with care.'], text: 'Every lot is checked before it leaves {district}. We pack it to arrive dry and fresh, and we tell you plainly what you are buying.' },
      care: [['Storing it', 'Keep in a cool, dry, airy place, away from moisture.'], ['Quality check', 'If a lot is not as described, tell us within 3 days of delivery.'], ['Honest samples', 'Photos show typical stock. Size and colour vary naturally by lot.']],
      note: 'Produce varies a little in size and colour from lot to lot. Photos are indicative.', formats: null
    }
  };

  const FALLBACK = 'Kota Stone';
  function packFor(info){
    const p = (info.product || '').toLowerCase();
    for (const k of Object.keys(PACKS)) if (p.includes(k.toLowerCase())) return [k, PACKS[k]];
    return [FALLBACK, PACKS[FALLBACK]];
  }

  // info: { ent, district, product }, ov: customer overrides { tagline, why[], what[], apps[], values[[t,x],..] }
  function getCopy(info, ov){
    ov = ov || {};
    const [name, P] = packFor(info), base = (info.ent || '') + '|' + (info.district || ''), sd = tag => hash(base + '#' + tag), D = info.district || 'your district', ent = info.ent || 'We';
    const T = s => TOKEN(s, D).replace(/\{ent\}/g, ent);
    const pair = a => [T(a[0]), T(a[1])];
    const vals = pick(P.values, sd('values')).map(v => [T(v[0]), T(v[1])]);
    const copy = {
      pack: name, key: P.key, stone: !!P.stone, badge: P.badge,
      tagline: ov.tagline || T(pick(P.tagline, sd('tagline'))),
      storyTitle: pair(pick(P.story, sd('story'))), heroTitle: pair(pick(P.hero, sd('hero'))), denseTitle: pair(pick(P.dense, sd('dense'))), editTitle: pick(P.edit, sd('edit')),
      titlePool: [].concat(P.story, P.hero, P.dense).map(pair),
      values: (ov.values && ov.values.length === 3) ? ov.values : vals,
      why: (ov.why && ov.why.length) ? ov.why : P.why, what: (ov.what && ov.what.length) ? ov.what : P.what,
      legacy: T(P.legacy), isText: P.isText, understand: P.understand, benefits: P.benefits,
      fin: P.fin, finAll: P.finAll || P.fin.items, appsTitle: P.appsTitle, apps: (ov.apps && ov.apps.length) ? ov.apps : P.apps,
      steps: P.steps, process: P.process.map(x => [T(x[0]), T(x[1])]), seal: P.seal, coverLine: P.coverLine,
      promise: { title: pair(P.promise.title), text: T(P.promise.text) }, care: P.care, note: P.note, formats: P.formats, patterns: P.patterns || null
    };
    return copy;
  }
  window.CONTENT = { getCopy, PACKS, hash };
  window.getCopy = getCopy;
})();
