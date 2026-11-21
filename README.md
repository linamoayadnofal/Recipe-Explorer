# 🍽️ Recipe Explorer

**Discover recipes, explore ingredients, and find inspiration for your next meal.**

Recipe Explorer is a web-based recipe discovery platform that helps users search for meals, explore food categories, view recipe details, save their favorite recipes, and organize their weekly meal plans.

The project is developed as part of a university Web Development course, focusing on frontend development, backend implementation, API integration, and working with JSON and XML data.

---

## 📌 Project Overview

Recipe Explorer provides users with a simple and enjoyable way to discover recipes based on their interests and available ingredients.

Users can explore different meals, search for recipes by name or ingredient, view detailed cooking instructions, save favorite meals, and plan their weekly meals.

The project integrates external APIs and local data files to demonstrate how web applications retrieve, process, and display structured data.

## 🎯 Project Objectives

- Build a responsive and user-friendly recipe website.
- Implement a backend using Node.js and Express.
- Integrate external APIs to retrieve recipe and search data.
- Use JSON to exchange and process data between the frontend and backend.
- Use an XML file to store recipe categories.
- Practice asynchronous JavaScript and API requests.
- Implement interactive features such as favorites and meal planning.

## ✨ Main Features

The website is planned to include the following pages and features:

### 1. Home Page
- Introduction to Recipe Explorer.
- Search recipes by name.
- Browse recipe categories.
- Display popular recipes.
- Discover a random recipe.

### 2. Recipes Page
- Explore available recipes.
- Search by recipe name.
- Search by ingredient.
- Browse recipes by category.
- Add or remove recipes from favorites.

### 3. Recipe Details Page
- Display recipe information.
- Show the recipe image.
- Display ingredients and measurements.
- Show cooking instructions.
- Provide access to the original recipe source when available.

### 4. Categories Page
- Display available recipe categories.
- Retrieve category information from the local XML file.
- Allow users to explore recipes by category.

### 5. Favorite Recipes Page
- Display saved favorite recipes.
- Allow users to remove recipes from favorites.
- Store favorite recipes using the browser's Local Storage.

### 6. Meal Planner Page
- Organize selected recipes into a weekly meal plan.
- Assign meals to different days.
- Save the meal plan using Local Storage.

### 7. Contact Page
- Provide a contact form.
- Allow users to enter their name, email, and message.

---

## 🛠️ Technologies Used

### Frontend
- HTML5
- CSS3
- JavaScript (Vanilla JavaScript)
- Local Storage

### Backend
- Node.js
- Express.js

### APIs and Data Sources
- **TheMealDB API:** Used to retrieve recipes, ingredients, meal details, and random recipes.
- **SerpAPI:** Used to retrieve Google search results through the backend.
- **XML:** Used to store recipe categories locally.
- **JSON:** Used for API responses and data exchange.

### Development Tools
- Visual Studio Code / Brackets
- Git and GitHub
- Node.js
- npm

---

## 📂 Project Structure

```text

Recipe-Explorer/
├── server.js
├── package.json
├── package-lock.json
├── .env
├── .gitignore
├── README.md
│
├── data/
│   ├── categories.xml
│   └── contact-messages.jsonl    # ينشأ عند إرسال أول رسالة
│
├── routes/
│   ├── recipeRoutes.js
│   ├── categoryRoutes.js
│   ├── googleRoutes.js
│   └── contactRoutes.js
│
├── services/
│   ├── mealService.js
│   └── googleSearchService.js
│
└── public/
    ├── index.html
    ├── recipes.html
    ├── recipe-details.html
    ├── categories.html
    ├── favorites.html
    ├── meal-planner.html
    ├── contact.html
    │
    ├── css/
    │   ├── style.css
    │   ├── components.css
    │   ├── responsive.css
    │   ├── recipes.css
    │   ├── categories.css
    │   ├── favorites.css
    │   ├── meal-planner.css
    │   └── contact.css
    │
    └── js/
        ├── app.js
        ├── api.js
        ├── home.js
        ├── recipes.js
        ├── recipe-details.js
        ├── categories.js
        ├── favorites.js
        ├── meal-planner.js
        └── contact.js
```

---

## 🔌 API Integration

### 1. TheMealDB API

TheMealDB is the main external API used to retrieve recipe information.

**Base URL:**

```text
https://www.themealdb.com/api/json/v1/1
```

The project uses the following endpoints:

| Endpoint | Purpose |
|---|---|
| `search.php?s=chicken` | Search recipes by name |
| `filter.php?i=chicken` | Search recipes by ingredient |
| `lookup.php?i=52772` | Retrieve recipe details by ID |
| `random.php` | Retrieve a random recipe |

### 2. SerpAPI

SerpAPI is integrated through the backend to retrieve Google search results.

The project uses it to demonstrate external search integration without exposing the API key in frontend JavaScript.

**Backend endpoint:**

```text
/api/google/search?q=chicken%20recipes
```

The backend processes the search response and returns selected information in JSON format, including:
- Search query
- Total results
- Result titles
- Result links
- Result descriptions

### 3. XML Data

The project includes a local XML file:

```text
data/categories.xml
```

It stores recipe categories such as:
- Beef
- Chicken
- Dessert
- Seafood
- Vegetarian

The backend reads and parses the XML file using `fast-xml-parser`, then provides the category data through a JSON endpoint.

---

## ⚙️ Backend API Routes

The backend provides the following endpoints:

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/status` | Check backend status |
| GET | `/api/categories` | Retrieve categories from XML |
| GET | `/api/recipes/search?name=chicken` | Search recipes by name |
| GET | `/api/recipes/ingredient/chicken` | Search recipes by ingredient |
| GET | `/api/recipes/random` | Retrieve a random recipe |
| GET | `/api/recipes/52772` | Retrieve recipe details by ID |
| GET | `/api/google/search?q=chicken` | Search Google through SerpAPI |

---

## 🚀 Installation and Setup

Follow these steps to run the project locally.

### Prerequisites

Make sure you have installed:

- Node.js
- npm
- A code editor
- An internet connection for external API requests

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
```

### 2. Navigate to the Project Folder

```bash
cd Recipe-Explorer
```

### 3. Install Dependencies

```bash
npm install
```

If dependencies are not already listed in `package.json`, install them using:

```bash
npm install express dotenv fast-xml-parser
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
SERPAPI_KEY=YOUR_SERPAPI_KEY
```

Replace `YOUR_SERPAPI_KEY` with your own SerpAPI key.

**Important:** Never upload your `.env` file or expose API keys in public repositories.

### 5. Start the Server

```bash
node server.js
```

If the server starts successfully, you should see:

```text
Recipe Explorer is running at http://localhost:3000
```

### 6. Open the Website

Visit:

```text
http://localhost:3000
```

---

## 🧪 Testing the Backend

After starting the server, you can test the API endpoints using your browser or an API testing tool.

Examples:

**Check server status:**

```text
http://localhost:3000/api/status
```

**Retrieve categories:**

```text
http://localhost:3000/api/categories
```

**Search for chicken recipes:**

```text
http://localhost:3000/api/recipes/search?name=chicken
```

**Search by ingredient:**

```text
http://localhost:3000/api/recipes/ingredient/chicken
```

**Get a random recipe:**

```text
http://localhost:3000/api/recipes/random
```

**Get recipe details:**

```text
http://localhost:3000/api/recipes/52772
```

**Search Google through SerpAPI:**

```text
http://localhost:3000/api/google/search?q=chicken%20recipes
```

---

## 💾 Data Storage

Recipe Explorer uses different data storage approaches:

- **XML:** Stores the local recipe category data.
- **JSON:** Handles data returned by external APIs and backend endpoints.
- **Local Storage:** Stores user favorites and weekly meal-planning data in the browser.

## 🔐 Security Considerations

- API keys are stored in environment variables.
- The `.env` file is excluded from Git using `.gitignore`.
- External API requests are handled through backend services.
- The frontend communicates with the backend through API endpoints.

---

## 👥 Project Information

**Project Name:** Recipe Explorer

**Course:** Web Development

**Project Type:** University Web Development Project

**Main Goal:** Developing a recipe discovery website using frontend technologies, backend services, external APIs, JSON, and XML.

---

## 📌 Project Status

The project is under development.

The backend server, recipe API integration, XML category endpoint, and SerpAPI search endpoint have been implemented and tested.

The homepage has been connected to the backend. Additional pages, frontend interactions, styling, and final testing are being developed.

---

## 📚 References

- [TheMealDB API Documentation](https://www.themealdb.com/api.php)
- [Node.js Documentation](https://nodejs.org/docs/latest/api/)
- [Express.js Documentation](https://expressjs.com/)
- [SerpAPI Documentation](https://serpapi.com/search-api)
- [MDN Web Docs](https://developer.mozilla.org/)

---
## Live Demo

[Open Recipe Explorer](https://recipe-explorer-a1fe.onrender.com)

The first load may take a little longer if the server has been inactive.

**Recipe Explorer — A little inspiration, a lot of flavor.**
