
document.addEventListener("DOMContentLoaded", () => {
    const query = new URLSearchParams(window.location.search);
    const ingredientInput = document.getElementById("recipesIngredientInput");
    const fromIngredientLink = query.get("searchType") === "ingredient";
    const name = fromIngredientLink ? "" : query.get("name")?.trim() || "";
    const ingredient = query.get("ingredient")?.trim()
        || (fromIngredientLink ? query.get("name")?.trim() || "" : "");
    const category = query.get("category");

    document.getElementById("recipesSearchInput").value = name;
    ingredientInput.value = ingredient;
    if (fromIngredientLink) ingredientInput.focus({ preventScroll: true });
    loadRecipeCategories(category);
    loadInitialRecipes(category, name, ingredient, Boolean(name && !ingredient));

    const searchForm = document.getElementById("recipesSearchForm");
    const categoryFilter = document.getElementById("categoryFilter");
    const clearButton = document.getElementById("clearFilters");

    searchForm.addEventListener("submit", handleRecipesSearch);
    categoryFilter.addEventListener("change", filterDisplayedRecipes);
    clearButton.addEventListener("click", clearRecipeFilters);
    document.getElementById("recipeSort").addEventListener("change", () => {
        visibleLimit = recipesPerPage;
        if (document.getElementById("recipesContainer").getAttribute("aria-busy") !== "true") {
            displayPageRecipes(currentRecipes);
        }
    });
    document.getElementById("loadMoreRecipes").addEventListener("click", () => {
        visibleLimit += recipesPerPage;
        displayPageRecipes(currentRecipes);
    });
});

let currentRecipes = [];
const recipesPerPage = 8;
let visibleLimit = recipesPerPage;
let requestVersion = 0;

// Load categories from XML
async function loadRecipeCategories(selected) {
    const select = document.getElementById("categoryFilter");

    if (selected) {
        const option = document.createElement("option");
        option.value = selected;
        option.textContent = selected;
        select.appendChild(option);
        select.value = selected;
    }

    try {
        const data = await getCategories();

        let categories = data.categories.category;

        if (!Array.isArray(categories)) {
            categories = [categories];
        }

        categories.forEach(category => {
            if (category.name === selected) return;
            const option = document.createElement("option");

            option.value = category.name;
            option.textContent = category.name;

            select.appendChild(option);
        });

    } catch (error) {
        console.error("Unable to load categories:", error);
    }
}

async function loadRecommendedRecipes() {
    const categories = ["Pasta", "Seafood", "Breakfast", "Vegetarian", "Dessert", "Chicken"];
    const responses = await Promise.allSettled(categories.map(filterRecipesByCategory));
    const groups = responses.map((response, index) => {
        if (response.status !== "fulfilled") return [];
        return (response.value?.meals ?? []).map(meal => ({
            ...meal,
            strCategory: meal.strCategory || categories[index]
        }));
    });
    const meals = new Map();
    for (let index = 0; index < Math.max(...groups.map(group => group.length)); index += 1) {
        for (const group of groups) {
            const meal = group[index];
            if (meal && !meals.has(meal.idMeal)) meals.set(meal.idMeal, meal);
        }
    }
    return meals.size ? { meals: Array.from(meals.values()) } : searchRecipes("chicken");
}

async function loadInitialRecipes(category, name = "", ingredient = "", tryIngredient = false) {
    const version = ++requestVersion;
    visibleLimit = recipesPerPage;
    showRecipesMessage("Loading delicious recipes...");

    try {
        const [nameResults, ingredientResults, categoryResults] = await Promise.all([
            name ? searchRecipes(name) : undefined,
            ingredient ? filterRecipesByIngredient(ingredient) : undefined,
            category ? filterRecipesByCategory(category) : undefined
        ]);

        const groups = [];
        const term = [name, ingredient].filter(Boolean).join(" · ");
        if (name) {
            let matches = nameResults?.meals ?? [];
            if (tryIngredient && !matches.length) {
                matches = (await filterRecipesByIngredient(name)).meals ?? [];
                if (version === requestVersion) {
                    document.getElementById("recipesSearchInput").value = "";
                    document.getElementById("recipesIngredientInput").value = name;
                }
            }
            groups.push(matches);
        }
        if (ingredient) groups.push(ingredientResults?.meals ?? []);
        if (category) {
            groups.push((categoryResults?.meals ?? []).map(meal => ({
                ...meal, strCategory: meal.strCategory || category
            })));
        }

        let meals;
        if (groups.length) {
            const [first, ...rest] = groups;
            const ids = rest.map(group => new Set(group.map(meal => String(meal.idMeal))));
            meals = first.filter(meal => ids.every(group => group.has(String(meal.idMeal))));
        } else {
            meals = (await loadRecommendedRecipes()).meals ?? [];
        }
        if (version !== requestVersion) return;

        currentRecipes = meals;
        document.getElementById("recipesResultsTitle").textContent =
            term ? `Results for "${term}"` : category || "All recipes";
        displayPageRecipes(currentRecipes);
    } catch (error) {
        if (version === requestVersion) showRecipesError(error.message);
    }
}

function handleRecipesSearch(event) {
    event.preventDefault();
    return searchFromFields();
}

function searchFromFields() {
    const name = document.getElementById("recipesSearchInput").value.trim();
    const ingredient = document.getElementById("recipesIngredientInput").value.trim();
    const filter = document.getElementById("categoryFilter").value;
    return loadInitialRecipes(filter === "all" ? null : filter, name, ingredient);
}

function escapeRecipeText(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

function safeRecipeImage(value) {
    try {
        const url = new URL(value);
        return url.protocol === "https:" ? escapeRecipeText(url.href) : "";
    } catch {
        return "";
    }
}

// Display recipe cards
function displayPageRecipes(recipes) {
    const container = document.getElementById("recipesContainer");
    const count = document.getElementById("recipesCount");

    container.setAttribute("aria-busy", "false");
    document.getElementById("loadMoreRecipes").hidden = recipes.length <= visibleLimit;

    if (!recipes.length) {
        container.innerHTML = `
            <p class="empty-message">
                No recipes found. Try another search.
            </p>
        `;

        count.textContent = "0 recipes";
        document.getElementById("recipesProgress").textContent = "";
        return;
    }

    const favorites = getFavorites();

    const order = document.getElementById("recipeSort").value;
    const sorted = order === "recommended" ? recipes : [...recipes].sort((left, right) => {
        const direction = order === "name-desc" ? -1 : 1;
        return direction * (left.strMeal || "").localeCompare(right.strMeal || "");
    });
    const visible = sorted.slice(0, visibleLimit);
    document.getElementById("recipesProgress").textContent =
        `Showing ${visible.length} of ${recipes.length}`;

    container.innerHTML = visible.map(recipe => {
        const isFavorite = favorites.some(
            item => item.idMeal === recipe.idMeal
        );

        return `
            <article class="recipe-card">

                <div class="recipe-image">

                    <img
                        src="${safeRecipeImage(recipe.strMealThumb)}"
                        alt="${escapeRecipeText(recipe.strMeal || "Recipe")}"
                        loading="lazy"
                    >

                    <button
                        type="button"
                        class="favorite-button ${isFavorite ? "is-favorite" : ""}"
                        data-recipe-id="${escapeRecipeText(recipe.idMeal)}"
                        aria-pressed="${isFavorite}"
                        aria-label="Toggle favorite"
                    >
                        ♥
                    </button>

                </div>

                <div class="recipe-info">

                    <span class="recipe-category">
                        ${escapeRecipeText([recipe.strCategory, recipe.strArea].filter(Boolean).join(" · ") || "Recipe")}
                    </span>

                    <h3>${escapeRecipeText(recipe.strMeal)}</h3>

                    <div class="recipe-card-bottom">



                        <a href="recipe-details.html?id=${encodeURIComponent(recipe.idMeal)}">
                            View recipe →
                        </a>

                    </div>

                </div>

            </article>
        `;
    }).join("");

    count.textContent = recipes.length === 1 ? "1 recipe" : `${recipes.length} delicious recipes`;

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
                item => String(item.idMeal) === id
            );

            if (!recipe) return;

            const added = toggleFavorite(recipe);

            button.classList.toggle("is-favorite", added);
            button.setAttribute("aria-pressed", String(added));
        });
    });
}

function filterDisplayedRecipes() {
    return searchFromFields();
}

// Clear search and filters
function clearRecipeFilters() {
    document.getElementById("recipesSearchInput").value = "";
    document.getElementById("recipesIngredientInput").value = "";
    document.getElementById("categoryFilter").value = "all";
    document.getElementById("recipeSort").value = "recommended";

    document.getElementById("recipesResultsTitle").textContent =
        "All recipes";

    loadInitialRecipes();
}

// Loading message
function showRecipesMessage(message) {
    document.getElementById("recipesContainer").setAttribute("aria-busy", "true");
    document.getElementById("loadMoreRecipes").hidden = true;
    document.getElementById("recipesContainer").innerHTML = `
        <p class="loading-message">${message}</p>
    `;

    document.getElementById("recipesCount").textContent = "";
    document.getElementById("recipesProgress").textContent = "";
}

// Error message
function showRecipesError(message) {
    document.getElementById("recipesContainer").setAttribute("aria-busy", "false");
    document.getElementById("recipesContainer").innerHTML = `
        <p class="error-message">
            Unable to load recipes: ${escapeRecipeText(message)}
        </p>
    `;

    document.getElementById("recipesCount").textContent = "";
    document.getElementById("recipesProgress").textContent = "";
}
