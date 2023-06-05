# Frontend for frt-23-3d services and applications
* [Description](#description)
* [Get started](#get-started)
* [Project structure](#project-structure)

## Description


## Get started
```bash
git clone https://github.com/IMZolin/frt23-3d-front.git <your project name>
cd <your project name>
npm install 
npm install --force # (if prev step doesn't work) 
npm start
```

## Project structure
```bash
├───node_modules # libs
├───public # assets and configs
├───src # code
│   ├───app # App.js with Routs and store(axios)
│   ├───components  # separate independent parts of pages
│   ├───dev # to view and work on the components
│   ├───hooks  # support functions 
│   ├───pages # parts of app(e.x.: main page)
│   └───index.js # get results
├───.gitignore
├───.prettierignore
├───.prettierrc
├───package.json # configs 
├───package-lock.json # configs
└───README.md # doc
```

