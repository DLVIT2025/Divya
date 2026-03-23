const https = require('https');
const fs = require('fs');

const fetchHTML = (url) => {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
};

const getTMDBPoster = async (title) => {
    try {
        const searchUrl = `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`;
        const searchHtml = await fetchHTML(searchUrl);
        const match = searchHtml.match(/href="(\/movie\/\d+[^"]*)"/);
        if (!match) return null;
        
        const movieUrl = `https://www.themoviedb.org${match[1]}`;
        const movieHtml = await fetchHTML(movieUrl);
        const imgMatch = movieHtml.match(/property="og:image" content="([^"]+)"/);
        
        if (imgMatch && imgMatch[1]) {
            return imgMatch[1];
        }
        return null;
    } catch(e) {
        return null;
    }
};

const movies = [
    "Kalki 2898 AD", "Dune: Part Two", "Devara: Part 1", "Guntur Kaaram", 
    "Fighter", "Leo", "Salaar: Part 1 - Ceasefire", 
    "Interstellar", "Captain Miller", "Oppenheimer", 
    "Jodhaa Akbar", "Premam", "Spider-Man: Across the Spider-Verse", 
    "Sita Ramam", "Dangal", "Bangalore Days", "RRR", "Bramayugam"
];

async function run() {
    const map = {};
    for (let m of movies) {
        const url = await getTMDBPoster(m);
        map[m] = url || "NOT_FOUND";
    }
    fs.writeFileSync('tmdb_results.json', JSON.stringify(map, null, 2));
}
run();
