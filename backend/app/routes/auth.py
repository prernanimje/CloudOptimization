from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
import logging

from ..database import get_db
from ..models import User
from ..schemas import UserCreate, UserResponse, Token
from ..utils.security import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_user

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    logger.info(f"📝 Registration attempt: username={user.username}, email={user.email}")
    
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        logger.warning(f"⚠️  Email already registered: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    db_username = db.query(User).filter(User.username == user.username).first()
    if db_username:
        logger.warning(f"⚠️  Username already taken: {user.username}")
        raise HTTPException(status_code=400, detail="Username already taken")
        
    try:
        hashed_password = get_password_hash(user.password)
        new_user = User(email=user.email, username=user.username, hashed_password=hashed_password)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        logger.info(f"✅ User registered successfully: {user.username}")
        return new_user
    except Exception as e:
        logger.error(f"❌ Registration error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"🔐 Login attempt: username={form_data.username}")
    
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user:
        logger.warning(f"⚠️  User not found: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    pwd_match = verify_password(form_data.password, user.hashed_password)
    logger.info(f"🔐 Password verification for {form_data.username}: {pwd_match}")
    
    if not pwd_match:
        logger.warning(f"⚠️  Password mismatch for user: {form_data.username}")
        logger.debug(f"   Provided pwd hash attempt, stored: {user.hashed_password[:50]}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    logger.info(f"✅ Login successful: {form_data.username}")
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
