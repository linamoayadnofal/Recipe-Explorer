const BASE_URL = "https://serpapi.com/search.json";

async function searchGoogle(query) {
    const apiKey = process.env.SERPAPI_KEY;

    if (!apiKey) {
        throw new Error("SerpAPI key is missing");
    }

    const params = new URLSearchParams({
        engine: "google",
        q: query,
        api_key: apiKey,
        google_domain: "google.com",
        hl: "en",
        gl: "us"
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);

    const data = await response.json();

    if (!response.ok || data.error) {
        throw new Error(data.error || "SerpAPI search failed");
    }

    return data;
}

module.exports = { searchGoogle };