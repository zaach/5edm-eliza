# 5EDM Eliza

The OG chat bot, [ELIZA](https://en.wikipedia.org/wiki/ELIZA), made available on [5edm](https://5edm.deno.dev).

## Local Setup

First, setup [5edm](https://github.com/zaach/5edm) locally. Within the 5edm project directory create a `.env` and start the server:

```
cd ./5edm
cp .env.example .env
deno task start
```

Then within this project directory create `.env` by copying the example and start the bot:

```
cp .env.example .env
deno run --allow-net --allow-read --allow-env --allow-run --unstable main.ts
```

When you visit [5edm](http://localhost:8000) now you'll see an option to chat with ELIZA🤖.
