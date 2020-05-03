import { createGame } from './create-mocks';
import IDataclient from './IDataclient';

const MockDataclient: IDataclient = {
  getGame: () => Promise.resolve(createGame()),
  updateGame: () => Promise.resolve(),
};

export default MockDataclient;
