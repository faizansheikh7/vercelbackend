import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import doctorRouter from "./routes/doctorRoute.js";
import adminRouter from "./routes/adminRoute.js";
import ocrRouter from "./routes/ocrRoute.js";
import http from "http"; // HTTP server import kiya
import { Server } from "socket.io"; // Socket.io import kiya

// app config
const app = express();
const port = process.env.PORT || 4000;
connectDB();
connectCloudinary();

// middlewares
app.use(express.json());
app.use(cors());

// api endpoints
app.use("/api/user", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/ocr", ocrRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

// ✅ WebRTC Signaling Server Setup ✅
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (Change it for production)
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("offer", (data) => {
    console.log("Offer received");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("Answer received");
    socket.broadcast.emit("answer", data);
  });

  socket.on("candidate", (data) => {
    console.log("ICE Candidate received");
    socket.broadcast.emit("candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});

// ✅ Server ko `server.listen` se start kiya (Express aur WebRTC dono ek saath)
server.listen(port, () => console.log(`Server started on PORT:${port}`));
