import asyncio
import logging

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from web.backend.views import router

app = FastAPI()
app.include_router(router)
logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")

origins = [
    "http://localhost:3010",
    "http://192.168.1.43:3010",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def start_backend(event_loop):
    config = uvicorn.Config(app, loop=event_loop, host="0.0.0.0", log_level=logging.INFO,
                            forwarded_allow_ips="*")
    server = uvicorn.Server(config)
    tasks = [asyncio.create_task(server.serve())]
    await asyncio.wait(tasks, return_when=asyncio.FIRST_COMPLETED)


async def main():
    try:
        loop = asyncio.get_event_loop()
        await asyncio.gather(start_backend(loop))
    except Exception as e:
        logging.error(e)


if __name__ == "__main__":
    asyncio.run(main())
