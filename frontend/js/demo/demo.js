// Demo data for testing the catalogue design. Photos come from demo-photos.js (real photos, see CREDITS.md).
// Enter real enterprise details and the enterprise's own product photos for an actual catalogue.
(function () {
  const U = '₹';
  const KD = (k, i) => ({ kind: k, img: i });
  window.DEMO_SETS = [
    {
      district: 'Jhalawar', product: 'Kota Stone', ent: 'Jhalawar Kota Stone Industries', person: 'Hukam Singh', mobile: '9414123456', wa: '9414123456',
      email: 'jhalawarkotastone@example.com', addr: 'Industrial Area, Jhalawar, Rajasthan - 326001',
      desc: 'Natural Kota Stone from the Hadoti region, known for its durability, slip resistance and cool finish. Quarried and cut in our own unit, available in polished and natural finishes.',
      use: 'Flooring, wall cladding, landscaping, kitchen platforms', platform: 'wa', link: 'https://wa.me/919414123456',
      social: { ig: 'https://www.instagram.com/jhalawar_kotastone', fb: 'https://www.facebook.com/jhalawarkotastone', web: 'https://www.jhalawarkotastone.in' },
      variants: [
        { ...KD('kotaStone', 0), name: 'Semi-Polished Kota Stone Slab', size: '600 x 600 x 20 mm', material: 'Natural limestone, semi-polished', colour: 'Grey-blue', price: U + ' 45 - 70 / sq ft', moq: '500 sq ft' },
        { ...KD('kotaStone', 1), name: 'Natural Finish Kota Stone Tile', size: '600 x 600 mm', material: 'Natural limestone, honed', colour: 'Green-grey', price: U + ' 40 - 60 / sq ft', moq: '500 sq ft' },
        { ...KD('kotaStone', 2), name: 'Diamond-Cut Kota Stone', size: '600 x 900 mm', material: 'Kota stone, machine cut', colour: 'Light grey', price: U + ' 48 - 72 / sq ft', moq: '500 sq ft' },
        { ...KD('kotaStone', 3), name: 'Kota Stone Flooring Slab', size: '600 x 600 x 25 mm', material: 'Kota stone, semi-polished', colour: 'Grey-green', price: U + ' 42 - 65 / sq ft', moq: '500 sq ft' },
        { ...KD('kotaStone', 4), name: 'Lappato Finish Kota Stone', size: '600 x 600 x 20 mm', material: 'Kota stone, lappato', colour: 'Blue', price: U + ' 55 - 85 / sq ft', moq: '300 sq ft' }
      ]
    },
    {
      district: 'Baran', product: 'Garlic', ent: 'Baran Garlic Producers', person: 'Ramesh Meena', mobile: '9829012345', wa: '9829012345',
      email: 'barangarlic@example.com', addr: 'Krishi Mandi, Baran, Rajasthan - 325205',
      desc: 'Fresh, strong-flavoured garlic grown in the fertile soil of Baran. Carefully graded, cured and packed, available whole, in braids, in bulk and in dehydrated forms for kitchens and food processors.',
      use: 'Cooking, pickles, spice blends, food processing', platform: 'ig', link: 'https://www.instagram.com/baran_garlic_producers',
      social: { ig: 'https://www.instagram.com/baran_garlic_producers', fb: 'https://www.facebook.com/barangarlicproducers', yt: 'https://www.youtube.com/@barangarlic' },
      variants: [
        { ...KD('garlic', 0), name: 'Premium Whole Garlic Bulbs', size: '35 - 45 mm', material: 'Fresh, naturally cured', colour: 'White-cream', price: U + ' 80 - 140 / kg', moq: '100 kg' },
        { ...KD('garlic', 1), name: 'Purple Garlic Bulbs', size: '40 - 50 mm', material: 'Fresh, hand-graded', colour: 'Purple-striped', price: U + ' 90 - 150 / kg', moq: '100 kg' },
        { ...KD('garlic', 2), name: 'Garlic Display Pack (Loose)', size: '30 - 40 mm', material: 'Dry whole bulbs', colour: 'Natural white', price: U + ' 70 - 120 / kg', moq: '50 kg' },
        { ...KD('garlic', 3), name: 'Dehydrated Garlic Granules', size: '100 g / 500 g pack', material: 'Dehydrated, granulated', colour: 'Pale cream', price: U + ' 250 - 400 / kg', moq: '25 kg' },
        { ...KD('garlic', 4), name: 'Bulk Garlic Bag Pack', size: '25 kg bag', material: 'Mixed grade, dry bulbs', colour: 'White-pink', price: U + ' 65 - 110 / kg', moq: '500 kg' }
      ]
    },
    {
      district: 'Bundi', product: 'Sandstone', ent: 'Bundi Sandstone Arts', person: 'Mahesh Kumawat', mobile: '9414765432', wa: '9414765432',
      email: 'bundisandstone@example.com', addr: 'Kumhar Mohalla, Bundi, Rajasthan - 323001',
      desc: 'Hand-carved sandstone from Bundi, a town known for its stone craft. Our artisans produce jali panels, pillars, tiles and slabs in natural red, beige and pink stone.',
      use: 'Architecture, facades, gardens, temples, home decor', platform: 'wa', link: 'https://wa.me/919414765432',
      social: { ig: 'https://www.instagram.com/bundi_sandstone_arts', yt: 'https://www.youtube.com/@bundisandstonearts', web: 'https://www.bundisandstone.in' },
      variants: [
        { ...KD('sandstone', 0), name: 'Carved Jali Panel', size: '24 x 24 inch', material: 'Natural sandstone, hand-carved', colour: 'Cream white', price: U + ' 3,500 - 6,000', moq: '4 pcs' },
        { ...KD('sandstone', 1), name: 'Hand-carved Pillar', size: '4 ft height', material: 'Red sandstone, hand-carved', colour: 'Red', price: U + ' 9,000 - 15,000', moq: '2 pcs' },
        { ...KD('sandstone', 2), name: 'Red Sandstone Floor Tile', size: '12 x 12 inch', material: 'Honed sandstone', colour: 'Red & pink mix', price: U + ' 45 - 75 / sq ft', moq: '500 sq ft' },
        { ...KD('sandstone', 3), name: 'Pink Sandstone Slab', size: '24 x 24 x 1 inch', material: 'Natural sandstone, cut', colour: 'Pink', price: U + ' 55 - 90 / sq ft', moq: '300 sq ft' },
        { ...KD('sandstone', 4), name: 'Lattice Jaali Block', size: '12 x 12 x 3 inch', material: 'Sandstone, pierced', colour: 'Red-pink', price: U + ' 180 - 320 / pc', moq: '50 pcs' }
      ]
    },
    {
      district: 'Kota', product: 'Kota Doria', ent: 'Kota Doria Weavers House', person: 'Shabnam Ansari', mobile: '9928123456', wa: '9928123456',
      email: 'kotadoriaweavers@example.com', addr: 'Kaithoon, Kota, Rajasthan - 325003',
      desc: 'Authentic Kota Doria handwoven by the weavers of Kaithoon in cotton and silk. Light, breathable and finished with fine borders, available as sarees, suit sets and dress material.',
      use: 'Sarees, dupattas, suits, stoles, home textiles', platform: 'fb', link: 'https://www.facebook.com/kotadoriaweavershouse',
      social: { fb: 'https://www.facebook.com/kotadoriaweavershouse', ig: 'https://www.instagram.com/kotadoria_weavers', web: 'https://www.kotadoriaweavers.in' },
      variants: [
        { ...KD('kotaDoria', 0), name: 'Kota Doria Printed Saree', size: '5.5 m + 0.8 m blouse', material: 'Cotton-silk, handwoven', colour: 'Maroon & black', price: U + ' 2,200 - 4,500', moq: '5 pcs' },
        { ...KD('kotaDoria', 1), name: 'Kota Doria Suit Set', size: '2.5 m + 2.5 m + 2.2 m', material: 'Cotton-silk, handwoven', colour: 'Red & maroon', price: U + ' 1,400 - 2,600', moq: '6 sets' },
        { ...KD('kotaDoria', 2), name: 'Handloom Zari Saree', size: '5.5 m + 0.8 m blouse', material: 'Cotton-silk with zari', colour: 'Golden', price: U + ' 3,200 - 6,500', moq: '3 pcs' },
        { ...KD('kotaDoria', 3), name: 'Block Print Doria Fabric', size: '44 inch width', material: 'Cotton-silk', colour: 'Black & white', price: U + ' 380 - 650 / m', moq: '20 m' },
        { ...KD('kotaDoria', 4), name: 'Kota Doria Dress Material', size: '2.5 m per piece', material: 'Cotton-silk', colour: 'Coral red', price: U + ' 650 - 1,200', moq: '10 pcs' }
      ]
    }
  ];
  window.drawDemoPhoto = v => (window.DEMO_IMAGES && window.DEMO_IMAGES[v.kind] || [])[v.img] || '';
})();
