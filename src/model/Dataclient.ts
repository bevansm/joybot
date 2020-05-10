import fs from 'fs';
import path from 'path';
import IDataclient from './IDataclient';
import { IGame } from './data-types';

export const getClient = () => {
  return LocalClient;
};

const LocalClient: IDataclient = {
  getGame: async (id: string) => {
    try {
      return (fs
        .readFileSync(path.resolve(__dirname, `./../../local-db/${id}.json`))
        .toJSON() as unknown) as IGame;
    } catch (e) {
      return null;
    }
  },
  updateGame: async (game: IGame) => {
    fs.writeFileSync(
      path.resolve(__dirname, `./../../local-db/${game.id}.json`),
      JSON.stringify(game)
    );
  },
  getGames: async () => {
    try {
      return (fs
        .readdirSync(path.resolve(__dirname, './../../local-db'))
        .map(path => fs.readFileSync(path).toJSON()) as unknown) as IGame[];
    } catch (e) {
      return [];
    }
  },
};

// TODO: implement this
// const DynamoClient: IDataclient = {
//   getGame: async () => createMockGame(),
//   updateGame: async () => Promise.resolve(),
//   getGames: async () => [],
// };

export default LocalClient;
