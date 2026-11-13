
document.addEventListener("DOMContentLoaded", () => {
    loadHomeCategories();
    loadPopularRecipes();

    const searchForm = document.getElementById("searchForm");
    const randomButton = document.getElementById("randomRecipeBtn");

    if (searchForm) {
        searchForm.addEventListener("submit", handleRecipeSearch);
    }

    if (randomButton) {
        randomButton.addEventListener("click", loadRandomRecipe);
    }
});

// Category icons
const categoryIcons = {
    Beef: "🥩",
    Chicken: "🍗",
    Dessert: "🍰",
    Seafood: "🐟",
    Vegetarian: "🥑",
    Pasta: "🍝",
    Starter: "🥗",
    Side: "🥔",
    Vegan: "🥬",
    Miscellaneous: "🍽️"
};

// Load categories from XML through the backend
async function loadHomeCategories() {
    const container = document.getElementById("categoryContainer");

    try {
        const data = await getCategories();

        let categories = data.categories.category;

        if (!Array.isArray(categories)) {
            categories = [categories];
        }

        container.innerHTML = categories.map(category => {
            const name = category.name;
            const icon = categoryIcons[name] || "🍴";

            return `
                <a href="categories.html?category=${encodeURIComponent(name)}"
                   class="category-card">

                    <div class="category-icon">${icon}</div>

                    <h3>${name}</h3>

                    <p>${category.description}</p>
                </a>
            `;
        }).join("");

    } catch (error) {
        container.innerHTML = `
            <p class="error-message">
                Unable to load categories. Please try again.
            </p>
        `;
    }
}

// Load popular recipes
async function loadPopularRecipes() {
    const container = document.getElementById("popularRecipes");

    try {
        const data = await searchRecipes("chicken");

        if (!data.meals) {
            container.innerHTML = `
                <p class="empty-message">No recipes found.</p>
            `;
            return;
        }

        displayRecipes(data.meals.slice(0, 6), container);

    } catch (error) {
        container.innerHTML = `
            <p class="error-message">
                Unable to load recipes. Please try again.
            </p>
        `;
    }
}

// Display recipe cards
function displayRecipes(recipes, container) {
    if (!recipes || recipes.length === 0) {
        container.innerHTML = `
            <p class="empty-message">No recipes found.</p>
        `;
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
                        src="${recipe.strMealThumb}"
                        alt="${recipe.strMeal}"
                        loading="lazy"
                    >

                    <button
                        class="favorite-button ${isFavorite ? "is-favorite" : ""}"
                        data-recipe-id="${recipe.idMeal}"
                        aria-label="Toggle favorite"
                    >
                        ♥
                    </button>
                </div>

                <div class="recipe-info">

                    <span class="recipe-category">
                        ${recipe.strCategory || "Recipe"}
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

    container.querySelectorAll(".favorite-button").forEach(button => {
        button.addEventListener("click", async () => {
            const id = button.dataset.recipeId;

            const recipe = recipes.find(
                item => item.idMeal === id
            );

            const added = toggleFavorite(recipe);

            button.classList.toggle("is-favorite", added);
        });
    });
}

// Search recipes
async function handleRecipeSearch(event) {
    event.preventDefault();

    const input = document.getElementById("searchInput");
    const searchValue = input.value.trim();

    if (!searchValue) return;

    const section = document.getElementById("searchResultsSection");
    const title = document.getElementById("searchResultsTitle");
    const container = document.getElementById("searchResults");

    section.classList.remove("hidden");
    title.textContent = `Results for "${searchValue}"`;
    container.innerHTML = `<p class="loading-message">Searching recipes...</p>`;

    section.scrollIntoView({ behavior: "smooth" });

    try {
        const data = await searchRecipes(searchValue);
        displayRecipes(data.meals, container);

    } catch (error) {
        container.innerHTML = `
            <p class="error-message">
                Something went wrong. Please try again.
            </p>
        `;
    }
}

// Load a random recipe
async function loadRandomRecipe() {
    const button = document.getElementById("randomRecipeBtn");
    const image = document.getElementById("randomRecipeImage");

    button.disabled = true;
    button.textContent = "Finding a recipe...";

    try {
        const data = await getRandomRecipe();
        const recipe = data.meals[0];

        image.src = recipe.strMealThumb;
        image.alt = recipe.strMeal;

        const section = document.getElementById("searchResultsSection");
        const title = document.getElementById("searchResultsTitle");
        const container = document.getElementById("searchResults");

        section.classList.remove("hidden");
        title.textContent = "Your surprise recipe";

        displayRecipes([recipe], container);

        section.scrollIntoView({ behavior: "smooth" });

    } catch (error) {
        alert("Unable to find a random recipe. Please try again.");
    } finally {
        button.disabled = false;
        button.innerHTML = 'Surprise me <span>→</span>';
    }
}
