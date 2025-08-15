module.exports = {
  stringify: (data) => JSON.stringify(data),
  parse: (data) => JSON.parse(data),
  serialize: (data) => ({ json: data, meta: {} }),
  deserialize: (data) => data.json || data,
  default: {
    stringify: (data) => JSON.stringify(data),
    parse: (data) => JSON.parse(data),
    serialize: (data) => ({ json: data, meta: {} }),
    deserialize: (data) => data.json || data,
  },
};
