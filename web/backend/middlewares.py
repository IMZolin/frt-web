from fastapi import FastAPI, HTTPException
from asyncpg import UniqueViolationError
from typing import Callable, Any, List  # Импортируйте Callable для явного указания типов


async def handle_unique_violation_error(request: Any, call_next: Callable) -> Any:
    try:
        response = await call_next(request)
        return response
    except UniqueViolationError as e:
        error_message = "Uniqueness error: such a record already exists."
        raise HTTPException(status_code=400, detail=error_message)


async def valid_method_name(method: str, method_list: List[str], method_type: str):
    if method is None or method not in method_list:
        raise HTTPException(status_code=404, detail=f"Incorrect {method_type} type not found in the cache.")


async def valid_positive_nums(num_list: List[int], type_params: str):
    if any(num_list) < 0:
        raise HTTPException(status_code=422, detail=f"Incorrect {type_params} params")