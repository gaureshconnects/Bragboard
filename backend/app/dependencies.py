from fastapi import Depends, HTTPException, status
from jose import jwt
from fastapi.security import OAuth2PasswordBearer
from utils import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def admin_required(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return user

async def employee_required(user=Depends(get_current_user)):
    if user.get("role") != "employee":
        raise HTTPException(status_code=403, detail="Employees only")
    return user
