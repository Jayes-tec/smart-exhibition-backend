const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

const db = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const exhibitionRoutes = require("./routes/exhibition.route");
const exhibitorRoutes = require("./routes/exhibitor.route")
const exhibitionExhibitorRoutes = require("./routes/exhibitionExhibitor.route")
const boothRoutes = require("./routes/booth.route");
const boothBooking = require("./routes/boothBooking.route");
const visitorRoutes = require("./routes/visitor.routes");
const visitorLogRoutes = require("./routes/visitorLog.route");
const productRoutes = require("./routes/product.route");
const leadRoutes = require("./routes/lead.route");
const feedbackRoutes = require("./routes/feedback.routes")
const boothDocumentRoutes = require("./routes/boothDocument.route")
const boothStaffRoutes = require("./routes/boothStaff.route")
const notificationRoutes = require("./routes/notification.route")
const reportRoutes = require("./routes/report.route")

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',authRoutes);
app.use("/api/exhibition",exhibitionRoutes)
app.use("/api/booths",boothRoutes);
app.use("/api/booth-bookings",boothBooking)
app.use("/api/visitors",visitorRoutes)
app.use("/api/visitor-logs",visitorLogRoutes);
app.use("/api/products", productRoutes);
app.use("/api/leads",leadRoutes)
app.use("/api/feedback",feedbackRoutes)
app.use("/api/booth-documents",boothDocumentRoutes)
app.use("/api/booth-staff",boothStaffRoutes )
app.use("/api/notifications",notificationRoutes)
app.use("/api/reports",reportRoutes)
app.use("/api/exhibitors",exhibitorRoutes)
app.use("/api/exhibitionExhibitor",exhibitionExhibitorRoutes)

db.getConnection()
    .then((connection) => {
        console.log("✅ MySQL Connected Successfully");
        connection.release();
    })
    .catch((err) => {
        console.error("❌ Database Connection Failed");
        console.error(err.message);
    });
// Test Route
app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Smart Exhibition Backend Running 🚀"
    });
});

// 404 Handler
// Pehle koi unmatched route (e.g. typo in URL) ke liye Express ka
// default HTML error page aata tha, ab consistent JSON milega
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

// Central Error Handler
// Safety net — agar koi error kisi controller ke try/catch se bhi
// bach kar yahan tak pahunch jaaye (e.g. middleware throw), to bhi
// response hamesha JSON format me hi jaayega, HTML crash page nahi
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});

module.exports = app;