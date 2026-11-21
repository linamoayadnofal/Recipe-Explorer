document.addEventListener("DOMContentLoaded", loadRecipeDetails);

async function loadRecipeDetails() {
    const status = document.getElementById("recipeDetailStatus");
    const id = new URLSearchParams(window.location.search).get("id");

    if (!id || !/^\d+$/.test(id)) {
        status.textContent = "Choose a recipe from the Recipes page.";
        return;
    }

    try {
        const data = await getRecipeDetails(id);
        const meal = data.meals?.[0];

        if (!meal) {
            status.textContent = "Recipe not found.";
            return;
        }

        document.title = meal.strMeal + " | Recipe Explorer";
        document.getElementById("detailName").textContent = meal.strMeal;
        document.getElementById("detailCategory").textContent =
            [meal.strCategory, meal.strArea].filter(Boolean).join(" · ");

        const image = document.getElementById("detailImage");
        const imageUrl = recipeDetailURL(meal.strMealThumb);
        if (imageUrl) {
            image.src = imageUrl;
            image.alt = meal.strMeal;
            image.hidden = false;
        }

        const ingredients = document.getElementById("detailIngredients");
        for (let index = 1; index <= 20; index += 1) {
            const ingredient = meal["strIngredient" + index]?.trim();
            if (!ingredient) continue;
            const item = document.createElement("li");
            const amount = meal["strMeasure" + index]?.trim();
            const label = document.createElement("label");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            const name = document.createElement("span");
            name.textContent = ingredient;
            const measure = document.createElement("span");
            measure.className = "detail-measure";
            measure.textContent = amount || "";
            label.append(checkbox, name, measure);
            item.append(label);
            ingredients.append(item);
        }
        const ingredientCount = ingredients.children.length;
        if (!ingredientCount) {
            const item = document.createElement("li");
            item.textContent = "No ingredients provided.";
            ingredients.append(item);
        } else {
            document.getElementById("detailSummary").textContent =
                ingredientCount + (ingredientCount === 1 ? " ingredient" : " ingredients");
        }

        const instructions = document.getElementById("detailInstructions");
        const steps = (meal.strInstructions || "").split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        for (const step of steps.length ? steps : ["No cooking instructions provided."]) {
            const item = document.createElement("li");
            const text = document.createElement("p");
            text.textContent = step;
            item.append(text);
            instructions.append(item);
        }

        for (const [id, value] of [["detailSource", meal.strSource], ["detailVideo", meal.strYoutube]]) {
            const url = recipeDetailURL(value);
            if (url) {
                const link = document.getElementById(id);
                link.href = url;
                link.hidden = false;
            }
        }

        const favorite = document.getElementById("detailFavorite");
        function updateFavorite(saved) {
            favorite.textContent = saved ? "Remove from favorites" : "Save to favorites";
            favorite.setAttribute("aria-pressed", String(saved));
        }
        updateFavorite(getFavorites().some(item => item.idMeal === meal.idMeal));
        favorite.addEventListener("click", () => {
            try {
                updateFavorite(toggleFavorite(meal));
            } catch {
                status.textContent = "Your browser could not save the favorite.";
            }
        });

        status.textContent = "";
        document.getElementById("recipeDetail").hidden = false;
    } catch {
        status.textContent = "Unable to load this recipe. Please try again.";
    }
}

function recipeDetailURL(value) {
    try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : "";
    } catch {
        return "";
    }
}
