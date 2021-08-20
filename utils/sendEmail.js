const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const path = require('path');
// Email class
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.user = user;
    this.url = url;
    this.from = process.env.EMAIL_FROM;
    this.firstName = user.name.split(' ')[0];
  }
  newTransporter() {
    if (process.env.NODE_ENV === 'production') {
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: +process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  async send(template, subject) {
    // 1, Create HTML
    const html = pug.renderFile(
      path.join(__dirname, `../views/email/${template}.pug`),
      {
        firstName: this.firstName,
        url: this.url,
        subject,
      }
    );
    // 2, Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      text: htmlToText.htmlToText(html),
      html,
    };
    // 3, Send email
    await this.newTransporter().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family!');
  }
  async sendResetPassword() {
    await this.send(
      'resetPassword',
      'Password reset token (valid for 10 minutes)'
    );
  }
}

module.exports = Email;
