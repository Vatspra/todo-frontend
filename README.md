# Todo Application

A modern todo application built with Vue 3 and Vite, featuring a clean and intuitive user interface for managing your daily tasks.

## Features

- Create, read, update, and delete todo items
- Mark todos as complete/incomplete
- Clean and responsive user interface
- Built with Vue 3 and TypeScript for type safety
- Fast development with Vite's hot module replacement

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Vue Router (for navigation)
- Pinia (for state management)

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Project Setup

```sh
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The development server will start at `http://localhost:5173` by default. Any changes you make to the code will be automatically reflected in the browser thanks to Vite's hot module replacement.

## Building for Production

When you're ready to deploy your application, run:

```sh
npm run build
```

This will create a production-ready build in the `dist` directory.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## License

MIT
