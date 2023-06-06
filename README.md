# PSF interface service

- [PSF interface service](#psf-interface-service)
  - [Description](#description)
  - [Get started](#get-started)
  - [Project structure](#project-structure)
  - [Useful materials](#useful-materials)

## Description

## Get started

```bash
git clone https://github.com/IMZolin/frt23-3d-interface.git <your project name>
cd <your project name>
npm install 
npm install --force # (if prev step doesn't work) 
npm start
```

## Project structure

```bash
├───backend
└───frontend 
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

## Useful materials

1. Notion report(ru): <https://www.notion.so/1d4cb5d37f1743babc89a2bea9fbc829?pvs=4>
2. Board in Miro(ru): <https://miro.com/app/board/uXjVMFFZCSg=/?share_link_id=999021127197>
3. Postman: <https://red-meteor-969100.postman.co/workspace/e7cf7956-c97a-4a54-b834-a2929af5ccdd>
