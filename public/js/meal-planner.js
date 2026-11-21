document.addEventListener("DOMContentLoaded", () => {
    const byId = id => document.getElementById(id);
    const picker = byId("mealPicker");
    const types = ["Breakfast", "Lunch", "Dinner"];
    const storageKey = "recipeMealPlan";
    let offset = 0;
    let activeSlot;
    let pickedFrom;
    let searchVersion = 0;

    function readPlan() {
        try {
            const value = JSON.parse(localStorage.getItem(storageKey) || "{}");
            return value && typeof value === "object" && !Array.isArray(value) ? value : {};
        } catch {
            return {};
        }
    }

    function savePlan(plan) {
        try {
            localStorage.setItem(storageKey, JSON.stringify(plan));
            return true;
        } catch {
            return false;
        }
    }

    function weekDays() {
        const start = new Date();
        start.setHours(12, 0, 0, 0);
        start.setDate(start.getDate() - (start.getDay() + 6) % 7 + offset * 7);
        return Array.from({ length: 7 }, (_, index) => {
            const day = new Date(start);
            day.setDate(start.getDate() + index);
            return day;
        });
    }

    function dateKey(date) {
        return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
            .map(value => String(value).padStart(2, "0")).join("-");
    }

    function element(tag, text, className) {
        const node = document.createElement(tag);
        if (text) node.textContent = text;
        if (className) node.className = className;
        return node;
    }

    function button(text, action) {
        const control = element("button", text);
        control.type = "button";
        control.addEventListener("click", action);
        return control;
    }

    function render() {
        const days = weekDays();
        const plan = readPlan();
        const shortDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
        const completeDate = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
        const weekday = new Intl.DateTimeFormat("en", { weekday: "long" });
        const first = days[0].getFullYear() === days[6].getFullYear() ? shortDate : completeDate;
        byId("plannerWeek").textContent = first.format(days[0]) + " – " + completeDate.format(days[6]);

        const head = element("thead");
        const headers = element("tr");
        
        for (const date of days) {
            const th = element("th", weekday.format(date));
            th.scope = "col";
            th.append(element("small", shortDate.format(date)));
            headers.append(th);
        }
        head.append(headers);

        const body = element("tbody");
        for (const mealType of types) {
            const row = element("tr");
            for (const date of days) {
                const key = dateKey(date) + "/" + mealType;
                const recipe = plan[key];
                const hasRecipe = Boolean(recipe?.idMeal && recipe.strMeal);
                const cell = element("td");
                const card = element("div", "", "planner-slot");
                card.append(element("span", mealType, "planner-slot-type"));

                const context = weekday.format(date) + " · " + mealType;
                const choose = button(hasRecipe ? "↻" : "", () => openPicker(key, context, choose));
                choose.dataset.slot = key;
                choose.setAttribute("aria-label", (hasRecipe ? "Change recipe for " : "Add recipe for ") + context);
                if (hasRecipe) {
                    const preview = element("div", "", "planner-recipe");
                    if (/^https?:\/\//i.test(recipe.strMealThumb || "")) {
                        const image = element("img");
                        image.src = recipe.strMealThumb;
                        image.alt = "";
                        image.loading = "lazy";
                        preview.append(image);
                    }
                    const controls = element("div", "", "planner-slot-controls");
                    const remove = button("×", () => removeRecipe(key));
                    remove.setAttribute("aria-label", "Remove recipe from " + context);
                    controls.append(remove, choose);
                    const info = element("div", "", "planner-recipe-info");
                    const link = element("a", recipe.strMeal);
                    link.href = "recipe-details.html?" + new URLSearchParams({ id: recipe.idMeal });
                    info.append(link);
                    if (recipe.strCategory) info.append(element("small", recipe.strCategory));
                    preview.append(controls, info);
                    card.append(preview);
                } else {
                    choose.className = "planner-add";
                    const plus = element("span", "+", "planner-plus");
                    plus.setAttribute("aria-hidden", "true");
                    choose.append(plus, element("span", "Add recipe"));
                    card.append(choose);
                }
                cell.append(card);
                row.append(cell);
            }
            body.append(row);
        }
        byId("plannerTable").replaceChildren(head, body);
    }

    function focusSlot(key) {
        document.querySelector('[data-slot="' + key + '"]')?.focus();
    }

    function removeRecipe(key) {
        const plan = readPlan();
        delete plan[key];
        if (!savePlan(plan)) {
            byId("plannerStatus").textContent = "Unable to save your changes.";
            return;
        }
        render();
        focusSlot(key);
        byId("plannerStatus").textContent = "Meal removed.";
    }

    function openPicker(key, title, trigger) {
        searchVersion += 1;
        activeSlot = key;
        pickedFrom = trigger;
        byId("pickerHeading").textContent = "Add recipe to " + title;
        byId("mealSearchForm").reset();
        byId("pickerStatus").textContent = "Choose a favorite or search by recipe name.";
        showChoices(getFavorites());
        picker.showModal();
        byId("mealQuery").focus();
    }

    function showChoices(recipes) {
        const buttons = recipes.filter(recipe => recipe?.idMeal && recipe.strMeal).slice(0, 30)
            .map(recipe => button(recipe.strMeal, () => {
                const plan = readPlan();
                plan[activeSlot] = {
                    idMeal: recipe.idMeal,
                    strMeal: recipe.strMeal,
                    strMealThumb: recipe.strMealThumb,
                    strCategory: recipe.strCategory
                };
                if (!savePlan(plan)) {
                    byId("pickerStatus").textContent = "Unable to save your changes.";
                    return;
                }
                render();
                picker.close();
                byId("plannerStatus").textContent = recipe.strMeal + " added.";
            }));
        byId("mealChoices").replaceChildren(...buttons);
        return buttons.length;
    }

    byId("mealSearchForm").addEventListener("submit", async event => {
        event.preventDefault();
        const query = byId("mealQuery").value.trim();
        if (!query) return;
        const version = ++searchVersion;
        byId("mealChoices").replaceChildren();
        byId("pickerStatus").textContent = "Searching recipes…";
        try {
            const data = await searchRecipes(query);
            if (version !== searchVersion || !picker.open) return;
            byId("pickerStatus").textContent = showChoices(data.meals || []) ? "Choose a recipe." : "No recipes found.";
        } catch {
            if (version === searchVersion && picker.open) {
                byId("pickerStatus").textContent = "Unable to search recipes. Please try again.";
            }
        }
    });

    picker.addEventListener("close", () => {
        searchVersion += 1;
        if (pickedFrom?.isConnected) pickedFrom.focus();
        else if (activeSlot) focusSlot(activeSlot);
    });

    for (const [id, step] of [["previousWeek", -1], ["nextWeek", 1]]) {
        byId(id).addEventListener("click", () => {
            offset += step;
            byId("plannerStatus").textContent = "";
            render();
        });
    }

    byId("clearWeek").addEventListener("click", () => {
        const plan = readPlan();
        const dates = new Set(weekDays().map(dateKey));
        const keys = Object.keys(plan).filter(key => dates.has(key.split("/")[0]));
        if (!keys.length) {
            byId("plannerStatus").textContent = "This week is already empty.";
            return;
        }
        if (!window.confirm("Remove all meals from this week?")) return;
        keys.forEach(key => delete plan[key]);
        if (savePlan(plan)) {
            render();
            byId("plannerStatus").textContent = "Week cleared.";
        } else {
            byId("plannerStatus").textContent = "Unable to clear this week.";
        }
    });

    window.addEventListener("storage", event => {
        if (event.key === storageKey || event.key === null) render();
    });
    render();
});
