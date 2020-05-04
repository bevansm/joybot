import { createMockGame } from './create-mocks';
import IDataclient from './IDataclient';

const MockDataclient: IDataclient = {
  getGame: () => Promise.resolve(createMockGame()),
  updateGame: () => Promise.resolve(),
};

export default MockDataclient;
