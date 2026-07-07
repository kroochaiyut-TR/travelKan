const questions = [
  {
    q: "When was Thai paper mill factory built?",
    options: ["1933-1937", "1934-1938"],
    answer: 0,
    reward: 1000
  },
  {
    q: "Who built Thai paper mill factory?",
    options: ["General Phraya Phahon Phonphayuhayadtha", "General Phraya Phahon Phonphayuhasena"],
    answer: 1,
    reward: 400
  },
  {
    q: "Where was the railway begin?",
    options: ["Nongpladuk station", "Nongplalai station"],
    answer: 0,
    reward: 300
  },
  {
    q: "When was the bridge over the River Kwai finished?",
    options: ["October 2486", "October 2488"],
    answer: 0,
    reward: 550
  },
  {
    q: "How far did the total railway from Thailand to Burma?",
    options: ["417 km.", "415 km."],
    answer: 1,
    reward: 400
  },
  {
    q: "What is the old name of Thai paper mill factory in Kanchanaburi?",
    options: ["The Royal Thai army", "The Royal Army"],
    answer: 0,
    reward: 100
  },
  {
    q: "Where did the Japanese need to build the railway to?",
    options: ["Burmese", "Burma"],
    answer: 1,
    reward: 300
  },
  {
    q: "Which name the railway is called?",
    options: ["The Death street", "The Death railway"],
    answer: 1,
    reward: 820
  },
  {
    q: "Where did the prisoners of war comprised?",
    options: ["British, Australia, Canada, Holland", "British, Australia, Dutch, American"],
    answer: 1,
    reward: 1000
  },
  {
    q: "Where was the first Thai Paper mill factory?",
    options: ["Samsen, Bangkok", "Samsen, Phetburi"],
    answer: 0,
    reward: 220
  },
  {
    q: "After the war was over, which country sold the railway to Thai government?",
    options: ["British government", "America government"],
    answer: 0,
    reward: 600
  },
  {
    q: "Where was the Bridge over the River Kwai located?",
    options: ["Thamakham, Kanchanaburi", "Thamaka, Kanchanaburi"],
    answer: 0,
    reward: 450
  },
  {
    q: "How was the prisoners transported to Banpong station?",
    options: ["tractor", "train"],
    answer: 1,
    reward: 1000
  },
  {
    q: "Who was owned and operated Thai paper mill in Kanchanaburi?",
    options: ["Royal Thai Paper Army", "Royal Thai paper mill"],
    answer: 0,
    reward: 250
  },
  {
    q: "When did the official opening date of the railway?",
    options: ["28 October 1943", "28 November 1943"],
    answer: 1,
    reward: 150
  },
  {
    q: "Why did Thai paper mill in Kanchanaburi closed?",
    options: ["The contract was ended.", "Shut down"],
    answer: 0,
    reward: 300
  },
  {
    q: "Who damages the Bridge over the River Kwai by bombing it?",
    options: ["America", "Allied"],
    answer: 1,
    reward: 500
  },
  {
    q: "How long of the construction time of the bridge?",
    options: ["6 months", "8 months"],
    answer: 0,
    reward: 250
  },
  {
    q: "How long did Thai paper mill build until now?",
    options: ["96 years", "93 years"],
    answer: 1,
    reward: 200
  },
  {
    q: "Which country took the prisoners built the railway?",
    options: ["America", "Japan"],
    answer: 1,
    reward: 1000
  }
];

const bonusImages = [
  { file: 'river_kwai_bridge.png', name: 'River Kwai Bridge' },
  { file: 'erawan_waterfall.png', name: 'Erawan Waterfall' },
  { file: 'hellfire_pass.png', name: 'Hellfire Pass' },
  { file: 'krasae_cave.png', name: 'Krasae Cave' },
  { file: 'sai_yok_noi.png', name: 'Sai Yok Noi Waterfall' },
  { file: 'safari_park.png', name: 'Safari Park Kanchanaburi' },
  { file: 'mon_bridge.png', name: 'Mon Bridge' },
  { file: 'mallika_town.png', name: 'Mallika R.E.124' },
  { file: 'erawan_park.png', name: 'Erawan National Park' },
  { file: 'wat_tham_suea.png', name: 'Wat Tham Suea' }
];

const randomBonuses = [
  { text: "Good luck you get +500 baht", value: 500 },
  { text: "Good luck you get +200 baht", value: 200 },
  { text: "Good luck you get +20 baht", value: 20 },
  { text: "Bad luck you lose -300 baht", value: -300 },
  { text: "Bad luck you lose -150 baht", value: -150 },
  { text: "Bad luck you lose -100 baht", value: -100 },
  { text: "Go back to start", value: 'START' }
];

// Board configuration 
// 32 squares: 1 Start, 1 Lose Turn, 5 Picture Bonus, 2 Random Bonus, 20 Questions, 3 Safe
const boardConfig = [
  { type: 'START', label: 'START' }, // 0
  { type: 'QUESTION', qIndex: 0 },
  { type: 'QUESTION', qIndex: 1 },
  { type: 'BONUS_PIC' },
  { type: 'QUESTION', qIndex: 2 },
  { type: 'QUESTION', qIndex: 3 },
  { type: 'RANDOM_BONUS' },
  { type: 'QUESTION', qIndex: 4 },
  { type: 'QUESTION', qIndex: 5 }, // 8 (Corner)
  
  { type: 'RANDOM_BONUS' },
  { type: 'QUESTION', qIndex: 6 },
  { type: 'QUESTION', qIndex: 7 },
  { type: 'BONUS_PIC' },
  { type: 'QUESTION', qIndex: 8 },
  { type: 'QUESTION', qIndex: 9 },
  { type: 'LOSE_TURN', label: 'Skip Turn' }, // 16 (Corner)
  
  { type: 'QUESTION', qIndex: 10 },
  { type: 'QUESTION', qIndex: 11 },
  { type: 'BONUS_PIC' },
  { type: 'QUESTION', qIndex: 12 },
  { type: 'SAFE', label: 'Safe Zone' },
  { type: 'QUESTION', qIndex: 13 },
  { type: 'QUESTION', qIndex: 14 },
  { type: 'RANDOM_BONUS' }, // 24 (Corner)
  
  { type: 'QUESTION', qIndex: 15 },
  { type: 'BONUS_PIC' },
  { type: 'QUESTION', qIndex: 16 },
  { type: 'QUESTION', qIndex: 17 },
  { type: 'RANDOM_BONUS' },
  { type: 'QUESTION', qIndex: 18 },
  { type: 'BONUS_PIC' },
  { type: 'QUESTION', qIndex: 19 } // 31
];
