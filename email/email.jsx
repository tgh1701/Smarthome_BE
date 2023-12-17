const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 465,
  secure: true,
  auth: {
    user: "2tghgames@gmail.com",
    pass: "loya awmn cjnz qkih",
  },
});

function sendEmailWarningHome() {
  const mailOptions = {
    from: "2tghgames@gmail.com",
    to: "tgh1701@gmail.com",
    subject: "FIRE WARING!!!",
    html: `
      <h1>FIRE IN YOUR HOUSE!!!</h1>
      <p><img src="https://cdn.pixabay.com/photo/2012/04/23/16/47/fire-39017_1280.png" alt="Fire Icon"></p>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
}

function sendEmailGasWarningHome() {
  const mailOptions = {
    from: "2tghgames@gmail.com",
    to: "tgh1701@gmail.com",
    subject: "GAS LEAK!!!",
    html: `
      <h1>GAS LEAK IN YOUR HOUSE!!!</h1>
      <p><img src="https://cdn-icons-png.flaticon.com/512/234/234793.png" alt="Fire Icon"></p>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
}

function sendEmailWarningGarage() {
  const mailOptions = {
    from: "2tghgames@gmail.com",
    to: "tgh1701@gmail.com",
    subject: "GAS LEAK!!!",
    html: `
      <h1>GAS LEAK YOUR GARAGE!!!</h1>
      <p><img src="https://cdn-icons-png.flaticon.com/512/234/234793.png" alt="Fire Icon"></p>
    `,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    }
  });
}

module.exports = {
  sendEmailWarningHome,
  sendEmailWarningGarage,
  sendEmailGasWarningHome,
};
