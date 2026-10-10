/**
 * Seeds the database with ORIGINAL sample songs (written for this project,
 * so no copyrighted lyrics are used). Also creates a demo admin account.
 * Run manually with `npm run seed`; server.js also calls seedIfEmpty().
 */
const bcrypt = require('bcryptjs');
const config = require('../src/config');

const SAMPLE_SONGS = [
  { title: 'Morning Chai', artist: 'Aarav Rhythm', album: 'Slow Sunrise', language: 'English', genre: 'Pop', year: 2024,
    lyrics: 'Steam rises from the cup,\nThe city is still waking up.\nOne sip and the world feels slow,\nMorning chai, let the good thoughts flow.\n\nWindow open, birds in tune,\nSunlight spilling across the room.\nNo rush, no race today,\nJust a warm cup to start the day.' },
  { title: 'Midnight Train', artist: 'Aarav Rhythm', album: 'Slow Sunrise', language: 'English', genre: 'Rock', year: 2024,
    lyrics: 'Wheels are humming on the track,\nThere is no turning back.\nLights blur past in silver rain,\nCarrying me to you again.\n\nMidnight train, take me home,\nThrough the dark I\'m not alone.' },
  { title: 'Barish Ke Baad', artist: 'Meera Sen', album: 'Monsoon Notes', language: 'Hindi', genre: 'Acoustic', year: 2023,
    lyrics: 'Barish ke baad ki woh khushboo,\nMitti mein ghuli teri baatein.\nChhat pe baithe hum dono,\nGinte rahe taaron ki raatein.\n\nBarish ke baad sab naya sa hai,\nDil mein ek nayi subah hai.' },
  { title: 'Chai Aur Tum', artist: 'Meera Sen', album: 'Monsoon Notes', language: 'Hindi', genre: 'Pop', year: 2023,
    lyrics: 'Ek pyaali chai aur tum,\nDoosri kuch maangta nahi main.\nShaam dhale aana yahan,\nBaaki sab kuch bhoolna hai.' },
  { title: 'Luna en el Mar', artist: 'Sofia Alba', album: 'Costa Brillante', language: 'Spanish', genre: 'Pop', year: 2022,
    lyrics: 'La luna baila sobre el mar,\nLas olas cantan sin parar.\nCamino descalza por la arena,\nY el viento me susurra una cadena de sueños.' },
  { title: 'Paper Boats', artist: 'The Lantern Club', album: 'Small Wonders', language: 'English', genre: 'Indie', year: 2021,
    lyrics: 'We folded dreams in paper boats,\nSet them sailing down the street.\nPuddles became oceans wide,\nAnd the rain was our fleet.\n\nIf they sink, we\'ll fold again,\nSmall hands, big plans.' },
  { title: 'Kadal Thira', artist: 'Anjali Menon', album: 'Kochi Evenings', language: 'Malayalam', genre: 'Folk', year: 2025,
    lyrics: 'Kadal thira paadunnu,\nVallam thaalam pidikkunnu.\nChinese valakal mele sandhya,\nKochi ente ormayude varna.' },
  { title: 'Concrete Garden', artist: 'The Lantern Club', album: 'Small Wonders', language: 'English', genre: 'Indie', year: 2021,
    lyrics: 'A weed pushes through the pavement crack,\nNo one planted it, no one looks back.\nBut it grows toward the light,\nStubborn, green, and just right.' },
];

async function seedIfEmpty(store) {
  if ((await store.countSongs()) > 0) return false;
  for (const s of SAMPLE_SONGS) await store.createSong(s);
  if (!(await store.findUserByEmail(config.adminEmail))) {
    await store.createUser({
      name: 'LyriFind Admin',
      email: config.adminEmail,
      passwordHash: await bcrypt.hash('Admin1234', config.bcryptRounds),
      role: 'admin',
    });
  }
  return true;
}

module.exports = { seedIfEmpty, SAMPLE_SONGS };

if (require.main === module) {
  (async () => {
    const { createStore } = require('../src/store');
    const store = await createStore();
    const seeded = await seedIfEmpty(store);
    console.log(seeded
      ? `Seeded ${SAMPLE_SONGS.length} songs. Demo admin: ${config.adminEmail} / Admin1234`
      : 'Database already has songs - nothing to do.');
    process.exit(0);
  })();
}
