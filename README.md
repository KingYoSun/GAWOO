<p align="center"><img src="https://i.imgur.com/flcMvDC.png"></p>

## Usage

### Create an App

```
# with npx
$ npx create-nextron-app my-app --example with-typescript-material-ui

# with yarn
$ yarn create nextron-app my-app --example with-typescript-material-ui

# with pnpx
$ pnpx create-nextron-app my-app --example with-typescript-material-ui
```

### Install Dependencies

```
$ cd my-app

# using yarn or npm
$ yarn (or `npm install`)

# using pnpm
$ pnpm install --shamefully-hoist
```

### Use it

```
# development mode
$ yarn dev (or `npm run dev` or `pnpm run dev`)

# production build
$ yarn build (or `npm run build` or `pnpm run build`)
```

### DB Migration

- changing db schema

```
# update ./prisma/schema.prisma
$ npx prisma migrate dev --name ***
$ npx prisma db push
```

- applly change of db schema in production

```
$npx prisma migrate deploy --**name**
```
