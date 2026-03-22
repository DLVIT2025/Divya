const https = require('https');

async function getWikiImage(title) {
    return new Promise((resolve) => {
        const query = encodeURIComponent(title);
        const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${query}&prop=pageimages&format=json&pithumbsize=500&redirects=1`;
        https.get(url, { headers: { 'User-Agent': 'MovieAppBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const pages = parsed.query.pages;
                    const pageId = Object.keys(pages)[0];
                    if (pageId !== "-1" && pages[pageId] && pages[pageId].thumbnail) {
                        resolve(pages[pageId].thumbnail.source);
                    } else {
                        // try with " film"
                        const query2 = encodeURIComponent(title + " (film)");
                        const url2 = `https://en.wikipedia.org/w/api.php?action=query&titles=${query2}&prop=pageimages&format=json&pithumbsize=500&redirects=1`;
                        https.get(url2, { headers: { 'User-Agent': 'MovieAppBot/1.0' } }, (res2) => {
                            let data2 = '';
                            res2.on('data', chunk => data2 += chunk);
                            res2.on('end', () => {
                                const parsed2 = JSON.parse(data2);
                                const pages2 = parsed2.query.pages;
                                const pageId2 = Object.keys(pages2)[0];
                                if (pageId2 !== "-1" && pages2[pageId2] && pages2[pageId2].thumbnail) {
                                    resolve(pages2[pageId2].thumbnail.source);
                                } else {
                                    resolve(null);
                                }
                            });
                        });
                    }
                } catch(e) { resolve(null); }
            });
        });
    });
}

const movies = [
    "Kalki 2898 AD", "Dune: Part Two", "Devara: Part 1", "Guntur Kaaram", 
    "Fighter", "Leo", "Salaar: Part 1 – Ceasefire", 
    "Interstellar", "Captain Miller", "Oppenheimer", 
    "Jodhaa Akbar", "Premam", "Spider-Man: Across the Spider-Verse", 
    "Sita Ramam", "Dangal", "Bangalore Days", "RRR", "Bramayugam"
];

async function run() {
    const map = {};
    for (let title of movies) {
        let url = await getWikiImage(title);
        if(!url && title === "Fighter") url = await getWikiImage("Fighter (2024 film)");
        if(!url && title === "Leo") url = await getWikiImage("Leo (2023 Indian film)");
        if(!url && title === "Captain Miller") url = await getWikiImage("Captain Miller (film)");
        if(!url && title === "Premam") url = await getWikiImage("Premam");
        map[title] = url || "NOT_FOUND";
    }
    console.log(JSON.stringify(map, null, 2));
}

run();
