from typing import Dict, Any, List
from app.services.ai_provider import AIProvider

class InterviewPlannerService:
    @staticmethod
    def generate_plan(
        parsed_resume: Dict[str, Any],
        company_name: str,
        job_title: str,
        interview_type: str,
        difficulty: str,
        duration_minutes: int
    ) -> List[Dict[str, Any]]:
        # Target question count based on duration
        if duration_minutes <= 15:
            count = 5
        elif duration_minutes <= 25:
            count = 7
        else:
            count = 10

        skills = parsed_resume.get("skills", ["Software Engineering"])
        projects = parsed_resume.get("projects", [])
        project_titles = [p.get("title", "") for p in projects if isinstance(p, dict)]

        prompt = f"""
Generate a question plan of exactly {count} questions for a candidate applying for {job_title} at {company_name}.
Interview Type: {interview_type}
Difficulty: {difficulty}
Duration: {duration_minutes} minutes
Candidate Skills: {', '.join(skills[:8])}
Candidate Projects: {', '.join(project_titles[:3])}

Return a JSON object with a key "questions" containing a list of {count} question specs.
"""
        system_prompt = "You are an expert tech interview planner. Generate realistic, structured interview question plans."
        res = AIProvider.generate_json(prompt, system_prompt)
        
        questions = res.get("questions", [])
        if not questions:
            # Fallback planned questions
            questions = [
                {
                    "sequence_number": i + 1,
                    "topic": f"Technical Competency {i + 1}",
                    "category": "technical" if i % 2 == 0 else "behavioral",
                    "objective": "Assess core engineering capabilities",
                    "difficulty": difficulty,
                    "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                }
                for i in range(count)
            ]
        return questions
