const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");

let response = []; // Stores all fetched and shuffled quotes
let num = 0; // The number of quotes requested by the user
const port = 8000;
const QUOTE_COUNT = 100;

/**
 * Fetches the required number of random anime quotes from the external API.
 */
const call = async () => {
  try {
    const promises = [];
    for (let i = 0; i < QUOTE_COUNT; i++) {
      // Collect 100 promises for concurrent fetching
      promises.push(axios.get("https://animotto-api.onrender.com/api/quotes/random"));
    }

    const results = await Promise.all(promises);

    // Store only the quote data (character, anime, quote)
    response = results.map(r => r.data);

    console.log(`✅ Successfully fetched ${response.length} quotes.`);
  } catch (err) {
    console.error("❌ Error fetching quotes:", err.message);
    // Exit process if fetching fails to prevent serving an empty app
    process.exit(1);
  }
};

/**
 * Implements the Fisher-Yates shuffle algorithm to randomize the array elements.
 * @param {Array} arr - The array to shuffle.
 * @returns {Array} The shuffled array.
 */
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// --- Server Setup ---

app.set("view engine", "ejs");
// Assuming 'public' directory is available for static assets (though not strictly needed here)
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Home page route
app.get("/", (req, res) => {
  // Use Math.min to ensure we never try to slice more quotes than we have (max 100)
  const count = Math.min(num, response.length);
  const datum = response.slice(0, count);

  res.render("motion.ejs", { 
    data: datum, 
    no: num, 
    maxQuotes: response.length // Pass max quotes for client-side validation
  });
});

// Post route for setting the number of quotes
app.post("/send", (req, res) => {
  // Ensure the input is a valid positive integer and does not exceed the max available quotes
  const requestedNum = parseInt(req.body.quotes, 10);
  num = (requestedNum >= 0 && requestedNum <= response.length) ? requestedNum : 0;
  
  console.log("Requested quotes:", num);
  res.redirect("/");
});

/**
 * Main function to load data and start the server.
 */
const startServer = async () => {
    console.log("Starting data fetch...");
    // Await the data fetching
    await call(); 

    // Shuffle the data once the fetch is complete
    response = shuffleArray(response);
    
    // Start the server only after data is ready
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
        console.log(`🔗 Access the app at http://localhost:${port}`);
    });
};

startServer();
