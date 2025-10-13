# hash_password.py
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# replace with the password you want for admin
plain_password = "admin123"
hashed = pwd_context.hash(plain_password)

print("Hashed password:")
print(hashed)
