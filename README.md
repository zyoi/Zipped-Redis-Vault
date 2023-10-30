# Zipped Redis Vault

Zipped Redis Vault is a versatile key-value storage solution backed by Redis. With built-in compression for every stored value, it offers an efficient approach to storing data. Optional encryption ensures sensitive data remains confidential.

## Features

- **Redis Backed**: Harnesses the power of Redis for fast and reliable storage.
- **Always-On Compression**: Every stored value is automatically compressed using Zlib, ensuring efficient use of storage.
- **Optional Encryption**: Secure specific data by encrypting it before storage.

## Dependencies

- **Redis**: An in-memory data structure store used for fast data storage and retrieval.
- **Dotenv**: Loads environment variables from a `dev.env` file.
- **Zlib**: A software library for data compression.

## API

### `get(key: string): Promise<any>`

- Fetches the value for the specified key from the store.
- Returns a promise that resolves with the value.
- If the key is absent, the promise resolves with `null`.

### `set(key: string, value: any): Promise<void>`

- Saves the specified value under the given key.
- Returns a promise that resolves once the value is stored.

### `watcher(key: string, logTime: boolean, callback: (value: any) => void, savedUpdateTime?: string): void`

- Observes a key for updates.
- Executes the callback function if the key gets updated.
- If `logTime` is `true`, the key's update time is logged to the console.
- The `savedUpdateTime` parameter is optional, used to set an initial last known update time.

## Usage Example

To fully utilize Zipped Redis Vault, follow this simple usage guide:

1. **Initialization**:
- First, make sure you have installed and set up the module correctly.
- Ensure you have a running Redis instance.
- For encryption, create a `dev.env` file in the root of the module with the following content:

```plaintext
secret=password
```

This password will be used as the encryption key. Adjust the password to your desired value.

- Set up the `cfg.js` file for any keys you wish to encrypt.

2. **Basic Set & Get**:

```javascript
const { set, get } = require('zipped-redis-vault');

(async () => {
// Store a value
await set('myKey', { name: 'John', age: 30 });

// Retrieve the stored value
const value = await get('myKey');
console.log(value);  // Outputs: { name: 'John', age: 30 }
})();
```

3. **Using Watcher**:

```javascript
const { set, watcher } = require('zipped-redis-vault');

watcher('myKey', true, (value) => {
console.log('Updated value:', value);
});

setTimeout(async () => {
await set('myKey', { name: 'Doe', age: 35 });
// The watcher will log: Updated value: { name: 'Doe', age: 35 }
}, 2000);
```

Note: The watcher will detect any changes made to the key and execute the callback.

4. **Encryption**:
- Ensure you've listed keys you want encrypted in the `cfg.js`.
- Values saved with the encrypted keys will be encrypted before storage and decrypted upon retrieval.

```javascript
// Assuming 'secureData' is listed in cfg.js as a secretKey
await set('secureData', { cardNumber: '1234-5678-9012-3456' });

// When you retrieve it, it will be decrypted automatically
const data = await get('secureData');
console.log(data);  // Outputs: { cardNumber: '1234-5678-9012-3456' }
```

## Exported Objects

- **client: RedisClient** - The Redis client instance the key-value store relies on.

## Installation

1. Ensure all dependencies are met, especially a running Redis instance.
2. Install directly from GitHub:

```
npm i github:zyoi/shins_key_value
```

## Configuration and Encryption

To specify keys that should be encrypted before storage, edit the `cfg.js` file. Here's a template:

```
module.exports = {
secretKeys: [
// Add the keys you wish to encrypt here:
'key1',
'key2',
// ... and so on
]
}
```

For encryption to work, ensure that an environment variable named `secret` is set as your encryption key.

## Testing

Ensure you have a running Redis instance:

```
npm test
```

## Contributions

We welcome feedback, bug reports, and pull requests. Let's improve and expand together!

## License

[MIT](https://choosealicense.com/licenses/mit/)
