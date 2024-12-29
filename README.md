# FRT (Fluorescence Restoration Techniques) in web interface


## Description

`About`: Fluorescence microscopy is widely used in fields like materials science and neurobiology for capturing 2D and 3D images of small objects due to its high sensitivity. However, noise and distortions often complicate analysis. To address this, we developed advanced methods for image enhancement, including automatic segmentation, denoising, and deconvolution, specifically for biological objects. Our work also led to the creation of a desktop application and online service, giving scientists tools to obtain clearer images of cellular structures, leading to more accurate conclusions.


`Technologies`: PyTorch, OpenCV, ReactJS, FastAPI, Docker, Redis

## Deployment

1. Cofigure the `.env` file 

```
yandex_access_key=...
yandex_secret_key=...
yandex_bucket_name=...
yandex_endpoint=https://storage.yandexcloud.net
```

2. Run the docker-compose file

```bash
docker-compose -f docker-compose.public.yml up -d --build
```


## Manual setup and configuration
1. Clone the repository of restoration methods

```bash
git clone -b web git@github.com:gerasimenkoab/simple_psf_extractor.git /web/engine
```

2. Build and run the Dockerfile

```bash
docker build -t frt:publi . # You can specify a different tag and change it in the docker-compose file.
docker-compose up -d --build
```