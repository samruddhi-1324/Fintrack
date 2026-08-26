import httpx
import json

def test_api_add_expense():
    # 1. Fetch categories
    cat_resp = httpx.get("http://localhost:8000/api/v1/categories")
    assert cat_resp.status_code == 200
    categories = cat_resp.json()
    food_cat = next(c for c in categories if c["name"] == "Food")

    # 2. Add new expense via POST
    payload = {
        "title": "Reliance Fresh Vegetables",
        "category_id": food_cat["id"],
        "amount": 320.00,
        "date": "2026-08-26",
        "notes": "Fresh veggies for home",
        "payment_mode": "upi"
    }

    post_resp = httpx.post("http://localhost:8000/api/v1/expenses", json=payload)
    print(f"POST Status Code: {post_resp.status_code}")
    print(f"Response Payload:\n{json.dumps(post_resp.json(), indent=2)}")
    
    assert post_resp.status_code == 201
    print("\n✅ REST API POST VERIFICATION SUCCESSFUL: 201 CREATED")

if __name__ == "__main__":
    test_api_add_expense()
