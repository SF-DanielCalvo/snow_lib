# snow_lib

Snowfactory internal operations library.

## Installation

```bash
npm install github:yourusername/snow_lib
```

## Features

- FTP operations
- SQL database operations
- Email functionality

## Usage

```javascript
import { snow } from 'snow_lib'

// FTP operations
await snow.ftp.upload(file)

// SQL operations
await snow.sql.query(sql)

// Email operations
await snow.email.send(options)
```

## License

ISC
