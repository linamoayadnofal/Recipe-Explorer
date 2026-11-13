
const API_BASE = "/api";

async function apiRequest(endpoint) {
    const response = await fetch(`${API_BASE}${endpoint}`);

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Unable to connect to the server."
        );
    }

    return data;
}

// Search recipes by name
async function searchRecipes(name) {
    return await apiRequest(
        `/recipes/search?name=${encodeURIComponent(name)}`
    );
}

// Get recipe details by ID
async function getRecipeDetails(id) {
    return await apiRequest(
        `/recipes/${encodeURIComponent(id)}`
    );
}

// Get a random recipe
async function getRandomRecipe() {
    return await apiRequest("/recipes/random");
}

// Get categories from XML
async function getCategories() {
    return await apiRequest("/categories");
}

// Filter recipes by ingredient
async function filterRecipesByIngredient(ingredient) {
    return await apiRequest(
        `/recipes/ingredient/${encodeURIComponent(ingredient)}`
    );
}

// Search Google through SerpAPI
async function searchGoogle(query) {
    return await apiRequest(
        `/google/search?q=${encodeURIComponent(query)}`
    );
}

