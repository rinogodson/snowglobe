const DecodeOREncode = (par: string) => {
  return par.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= "Z" ? "A".charCodeAt(0) : "a".charCodeAt(0);
    return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
  });
};

export default DecodeOREncode;
