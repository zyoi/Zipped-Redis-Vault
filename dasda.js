const SHA256 = require("crypto-js/sha256");

let data = [
  { foo: "foo", bar: "bar", baz: "baz" },
  { foo: "foo", bar: "bar", baz: "baz" },
  { foo: "foo", bar: "bar", baz: "baz" },
  { foo: "foo", bar: "bar", baz: "baz" }
];

let foo = JSON.stringify(data);

console.log(SHA256(foo).toString());