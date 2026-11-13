
const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

// Search recipes by name
async function searchRecipes(name) {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
    if (!response.ok) {
        throw new Error("Failed to search recipes");
    }
    return await response.json();
}

// Get recipe details by ID
async function getRecipeById(id) {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${encodeURIComponent(id)}`);
    if (!response.ok) {
        throw new Error("Failed to get recipe details");
    }
    return await response.json();
}

// Filter recipes by ingredient
async function filterByIngredient(ingredient) {
    const response = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    if (!response.ok) {
        throw new Error("Failed to filter recipes");
    }
    return await response.json();
}

// Get a random recipe
async function getRandomRecipe() {
    const response = await fetch(`${BASE_URL}/random.php`);
    if (!response.ok) {
        throw new Error("Failed to get a random recipe");
    }
    return await response.json();
}

module.exports = {
    searchRecipes,
    getRecipeById,
    filterByIngredient,
    getRandomRecipe
};
