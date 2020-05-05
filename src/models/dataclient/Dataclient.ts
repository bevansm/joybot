import IDataclient from './IDataclient';
import { createMockGame } from './create-mocks';

// TODO: Hook up the dataclient to a functioning database.
const Dataclient: IDataclient = {
  getGame: () => Promise.resolve(createMockGame()),
  updateGame: () => Promise.resolve(),
};

export default Dataclient;
