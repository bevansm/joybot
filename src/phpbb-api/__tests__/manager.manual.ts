import { login } from '../CookieManager';
import { postPost } from '../PHPBBApi';

const runner = async () => {
  await login();
  const forum = '5';
  const topic = '108366';
  await postPost(
    {
      message: 'lol',
      subject: "Re: go back to swimming moonbird you're not funny",
    },
    forum,
    topic
  );
};

runner();
