// the GRYC's own photos (from its Wix site), named by what they show.
// Location photos live with each location in locations.ts.

export type Photo = { id: string; alt: string };

export const PHOTOS = {
    logo: {
        id: '26f0ca_216299b94b004eb48f9266ee8d923e65~mv2.png',
        alt: 'GRYC logo: children standing and sitting around a large black letter G'
    },
    familyArt: {
        id: '0632b7_abeb6277e89f42888e4967cfcf0c9230~mv2.png',
        alt: 'Two children hold up their paintings next to a parent at a family art night'
    },
    science: {
        id: '0632b7_daf2133e9583404eaa3c84e3d56a6f04~mv2.jpg',
        alt: 'A student in gloves pours a liquid that glows under UV light during a science activity'
    },
    facePaint: {
        id: '0632b7_c247d0360c584d4fbc0e374721ec4958~mv2.png',
        alt: 'A girl with a butterfly painted on her face makes a heart with her hands'
    },
    flowerShop: {
        id: '0632b7_1488505bc68d4d2e89198b52a8e29bf0~mv2.jpg',
        alt: 'A girl plays shopkeeper at a pretend flower shop'
    },
    seniorKnights: {
        id: '0632b7_3e276e11471b4885862c18e8d2e7bb5f~mv2.png',
        alt: 'Middle schoolers hold up hand-painted Senior Knights banners'
    },
    prekCrowns: {
        id: '0632b7_066bd135171f443bae7e5c1087610f5f~mv2.jpg',
        alt: 'Pre-K children in paper crowns at their table with their teacher'
    },
    prekClass: {
        id: '0632b7_5d9a29f0e902401e80d11ce6ca91240c~mv2.jpg',
        alt: 'Pre-K children at play in a Little Stars classroom'
    },
    craftBoy: {
        id: '0632b7_0e145cccfe954128be54b839be6f68d3~mv2.jpeg',
        alt: 'A boy in a yellow sweater shows off a craft he made at P.S. 153'
    },
    hawtreeGaming: {
        id: '0632b7_96a4b1e6b2504743ac6befe46f037777~mv2.png',
        alt: 'Hawtree Creek middle schoolers from the gaming club under the Home of the Panthers sign'
    },
    feeCrafts: {
        id: '5c6d8c_26f66f04ce0b4dbaa2fb3b5b167153a2~mv2.png',
        alt: 'Children work on crafts at a round table at P.S. 164'
    },
    paintedPlates: {
        id: '0632b7_85ff8a0087ab4d26be5329cc4ca1cac5~mv2.jpeg',
        alt: 'Students hold up the plates they painted, with their counselor'
    },
    staffGroup: {
        id: '0632b7_625cac53af04437398c902c5e6e2bba7~mv2.jpg',
        alt: 'GRYC staff in pink shirts gathered for a group photo'
    },
    syepStreet: {
        id: '0632b7_0966fb1fb2b54516bf8f494b9ea6e9e7~mv2.jpg',
        alt: 'Summer Youth Employment participants in green shirts on a Ridgewood street'
    },
    syepWagon: {
        id: '26f0ca_3dbc30a3f6144254ae5c2aead1823dfd~mv2.png',
        alt: 'SYEP service learning participants with a wagon of plants'
    },
    syepGarden: {
        id: '26f0ca_a5dc1b8caf0b459b97dddb484516fb82~mv2.jpg',
        alt: 'Service learning participants planting a community garden for an environmental justice project'
    },
    orangeShirts: {
        id: 'fab1f0_7c3921c16d2544a09ab82c752aa3eadb~mv2_d_5312_2988_s_4_2.jpg',
        alt: 'GRYC campers in orange shirts on a summer outing'
    },
    greenShirtsGroup: {
        id: '0632b7_9355ed4874b14a7081785af893ed4af0~mv2.png',
        alt: 'Students in matching green shirts with bags they packed for a community service project'
    },
    robotics: {
        id: '0632b7_f3269158cb9043eead82ce23168134d1~mv2.png',
        alt: 'Students build and program a robot on a laptop'
    },
    gym: {
        id: '0632b7_4e95daf523114c1d988c8dd529d57beb~mv2.png',
        alt: 'Children play a game in a school gym'
    },
    dycdLogo: {
        id: '0632b7_0f19313b5e034101a00b84217c687004~mv2.png',
        alt: 'NYC Department of Youth & Community Development'
    },
    doeLogo: {
        id: 'fab1f0_47e6b523c8934a07823ddeb66285ff26~mv2.png',
        alt: 'NYC Department of Education'
    }
} satisfies Record<string, Photo>;

/** flyers people read and save: shown whole, linked to the original */
export const FLYERS = {
    prekEnglish: { id: 'cbe18b_dd344f0a615a4b86be82a943ab892988~mv2.jpg', alt: 'Little Stars 3-K and Pre-K 2026–27 flyer in English' },
    prekSpanish: { id: 'cbe18b_a760e203843e4103abda3e52264dfc0f~mv2.jpg', alt: 'Little Stars 3-K and Pre-K 2026–27 flyer in Spanish' },
    syepTimeline: { id: 'cbe18b_4fd0f3ecd8174bb19aad401b23473f6e~mv2.jpg', alt: 'SYEP 2026 timeline' },
    syepEnglish: { id: 'cbe18b_cf681ed372b44dab8a0b8d73285538b7~mv2.jpg', alt: 'SYEP 2026 flyer in English' },
    syepSpanish: { id: 'cbe18b_9afd731bbe7b48e28530577535c88623~mv2.jpg', alt: 'SYEP 2026 flyer in Spanish' }
} satisfies Record<string, Photo>;

/** what a shared link shows */
export const SHARE_IMAGE = PHOTOS.familyArt;
