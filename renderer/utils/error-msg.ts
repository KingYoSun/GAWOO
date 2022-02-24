export function call(e) {
  const errorMsg = `ウォレットの接続に失敗しました: ${e}`;
  alert(errorMsg);
  console.log(errorMsg);
}
