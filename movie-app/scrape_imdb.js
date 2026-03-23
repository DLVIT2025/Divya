const https = require('https');
const fs = require('fs');

const getImdbPoster = (title) => {
    return new Promise((resolve) => {
        const query = encodeURIComponent(title.toLowerCase());
        const url = `https://v3.sg.media-imdb.com/suggestion/x/${query}.json`;
        
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const match = parsed.d.find(item => item.i && item.i.imageUrl);
                    resolve(match ? match.i.imageUrl : null);
                } catch(e) { resolve(null); }
            });
        }).on('error', () => resolve(null));
    });
};

async function run() {
    const urls = {
        Aavesham: await getImdbPoster("Aavesham"),
        Gargi: await getImdbPoster("Gargi")
    };
    fs.writeFileSync('missing_imdb.json', JSON.stringify(urls, null, 2));
}

run();
