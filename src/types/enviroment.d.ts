declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';
      FORUM_URL: string;
      GAMES_ID: string;

      USER: string;
      PASSWORD: string;

      // The default time between posted votecounts.
      DEFAULT_VOTECOUNT_TIMEOUT: string;

      // The number of posts on a given page.
      POSTS_PER_PAGE: string;

      /**
       * The post command to start a bot posting on the thread.
       * A sample post and avalible params can be found in the README.
       */
      START_COMMAND: string;
    }
  }
}

export {};
