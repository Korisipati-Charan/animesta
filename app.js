const express = require("express");
const app = express();
const axios = require("axios");
const path = require("path");

let response = [];
let num = 0;
const port = 8000;

// Fetch 100 random anime quotes
const call = async () => {
  try {
    const promises = [];
    for (let i = 0; i < 100; i++) {
      promises.push(axios.get("https://animotto-api.onrender.com/api/quotes/random"));
    }

    const results = await Promise.all(promises);

    // Store only the data part (not the whole Axios object)
    response = results.map(r => r.data);

    console.log("✅ Successfully fetched 100 quotes!");
  } catch (err) {
    console.error("❌ Error fetching quotes:", err.message);
  }
};

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // pick random index
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
}

call(); // Run once at server start

response=shuffleArray(response);

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home page
app.get("/", (req, res) => {
  const datum = response.slice(0, num);
  res.render("motion.ejs", { data: datum, no: num });
});

// When user submits the number
app.post("/send", (req, res) => {
  num = parseInt(req.body.quotes) || 0;
  console.log("Requested quotes:", num);
  res.redirect("/");
});

app.listen(port, () => {
  console.log("🚀 Server running on port", port);
});
