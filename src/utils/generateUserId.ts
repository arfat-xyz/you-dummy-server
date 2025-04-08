export const findLastUserId = async () => {
  return "00001";
};

export const generatedId = async () => {
  const currentId = (await findLastUserId()) || (0).toString().padEnd(5, "0");
  const incrementId = (parseInt(currentId) + 1).toString().padStart(5, "0");
  return incrementId;
};
