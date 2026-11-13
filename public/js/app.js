
document.addEventListener("DOMContentLoaded", () => {
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");
        });
    }
});

// Get saved favorite recipes
function getFavorites() {
    return JSON.parse(localStorage.getItem("recipeFavorites")) || [];
}

// Save a recipe to favorites
function toggleFavorite(recipe) {
    let favorites = getFavorites();

    const exists = favorites.some(
        item => item.idMeal === recipe.idMeal
    );

    if (exists) {
        favorites = favorites.filter(
            item => item.idMeal !== recipe.idMeal
        );
    } else {
        favorites.push(recipe);
    }

    localStorage.setItem("recipeFavorites", JSON.stringify(favorites));

    return !exists;
}
