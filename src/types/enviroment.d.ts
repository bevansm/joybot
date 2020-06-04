declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod' | 'local';
      FORUM_URL: string;
      GAMES_ID: string;

      // if provided, will use to pop up webapp where user can input the key.
      SITE_KEY: string;

      USER: string;
      PASSWORD: string;
      DISCORD_TOKEN: string;

      // The default time between posted votecounts.
      DEFAULT_VOTECOUNT_TIMEOUT: string;

      // The number of posts on a given page.
      POSTS_PER_PAGE: string;

      /**
       * The post command to start a bot posting on the thread.
       * A sample post and avalible params can be found in the README.
       */
      START_COMMAND: string;

      // When developing locally, can use session token from browser
      _S?: string;
    }
  }
}

export {};
