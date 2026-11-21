document.addEventListener("DOMContentLoaded", () => {
    renderFavorites();
    window.addEventListener("storage", event => {
        if (event.key === "recipeFavorites" || event.key === null) renderFavorites();
    });
});

function renderFavorites() {
    const grid = document.getElementById("favoritesGrid");
    const empty = document.getElementById("favoritesEmpty");
    const count = document.getElementById("favoritesCount");
    const recipes = getFavorites().filter(recipe => recipe?.idMeal && recipe.strMeal);

    empty.hidden = recipes.length > 0;
    grid.hidden = recipes.length === 0;
    count.textContent = recipes.length
        ? recipes.length + (recipes.length === 1 ? " saved recipe" : " saved recipes")
        : "";

    grid.replaceChildren(...recipes.map(makeFavoriteCard));
}

function makeFavoriteCard(recipe) {
    const card = document.createElement("article");
    card.className = "recipe-card";
    const imageArea = document.createElement("div");
    imageArea.className = "recipe-image";

    if (typeof recipe.strMealThumb === "string" && /^https?:\/\//i.test(recipe.strMealThumb)) {
        const image = document.createElement("img");
        image.src = recipe.strMealThumb;
        image.alt = "";
        image.loading = "lazy";
        imageArea.append(image);
    }

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "favorite-button is-favorite";
    remove.textContent = "♥";
    remove.setAttribute("aria-label", "Remove " + recipe.strMeal + " from favorites");
    remove.addEventListener("click", () => {
        const controls = [...document.querySelectorAll("#favoritesGrid .favorite-button")];
        const index = controls.indexOf(remove);
        const message = document.getElementById("favoritesMessage");
        try {
            const remaining = getFavorites().filter(item =>
                String(item?.idMeal) !== String(recipe.idMeal)
            );
            localStorage.setItem("recipeFavorites", JSON.stringify(remaining));
            renderFavorites();
            message.textContent = recipe.strMeal + " removed from favorites.";
            const next = document.querySelectorAll("#favoritesGrid .favorite-button");
            (next[Math.min(index, next.length - 1)]
                || document.querySelector("#favoritesEmpty a"))?.focus();
        } catch {
            message.textContent = "Your browser could not remove this favorite.";
        }
    });
    imageArea.append(remove);

    const info = document.createElement("div");
    info.className = "recipe-info";
    const category = document.createElement("span");
    category.className = "recipe-category";
    category.textContent = [recipe.strCategory, recipe.strArea].filter(Boolean).join(" · ") || "Recipe";

    const title = document.createElement("h3");
    title.textContent = recipe.strMeal;
    const bottom = document.createElement("div");
    bottom.className = "recipe-card-bottom";
    const details = document.createElement("a");
    details.href = "recipe-details.html?" + new URLSearchParams({id: recipe.idMeal});
    details.textContent = "View recipe";
    bottom.append(details);
    info.append(category, title, bottom);
    card.append(imageArea, info);
    return card;
}
