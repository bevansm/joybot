import { Game } from '../game-types';
import { Role, InformedTeam } from '../role-types';
import { GameRolesState } from '../role-states';

export enum TableName {
  GAMES = 'games',
  ROLES = 'roles',
  TEAMS = 'teams',
  GAME_ROLE_STATE = 'game-state',
}

interface IDataclient {
  getGame: (game: string) => Promise<Game>;
  setGame: (game: Game) => Promise<void>;
  getAllGames: () => Array<Promise<Game>>;

  getRole: (id: string) => Promise<Role>;
  getRoles: (id: string[]) => Array<Promise<Role>>;
  setRole: (role: Role) => Promise<void>;

  getTeam: (id: string) => Promise<InformedTeam>;
  getTeams: (id: string[]) => Array<Promise<InformedTeam>>;
  setTeam: (team: InformedTeam) => Promise<void>;

  getGameRolesState: (id: string) => Promise<GameRolesState>;
  setGameRolesState: (state: GameRolesState) => Promise<void>;
}

export abstract class AbstractDataClient implements IDataclient {
  protected abstract get: <T>(id: string, tn: TableName) => Promise<T>;
  protected abstract set: <T>(
    id: string,
    tn: TableName,
    obj: T
  ) => Promise<void>;
  public abstract getAllGames: () => Array<Promise<Game>>;

  private getWithID = <T>(tn: TableName) => (id: string) => this.get<T>(id, tn);
  private getWithIDS = <T>(tn: TableName) => (ids: string[]) =>
    ids.map(this.getWithID<T>(tn));
  private setWithID = (tn: TableName) => (obj: { id: string }) =>
    this.set(obj.id, tn, obj);

  public getGame = this.getWithID<Game>(TableName.GAMES);
  public setGame = this.setWithID(TableName.GAMES);

  public getGameRolesState = this.getWithID<GameRolesState>(
    TableName.GAME_ROLE_STATE
  );
  public setGameRolesState = this.setWithID(TableName.GAME_ROLE_STATE);

  public getRole = this.getWithID<Role>(TableName.ROLES);
  public getRoles = this.getWithIDS<Role>(TableName.ROLES);
  public setRole = this.setWithID(TableName.ROLES);

  public getTeam = this.getWithID<InformedTeam>(TableName.TEAMS);
  public getTeams = this.getWithIDS<InformedTeam>(TableName.TEAMS);
  public setTeam = this.setWithID(TableName.TEAMS);
}

export default IDataclient;
