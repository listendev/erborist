# erborist 🌱

> Arborist as a standalone executable

Thus, **e**rborist.

**e**rborist mimics what `npm install --package-lock-only ...` does,

without forcing you to have Node.js on your machine.

Kinda cool, isn't it?

## Benefits

You can generate a `package-lock.json` file...

- without Node.js on your machine (repetita iuvant)
- without `npm` on your machine
- without **actually installing anything** (bye `node_modules/` see you soon)
- targeting a specific lockfile version disregarding the `npm` version you may have or not
- even if the `package.json` scripts are broken

I do believe it's enough for today.
