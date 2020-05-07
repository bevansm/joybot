import IPHPBBApi from './IPHBBApi';

const MockPHPBBApi: IPHPBBApi = {
  post: () => Promise.resolve(),
};

export default MockPHPBBApi;
