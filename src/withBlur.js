export default function withBlur(cb) {
  return (e) => {
    e.target.blur();
    cb(e);
  };
}
