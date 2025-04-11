import nodeMailer from "nodemailer";
import { MailOptions } from "nodemailer/lib/json-transport";
import ApiError from "../errors/ApiError";

const transporter = nodeMailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

export const sendEmailViaNodemailer = async ({
  template,
  subject,
  from = process.env.GMAIL_EMAIL as string,
  to = ["arfatpciu@gmail.com"],
}: {
  template: string;
  subject: string;
  from?: string;
  to?: string[];
}): Promise<{ success: boolean; message: string }> => {
  const mailOption: MailOptions = {
    from: `Arfatur Rahman <${from}>`,
    to,
    subject,
    html: template,
    replyTo: from,
  };

  try {
    await transporter.sendMail(mailOption); // Wait for the sendMail to complete
    console.log(`Message sent successfully`);
    return {
      success: true,
      message: `Message sent successfully`,
    };
  } catch (error) {
    console.log("Nodemailer Error", error);
    throw new ApiError(
      400,
      error instanceof Error ? error?.message : "An unknown error occurred",
    );
  }
};
