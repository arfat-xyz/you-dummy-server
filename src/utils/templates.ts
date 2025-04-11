export const resetPasswordTemplate = () => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Email</title>
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>
<body class="bg-gray-100 py-6">
  <div class="max-w-lg mx-auto bg-white shadow-lg rounded-lg p-6">
    <div class="text-center mb-4">
      <h1 class="text-2xl font-semibold text-gray-900">Reset Your Password</h1>
      <p class="text-sm text-gray-600 mt-2">We received a request to reset your password. Click the button below to reset it.</p>
    </div>

    <div class="my-6">
      <a href="https://yourwebsite.com/reset-password" class="block text-center py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
        Reset Password
      </a>
    </div>

    <p class="text-sm text-gray-600 text-center">
      If you didn’t request this, please ignore this email. Your password will not be changed.
    </p>
    
    <div class="mt-6 text-center">
      <p class="text-xs text-gray-400">If you have any issues, contact our support team at <a href="mailto:${process.env.GMAIL_EMAIL}" class="text-blue-600">${process.env.GMAIL_EMAIL}</a>.</p>
    </div>
  </div>
</body>
</html>
`;
};
