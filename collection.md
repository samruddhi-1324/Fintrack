# FinTrack — Postman API Testing & Collection Guide

This document contains the complete Postman API collection reference and importable collection JSON for testing all **FinTrack** REST API endpoints locally or in production.

---

## 🚀 Quick Setup Instructions for Postman

### Option A: Direct Import via JSON
1. Open **Postman**.
2. Click **Import** (top left).
3. Select **Raw text** (or paste the JSON from the [Importable Postman Collection JSON](#-importable-postman-collection-v210-json) section below).
4. Click **Import**.

### Option B: Set Up Environment Variables
Create a new Environment in Postman named **FinTrack Local** or **FinTrack Production**:

| Variable Name | Local Value | Production Value |
|---|---|---|
| `baseUrl` | `http://localhost:8000/api/v1` | `https://fintrack-backend-hmc6.onrender.com/api/v1` |
| `category_id` | *(Set after creating a category)* | *(Set after creating a category)* |
| `expense_id` | *(Set after creating an expense)* | *(Set after creating an expense)* |

---

## 📋 Endpoint Documentation & Payload Reference

### 1. Health & Status
- **`GET {{baseUrl}}/health`** — System health check & database connectivity.
- **`GET {{baseUrl}}/version`** — API service version information.

### 2. Categories API (`/categories`)
- **`GET {{baseUrl}}/categories`** — Fetch all categories.
- **`POST {{baseUrl}}/categories`** — Create a new spending category.
  ```json
  {
    "name": "Food & Dining",
    "is_default": false
  }
  ```
- **`PUT {{baseUrl}}/categories/{{category_id}}`** — Update a category.
  ```json
  {
    "name": "Groceries & Dining",
    "is_default": false
  }
  ```
- **`DELETE {{baseUrl}}/categories/{{category_id}}`** — Delete category.

### 3. Expenses API (`/expenses`)
- **`GET {{baseUrl}}/expenses`** — List expenses with optional pagination & filtering parameters:
  - Query Params: `start_date=2026-08-01`, `end_date=2026-08-31`, `category_id={{category_id}}`, `limit=50`
- **`POST {{baseUrl}}/expenses`** — Record a new expense.
  ```json
  {
    "title": "Supermarket Groceries",
    "amount": 1250.50,
    "category_id": "{{category_id}}",
    "date": "2026-08-27",
    "payment_mode": "upi",
    "notes": "Weekly household groceries purchase"
  }
  ```
- **`GET {{baseUrl}}/expenses/{{expense_id}}`** — Fetch single expense details.
- **`PUT {{baseUrl}}/expenses/{{expense_id}}`** — Update an expense entry.
  ```json
  {
    "title": "Supermarket Groceries",
    "amount": 1300.00,
    "category_id": "{{category_id}}",
    "date": "2026-08-27",
    "payment_mode": "card",
    "notes": "Updated purchase with tax"
  }
  ```
- **`DELETE {{baseUrl}}/expenses/{{expense_id}}`** — Delete expense entry.

### 4. Budgets API (`/budgets`)
- **`GET {{baseUrl}}/budgets`** — Fetch category monthly budgets.
- **`POST {{baseUrl}}/budgets`** — Set or update a category budget.
  ```json
  {
    "category_id": "{{category_id}}",
    "amount": 15000.00,
    "period": "monthly"
  }
  ```
- **`PUT {{baseUrl}}/budgets/{{budget_id}}`** — Update budget limit.
- **`DELETE {{baseUrl}}/budgets/{{budget_id}}`** — Remove budget limit.

### 5. Dashboard & Analytics (`/dashboard`, `/reports`)
- **`GET {{baseUrl}}/dashboard/summary`** — Dashboard KPIs (Total Spending, Budget Progress, Monthly Trend).
  - Query Params: `month=8`, `year=2026`
- **`GET {{baseUrl}}/reports/spending-by-category`** — Breakdown by category for pie/bar charts.
- **`GET {{baseUrl}}/reports/monthly-trends`** — Historical monthly spending trends.

### 6. Data Export (`/export`)
- **`GET {{baseUrl}}/export/csv`** — Export all expense records as a CSV spreadsheet file download.

---

## 📄 Importable Postman Collection v2.1.0 JSON

Copy the raw JSON block below and paste directly into **Postman** (Import ➔ Raw text):

```json
{
	"info": {
		"_postman_id": "fintrack-api-collection-v1",
		"name": "FinTrack REST API",
		"description": "Complete Postman Collection for testing FinTrack Expense Tracker API endpoints.",
		"schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
	},
	"variable": [
		{
			"key": "baseUrl",
			"value": "http://localhost:8000/api/v1",
			"type": "string"
		}
	],
	"item": [
		{
			"name": "Health Check",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/health",
					"host": ["{{baseUrl}}"],
					"path": ["health"]
				}
			}
		},
		{
			"name": "Version",
			"request": {
				"method": "GET",
				"header": [],
				"url": {
					"raw": "{{baseUrl}}/version",
					"host": ["{{baseUrl}}"],
					"path": ["version"]
				}
			}
		},
		{
			"name": "Categories",
			"item": [
				{
					"name": "Get Categories",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/categories",
							"host": ["{{baseUrl}}"],
							"path": ["categories"]
						}
					}
				},
				{
					"name": "Create Category",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"name\": \"Food & Dining\",\n  \"is_default\": false\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/categories",
							"host": ["{{baseUrl}}"],
							"path": ["categories"]
						}
					}
				}
			]
		},
		{
			"name": "Expenses",
			"item": [
				{
					"name": "Get Expenses",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/expenses",
							"host": ["{{baseUrl}}"],
							"path": ["expenses"]
						}
					}
				},
				{
					"name": "Create Expense",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"title\": \"Groceries\",\n  \"amount\": 1250.50,\n  \"category_id\": \"<CATEGORY_UUID>\",\n  \"date\": \"2026-08-27\",\n  \"payment_mode\": \"upi\",\n  \"notes\": \"Weekly groceries\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/expenses",
							"host": ["{{baseUrl}}"],
							"path": ["expenses"]
						}
					}
				}
			]
		},
		{
			"name": "Budgets",
			"item": [
				{
					"name": "Get Budgets",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/budgets",
							"host": ["{{baseUrl}}"],
							"path": ["budgets"]
						}
					}
				},
				{
					"name": "Set Budget",
					"request": {
						"method": "POST",
						"header": [
							{
								"key": "Content-Type",
								"value": "application/json"
							}
						],
						"body": {
							"mode": "raw",
							"raw": "{\n  \"category_id\": \"<CATEGORY_UUID>\",\n  \"amount\": 15000.00,\n  \"period\": \"monthly\"\n}"
						},
						"url": {
							"raw": "{{baseUrl}}/budgets",
							"host": ["{{baseUrl}}"],
							"path": ["budgets"]
						}
					}
				}
			]
		},
		{
			"name": "Dashboard & Analytics",
			"item": [
				{
					"name": "Get Dashboard Summary",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/dashboard/summary",
							"host": ["{{baseUrl}}"],
							"path": ["dashboard", "summary"]
						}
					}
				},
				{
					"name": "Get Category Spending Report",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/reports/spending-by-category",
							"host": ["{{baseUrl}}"],
							"path": ["reports", "spending-by-category"]
						}
					}
				}
			]
		},
		{
			"name": "Export Data",
			"item": [
				{
					"name": "Export CSV",
					"request": {
						"method": "GET",
						"header": [],
						"url": {
							"raw": "{{baseUrl}}/export/csv",
							"host": ["{{baseUrl}}"],
							"path": ["export", "csv"]
						}
					}
				}
			]
		}
	]
}
```
