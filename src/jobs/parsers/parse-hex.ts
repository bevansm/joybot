enum RoleColor {
  TOWN_1 = '#00BF40',
  TOWN_2 = '#00BF00',
  MAFIA = '#FF0000',
  NEUTRAL = 'GREY',
  SURVIVOR = '#BBBB00',
  AMNESIAC = '#00DDDD',
  PHANTOM = '#80BF80',
  DOUBLE = '#8080FF',
  SHADE = '#004040',
  JESTER = '#FF80FF',
  EXE = '#999999',
  KLEPTO = '#FF4080',
  WARLOCK = '800040',
  SERIAL_KILLER_1 = '#0000BF',
  SERIAL_KILLER_2 = '#0000FF',
  ARSONIST = '#FF8000',
  BOMBER = '#582525',
  WITCH = '#8000FF',
}

export const parseHex = (content: CheerioElement, $: CheerioStatic): string => {
  const colors = $(content).find('span[style*="color:"]').toArray();
  const weightedColors: { [key: string]: number } = { '#000': 0 };
  colors.forEach(e => {
    const color = $(e)
      .attr('style')
      .split('color: ')[1]
      .split(';')[0]
      .toUpperCase();

    // Checking to make sure some host hasn't just written an entire post w/ a color that happens to conflict
    const isReserved = Object.values(RoleColor).includes(color as RoleColor);
    if (!isReserved || colors.length < 3) {
      const length = $(e).text().length;
      weightedColors[color] = (weightedColors[color] || 0) + length;
    }
  });
  if (colors.length === 0) return undefined;
  return Object.keys(weightedColors).reduce(
    (prev, curr) => (weightedColors[curr] > weightedColors[prev] ? curr : prev),
    '#000'
  );
};
