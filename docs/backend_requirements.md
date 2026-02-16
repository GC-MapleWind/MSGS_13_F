
# Backend API Requirements for Login System

This document outlines the API endpoints and logic required to support the frontend login and signup flow.

## 1. Auth Flow Overview

1.  **Kakao Login**: Frontend sends Kakao Auth Code -> Backend.
2.  **Branching**:
    - If user exists: Return valid JWT token (200 OK).
    - If user is new: Return a temporary `registerToken` (202 Accepted).
3.  **Signup**: Frontend sends `registerToken` + additional info (Student ID, Nickname) -> Backend creates user -> Return valid JWT token (200 OK).

## 2. API Endpoints

### A. Kakao Login
- **Endpoint**: `POST /api/auth/kakao/login`
- **Description**: Exchanges Kakao authorization code for an app session.

#### Request Body
```json
{
  "code": "KAKAO_AUTH_CODE_FROM_FRONTEND"
}
```

#### Response: Existing User (Login Success)
- **Status**: `200 OK`
```json
{
  "token": "ACCESS_TOKEN_JWT",
  "user": {
    "name": "홍길동",
    "studentId": "202012345",
    "nickname": "길동이",
    "level": 1,
    // ... other user fields
  }
}
```

#### Response: New User (Needs Registration)
- **Status**: `202 Accepted`
- **Note**: The `registerToken` should be a temporary token that claims the user's identity from Kakao but doesn't allow full API access yet.
```json
{
  "registerToken": "TEMPORARY_TOKEN_FOR_SIGNUP"
}
```

### B. Signup (Register)
- **Endpoint**: `POST /api/auth/signup`
- **Description**: Completes the registration process for a new user.

#### Request Body
```json
{
  "registerToken": "TOKEN_RECEIVED_FROM_LOGIN_202",
  "studentId": "123456789",
  "nickname": "멋진닉네임"
}
```

#### Response (Success)
- **Status**: `200 OK`
```json
{
  "token": "ACCESS_TOKEN_JWT",
  "user": {
    "name": "홍길동", // Extracted from Kakao profile using registerToken
    "studentId": "123456789",
    "nickname": "멋진닉네임"
    // ...
  }
}
```

### C. Verify Auth (Auto-login)
- **Endpoint**: `GET /api/auth/verify`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`
- **Description**: Validates the current token on page load.

#### Response (Valid)
- **Status**: `200 OK`
```json
{
  "user": {
    "name": "홍길동",
    "studentId": "202012345"
    // ...
  }
}
```

#### Response (Invalid/Expired)
- **Status**: `401 Unauthorized`

## 3. Notes for Developer
- **CORS**: Ensure CORS is configured to allow requests from the frontend origin (e.g., `http://localhost:5173`).
- **Error Handling**: For all endpoints, return `4xx` or `5xx` with a JSON body `{ "message": "Error description" }` in case of failure.
- **Debug Token**: The frontend currently uses a hardcoded mechanism to bypass backend auth for the user `황단바/123456789` with a token value of `"debug-token"`. The backend does NOT need to handle this (it's frontend-only), but be aware of it if debugging frontend behavior.

## 4. Data Models & Content Structure

The application displays "MeSaeng Gyeolsan" (MapleLife Settlement) data. The backend should provide APIs to serve this content.

### A. Character (Member)
Represents a club member participating in the settlement.
- **Table**: `characters`
- **Fields**:
  - `id` (PK): String or Integer
  - `name`: String (Real Name)
  - `nickname`: String (In-game Nickname)
  - `avatarUrl`: String (URL to profile image)
  - `level`: Integer
  - `job`: String (MapleStory Class)
  - `club`: String (Guild Name, e.g., "단풍바람")
  - `server`: String (World Name, e.g., "스카니아")

### B. Settlement Item (Gyeolsan Card)
Represents a specific achievement or memory card displayed in the user's settlement.
- **Table**: `settlement_items`
- **Fields**:
  - `id` (PK): String or Integer
  - `characterId` (FK): Links to `characters.id`
  - `title`: String (Card Title)
  - `description`: String (Detailed text, support for multi-line)
  - `imageUrl`: String (URL to the memory image)
  - `acquiredAt`: Date/String (Date of event, YYYY-MM-DD)

### C. Talk Comment (Guestbook)
Represents a comment left in the guestbook/talk section.
- **Table**: `talk_comments`
- **Fields**:
  - `id` (PK): String or Integer
  - `author`: String (Writer's name)
  - `authorAvatar`: String (URL to writer's avatar)
  - `content`: String (Comment body)
  - `createdAt`: Datetime (Timestamp)

### D. Suggested API Endpoints for Data

#### Get All Characters
- **GET** `/api/characters`
- **Response**: `Character[]`

#### Get Character's Settlement
- **GET** `/api/characters/{id}/settlements`
- **Response**: `SettlementItem[]`

#### Get Guestbook Comments
- **GET** `/api/comments`
- **Response**: `TalkComment[]`
