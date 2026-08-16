# Smart Exhibition Backend

REST API backend for the Smart Exhibition Management System.

## Stack

- Node.js + Express.js
- MySQL + mysql2
- JWT authentication
- bcrypt password hashing
- Multer file uploads
- express-validator
- CORS
- dotenv
- Postman

## Roles

| ID | Role |
|---:|---|
| 1 | Admin |
| 2 | Organizer |
| 3 | Exhibitor |
| 4 | Visitor |

## Project structure

```text
smart-exhibition-backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   │   ├── exhibitors/
│   │   ├── exhibitions/
│   │   ├── products/
│   │   ├── booth-documents/
│   │   └── reports/
│   └── server.js
├── postman/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## Setup

From the project root:

```powershell
npm install
```

Create `.env` from `.env.example` and set your local MySQL/JWT values.

Run development server:

```powershell
npm run dev
```

Run normally:

```powershell
npm start
```

Health check:

```text
GET /
```

Expected response:

```json
{
  "success": true,
  "message": "Smart Exhibition Backend Running 🚀"
}
```

## Authentication

Protected APIs use:

```text
Authorization: Bearer <JWT_TOKEN>
```

The authentication middleware puts the authenticated user in `req.user`.

## Main modules

- Authentication
- Exhibitions
- Halls
- Booths
- Exhibition Exhibitors
- Booth Bookings
- Booth Staff
- Products
- Booth Documents
- Visitors
- Visitor Logs
- Leads
- Feedback
- Notifications
- Reports

## Multer / File Uploads

Multer is fully integrated through:

```text
src/middleware/upload.middleware.js
```

Maximum configured file size: **5 MB**.

Allowed file types: **JPG, PNG, WEBP and PDF**.

### Upload endpoints

| Endpoint | Role | Form-data field | Purpose |
|---|---|---|---|
| `POST /api/exhibitors/upload-logo` | Exhibitor | `logo` | Exhibitor logo |
| `POST /api/exhibitions` | Organizer | `banner` | Create exhibition with banner |
| `PUT /api/exhibition/:id` | Organizer | `banner` | Replace exhibition banner |
| `POST /api/products/upload-image` | Exhibitor | `image` | Product image |
| `POST /api/booth-documents/upload` | Exhibitor | `file` | Booth document |
| `POST /api/reports` | Admin/Organizer | `report` | Report file |

For upload requests use **Postman → Body → form-data**. Do not manually set the multipart boundary.

Uploaded files are stored under `src/uploads/` and are served through:

```text
/uploads/...
```

The database stores the corresponding file URL/path where applicable.

## Core business flow

```text
Organizer
  ↓
Exhibition
  ↓
Hall
  ↓
Booth
  ↓
Exhibitor Registration / Booking
  ↓
Approval
  ↓
Allocated Booth
  ├── Booth Staff
  ├── Products
  └── Booth Documents
          ↓
       Visitors
          ↓
     Visitor Logs
          ↓
       Leads
          ↓
      Feedback
          ↓
 Notifications / Reports
```

## Ownership and authorization

Authentication answers **who is logged in**. Role middleware answers **what that role may do**. Services additionally check ownership where a resource belongs to a specific organizer, exhibitor or visitor.

Examples:

- Only organizers manage their exhibitions.
- Exhibitors can manage their own products/staff/documents.
- Visitors can access their own visitor data.
- Admin/Organizer endpoints are protected by role middleware.

## Postman testing order

1. Signup
2. Login
3. Create required role profile
4. Create exhibition
5. Create hall
6. Create booth
7. Register/approve exhibitor
8. Manage booth staff
9. Upload product image and create product
10. Upload booth document
11. Create visitor activity/logs
12. Create lead
13. Submit feedback
14. Test notifications
15. Test reports and report upload
16. Test role/ownership restrictions

Use separate JWT tokens for Admin, Organizer, Exhibitor and Visitor while testing permissions.

## Important security notes

Never share or commit:

```text
.env
DB_PASSWORD
JWT_SECRET
```

The distributable project contains `.env.example`, not the real `.env`.

The `.gitignore` also excludes runtime uploads and `node_modules`.

## Common status codes

| Code | Meaning |
|---:|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation / bad request |
| 401 | Authentication required/invalid |
| 403 | Forbidden |
| 404 | Not found |
| 409 | Conflict |
| 500 | Server error |

## Final handover

After extracting the ZIP:

```powershell
cd smart-exhibition-backend
npm install
```

Create `.env` from `.env.example`, configure MySQL, then:

```powershell
npm run dev
```

A live database integration test still depends on the recipient's MySQL server, schema/data and credentials; this package does not include production secrets or `node_modules`.
