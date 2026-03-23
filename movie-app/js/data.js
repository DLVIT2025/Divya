import { db } from './firebase-service.js';
import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc,
    doc,
    arrayUnion,
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// We'll keep a local cache for performance
let movies = [];
let shows = [];

export const fetchMovies = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "movies"));
        movies = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return movies;
    } catch (error) {
        console.error("Error fetching movies:", error);
        return [];
    }
};

export const fetchShows = async (movieName) => {
    try {
        const q = query(collection(db, "shows"), where("movieName", "==", movieName));
        const querySnapshot = await getDocs(q);
        shows = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return shows;
    } catch (error) {
        console.error("Error fetching shows:", error);
        return [];
    }
};

export const fetchAllBookings = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "bookings"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        return [];
    }
};

export const fetchUserBookings = async (userName) => {
    try {
        const q = query(collection(db, "bookings"), where("userName", "==", userName));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching user bookings:", error);
        return [];
    }
};

export const createBooking = async (bookingData) => {
    try {
        const docRef = await addDoc(collection(db, "bookings"), {
            ...bookingData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating booking:", error);
        return { success: false, error };
    }
};

// Seed initial data if needed (Helper for user to populate database)
export const seedInitialData = async () => {
    const existingMovies = await fetchMovies();
    if (existingMovies.length === 0) {
        const initialMovies = [
            { 
                title: "Leo", 
                language: "Tamil", 
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/f/f6/Leo_%282023_Indian_film%29.jpg",
                genre: "Action/Thriller",
                duration: "2h 44m",
                rating: "8.5",
                cast: [
                    { name: "Vijay", img: "https://ui-avatars.com/api/?name=Vijay&background=random" },
                    { name: "Sanjay Dutt", img: "https://ui-avatars.com/api/?name=Sanjay+Dutt&background=random" },
                    { name: "Trisha", img: "https://ui-avatars.com/api/?name=Trisha&background=random" }
                ]
            },
            { 
                title: "Kalki 2898 AD", 
                language: "Telugu", 
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg",
                genre: "Sci-Fi/Epic",
                duration: "3h 10m",
                rating: "9.0",
                cast: [
                    { name: "Prabhas", img: "https://ui-avatars.com/api/?name=Prabhas&background=random" },
                    { name: "Deepika Padukone", img: "https://ui-avatars.com/api/?name=Deepika+Padukone&background=random" },
                    { name: "Amitabh Bachchan", img: "https://ui-avatars.com/api/?name=Amitabh+Bachchan&background=random" }
                ]
            },
            { 
                title: "Devara: Part 1", 
                language: "Telugu", 
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/b/be/Devara_Part_1.jpg",
                genre: "Action/Drama",
                duration: "2h 58m",
                rating: "8.8",
                cast: [
                    { name: "NTR Jr.", img: "https://ui-avatars.com/api/?name=NTR+Jr&background=random" },
                    { name: "Saif Ali Khan", img: "https://ui-avatars.com/api/?name=Saif+Ali+Khan&background=random" },
                    { name: "Janhvi Kapoor", img: "https://ui-avatars.com/api/?name=Janhvi+Kapoor&background=random" }
                ]
            },
            { 
                title: "Dune: Part Two", 
                language: "English", 
                posterUrl: "https://upload.wikimedia.org/wikipedia/en/5/52/Dune_Part_Two_poster.jpeg",
                genre: "Sci-Fi/Adventure",
                duration: "2h 46m",
                rating: "9.2",
                cast: [
                    { name: "Timothée Chalamet", img: "https://ui-avatars.com/api/?name=Timothée+Chalamet&background=random" },
                    { name: "Zendaya", img: "https://ui-avatars.com/api/?name=Zendaya&background=random" },
                    { name: "Austin Butler", img: "https://ui-avatars.com/api/?name=Austin+Butler&background=random" }
                ]
            }
        ];
        for (const m of initialMovies) {
            const docRef = await addDoc(collection(db, "movies"), m);
            // Add some dummy shows for each movie
            await addDoc(collection(db, "shows"), { movieName: m.title, showTime: "6:00 PM", price: 200 });
            await addDoc(collection(db, "shows"), { movieName: m.title, showTime: "9:30 PM", price: 250 });
        }
        return true;
    }
    return false;
};

// Maintain original export name for compatibility where possible
export const moviesData = movies;

// --- COMMUNITY / CLUBS ---

export const fetchClubs = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "clubs"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching clubs:", error);
        return [];
    }
};

export const createClub = async (clubData) => {
    try {
        const docRef = await addDoc(collection(db, "clubs"), {
            ...clubData,
            members: [clubData.createdBy], // Creator joins automatically
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating club:", error);
        return { success: false, error };
    }
};

export const joinClub = async (clubId, userId) => {
    try {
        const clubRef = doc(db, "clubs", clubId);
        await updateDoc(clubRef, {
            members: arrayUnion(userId)
        });
        return { success: true };
    } catch (error) {
        console.error("Error joining club:", error);
        return { success: false, error };
    }
};

// --- CHAT / POSTS ---

export const fetchPosts = async (clubId) => {
    try {
        const q = query(
            collection(db, "posts"), 
            where("clubId", "==", clubId)
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching posts:", error);
        return [];
    }
};

export const createPost = async (postData) => {
    try {
        const docRef = await addDoc(collection(db, "posts"), {
            ...postData,
            createdAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error creating post:", error);
        return { success: false, error };
    }
};
