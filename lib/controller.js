let store = [];

function record(data) {
  store.push(data);
}

function flush() {
  const data = [...store];
  store = [];
  return data;
}

module.exports = { record, flush };
