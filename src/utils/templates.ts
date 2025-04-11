export const resetPasswordTemplate = (shortCode: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Email</title>
</head>
<body style="background-color: #f3f4f6; padding: 24px;">

  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 24px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

    <div style="text-align: center; margin-bottom: 16px;">
      <h1 style="font-size: 24px; font-weight: 600; color: #1f2937;">Reset Your Password</h1>
      <p style="font-size: 14px; color: #4b5563; margin-top: 8px;">We received a request to reset your password. Use the code below to reset your password:</p>
    </div>

    <!-- Display Short Code -->
    <div style="margin: 24px 0; text-align: center;">
      <p style="font-size: 18px; font-weight: 600; color: #1f2937;">Your Reset Code:</p>
      <p style="font-size: 24px; font-weight: 700; color: #2563eb; background-color: #ffffff; border: 1px solid #d1d5db; padding: 12px 24px; display: inline-block;">${shortCode}</p>
      <p style="font-size: 14px; color: #4b5563; margin-top: 8px;">Please copy the code above and paste it into the reset form on our website.</p>
    </div>

    <p style="font-size: 14px; color: #4b5563; text-align: center;">
      If you didn’t request this, please ignore this email. Your password will not be changed.
    </p>

    <div style="margin-top: 24px; text-align: center;">
      <p style="font-size: 12px; color: #9ca3af;">If you have any issues, contact our support team at <a href="mailto:${process.env.GMAIL_EMAIL}" style="color: #2563eb;">${process.env.GMAIL_EMAIL}</a>.</p>
    </div>

  </div>

</body>
</html>`;
};
