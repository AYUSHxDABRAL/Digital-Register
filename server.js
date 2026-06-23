// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// ---------------- MIDDLEWARE ----------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// ---------------- DATABASE CONNECTION ----------------
mongoose
  .connect("mongodb://127.0.0.1:27017/gramPanchayatDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("❌ MongoDB error:", err));

// ---------------- SCHEMAS ----------------
const adminSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const citizenSchema = new mongoose.Schema({
  name: String,
  email: String,
  age: Number,
  gender: String,
  mobile: String,
  income: Number,
  category: String,
  address: String,
});

const policySchema = new mongoose.Schema({
  policyId: String,
  name: String,
  minAge: Number,
  minIncome: Number,
  description: String, // will store the LINK
});

const landSchema = new mongoose.Schema({
  size: String,
  ownerName: String,
  ownerEmail: String,
});

const Admin = mongoose.model("Admin", adminSchema);
const Citizen = mongoose.model("Citizen", citizenSchema);
const Policy = mongoose.model("Policy", policySchema);
const Land = mongoose.model("Land", landSchema);

// ---------------- SEED DEFAULT ADMIN ----------------
app.get("/api/admin/seed", async (req, res) => {
  const exists = await Admin.findOne({ email: "admin@gmail.com" });

  if (!exists) {
    await Admin.create({ email: "admin@gmail.com", password: "123" });
    console.log("⭐ Default admin created");
  }

  res.json({ success: true });
});

// ---------------- ADMIN LOGIN ----------------
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) return res.json({ success: false, message: "Admin not found" });
  if (admin.password !== password)
    return res.json({ success: false, message: "Incorrect password" });

  res.json({ success: true });
});

// ---------------- CITIZENS CRUD ----------------
app.post("/api/citizens", async (req, res) => {
  try {
    await Citizen.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/citizens", async (req, res) => {
  const list = await Citizen.find();
  res.json(list);
});

app.delete("/api/citizens/:id", async (req, res) => {
  await Citizen.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------- CITIZEN LOGIN + Eligibility + Land ----------------
app.post("/api/citizens/login", async (req, res) => {
  const { email } = req.body;

  const citizen = await Citizen.findOne({ email });
  if (!citizen)
    return res.json({ success: false, message: "Citizen not found" });

  const policies = await Policy.find();

  // Eligibility rules
  const eligiblePolicies = policies
    .filter((p) => {
      const ageOK = p.minAge == null || citizen.age >= p.minAge;
      const incomeOK = p.minIncome == null || citizen.income >= p.minIncome;
      return ageOK && incomeOK;
    })
    .map((p) => ({
      _id: p._id,
      policyId: p.policyId,
      name: p.name,
      minAge: p.minAge,
      minIncome: p.minIncome,
      description: p.description, // LINK
    }));

  // Land records matching user email
  const lands = await Land.find({ ownerEmail: email });

  return res.json({
    success: true,
    citizen,
    eligiblePolicies,
    lands,
  });
});

// ---------------- POLICIES CRUD ----------------
app.post("/api/policies", async (req, res) => {
  try {
    await Policy.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/policies", async (req, res) => {
  const list = await Policy.find();
  res.json(list);
});

app.delete("/api/policies/:id", async (req, res) => {
  await Policy.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ⭐ EXTRA: Get policy details by ID (for popup)
app.get("/api/policies/detail/:id", async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id);

    if (!policy)
      return res.json({ success: false, message: "Policy not found" });

    res.json({ success: true, policy });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

// ---------------- LANDS CRUD ----------------
app.post("/api/lands", async (req, res) => {
  try {
    await Land.create(req.body);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});

app.get("/api/lands", async (req, res) => {
  const list = await Land.find();
  res.json(list);
});

app.delete("/api/lands/:id", async (req, res) => {
  await Land.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ---------------- SERVE FRONTEND ----------------
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ---------------- START SERVER ----------------
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
