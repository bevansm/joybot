import { Game } from '../game-types';
import IDataclient, {
  TableName,
  AbstractDataClient,
} from './AbstractDataclient';
import { Role, InformedTeam } from '../role-types';
import { GameRolesState } from '../role-states';

interface MockDBType {
  [TableName.GAMES]: { [key: string]: Game };
  [TableName.ROLES]: { [key: string]: Role };
  [TableName.TEAMS]: { [key: string]: InformedTeam };
  [TableName.GAME_ROLE_STATE]: { [key: string]: GameRolesState };
}

const database: MockDBType = Object.values(TableName).reduce(
  (prev, t) => ({ ...prev, [t]: {} }),
  {}
) as MockDBType;

class MockDataclient extends AbstractDataClient {
  protected get = <T>(id: string, tn: TableName) =>
    (database[tn][id] as unknown) as T;
  protected set = async (id: string, tn: TableName, obj: any) => {
    database[tn][id] = obj;
  };
  public getAllGames = () =>
    Object.values(database[TableName.GAMES]).map(v => Promise.resolve(v));
}
export default new MockDataclient();
