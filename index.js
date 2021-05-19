require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const app = express();
const port = process.env.PORT || 5000;

const USER_EMAIL = process.env.USER_EMAIL;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Graphic Rhino Server");
});

app.post("/contact", async (req, res) => {
  try {
    const ACCESS_TOKEN = await oAuth2Client.getAccessToken();
    const { name, email, phone, message } = req.body;

    if (!(name && email && message)) {
      return res.status(400).send("Please fill the required fields!");
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).send("Invalid email address! Please try again!");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: USER_EMAIL,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
    });

    await transporter.sendMail({
      from: { name: "Graphic Rhino", address: email },
      replyTo: email,
      to: "atasin1998@gmail.com",
      //   to: "hello@graphicrhino.be",
      subject: `Contact form submission from ${name}`,
      html: `<p>Hello Tasin Ahmed,</p>
        <p>You have a new message from ${name}</p>
        <p style="padding: 12px; border-left: 4px solid #d0d0d0; font-style: italic;">${message}</p>
        ${phone ? `<p>Call me back at ${phone}</p>` : ""}
        <p>Sent from <a href="mailto:${email}">${email}</a></p>`,
    });

    res.send("Message sent successfully! We will get back to you soon!");
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Unable to send! Please try again!");
  }
});

app.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
