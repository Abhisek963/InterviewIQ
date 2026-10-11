from typing import List, Dict, Any, Tuple
from app.services.ai_provider import AIProvider

class ReportGeneratorService:
    @staticmethod
    def generate_final_report(
        company_name: str,
        job_title: str,
        qa_pairs: List[Tuple[Any, Any]]  # List of (InterviewQuestion, Answer)
    ) -> Dict[str, Any]:
        if not qa_pairs:
            return {
                "overall_score": 0.0,
                "dimension_scores": {
                    "technical_correctness": 0.0,
                    "relevance": 0.0,
                    "reasoning_and_depth": 0.0,
                    "communication_clarity": 0.0,
                    "answer_structure": 0.0
                },
                "strengths": ["No questions were answered during this session."],
                "improvements": ["Complete interview sessions to receive feedback."],
                "answer_reviews": [],
                "practice_plan": [],
                "summary": "Interview session completed without answers."
            }

        scores = []
        dim_totals = {
            "technical_correctness": 0.0,
            "relevance": 0.0,
            "reasoning_and_depth": 0.0,
            "communication_clarity": 0.0,
            "answer_structure": 0.0
        }
        answer_reviews = []
        valid_count = 0

        for q, a in qa_pairs:
            if not a or a.score is None:
                continue
            valid_count += 1
            scores.append(a.score)
            dims = a.dimension_scores or {}
            for k in dim_totals:
                dim_totals[k] += float(dims.get(k, a.score))

            fb = a.feedback or {}
            answer_reviews.append({
                "sequence_number": q.sequence_number,
                "question_text": q.question_text,
                "user_answer": a.answer_text,
                "score": round(a.score, 1),
                "dimension_scores": dims,
                "feedback_summary": fb.get("evaluation_notes", "Good attempt"),
                "example_stronger_answer": fb.get("example_stronger_answer", "")
            })

        if valid_count > 0:
            overall_score = round(sum(scores) / valid_count, 1)
            dimension_scores = {k: round(v / valid_count, 1) for k, v in dim_totals.items()}
        else:
            overall_score = 0.0
            dimension_scores = {k: 0.0 for k in dim_totals}

        # Prompt AI for summary & practice plan using computed scores
        prompt = f"""
Candidate completed mock interview for {job_title} at {company_name}.
Overall Score: {overall_score} / 100
Dimension Scores: {dimension_scores}
Number of answered questions: {valid_count}

Generate JSON with:
1. "summary": Executive overview paragraph based on their score of {overall_score}
2. "strengths": List of 3 key candidate strengths
3. "improvements": List of 3 priority growth areas
4. "practice_plan": List of 7 daily plans (day 1 to 7) with keys "day", "focus_area", "tasks" (list), "resource_recommendations" (list).
"""
        system_prompt = "You are a career development coach. Create action-oriented, encouraging, realistic performance reports."
        res = AIProvider.generate_json(prompt, system_prompt)

        default_practice_plan = [
            {
                "day": 1,
                "focus_area": "Data Structures & Core Algorithms",
                "tasks": ["Review Big-O notation", "Solve 3 array/hashmap problems"],
                "resource_recommendations": ["LeetCode Top Interview Questions"]
            },
            {
                "day": 2,
                "focus_area": "System Design Fundamentals",
                "tasks": ["Study load balancing & caching", "Map out a microservice flow"],
                "resource_recommendations": ["System Design Primer GitHub"]
            },
            {
                "day": 3,
                "focus_area": "Database Optimization & SQL",
                "tasks": ["Practice indexing queries", "Analyze query execution plans"],
                "resource_recommendations": ["Use The Index, Luke!"]
            },
            {
                "day": 4,
                "focus_area": "Behavioral STAR Method",
                "tasks": ["Draft 3 project accomplishment stories using STAR"],
                "resource_recommendations": ["STAR Interview Method Guide"]
            },
            {
                "day": 5,
                "focus_area": "Project Architecture Review",
                "tasks": ["Prepare deep-dive explanation of primary resume project"],
                "resource_recommendations": ["Resume Architecture Checklist"]
            },
            {
                "day": 6,
                "focus_area": "Mock Interview Retest",
                "tasks": ["Re-answer questions scored below 80 in this session"],
                "resource_recommendations": ["InterviewIQ Mock Practice"]
            },
            {
                "day": 7,
                "focus_area": "Final Confidence & Warmup",
                "tasks": ["Conduct full timed 20-minute mock session"],
                "resource_recommendations": ["InterviewIQ Live Practice"]
            }
        ]

        return {
            "overall_score": overall_score,
            "dimension_scores": dimension_scores,
            "strengths": res.get("strengths", ["Solid baseline understanding", "Structured answers", "Good communication"]),
            "improvements": res.get("improvements", ["Elaborate on edge cases", "Include metrics in project descriptions", "Improve depth on complex questions"]),
            "answer_reviews": answer_reviews,
            "practice_plan": res.get("practice_plan", default_practice_plan),
            "summary": res.get("summary", f"Candidate demonstrated strong potential with an overall score of {overall_score}/100 in the {job_title} mock interview at {company_name}.")
        }
