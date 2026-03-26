# Gamingroom Display Screen

This is the display screen where the kids can see who's playing and when their time is up.

<img width="1912" height="926" alt="gamingroom-display" src="https://github.com/user-attachments/assets/0723d8e0-695c-442c-8c16-4c7fda2751f9" />

## Dependencies

This app doesn't really make sense without first installing [gamingroom-API](https://github.com/Ornendil/gamingroom-API) and [gamingroom-admin](https://github.com/Ornendil/gamingroom-admin).

## Install

1. Change `API_ROOT` to wherever you installed the admin panel (i.e. where the "public" folder of the API is exposed to the internet). I was stupid and committed to calling my app `gamingrom` and then changed my mind and started using `gamingroom` instead, so the default here is `gamingrom`, even though it's `gamingroom` everywhere else.

2. I don't think there's anything more you have to edit, but I'm probably wrong.

3. Build the app. Instructions for this are below.

4. Put the contents of the `build` folder on your server.

## Development

In the project directory, run:

#### `npm install`

Installs the project dependencies.

#### `npm run dev`

Starts the Vite development server on [http://localhost:3000](http://localhost:3000).  
The `/api` routes are proxied to `http://localhost:3002`.

#### `npm start`

Alias for `npm run dev`.

#### `npm run build`

Builds the app for production into the `build` folder.

#### `npm run preview`

Serves the production build locally for a quick verification pass.

## Notes

The app is configured to build with the `/skjerm/` base path so it can continue to be served from that subpath.
