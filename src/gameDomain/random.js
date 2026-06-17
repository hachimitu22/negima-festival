// min以上max以下の整数をランダムに生成する関数
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// percent%の確率でtrueを返す関数
function rollChance(percent) {
  return Math.random() * 100 < percent;
}

export { getRandomInt, rollChance };
