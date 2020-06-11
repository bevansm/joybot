import { Slot, Host } from '../../model/game-types';
import {
  List,
  Strikethrough,
  Link,
  Newlines,
  Color,
  Bold,
} from './TagDecorators';

const ISO = (name: string, topic: string, contents?: string) =>
  Link(
    contents || name,
    `${process.env.FORUM_URL}/search.php?t=${topic}&author=${name}`
  );

export const PlayerISOs = (
  users: Slot[],
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

export const HostISOs = (hosts: Host[], topic: string): string =>
  Newlines(
    hosts.map(({ name, hex }) => ISO(name, topic, Bold(Color(name, hex))))
  );
