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

const missingMovies = [
    { title: "Aavesham", query: "Aavesham 2024" },
    { title: "Manjummel Boys", query: "Manjummel Boys" },
    { title: "Gargi", query: "Gargi Tamil" },
    { title: "Premam", query: "Premam 2015" }
];

async function run() {
    const map = {};
    for (let m of missingMovies) {
        let url = await getTMDBPoster(m.query);
        map[m.title] = url || "NOT_FOUND";
    }
    fs.writeFileSync('missing_results.json', JSON.stringify(map, null, 2));
}
run();
