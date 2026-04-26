const N = 8;

export function avatarColorClass(str) {
  if (!str) return "";
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return `avatar--c${h % N}`;
}
