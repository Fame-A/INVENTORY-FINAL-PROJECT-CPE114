# Inventory Management REST API

## About

Managing physical inventory is one of the most common and critical challenges faced by businesses of all sizes — from small hardware shops in the province to large warehouses supplying multiple retail locations. Without a structured system, businesses often struggle with stock inaccuracies, lost items, untracked suppliers, and disorganized categories that lead to lost revenue and inefficiency.

This project, the **Inventory Management REST API**, was built as the CPE 114 Software Design Final Project to address this exact problem. The application provides a fully functional backend REST API that enables a business or system to manage its inventory of items, organize them into logical categories, and track which suppliers can provide each item.

The API is built around three core resources: **Categories**, **Items**, and **Suppliers**. Categories allow items to be grouped into logical families (e.g., Electronics, Office Supplies, Raw Materials). Items represent individual stock entries in the warehouse, each assigned to a category. Suppliers are the vendors or distributors who provide those items, and each item can have multiple suppliers — and each supplier can supply multiple items, making this a true many-to-many relationship.

The API fully implements REST conventions including proper use of HTTP methods (GET, POST, PUT, DELETE), meaningful status codes (200, 201, 400, 404, 500), and structured JSON responses for both success and error cases. All relationships between entities are enforced at the database level using foreign keys and through Sequelize ORM associations.

The project demonstrates good backend engineering practices including separation of concerns through the MVC pattern, centralized error handling, request logging, input validation, and secure configuration via environment variables. It is designed so that any frontend application, mobile app, or Postman client can consume the API without needing to understand the underlying database structure.

This system solves real-world problems: a warehouse manager can add new product categories, register items with their SKU and stock count, assign multiple suppliers to each item with individual unit costs, and remove supplier relationships when contracts end — all through simple HTTP requests.

---

## Tech Stack

| Technology | Version |
|------------|---------|
| Node.js    | v20.x   |
| Express.js | ^4.19.2 |
| Sequelize  | ^6.37.3 |
| MySQL      | 8.x     |
| mysql2     | ^3.9.7  |
| dotenv     | ^16.4.5 |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone [https://github.com/Fame-A/inventory-api.git](https://github.com/Fame-A/INVENTORY-FINAL-PROJECT-CPE114.git)
cd inventory-api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example env file and fill in your database credentials:

```bash
cp .env.example .env
```

Edit `.env`:

```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_db
DB_USER=root
DB_PASSWORD=yourpassword
PORT=3000
```

### 4. Create the MySQL Database

Log in to MySQL and create the database:

```sql
CREATE DATABASE inventory_db;
```

> Sequelize will automatically create all tables on first startup via `sequelize.sync()`.

### 5. Start the Server

```bash
npm start
```

You should see:

```
Database synced successfully.
Inventory API running at http://localhost:3000
```

---

## Database Schema

### `categories`

| Column      | Type         | Constraints              |
|-------------|--------------|--------------------------|
| id          | INT          | PK, AUTO_INCREMENT       |
| name        | VARCHAR(100) | NOT NULL, UNIQUE         |
| description | TEXT         | NULLABLE                 |
| createdAt   | DATETIME     | NOT NULL                 |
| updatedAt   | DATETIME     | NOT NULL                 |

### `suppliers`

| Column       | Type         | Constraints              |
|--------------|--------------|--------------------------|
| id           | INT          | PK, AUTO_INCREMENT       |
| name         | VARCHAR(150) | NOT NULL                 |
| contactEmail | VARCHAR(150) | NOT NULL, UNIQUE         |
| phone        | VARCHAR(30)  | NULLABLE                 |
| address      | TEXT         | NULLABLE                 |
| createdAt    | DATETIME     | NOT NULL                 |
| updatedAt    | DATETIME     | NOT NULL                 |

### `items`

| Column      | Type           | Constraints                          |
|-------------|----------------|--------------------------------------|
| id          | INT            | PK, AUTO_INCREMENT                   |
| name        | VARCHAR(150)   | NOT NULL                             |
| sku         | VARCHAR(50)    | NOT NULL, UNIQUE                     |
| description | TEXT           | NULLABLE                             |
| quantity    | INT            | NOT NULL, DEFAULT 0, min: 0          |
| price       | DECIMAL(10,2)  | NOT NULL, min: 0                     |
| categoryId  | INT            | NOT NULL, FK → categories(id)        |
| createdAt   | DATETIME       | NOT NULL                             |
| updatedAt   | DATETIME       | NOT NULL                             |

### `item_suppliers` (Junction Table)

| Column     | Type          | Constraints                    |
|------------|---------------|--------------------------------|
| id         | INT           | PK, AUTO_INCREMENT             |
| itemId     | INT           | NOT NULL, FK → items(id)       |
| supplierId | INT           | NOT NULL, FK → suppliers(id)   |
| unitCost   | DECIMAL(10,2) | NULLABLE                       |
| createdAt  | DATETIME      | NOT NULL                       |
| updatedAt  | DATETIME      | NOT NULL                       |

---

## Relationship Diagram (ER Diagram)

```
+----------------+         +------------------+         +----------------+
|   categories   |         |      items       |         |   suppliers    |
+----------------+         +------------------+         +----------------+
| PK id          |1       N| PK id            |         | PK id          |
| name           |─────────| name             |         | name           |
| description    |         | sku              |         | contactEmail   |
| createdAt      |         | description      |M       N| phone          |
| updatedAt      |         | quantity         |─────────| address        |
+----------------+         | price            |         | createdAt      |
                           | FK categoryId    |         | updatedAt      |
                           | createdAt        |         +----------------+
                           | updatedAt        |                |
                           +------------------+                |
                                    |                          |
                                    |    +-------------------+ |
                                    |    |  item_suppliers   | |
                                    |    +-------------------+ |
                                    +───>| FK itemId         |<+
                                         | FK supplierId     |
                                         | unitCost          |
                                         | createdAt         |
                                         | updatedAt         |
                                         +-------------------+

Relationships:
  Category (1) ──────── (N) Item         [One-to-Many]
  Item     (M) ──────── (N) Supplier     [Many-to-Many via item_suppliers]
```

---

## API Reference

### Categories

| Method | Path               | Request Body                          | Description                          | Success Code |
|--------|--------------------|---------------------------------------|--------------------------------------|--------------|
| GET    | /categories        | —                                     | Get all categories                   | 200          |
| GET    | /categories/:id    | —                                     | Get one category with its items      | 200          |
| POST   | /categories        | `{ name*, description }`             | Create a new category                | 201          |
| PUT    | /categories/:id    | `{ name, description }`              | Update a category                    | 200          |
| DELETE | /categories/:id    | —                                     | Delete a category                    | 200          |

### Suppliers

| Method | Path               | Request Body                                        | Description                           | Success Code |
|--------|--------------------|-----------------------------------------------------|---------------------------------------|--------------|
| GET    | /suppliers         | —                                                   | Get all suppliers                     | 200          |
| GET    | /suppliers/:id     | —                                                   | Get one supplier with its items       | 200          |
| POST   | /suppliers         | `{ name*, contactEmail*, phone, address }`         | Create a new supplier                 | 201          |
| PUT    | /suppliers/:id     | `{ name, contactEmail, phone, address }`           | Update a supplier                     | 200          |
| DELETE | /suppliers/:id     | —                                                   | Delete a supplier                     | 200          |

### Items

| Method | Path                            | Request Body                                           | Description                              | Success Code |
|--------|---------------------------------|--------------------------------------------------------|------------------------------------------|--------------|
| GET    | /items                          | —                                                      | Get all items with category              | 200          |
| GET    | /items/:id                      | —                                                      | Get one item with category and suppliers | 200          |
| POST   | /items                          | `{ name*, sku*, price*, categoryId*, description, quantity }` | Create a new item              | 201          |
| PUT    | /items/:id                      | `{ name, sku, price, categoryId, description, quantity }` | Update an item                      | 200          |
| DELETE | /items/:id                      | —                                                      | Delete an item                           | 200          |
| POST   | /items/:id/suppliers            | `{ supplierId*, unitCost }`                           | Assign a supplier to an item             | 201 / 200    |
| DELETE | /items/:id/suppliers/:supplierId| —                                                      | Remove a supplier from an item           | 200          |

`*` = required field

### Example Responses

**GET /items/1**
```json
{
  "id": 1,
  "name": "Arduino Uno",
  "sku": "ARD-UNO-001",
  "description": "Microcontroller board",
  "quantity": 50,
  "price": "12.99",
  "categoryId": 1,
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z",
  "category": {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic components and gadgets"
  },
  "suppliers": [
    {
      "id": 1,
      "name": "TechParts Co.",
      "contactEmail": "contact@techparts.com",
      "ItemSupplier": { "unitCost": "8.50" }
    }
  ]
}
```

**POST /items (201 Created)**
```json
{
  "id": 2,
  "name": "Raspberry Pi 4",
  "sku": "RPI-4-001",
  "quantity": 20,
  "price": "45.00",
  "categoryId": 1,
  "category": { "id": 1, "name": "Electronics" }
}
```

---

## Error Responses

| Status | Error              | When it occurs                                      | JSON Structure |
|--------|--------------------|-----------------------------------------------------|----------------|
| 400    | Validation Error   | Missing required fields or invalid data on POST/PUT | `{ "error": "Validation Error", "message": "..." }` |
| 404    | Not Found          | Record or route does not exist                      | `{ "error": "Not Found", "message": "..." }` |
| 500    | Internal Server Error | Unexpected server-side failure                   | `{ "error": "Internal Server Error", "message": "An unexpected error occurred. Please try again later." }` |

**Example 400:**
```json
{
  "error": "Validation Error",
  "message": "'name', 'sku', 'price', and 'categoryId' are required."
}
```

**Example 404:**
```json
{
  "error": "Not Found",
  "message": "Item with id 99 not found."
}
```

**Example undefined route (404):**
```json
{
  "error": "Not Found",
  "message": "Route GET /undefined-path does not exist."
}
```
