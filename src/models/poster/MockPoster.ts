import IPoster from './IPoster';

const MockPoster: IPoster = {
  post: () => Promise.resolve(),
};

export default MockPoster;
