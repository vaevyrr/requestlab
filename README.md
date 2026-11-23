# RequestLab

A small command-line API runner for repeatable HTTP checks. Keep requests in a JSON collection, provide environment values separately, and run the collection from a terminal or CI job.

## Features

- GET, POST, PUT, PATCH and DELETE requests
- Collection files with named requests
- `{{variable}}` substitution in URLs, headers and bodies
- Per-request timeout
- Expected status assertions
- Response timing and concise output
- Optional JSON report

## Requirements

Node.js 18 or newer. No dependencies.

## Run

```bash
node src/index.js examples/collection.json
node src/index.js examples/collection.json --env examples/local.env.json --report report.json
```

Environment files should not contain real credentials if you plan to commit them. Use your own private file and add it to `.gitignore`.

## Collection format

See `examples/collection.json`. Each request needs a `name` and `url`; method defaults to GET. Optional `expectStatus`, `headers`, `body`, and `timeoutMs` are supported.

## License

MIT
