
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

const homeCategoryImages = {
    Chicken: "https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
    Dessert: "https://www.themealdb.com/images/media/meals/9kmyly1784660555.jpg",
    Seafood: "https://www.themealdb.com/images/media/meals/1549542994.jpg",
    Vegetarian: "https://www.themealdb.com/images/media/meals/tvtxpq1511464705.jpg",
    Pasta: "https://www.themealdb.com/images/media/meals/wtsvxx1511296896.jpg",
    Breakfast: "https://www.themealdb.com/images/media/meals/c400ok1764439058.jpg"
};

const homeCategories = ["Pasta", "Seafood", "Breakfast", "Vegetarian", "Dessert", "Chicken"];

const featuredRecipes = [
    ["52844", "Lasagne", "Pasta", "Italian"],
    ["52960", "Salmon Avocado Salad", "Seafood", "British"],
    ["53331", "Oatmeal pancakes", "Breakfast", "Venezuela"],
    ["52870", "Chickpea Fajitas", "Vegetarian", "Mexican"]
].map(([idMeal, strMeal, strCategory, strArea]) => ({
    idMeal,
    strMeal,
    strCategory,
    strArea,
    strMealThumb: homeCategoryImages[strCategory]
}));

// Show the Home cards immediately, then refresh them from the server.
async function loadHomeCategories() {
    const container = document.getElementById("categoryContainer");
    renderHomeCategories(container, homeCategories);

    if (location.protocol === "file:") return;

    try {
        const data = await getCategories();
        const raw = data?.categories?.category;
        const categories = Array.isArray(raw) ? raw : raw ? [raw] : [];
        const names = new Set(categories.map(category => category.name));
        const matches = homeCategories.filter(name => names.has(name));

        if (matches.length) {
            renderHomeCategories(container, matches);
        }
    } catch {
        // Keep the built-in Home cards visible if the XML endpoint is unavailable.
    }
}

function renderHomeCategories(container, names) {
    container.replaceChildren(...names.map(name => {
        const card = document.createElement("a");
        card.className = "category-card";
        card.href = `recipes.html?category=${encodeURIComponent(name)}`;

        const image = document.createElement("img");
        image.src = homeCategoryImages[name];
        image.alt = "";
        image.loading = "lazy";

        const title = document.createElement("h3");
        title.textContent = name;
        card.append(image, title);
        return card;
    }));
}

async function loadPopularRecipes() {
    const container = document.getElementById("popularRecipes");
    displayRecipes(featuredRecipes, container);

    if (location.protocol === "file:") return;

    const responses = await Promise.allSettled(
        featuredRecipes.map(recipe => getRecipeDetails(recipe.idMeal))
    );
    const recipes = responses.map((response, index) =>
        response.status === "fulfilled"
            ? response.value?.meals?.[0] ?? featuredRecipes[index]
            : featuredRecipes[index]
    );

    // Update the existing cards only when the user has not moved focus into them.
    if (!container.contains(document.activeElement)) {
        displayRecipes(recipes, container);
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
                        ${[recipe.strCategory, recipe.strArea].filter(Boolean).join(" · ") || "Recipe"}
                    </span>

                    <h3>${recipe.strMeal}</h3>

                    <div class="recipe-card-bottom">


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
        const meals = data.meals?.length
            ? data.meals
            : (await filterRecipesByIngredient(searchValue)).meals;
        displayRecipes(meals, container);

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

    button.disabled = true;
    button.textContent = "Finding a recipe...";

    try {
        const data = await getRandomRecipe();
        const recipe = data.meals[0];

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
        button.textContent = "Surprise me";
    }
}
