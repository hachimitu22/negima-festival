/**
 * min以上max以下の整数をランダムに生成する。
 * 
 * @public
 * @param {number} min - 最小値（整数）
 * @param {number} max - 最大値（整数）
 * @returns {number} min以上max以下のランダムな整数
 * 
 * @example
 * const random = getRandomInt(1, 10);
 * console.log(random); // 1 から 10 のいずれか
 */
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 指定確率でtrueを返す。
 * 
 * @public
 * @param {number} percent - 確率（0～100、単位は%）
 * @returns {boolean} percent%の確率でtrue、それ以外はfalse
 * 
 * @example
 * if (rollChance(30)) {
 *   console.log('30%の確率で実行される処理');
 * }
 */
function rollChance(percent) {
  return Math.random() * 100 < percent;
}

export { getRandomInt, rollChance };
