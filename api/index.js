const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const Student = require('../models/Student');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.ATLAS_URI).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

app.post('/api/students', async (req, res) => {
  try {
    await connectDB();
    const student = await Student.create(req.body);
    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/students', async (req, res) => {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 });
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/admin/students', async (req, res) => {
  try {
    await connectDB();
    const students = await Student.find().sort({ createdAt: -1 });
    const rows = students.map(s => `
      <tr>
        <td>${s.name}</td>
        <td>${s.date.toISOString().split('T')[0]}</td>
        <td>${s.class}</td>
        <td>${s.address}</td>
        <td>${s.payment.toLocaleString()}</td>
      </tr>
    `).join('');
    res.send(`
      <!DOCTYPE html><html lang="en"><head>
        <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
        <title>All Students - Admin</title>
        <style>
          * { box-sizing:border-box; margin:0; padding:0; }
          body { font-family:system-ui,sans-serif; background:#f4f6f8; padding:2rem; color:#333; }
          .container { max-width:900px; margin:0 auto; background:#fff; padding:2rem; border-radius:8px; box-shadow:0 2px 8px rgba(0,0,0,0.1); }
          h1 { margin-bottom:1rem; color:#1a3a5c; }
          .count { margin-bottom:1rem; font-size:0.9rem; color:#666; }
          table { width:100%; border-collapse:collapse; }
          th, td { border:1px solid #ddd; padding:0.5rem; text-align:left; }
          th { background:#1a3a5c; color:#fff; }
          tr:nth-child(even) { background:#f9f9f9; }
          a { display:inline-block; margin-top:1rem; color:#1a73e8; }
        </style>
      </head><body>
        <div class="container">
          <h1>All Students</h1>
          <p class="count">${students.length} record(s)</p>
          <table><thead><tr><th>Name</th><th>DOB</th><th>Class</th><th>Address</th><th>Payment</th></tr></thead>
          <tbody>${rows}</tbody></table>
          <a href="/">← Back to Registration</a>
        </div>
      </body></html>
    `);
  } catch (err) {
    res.status(500).send('Error loading students');
  }
});

module.exports = app;
