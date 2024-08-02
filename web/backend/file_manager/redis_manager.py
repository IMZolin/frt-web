import time
from typing import Any, Optional

import redis

redis_client = redis.Redis(host='redis', port=6379, decode_responses=True)
TIMEOUT = 600


def pass2cache(cache_key: str, data: Any, is_dict_data: bool = True):
    try:
        if is_dict_data:
            cache_dict = {key: str(value) for key, value in data.items()}
            redis_client.hset(cache_key, mapping=cache_dict)
        else:
            redis_client.set(cache_key, data)
        redis_client.expire(cache_key, TIMEOUT)
        print(f"Successfully saved data in cache by cache key: {cache_key}")
    except Exception as e:
        raise Exception(f"Error in pass2cache: {e}")


async def get_cache_data(data_type: str, is_dict_data: bool = True) -> Optional[Any]:
    try:
        if is_dict_data:
            cache_data = redis_client.hgetall(f"{data_type}")
        else:
            cache_data = redis_client.get(f"{data_type}")
        return cache_data if cache_data else None
    except Exception as e:
        raise Exception(f"Cache not found: {e}")
