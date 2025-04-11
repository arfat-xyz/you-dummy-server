export const generateShortCode = (length: number = 7): string => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Uppercase letters and numbers
  let shortCode = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    shortCode += charset[randomIndex];
  }

  return shortCode;
};
