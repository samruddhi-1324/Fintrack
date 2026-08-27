# FinTrack — Postman API Testing Guide & Step-by-Step Walkthrough

This guide provides step-by-step instructions on how to test the **FinTrack REST API** using **Postman**, from basic manual request testing to automated collection runs and assertion tests.

---

## 🛠 Prerequisites

Before starting your API tests, make sure:
1. **Postman App** is installed on your computer ([Download Postman](https://www.postman.com/downloads/)).
2. The FinTrack Backend API server is running:
   - **Local Server**: `http://localhost:8000/api/v1`
   - **Production Server**: `https://fintrack-backend-hmc6.onrender.com/api/v1`

---

## 📥 Step 1: Import the Postman Collection

1. Open **Postman**.
2. Click the **Import** button in the top-left sidebar (or press `Ctrl + O` / `Cmd + O`).
3. Choose one of the following methods:
   - **Method A (File Import)**: Click **Files** and select [`fintrack.postman_collection.json`](file:///d:/Fintrack/fintrack.postman_collection.json) from the project directory.
   - **Method B (Raw Text)**: Copy the JSON from [`collection.md`](file:///d:/Fintrack/collection.md), select **Raw text** in Postman, paste the JSON, and click **Import**.

---

## ⚙️ Step 2: Configure Environment & Variables

1. In Postman, click **Environments** on the left sidebar ➔ **+ (Create Environment)**.
2. Name the environment **`FinTrack Local`**.
3. Add the following variable:
   - **Variable**: `baseUrl`
   - **Initial Value**: `http://localhost:8000/api/v1`
   - **Current Value**: `http://localhost:8000/api/v1`
4. Click **Save** (`Ctrl + S`).
5. Select **`FinTrack Local`** from the environment dropdown menu in the top-right corner.

---

## 🧪 Step 3: Step-by-Step API Testing Workflow

Follow this sequence to test full CRUD and workflow operations:

### 1. Test Health & Connectivity
- Request: **`GET {{baseUrl}}/health`**
- Click **Send**.
- **Expected Status**: `200 OK`
- **Expected Body**:
  ```json
  {
    "status": "healthy",
    "database": "connected"
  }
  ```

---

### 2. Create a Category
- Request: **`POST {{baseUrl}}/categories`**
- Body (JSON):
  ```json
  {
    "name": "Food & Dining",
    "is_default": false
  }
  ```
- Click **Send**.
- **Expected Status**: `200 OK` or `201 Created`
- 📌 **Important**: Copy the returned category `id` UUID from the response JSON for the next steps!

---

### 3. Fetch Categories List
- Request: **`GET {{baseUrl}}/categories`**
- Click **Send**.
- **Expected Status**: `200 OK`
- Verify your newly created category is listed.

---

### 4. Create an Expense
- Request: **`POST {{baseUrl}}/expenses`**
- Body (JSON) — *Replace `<CATEGORY_UUID>` with the UUID copied in Step 2*:
  ```json
  {
    "title": "Supermarket Groceries",
    "amount": 1450.00,
    "category_id": "<CATEGORY_UUID>",
    "date": "2026-08-27",
    "payment_mode": "upi",
    "notes": "Weekly grocery shopping"
  }
  ```
- Click **Send**.
- **Expected Status**: `200 OK` or `201 Created`

---

### 5. Set a Category Monthly Budget
- Request: **`POST {{baseUrl}}/budgets`**
- Body (JSON):
  ```json
  {
    "category_id": "<CATEGORY_UUID>",
    "amount": 10000.00,
    "period": "monthly"
  }
  ```
- Click **Send**.
- **Expected Status**: `200 OK` or `201 Created`

---

### 6. Get Category Spending & Trend Reports
- Request: **`GET {{baseUrl}}/reports`** (or with query param `GET {{baseUrl}}/reports?period=monthly`)
- Click **Send**.
- **Expected Status**: `200 OK`
- **Verification**: Returns `category_breakdown` (category IDs, names, amounts, percentages) and `spending_trend`.

---

### 7. Test Data CSV Export
- Request: **`GET {{baseUrl}}/export/csv`**
- Click **Send**.
- **Expected Status**: `200 OK`
- Response Content-Type should be `text/csv` with downloaded expense rows.

---

## ⚡ Step 4: Automated Testing with Postman Collection Runner

You can run all API tests automatically in one click:

1. Click on the **`FinTrack REST API`** collection in the left sidebar.
2. Click **Run** (or click the three dots `...` ➔ **Run collection**).
3. Ensure all requests are checked.
4. Click **Run FinTrack REST API**.
5. Postman will execute all requests in sequence and output a summary report of response times and statuses!

---

## 🔍 Step 5: Adding Automated Assertions (Scripts)

To make Postman automatically validate HTTP status codes, add test scripts to requests under the **Tests** tab:

```javascript
// Test Status Code 200 OK
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// Test Response Time is under 500ms
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

// Test Response Body JSON Structure
pm.test("Response has healthy status", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.status).to.eql("healthy");
});
```

---

## ⚠️ Troubleshooting Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Could not get response / ECONNREFUSED` | Backend API server is not running on port 8000 | Run `uvicorn app.main:app --port 8000` in `backend/` |
| `422 Unprocessable Entity` | Request JSON body is missing required fields | Check field names (e.g. `title`, `amount`, `category_id`) |
| `404 Not Found` | Incorrect API path | Ensure URL includes `/api/v1/` prefix (e.g. `http://localhost:8000/api/v1/health`) |
