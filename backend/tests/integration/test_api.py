import pytest

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "mock_ai_mode" in data

def test_get_current_user_profile(client):
    headers = {"Authorization": "Bearer dev-token-testuser123"}
    response = client.get("/api/v1/users/me", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "testuser123"

def test_update_profile(client):
    headers = {"Authorization": "Bearer dev-token-testuser123"}
    response = client.patch(
        "/api/v1/users/me",
        json={"full_name": "Alice Smith", "college_name": "IIT Bombay", "graduation_year": 2026},
        headers=headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["full_name"] == "Alice Smith"
    assert data["college_name"] == "IIT Bombay"
    assert data["graduation_year"] == 2026
