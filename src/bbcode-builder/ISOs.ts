import { ISlot, IHost } from '../model/data-types';
import { List, Strikethrough, Link, Newlines, Color } from './TagDecorators';

const ISO = (name: string, topic: string) =>
  Link(name, `${process.env.FORUM_URL}/search.php?t=${topic}&author=${name}`);

export const PlayerISOs = (
  users: ISlot[],
  topic: string,
  numbered: boolean = true
): string =>
  List(
    users.map(({ name, history, isAlive }) =>
      history
        .map(s => Strikethrough(ISO(s, topic)))
        .concat(isAlive ? ISO(name, topic) : Strikethrough(ISO(name, topic)))
        .join(' ')
    ),
    numbered
  );

export const HostISOs = (hosts: IHost[], topic: string): string =>
  Newlines(hosts.map(({ name, hex }) => Color(ISO(name, topic), hex)));
