# Gamingroom Display Screen

This is the display screen where the kids can see who's playing and when their time is up.

## Dependencies

This app doesn't really make sense without first installing [gamingroom-API](https://github.com/Ornendil/gamingroom-API) and [gamingroom-admin](https://github.com/Ornendil/gamingroom-admin).

## Install

1. Set your settings in `src/data.js`. You'll want to edit `aapningstider` and `computers`. I can't recall if setting `timeSlotSize`to anything but 15 works, but you can try.

2. I don't think there's anything more you have to edit, but I'm probably wrong.

3. Build the app. Instructions for this are below.

4. Put the contents of the `build` folder in the `public` folder you created on your server when installing the [Gamingroom-API](https://github.com/Ornendil/gamingroom-API).

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

### Available Scripts

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

#### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

#### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
