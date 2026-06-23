export const getArtificialDelayMs = (): number => {
  return Math.floor(Math.random() * 10_000);
};

export const wait = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms));
};
