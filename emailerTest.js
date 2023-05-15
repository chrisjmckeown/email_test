const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const winston = require("winston");

require("dotenv").config();

const app = express();
const port = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Log requests using Winston
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  next();
});

app.post("/send-email", async (req, res) => {
  try {
    if (req.method !== "POST") {
      return res.status(400).send("Incorrect method used");
    }
    const { emails } = req.body;
    if (!emails) {
      return res.status(400).send("No emails sent");
    }
    logger.info("sending email");
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const emailPromises = emails.map((email) => {
      const { to, body } = email;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Bonus Tools - New Cloud Licensing - Revit 2024 enabled",
        text: body,
      };

      return transporter.sendMail(mailOptions);
    });
    const result = await Promise.all(emailPromises);
    const message = [];
    result.forEach((item) => {
      message.push(item.accepted[0]);
    });
    logger.info("emails sent");
    logger.info(message);
    return res.status(200).send("Emails sent!");
  } catch (err) {
    logger.error(err.message);
    return res.status(500).send({ err });
  }
});

nodemailer.createTestAccount((err, account) => {
  if (err) {
    logger.error(err);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  transporter.verify((err, success) => {
    if (err) {
      logger.error({ err });
      return;
    }

    logger.info("Server is ready to take our messages");
  });
});

// Create a Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

app.listen(port, () => {
  logger.info(`Server listening at http://localhost:${port}`);
  console.log(`Server listening at http://localhost:${port}`);
});
