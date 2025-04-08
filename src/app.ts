// app.ts
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import globalErrorHandler from "./app/middlewares/globalErrorHandler";
import allRoutes from "./app/routes/index";
const app: Application = express();
app.use(cors());

// parser
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.get("/", async (req: Request, res: Response) => {
  res.send({
    response: "Welcome to my Database",
  });
});

// src/app.ts

app.use("/api/v1/", allRoutes);

// Handle Route not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "Not found",
    errorMessages: [
      {
        path: req.originalUrl,
        message: "API not found",
      },
    ],
  });
  next();
});

app.use(globalErrorHandler);
export default app;
