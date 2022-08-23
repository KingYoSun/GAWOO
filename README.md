<p align="center"><img src="./resources/logo.png"></p>

# GAWOO

## Usage

### Install Dependencies

```
# using yarn or npm (admin rights)
$ npm install --legacy-peer-deps
```

### Use it

```
# run unit test
$ npm run test

# run e2e test
$ npm run test:e2e

# development mode
$ npm run dev

# production build
$ npm run build

# e2e test
$ npm run build
$ npm run test:e2e
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
$ npx prisma migrate deploy --**name**
```
