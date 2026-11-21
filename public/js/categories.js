const categoryDescriptions = {
    Pasta: "Twirl-worthy comfort, from classic to modern.",
    Seafood: "Fresh flavors inspired by the coast.",
    Breakfast: "Slow mornings and brighter starts.",
    Vegetarian: "Produce-led dishes full of character.",
    Dessert: "A little sweetness for every occasion.",
    Chicken: "Reliable favorites for the whole table.",
    Beef: "Rich, hearty recipes for sharing.",
    Starter: "Beautiful first bites and small plates."
};

const categoryPhotos = {
    Pasta: "wtsvxx1511296896.jpg",
    Seafood: "1549542994.jpg",
    Breakfast: "c400ok1764439058.jpg",
    Vegetarian: "tvtxpq1511464705.jpg",
    Dessert: "9kmyly1784660555.jpg",
    Chicken: "wvpsxx1468256321.jpg",
    Beef: "vussxq1511882648.jpg",
    Starter: "5jdtie1763289302.jpg"
};

document.addEventListener("DOMContentLoaded", loadCategoryCollection);

async function loadCategoryCollection() {
    const grid = document.getElementById("categoryCollectionGrid");
    const status = document.getElementById("categoryCollectionStatus");

    try {
        const data = await getCategories();
        const items = data?.categories?.category;
        const categories = Array.isArray(items) ? items : items ? [items] : [];
        const featuredOrder = Object.keys(categoryPhotos);
        const rank = name => {
            const index = featuredOrder.indexOf(name);
            return index === -1 ? featuredOrder.length : index;
        };

        categories
            .filter(category => category.name)
            .sort((left, right) => rank(left.name) - rank(right.name))
            .forEach(category => grid.append(buildCategoryTile(category)));

        status.textContent = grid.children.length ? "" : "No categories are available.";
    } catch {
        status.textContent = "Unable to load categories. Please refresh to try again.";
    } finally {
        grid.setAttribute("aria-busy", "false");
    }
}

function buildCategoryTile(category) {
    const link = document.createElement("a");
    link.className = "collection-tile";
    link.href = "recipes.html?" + new URLSearchParams({category: category.name});

    const photo = Object.hasOwn(categoryPhotos, category.name) && categoryPhotos[category.name];
    if (photo) {
        const image = document.createElement("img");
        image.src = "https://www.themealdb.com/images/media/meals/" + photo;
        image.alt = "";
        image.loading = "lazy";
        image.addEventListener("error", () => image.remove(), {once: true});
        link.append(image);
    }

    const content = document.createElement("div");
    content.className = "collection-tile-content";
    const title = document.createElement("h2");
    title.textContent = category.name;
    const description = document.createElement("p");
    description.textContent = Object.hasOwn(categoryDescriptions, category.name)
        ? categoryDescriptions[category.name]
        : category.description || "";
    const action = document.createElement("span");
    action.textContent = "Explore recipes";
    const arrow = document.createElement("span");
    arrow.setAttribute("aria-hidden", "true");
    arrow.textContent = " →";
    action.append(arrow);
    content.append(title, description, action);
    link.append(content);
    return link;
}
