import fs from 'fs';
import path from 'path';
import { TableName, AbstractDataClient } from './AbstractDataclient';
import { Game } from '../game-types';

export const getClient = () => {
  return new LocalClient();
};

const dbPath = './../../local-db';

class LocalClient extends AbstractDataClient {
  protected set = async (id: string, table: TableName, obj: any) =>
    fs.writeFileSync(
      path.resolve(__dirname, `./../../local-db/${table}/${id}.json`),
      JSON.stringify(obj)
    );
  protected get = (id: string, table: TableName) =>
    JSON.parse(
      fs
        .readFileSync(path.resolve(__dirname, `${dbPath}/${table}/${id}.json`))
        .toString()
    );
  public getAllGames = () => {
    try {
      return (fs
        .readdirSync(path.resolve(__dirname, `${dbPath}/${TableName.GAMES}`))
        .map(path =>
          JSON.parse(fs.readFileSync(path).toString())
        ) as unknown) as Array<Promise<Game>>;
    } catch (e) {
      return [];
    }
  };
}

// TODO: implement this
// const DynamoClient: IDataclient = {
//   getGame: async () => createMockGame(),
//   updateGame: async () => Promise.resolve(),
//   getGames: async () => [],
// };

export default new LocalClient();
