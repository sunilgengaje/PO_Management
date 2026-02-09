from fastapi import FastAPI, HTTPException, Depends, status, Request
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from PIL import Image, ImageDraw, ImageFont
import io, base64, random, string, time

app = FastAPI()

origins = ["http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# In-memory user store (replace with DB in prod)
users_db = {
    "admin@example.com": {
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("Admin@123"),
        "role": "admin",
        "blocked": False,
        "login_attempts": 0,
        "last_attempt": 0
    },
    "user@example.com": {
        "email": "user@example.com",
        "hashed_password": pwd_context.hash("User@123"),
        "role": "user",
        "blocked": False,
        "login_attempts": 0,
        "last_attempt": 0
    }
}

class Token(BaseModel):
    access_token: str
    token_type: str
    user: str
    role: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    captcha: str = ""
    remember: bool = False

class LoginResponse(BaseModel):
    status: str
    token: str = ""
    user: str = ""
    role: str = ""
    message: str = ""
    captchaRequired: bool = False

# Captcha store (in-memory, for demo)
captcha_store = {}

# Vendor store (in-memory)
vendors = [
    {"id": 1, "name": "Vendor A"},
    {"id": 2, "name": "Vendor B"}
]

# --- Utility functions ---
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta=None):
    to_encode = data.copy()
    expire = time.time() + (expires_delta or ACCESS_TOKEN_EXPIRE_MINUTES * 60)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(email: str):
    return users_db.get(email)

def block_user(email: str):
    if email in users_db:
        users_db[email]["blocked"] = True

def record_login_attempt(email: str, success: bool):
    user = users_db.get(email)
    if not user:
        return
    now = time.time()
    if not success:
        user["login_attempts"] += 1
        user["last_attempt"] = now
        if user["login_attempts"] >= 5:
            user["blocked"] = True
    else:
        user["login_attempts"] = 0
        user["last_attempt"] = now

def is_blocked(email: str):
    user = users_db.get(email)
    return user and user["blocked"]

def needs_captcha(email: str):
    user = users_db.get(email)
    return user and user["login_attempts"] >= 3

def generate_captcha():
    text = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    img = Image.new('RGB', (120, 40), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    d.text((10, 5), text, fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    return text, f"data:image/png;base64,{img_b64}"

# --- Auth endpoints ---
@app.post("/auth/login", response_model=LoginResponse)
@limiter.limit("10/minute")
def login(req: LoginRequest, request: Request):
    user = get_user(req.email)
    if not user:
        return LoginResponse(status="error", message="User not found")
    if is_blocked(req.email):
        return LoginResponse(status="error", message="Account blocked. Try later.")
    if needs_captcha(req.email):
        if not req.captcha or req.captcha != captcha_store.get(req.email, ""):
            captchaRequired = True
            captcha_store[req.email] = generate_captcha()[0]
            return LoginResponse(status="error", message="Captcha required", captchaRequired=True)
    if not verify_password(req.password, user["hashed_password"]):
        record_login_attempt(req.email, False)
        if needs_captcha(req.email):
            captcha_store[req.email] = generate_captcha()[0]
        return LoginResponse(status="error", message="Invalid password", captchaRequired=needs_captcha(req.email))
    if user["blocked"]:
        return LoginResponse(status="error", message="Account blocked. Try later.")
    record_login_attempt(req.email, True)
    token = create_access_token({"sub": req.email, "role": user["role"]})
    return LoginResponse(status="success", token=token, user=req.email, role=user["role"])

@app.get("/auth/captcha")
def get_captcha(email: str = ""):  # email param for demo
    text, image = generate_captcha()
    if email:
        captcha_store[email] = text
    return {"image": image}

@app.post("/auth/refresh")
def refresh(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        if not email:
            raise HTTPException(status_code=401, detail="Invalid token")
        new_token = create_access_token({"sub": email, "role": role})
        return {"token": new_token}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/auth/logout")
def logout():
    return {"status": "success"}

@app.get("/auth/me")
def me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        role = payload.get("role")
        return {"user": email, "role": role}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# --- Vendor endpoints ---
@app.get("/vendors")
def get_vendors(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        return {"items": vendors}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/vendors")
def add_vendor(vendor: dict, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        new_vendor = {"id": len(vendors) + 1, **vendor}
        vendors.append(new_vendor)
        return new_vendor
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.put("/vendors/{vendor_id}")
def update_vendor(vendor_id: int, vendor: dict, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Forbidden")
        for v in vendors:
            if v["id"] == vendor_id:
                v.update(vendor)
                return v
        raise HTTPException(status_code=404, detail="Vendor not found")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/products")
def get_products(token: str = Depends(oauth2_scheme)):
    return {"items": []}

@app.post("/products")
def add_product(product: dict, token: str = Depends(oauth2_scheme)):
    return {"id": 1, **product}

@app.put("/products/{product_id}")
def update_product(product_id: int, product: dict, token: str = Depends(oauth2_scheme)):
    return {"id": product_id, **product}
