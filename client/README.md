# Milvus insight client

## How to run

1. yarn install
2. yarn start

## Folder Structure

    └── public                    # Static resources
    └── src
      ├── assets                  # Put images here
      ├── components              # Components
      ├── consts                  # Constant values
      ├── context                 # React context
      ├── hooks                   # React hooks
      ├── http                    # Http request api. And we have http interceptor in GlobalEffect.tsx file
      ├── i18n                    # Language i18n
      ├── pages                   # All pages , business components and types.
      ├── router                  # React router, control the page auth.
      ├── styles                  # Styles, normally we use material to control styles.
      ├── types                   # Global types
      └── utils                   # The common functoins

### Fixed pacakge version

Temporarily we specify 3 packages' version for ts build.

```
"@material-ui/core": "4.11.4",
"@material-ui/lab": "4.0.0-alpha.58",
"react-i18next": "11.10.0",
```

`react-i18next`'s `useTranslation(<name>)` will return a `t` function, which used to return `string` and `string{}` type. But in latest version it only return `string` and cause typecheck error.

`@material-ui/core` change `TablePagination`(from '@material-ui/core/TablePagination') type in latest version. We specified a former version to prevent error here.

In future we will fix all type issues and remove specified package version usage.

### How to name the file

We use Camel-Case to name the file.

In components / pages folder, we need subfolder to wrapper all related files.

### Global Effect

We get global data or take global side effect in components/layout/GlobalEffect

### Http request

We support user to define HOST_URL when docker run and it will write the env-config.js in public folder.

We use class getter to define our client fields like \_field, because of our server response fields may be changed.

### Helper Folder

Like utils / consts / utils / hooks , we dont want put all functions or datas in one file like index.ts because of maintainability.

So when we need to create new file , treat the file like Class then name it.

### Icon

We put all icons in components/icons file. Normally we use material icon.

If we use custom svg, like: import { ReactComponent as MilvusEmIcon } from xxx/xxx.svg'.

It's react component because of svgr/webpack in webpack config.

### Build

We use react-app-rewired to change webpack config.

If we want to change the webpack config, we can edit config-overrides.js file.

And we use milvus insight server to host our client site. So our build path is `../server/build` .
