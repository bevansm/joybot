import IDataclient from './IDataclient';
import { createGame } from './create-mocks';

// TODO: Hook up the dataclient to a functioning database.
const Dataclient: IDataclient = {
  getGame: () => Promise.resolve(createGame()),
  updateGame: () => Promise.resolve(),
};

export default Dataclient;
