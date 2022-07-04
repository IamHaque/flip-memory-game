const EMOJI_LIST = [
  "✌",
  "😂",
  "😝",
  "😁",
  "😱",
  "👉",
  "🙌",
  "🍻",
  "🔥",
  "🌈",
  "☀",
  "🎈",
  "🌹",
  "💄",
  "🎀",
  "⚽",
  "🎾",
  "🏁",
  "😡",
  "👿",
  "🐻",
  "🐶",
  "🐬",
  "🐟",
  "🍀",
  "👀",
  "🚗",
  "🍎",
  "💝",
  "💙",
  "👌",
  "❤",
  "😍",
  "😉",
  "😓",
  "😳",
  "💪",
  "💩",
  "🍸",
  "🔑",
  "💖",
  "🌟",
  "🎉",
  "🌺",
  "🎶",
  "👠",
  "🏈",
  "⚾",
  "🏆",
  "👽",
  "💀",
  "🐵",
  "🐮",
  "🐩",
  "🐎",
  "💣",
  "👃",
  "👂",
  "🍓",
  "💘",
  "💜",
  "👊",
  "💋",
  "😘",
  "😜",
  "😵",
  "🙏",
  "👋",
  "🚽",
  "💃",
  "💎",
  "🚀",
  "🌙",
  "🎁",
  "⛄",
  "🌊",
  "⛵",
  "🏀",
  "🎱",
  "💰",
  "👶",
  "👸",
  "🐰",
  "🐷",
  "🐍",
  "🐫",
  "🔫",
  "👄",
  "🚲",
  "🍉",
  "💛",
  "💚",
];

export const initializeTiles = (emojiCount, tileCount) => {
  const emojis = generateEmojis(emojiCount, tileCount);
  return generateTiles(emojis, tileCount);
};

const generateTiles = (content, count) => {
  const generatedTiles = [];
  for (let i = 0; i < count * count; i++) {
    const tile = {
      id: i,
      matched: false,
      flipped: false,
      content: content[i],
    };

    generatedTiles.push(tile);
  }
  return generatedTiles;
};

const generateEmojis = (count) => {
  let emojis = [];
  let emojisGenerated = 0;

  while (emojisGenerated < count) {
    let randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)];
    if (emojis.includes(randomEmoji)) continue;

    emojis.push(randomEmoji);
    emojis.push(randomEmoji);
    emojisGenerated += 1;
  }

  return shuffleArray(emojis);
};

const shuffleArray = (list) => {
  for (var index = list.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    const tempValue = list[index];
    list[index] = list[randomIndex];
    list[randomIndex] = tempValue;
  }
  return list;
};

export const mapRange = (value, low1, high1, low2, high2) => {
  return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
};

export const round = (value, decimalPlaces = 2) => {
  return parseFloat(
    Number(
      Math.round(parseFloat(value + "e" + decimalPlaces)) + "e-" + decimalPlaces
    ).toFixed(decimalPlaces)
  );
};

export const showElapsedTime = (timer) => {
  let elapsedTime = {
    seconds: timer % 60,
    minutes: Math.floor(timer / 60) % 60,
  };

  return `${
    elapsedTime.minutes > 0 ? padNumbers(elapsedTime.minutes) + "" : "00"
  } : ${elapsedTime.seconds > 0 ? padNumbers(elapsedTime.seconds) + "" : "00"}`;
};

const padNumbers = (num) => (num <= 9 ? `0${num}` : num);
