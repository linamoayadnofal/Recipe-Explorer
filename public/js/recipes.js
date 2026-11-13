
document.addEventListener("DOMContentLoaded", () => {
    loadRecipeCategories();
    loadInitialRecipes();

    const searchForm = document.getElementById("recipesSearchForm");
    const categoryFilter = document.getElementById("categoryFilter");
    const clearButton = document.getElementById("clearFilters");

    searchForm.addEventListener("submit", handleRecipesSearch);
    categoryFilter.addEventListener("change", filterDisplayedRecipes);
    clearButton.addEventListener("click", clearRecipeFilters);
});

let currentRecipes = [];

// Load categories from XML
async function loadRecipeCategories() {
    const select = document.getElementById("categoryFilter");

    try {
        const data = await getCategories();

        let categories = data.categories.category;

        if (!Array.isArray(categories)) {
            categories = [categories];
        }

        categories.forEach(category => {
            const option = document.createElement("option");

            option.value = category.name;
            option.textContent = category.name;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Unable to load categories:", error);
    }
}

// Load initial recipes
async function loadInitialRecipes() {
    showRecipesMessage("Loading delicious recipes...");

    try {
        const data = await searchRecipes("chicken");

        currentRecipes = data.meals || [];

        displayPageRecipes(currentRecipes);

        document.getElementById("recipesResultsTitle").textContent =
            "Discover recipes";

    } catch (error) {
        showRecipesError(error.message);
    }
}

// Search by recipe name or ingredient
async function handleRecipesSearch(event) {
    event.preventDefault();

    const input = document.getElementById("recipesSearchInput");
    const searchType = document.getElementById("searchType").value;

    const query = input.value.trim();

    if (!query) return;

    showRecipesMessage("Searching for recipes...");

    document.getElementById("recipesResultsTitle").textContent =
        `Results for "${query}"`;

    try {
        let data;

        if (searchType === "ingredient") {
            data = await filterRecipesByIngredient(query);
        } else {
            data = await searchRecipes(query);
        }

        currentRecipes = data.meals || [];

        document.getElementById("categoryFilter").value = "all";

        displayPageRecipes(currentRecipes);

    } catch (error) {
        showRecipesError(error.message);
    }
}

// Display recipe cards
function displayPageRecipes(recipes) {
    const container = document.getElementById("recipesContainer");
    const count = document.getElementById("recipesCount");

    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <p class="empty-message">
                No recipes found. Try another search.
            </p>
        `;

        count.textContent = "0 recipes";
        return;
    }

    const favorites = getFavorites();

    container.innerHTML = recipes.map(recipe => {
        const isFavorite = favorites.some(
            item => item.idMeal === recipe.idMeal
        );

        return `
            <article class="recipe-card">

                <div class="recipe-image">

                    <img
                        src="${recipe.strMealThumb || ""}"
                        alt="${recipe.strMeal || "Recipe"}"
                        loading="lazy"
                    >

                    <button
                        type="button"
                        class="favorite-button ${isFavorite ? "is-favorite" : ""}"
                        data-recipe-id="${recipe.idMeal}"
                        aria-label="Toggle favorite"
                    >
                        ♥
                    </button>

                </div>

                <div class="recipe-info">

                    <span class="recipe-category">
                        ${recipe.strCategory || "Delicious recipe"}
                    </span>

                    <h3>${recipe.strMeal}</h3>

                    <div class="recipe-card-bottom">

                        <span>Discover something delicious</span>

                        <a href="recipe-details.html?id=${recipe.idMeal}">
                            View recipe →
                        </a>

                    </div>

                </div>

            </article>
        `;
    }).join("");

    count.textContent = `${recipes.length} recipes`;

    attachFavoriteEvents(recipes);
}

// Favorite buttons
function attachFavoriteEvents(recipes) {
    const buttons = document.querySelectorAll(
        "#recipesContainer .favorite-button"
    );

    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const id = button.dataset.recipeId;

            const recipe = recipes.find(
                item => item.idMeal === id
            );

            if (!recipe) return;

            const added = toggleFavorite(recipe);

            button.classList.toggle("is-favorite", added);
        });
    });
}

// Filter currently displayed recipes by category
function filterDisplayedRecipes() {
    const selectedCategory =
        document.getElementById("categoryFilter").value;

    if (selectedCategory === "all") {
        displayPageRecipes(currentRecipes);
        return;
    }

    const filteredRecipes = currentRecipes.filter(recipe =>
        recipe.strCategory === selectedCategory
    );

    displayPageRecipes(filteredRecipes);

    document.getElementById("recipesResultsTitle").textContent =
        `${selectedCategory} recipes`;
}

// Clear search and filters
function clearRecipeFilters() {
    document.getElementById("recipesSearchInput").value = "";
    document.getElementById("searchType").value = "name";
    document.getElementById("categoryFilter").value = "all";

    document.getElementById("recipesResultsTitle").textContent =
        "Discover recipes";

    loadInitialRecipes();
}

// Loading message
function showRecipesMessage(message) {
    document.getElementById("recipesContainer").innerHTML = `
        <p class="loading-message">${message}</p>
    `;

    document.getElementById("recipesCount").textContent = "";
}

// Error message
function showRecipesError(message) {
    document.getElementById("recipesContainer").innerHTML = `
        <p class="error-message">
            Unable to load recipes: ${message}
        </p>
    `;

    document.getElementById("recipesCount").textContent = "";
}
