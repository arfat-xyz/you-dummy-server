import nodeMailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";

const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendEmailViaNodemailer = ({
  template,
  subject,
  from = process.env.GMAIL_EMAIL as string,
  to = ["arfatpciu@gmail.com"],
}: {
  template: string;
  subject: string;
  from?: string;
  to?: string[];
}) => {
  const mailOption: MailOptions = {
    from: `Arfatur Rahman <${from}>`,
    to,
    subject,
    html: template,
    replyTo: from,
  };
  transporter.sendMail(mailOption, function (error) {
    if (error) {
      console.log("Nodemailer Error", error);
    } else {
      console.log(`Message sent successfully`);
    }
  });
};
