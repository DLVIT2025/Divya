import { db } from './js/firebase-service.js';
import { collection, getDocs, updateDoc, doc, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const movieUpdates = {
    "Leo": {
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f6/Leo_%282023_Indian_film%29.jpg",
        cast: [
            { name: "Vijay", img: "https://ui-avatars.com/api/?name=Vijay&background=random" },
            { name: "Sanjay Dutt", img: "https://ui-avatars.com/api/?name=Sanjay+Dutt&background=random" },
            { name: "Trisha", img: "https://ui-avatars.com/api/?name=Trisha&background=random" }
        ]
    },
    "Kalki 2898 AD": {
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg",
        cast: [
            { name: "Prabhas", img: "https://ui-avatars.com/api/?name=Prabhas&background=random" },
            { name: "Deepika Padukone", img: "https://ui-avatars.com/api/?name=Deepika+Padukone&background=random" },
            { name: "Amitabh Bachchan", img: "https://ui-avatars.com/api/?name=Amitabh+Bachchan&background=random" }
        ]
    },
    "Devara: Part 1": {
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/be/Devara_Part_1.jpg",
        cast: [
            { name: "NTR Jr.", img: "https://ui-avatars.com/api/?name=NTR+Jr&background=random" },
            { name: "Saif Ali Khan", img: "https://ui-avatars.com/api/?name=Saif+Ali+Khan&background=random" },
            { name: "Janhvi Kapoor", img: "https://ui-avatars.com/api/?name=Janhvi+Kapoor&background=random" }
        ]
    },
    "Dune: Part Two": {
        posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
        cast: [
            { name: "Timothée Chalamet", img: "https://ui-avatars.com/api/?name=Timothée+Chalamet&background=random" },
            { name: "Zendaya", img: "https://ui-avatars.com/api/?name=Zendaya&background=random" },
            { name: "Austin Butler", img: "https://ui-avatars.com/api/?name=Austin+Butler&background=random" }
        ]
    }
};

const updateMovies = async () => {
    console.log("Starting movie data update...");
    const querySnapshot = await getDocs(collection(db, "movies"));
    let updatedCount = 0;
    
    for (const d of querySnapshot.docs) {
        const data = d.data();
        const update = movieUpdates[data.title];
        if (update) {
            await updateDoc(doc(db, "movies", d.id), update);
            console.log(`Updated ${data.title}`);
            updatedCount++;
        }
    }
    
    // If some movies missing, add them
    for (const title in movieUpdates) {
        if (!querySnapshot.docs.find(d => d.data().title === title)) {
            await addDoc(collection(db, "movies"), { 
                title, 
                ...movieUpdates[title],
                language: "Multilingual",
                genre: "Action/Sci-Fi",
                duration: "2h 30m",
                rating: "8.5"
            });
            console.log(`Added missing movie: ${title}`);
        }
    }
    
    console.log("Movie update complete!");
    alert("Movie data updated! Please refresh the page.");
};

// Expose to window for easy calling from console or a temporary script tag
window.runMovieUpdate = updateMovies;
updateMovies();
