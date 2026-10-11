from typing import Dict, Any, Optional
from app.services.ai_provider import AIProvider

class InterviewerService:
    @staticmethod
    def generate_next_question(
        company_name: str,
        job_title: str,
        interview_type: str,
        difficulty: str,
        current_sequence: int,
        planned_item: Dict[str, Any],
        parsed_resume: Dict[str, Any],
        previous_question: Optional[str] = None,
        previous_answer: Optional[str] = None
    ) -> Dict[str, Any]:
        category = planned_item.get("category", "technical")
        topic = planned_item.get("topic", "Software Engineering")
        skills = parsed_resume.get("skills", [])
        projects = parsed_resume.get("projects", [])

        prompt = f"""
Company: {company_name}
Job Title: {job_title}
Interview Type: {interview_type}
Difficulty: {difficulty}
Sequence Number: {current_sequence}
Topic: {topic}
Category: {category}
Candidate Skills: {', '.join(skills[:8])}
Candidate Projects: {[p.get('title') for p in projects[:2] if isinstance(p, dict)]}

Previous Question: {previous_question or 'None'}
Previous Answer: {previous_answer or 'None'}

Formulate a sharp, engaging, real-world interview question for question #{current_sequence}.
Do NOT output any answer or hints to the question. Ask only the question text itself.
"""
        system_prompt = "You are a senior tech interviewer. Ask one clear question. Return JSON with key 'question_text'."
        res = AIProvider.generate_json(prompt, system_prompt)

        question_text = res.get("question_text", "")
        if not question_text:
            if category == "technical":
                question_text = f"Can you explain how you would design and implement a scalable solution for {topic}? What trade-offs would you consider?"
            elif category == "behavioral":
                question_text = f"Describe a challenging situation you encountered regarding {topic}. How did you handle it and what was the outcome?"
            elif category == "project":
                proj_name = projects[0].get("title", "your recent project") if projects else "your project"
                question_text = f"In {proj_name}, what was the most complex technical hurdle you faced and how did you overcome it?"
            else:
                question_text = f"Why are you interested in joining {company_name} as a {job_title}, and how do your skills align with this role?"

        return {
            "sequence_number": current_sequence,
            "question_text": question_text,
            "category": category,
            "topic": topic,
            "difficulty": difficulty,
            "rubric": planned_item.get("rubric", {"technical_correctness": 35, "relevance": 20, "reasoning_and_depth": 20, "communication_clarity": 15, "answer_structure": 10})
        }
