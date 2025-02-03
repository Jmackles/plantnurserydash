const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CX = process.env.NEXT_PUBLIC_GOOGLE_CX;

export const fetchImageFromGoogle = async (query: string) => {
    try {
        const response = await fetch(`https://www.googleapis.com/customsearch/v1?q=${query}&cx=${GOOGLE_CX}&key=${GOOGLE_API_KEY}&searchType=image&num=1`);

        if (response.status === 429) {
            console.warn("Google API rate limit hit. Not updating image; waiting for user upload.");
            return null;
        }

        const data = await response.json();
        if (data.items && data.items.length > 0) {
            return data.items[0].link;
        }
    } catch (error) {
        console.error('Error fetching image from Google:', error);
    }
    return null;
};
