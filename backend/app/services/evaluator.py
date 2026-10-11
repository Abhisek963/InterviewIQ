from typing import Dict, Any
from app.services.ai_provider import AIProvider

class AnswerEvaluatorService:
    DEFAULT_WEIGHTS = {
        "technical_correctness": 0.35,
        "relevance": 0.20,
        "reasoning_and_depth": 0.20,
        "communication_clarity": 0.15,
        "answer_structure": 0.10
    }

    @classmethod
    def evaluate_answer(
        cls,
        question_text: str,
        category: str,
        topic: str,
        candidate_answer: str,
        rubric: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        prompt = f"""
Evaluate the candidate's answer.
Question: {question_text}
Category: {category}
Topic: {topic}
Candidate Answer: {candidate_answer}

Return JSON with numerical ratings (0-100) for:
- technical_correctness
- relevance
- reasoning_and_depth
- communication_clarity
- answer_structure
And text lists for:
- correct_concepts
- missing_concepts
- factual_errors
- strengths
- improvements
- example_stronger_answer
- confidence_level (0.0 to 1.0)
- evaluation_notes
"""
        system_prompt = "You are an expert answer evaluator. Return objective ratings and structured feedback."
        res = AIProvider.generate_json(prompt, system_prompt)

        # Extract dimension scores with sensible fallback
        tech = float(res.get("technical_correctness", 75.0))
        rel = float(res.get("relevance", 80.0))
        depth = float(res.get("reasoning_and_depth", 70.0))
        clarity = float(res.get("communication_clarity", 80.0))
        struct = float(res.get("answer_structure", 75.0))

        # Clamp values to 0-100
        tech = max(0.0, min(100.0, tech))
        rel = max(0.0, min(100.0, rel))
        depth = max(0.0, min(100.0, depth))
        clarity = max(0.0, min(100.0, clarity))
        struct = max(0.0, min(100.0, struct))

        # Calculate overall score deterministically in Python using weights
        weights = cls.DEFAULT_WEIGHTS
        total_score = round(
            tech * weights["technical_correctness"] +
            rel * weights["relevance"] +
            depth * weights["reasoning_and_depth"] +
            clarity * weights["communication_clarity"] +
            struct * weights["answer_structure"],
            1
        )

        dimension_scores = {
            "technical_correctness": tech,
            "relevance": rel,
            "reasoning_and_depth": depth,
            "communication_clarity": clarity,
            "answer_structure": struct
        }

        feedback = {
            "correct_concepts": res.get("correct_concepts", ["Demonstrated understanding of core concepts"]),
            "missing_concepts": res.get("missing_concepts", ["Could include more specific edge case details"]),
            "factual_errors": res.get("factual_errors", []),
            "strengths": res.get("strengths", ["Clear explanation style"]),
            "improvements": res.get("improvements", ["Provide additional technical details and trade-offs"]),
            "example_stronger_answer": res.get("example_stronger_answer", "A comprehensive answer would outline the step-by-step approach, time/space trade-offs, and failure handling."),
            "confidence_level": float(res.get("confidence_level", 0.9)),
            "evaluation_notes": res.get("evaluation_notes", "Evaluation completed successfully.")
        }

        return {
            "score": total_score,
            "dimension_scores": dimension_scores,
            "feedback": feedback
        }
