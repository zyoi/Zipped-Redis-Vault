# Zipped Redis Vault

Zipped Redis Vault is a high-performance key-value storage solution that leverages the speed of Redis. It comes with built-in compression using Zlib and optional encryption to keep your data secure and storage-efficient.

## Features

- **Redis-Backed**: Utilizes Redis for fast, in-memory data storage and retrieval.
- **Automatic Compression**: Values are automatically compressed with Zlib, optimizing storage space.
- **Optional Encryption**: Offers the option to encrypt data before storage for enhanced security.

## Dependencies

- **Redis**: A high-performance in-memory key-value data store.
- **Dotenv**: A zero-dependency module to load environment variables.
- **Zlib**: A compression library providing data compression functionality.
- **Crypto-JS**: A library of cryptography standards for encryption.

## API

### `get(key: string): Promise<any>`

Retrieves the value associated with the given key.

- **Parameters**: `key` - The key to fetch the value for.
- **Returns**: A promise that resolves to the value, or `null` if the key doesn't exist.

### `set(key: string, value: any): Promise<void>`

Stores a value under the specified key.

- **Parameters**:
   - `key` - The key under which to store the value.
   - `value` - The value to store.
- **Returns**: A promise that resolves once the operation is complete.

### `watcher(key: string, logTime: boolean, callback: (value: any) => void, savedUpdateTime?: string): void`

Watches a specific key for any updates and executes a callback when the key is updated.

- **Parameters**:
   - `key` - The key to watch.
   - `logTime` - If `true`, logs the update time to the console.
   - `callback` - A function to execute when the key is updated.
   - `savedUpdateTime` - (Optional) The initial last known update time.

## Usage Example

Here's a quick guide to getting started with Zipped Redis Vault:

1. **Setup**:
   Ensure Redis is running and accessible. Place your configuration in a `dev.env` file at the root of your project, like so:

   ```plaintext
   SECRET=your_encryption_key
   SECRET_KEYS=comma_separated_keys_to_encrypt
   REDIS_URL=redis://your_redis_url:6379
   ```

2. **Storing and Retrieving Data**:

   ```javascript
   const { set, get } = require('zipped-redis-vault');

   (async () => {
   await set('myKey', { name: 'John', age: 30 });
   const value = await get('myKey');
   console.log(value);  // Outputs: { name: 'John', age: 30 }
   })();
   ```

3. **Using the Watcher**:

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

4. **Encryption**:
   Any keys specified in the `SECRET_KEYS` of your `dev.env` will be encrypted automatically.

   ```javascript
   await set('secureData', { cardNumber: '1234-5678-9012-3456' });
   const data = await get('secureData');
   console.log(data);  // Outputs: { cardNumber: '1234-5678-9012-3456' }
   ```

## Exported Objects

- **client: RedisClient** - The instance of the Redis client used by the module.

## Installation

To install the package, you need to have Redis running and a `dev.env` file with the necessary configurations.

1. Install the package using npm:

   ```plaintext
   npm i github:zyoi/Zipped-Redis-Vault
   ```

## Configuration

All configuration is handled through the `dev.env` file. This should include:

- `SECRET`: Your encryption key.
- `SECRET_KEYS`: A comma-separated list of keys to encrypt.
- `REDIS_URL`: The URL to your Redis server.

## Testing

To run tests, ensure your Redis instance is accessible as configured in `dev.env`:

```plaintext
npm test
```

## Contributions

Contributions are welcome! Feel free to submit issues, pull requests, or suggestions to help improve the project.

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/).
