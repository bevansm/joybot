export const startGameJob = async (topicNumber: string): Promise<void> => {
  const baseUrl = `${process.env.FORUM_URL}/viewforum.php?f=${process.env.GAMES_ID}&t=${topicNumber}`;

  return null;
};

export default startGameJob;
