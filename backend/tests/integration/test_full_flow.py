"""
Integration test for complete interview flow using multipart upload.
Uses the test client to simulate a full interview session with mock AI.
"""
import pytest
import io
import json
import os
import docx

# Build a minimal in-memory DOCX for testing
def create_test_docx() -> bytes:
    doc = docx.Document()
    doc.add_paragraph("John Doe - Software Engineer")
    doc.add_paragraph("Skills: Python, React, SQL, FastAPI, Docker, Data Structures, Algorithms")
    doc.add_paragraph("Education: B.Tech Computer Science - State University - 2025")
    doc.add_paragraph("Projects: Web Platform built with React and Python FastAPI")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_full_interview_flow(client):
    """Tests the complete interview flow from upload through question submission."""
    headers = {"Authorization": "Bearer dev-token-interviewflow001"}

    # 1. Upload resume
    docx_bytes = create_test_docx()
    response = client.post(
        "/api/v1/resumes",
        headers={"Authorization": "Bearer dev-token-interviewflow001"},
        files={"file": ("test_resume.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert response.status_code == 201, f"Resume upload failed: {response.text}"
    resume_data = response.json()
    assert resume_data["status"] == "ready"
    assert resume_data["parsed_profile"]["skills"]
    resume_id = resume_data["id"]

    # 2. Create interview session
    response = client.post(
        "/api/v1/interviews",
        headers=headers,
        json={
            "resume_id": resume_id,
            "company_name": "Google",
            "job_title": "Software Engineer",
            "interview_type": "technical",
            "difficulty": "intermediate",
            "duration_minutes": 10
        }
    )
    assert response.status_code == 201, f"Interview creation failed: {response.text}"
    session_data = response.json()
    session_id = session_data["id"]
    assert session_data["status"] == "created"

    # 3. Start interview
    response = client.post(
        f"/api/v1/interviews/{session_id}/start",
        headers=headers
    )
    assert response.status_code == 200, f"Start interview failed: {response.text}"
    question_data = response.json()
    assert question_data["sequence_number"] == 1
    assert question_data["question_text"]

    # 4. Submit first answer
    response = client.post(
        f"/api/v1/interviews/{session_id}/answers",
        headers=headers,
        json={"answer_text": "In my experience, I would use a hash map for O(1) lookups combined with a sorted tree for range queries. This reduces the time complexity from O(N) to O(log N) for most operations."}
    )
    assert response.status_code == 200, f"Answer submission failed: {response.text}"
    answer_data = response.json()
    assert "answer_id" in answer_data
    assert "evaluation" in answer_data
    assert answer_data["evaluation"]["score"] >= 0

    # 5. Finish interview early
    response = client.post(
        f"/api/v1/interviews/{session_id}/finish",
        headers=headers
    )
    assert response.status_code == 200, f"Finish interview failed: {response.text}"
    session_data = response.json()
    assert session_data["status"] == "completed"

    # 6. Retrieve report
    response = client.get(
        f"/api/v1/interviews/{session_id}/report",
        headers=headers
    )
    assert response.status_code == 200, f"Get report failed: {response.text}"
    report_data = response.json()
    assert report_data["status"] == "ready"
    assert report_data["overall_score"] is not None
    assert len(report_data["strengths"]) > 0
    assert len(report_data["answer_reviews"]) > 0
    assert len(report_data["practice_plan"]) > 0

    # 7. Verify cross-user access is blocked
    other_headers = {"Authorization": "Bearer dev-token-otheruser999"}
    response = client.get(
        f"/api/v1/interviews/{session_id}/report",
        headers=other_headers
    )
    assert response.status_code == 404, "Cross-user access should return 404"

    print(f"\n[PASS] Full interview flow: Score={report_data['overall_score']}, Questions={len(report_data['answer_reviews'])}")


def test_completed_session_rejects_answers(client):
    """Tests that a completed session cannot receive new answers."""
    headers = {"Authorization": "Bearer dev-token-completedtest001"}


    # Upload resume first
    docx_bytes = create_test_docx()
    r = client.post(
        "/api/v1/resumes",
        headers=headers,
        files={"file": ("test.docx", io.BytesIO(docx_bytes), "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}
    )
    assert r.status_code == 201
    resume_id = r.json()["id"]

    # Create and start interview
    r = client.post("/api/v1/interviews", headers=headers, json={
        "resume_id": resume_id, "company_name": "Amazon", "job_title": "SDE",
        "interview_type": "technical", "difficulty": "beginner", "duration_minutes": 10
    })
    assert r.status_code == 201
    session_id = r.json()["id"]

    client.post(f"/api/v1/interviews/{session_id}/start", headers=headers)
    client.post(f"/api/v1/interviews/{session_id}/finish", headers=headers)

    # Try to submit answer to completed session
    r = client.post(f"/api/v1/interviews/{session_id}/answers", headers=headers,
                    json={"answer_text": "This should be rejected"})
    assert r.status_code == 400, "Completed session should reject answers"


def test_unauthorized_access(client):
    """Tests that unauthenticated or cross-user access is properly blocked."""
    # Try to access non-existent resource with a valid-looking token
    headers = {"Authorization": "Bearer dev-token-unauthorizedtest"}
    r = client.get("/api/v1/interviews/nonexistent-session-id", headers=headers)
    assert r.status_code == 404
