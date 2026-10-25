const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "smarttravel_secret_key";

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── User Schema ────────────────────────────────────────────
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

// ─── Middleware ──────────────────────────────────────────────
function verifyToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Please login." });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token. Please login again." });
    }
}

function isAdmin(req, res, next) {
    verifyToken(req, res, function() {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
    });
}

// ─── Destination Schema ──────────────────────────────────────
const destinationSchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String
});

const Destination = mongoose.model("Destination", destinationSchema);

// ─── REGISTER ───────────────────────────────────────────────
app.post("/api/register", async function(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const adminEmail = process.env.ADMIN_EMAIL || "";
        const role = email.toLowerCase() === adminEmail.toLowerCase() ? "admin" : "user";

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            role: role
        });

        await user.save();

        const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

        res.status(201).json({
            message: "Registration successful",
            token: token,
            user: { name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Registration failed. Please try again." });
    }
});

// ─── LOGIN ───────────────────────────────────────────────────
app.post("/api/login", async function(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ userId: user._id, name: user.name, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

        res.json({
            message: "Login successful",
            token: token,
            user: { name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        res.status(500).json({ message: "Login failed. Please try again." });
    }
});

// ─── DESTINATIONS ────────────────────────────────────────────
app.get("/api/destinations", async function(req, res) {
    try {
        const destinations = await Destination.find();
        res.json(destinations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching destinations" });
    }
});

app.post("/api/destinations", isAdmin, async function(req, res) {
    try {
        const { name, location, description } = req.body;

        if (!name || !location) {
            return res.status(400).json({ message: "Name and location are required" });
        }

        const destination = new Destination({
            name: name,
            location: location,
            description: description || "Explore this beautiful destination."
        });

        const savedDestination = await destination.save();

        res.status(201).json({
            message: "Destination saved successfully",
            destination: savedDestination
        });
    } catch (error) {
        res.status(500).json({ message: "Error saving destination" });
    }
});

// ─── START SERVER ────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
    .then(function() {
        console.log("MongoDB connected successfully");
        app.listen(PORT, function() {
            console.log("Server running at http://localhost:" + PORT);
        });
    })
    .catch(function(error) {
        console.log("MongoDB connection failed:", error.message);
    });
