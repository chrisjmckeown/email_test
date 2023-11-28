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
      const { to, code } = email;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Bonus Tools - New Cloud Licensing - Revit 2024 enabled",
        html: `<p>Hello,</p><p>We miss you and would like you back. We would like to offer you anextended trial to our new cloud based licensing method, licenses are no longer locked to one PC, work from any location, work, home, site, anywhere. Please review the growing range of tutorials from our Wiki site: <a href='https://kiwicodes.freshdesk.com/support/solutions/folders/51000372057' >Tutorials</a>.</p><p><a name='_MailAutoSig'><strong>Please find you key here: ${code}</strong></a></p><ol start='1' type='1'><li> Please review this tutorial that will explain how to install Bonus Tools: <a href='https://kiwicodes.freshdesk.com/support/solutions/articles/51000305792-02-installation-basic' >02 Installation Basic</a ></li><li> You can download the current version of Bonus Tools from here: <a href='https://kiwicodes.freshdesk.com/a/solutions/articles/51000302037' >Latest Releases</a >(you must use the latest version with the key above)</li><li> Please see here instructions to activate your license key once received: <a href='https://kiwicodes.freshdesk.com/support/solutions/articles/51000323073-4c-kc-license-activation' >4c KC License Activation</a ></li><li> A License Manager Viewer is available to login to at the below address</li><ol start='1' type='1'> <li> <a href='https://licensemanager.kiwicodes.com/'>https://licensemanager.kiwicodes.com/</a > </li> <li>You will need to create an account with your BT Activation Key.</li></ol></ol><p>If you have any questions or suggestions please don’t hesitate in replying.</p><p>Regards</p><p><strong>Chris Mckeown</strong><br>Director/Programmer</p><p><img border='0' width='176' height='36' src='cid:KiwicodesLogo' /></p><p ><a href='mailto:chris@kiwicodes.com' target='_blank' style='color:rgb(31, 73, 125); font-size: 0.875em'>chris@kiwicodes.com</a><br><a href='http://www.kiwicodes.com/' target='_blank' style='color:rgb(31, 73, 125); font-size: 0.875em'>www.kiwicodes.com</a></p>`,
        attachments: [
          {
            filename: "KiwicodesLogo.png",
            path: "./KiwicodesLogo.png",
            cid: "KiwicodesLogo",
          },
        ],
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
