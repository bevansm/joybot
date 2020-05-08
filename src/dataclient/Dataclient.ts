import IDataclient from './IDataclient';
import { createMockGame } from './create-mocks';

// TODO: Hook up the dataclient to a functioning database.
const Dataclient: IDataclient = {
  getGame: async () => createMockGame(),
  updateGame: async () => Promise.resolve(),
  getGames: async () => [],
};

export default Dataclient;
