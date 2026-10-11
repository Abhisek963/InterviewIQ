import json
import logging
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

logger = logging.getLogger("interviewiq.ai_provider")

class AIProvider:
    @staticmethod
    def generate_json(prompt: str, system_prompt: str = "") -> Dict[str, Any]:
        """
        Generates structured JSON response using configured LLM provider or Mock Provider.
        """
        if settings.MOCK_AI_MODE or not settings.LLM_API_KEY or settings.LLM_PROVIDER == "mock":
            return AIProvider._mock_generate_json(prompt, system_prompt)

        provider = settings.LLM_PROVIDER.lower()
        try:
            if provider == "openai":
                return AIProvider._call_openai(prompt, system_prompt)
            elif provider == "gemini":
                return AIProvider._call_gemini(prompt, system_prompt)
            elif provider == "anthropic":
                return AIProvider._call_anthropic(prompt, system_prompt)
            else:
                logger.warning(f"Unknown AI provider '{provider}', falling back to Mock Provider.")
                return AIProvider._mock_generate_json(prompt, system_prompt)
        except Exception as e:
            logger.error(f"Error calling AI Provider ({provider}): {e}. Falling back to Mock mode.")
            return AIProvider._mock_generate_json(prompt, system_prompt)

    @staticmethod
    def _call_openai(prompt: str, system_prompt: str) -> Dict[str, Any]:
        headers = {
            "Authorization": f"Bearer {settings.LLM_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.LLM_MODEL or "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": system_prompt + "\nRespond ONLY in valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.4
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)

    @staticmethod
    def _call_gemini(prompt: str, system_prompt: str) -> Dict[str, Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.LLM_MODEL or 'gemini-1.5-flash'}:generateContent?key={settings.LLM_API_KEY}"
        payload = {
            "contents": [
                {"role": "user", "parts": [{"text": f"{system_prompt}\n\n{prompt}\n\nOUTPUT VALID JSON ONLY."}]}
            ],
            "generationConfig": {
                "response_mime_type": "application/json",
                "temperature": 0.4
            }
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)

    @staticmethod
    def _call_anthropic(prompt: str, system_prompt: str) -> Dict[str, Any]:
        headers = {
            "x-api-key": settings.LLM_API_KEY,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": settings.LLM_MODEL or "claude-3-haiku-20240307",
            "system": system_prompt + "\nRespond ONLY in valid JSON format.",
            "messages": [{"role": "user", "content": prompt}],
            "max_tokens": 2048,
            "temperature": 0.4
        }
        with httpx.Client(timeout=30.0) as client:
            resp = client.post("https://api.anthropic.com/v1/messages", headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            text = data["content"][0]["text"]
            return json.loads(text)

    @staticmethod
    def _mock_generate_json(prompt: str, system_prompt: str) -> Dict[str, Any]:
        """
        Deterministic Mock AI Provider for offline / testing execution.
        """
        prompt_lower = prompt.lower()
        system_lower = system_prompt.lower()

        if "plan" in prompt_lower or "plan" in system_lower:
            return {
                "mock_mode": True,
                "questions": [
                    {
                        "sequence_number": 1,
                        "topic": "Data Structures & Core CS",
                        "category": "technical",
                        "objective": "Assess fundamental algorithmic understanding",
                        "difficulty": "intermediate",
                        "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                    },
                    {
                        "sequence_number": 2,
                        "topic": "System Design & Architecture",
                        "category": "technical",
                        "objective": "Assess understanding of scalable backend components",
                        "difficulty": "intermediate",
                        "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                    },
                    {
                        "sequence_number": 3,
                        "topic": "Resume Project Deep Dive",
                        "category": "project",
                        "objective": "Verify candidate ownership and trade-off choices in projects",
                        "difficulty": "intermediate",
                        "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                    },
                    {
                        "sequence_number": 4,
                        "topic": "Problem Solving & Error Handling",
                        "category": "technical",
                        "objective": "Assess debugging methodology and edge-case handling",
                        "difficulty": "intermediate",
                        "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                    },
                    {
                        "sequence_number": 5,
                        "topic": "Behavioral & Engineering Ethics",
                        "category": "behavioral",
                        "objective": "Evaluate team collaboration and communication",
                        "difficulty": "intermediate",
                        "rubric": {"correctness": 35, "relevance": 20, "depth": 20, "clarity": 15, "structure": 10}
                    }
                ]
            }

        elif "evaluat" in prompt_lower or "evaluat" in system_lower:
            return {
                "mock_mode": True,
                "technical_correctness": 82.0,
                "relevance": 88.0,
                "reasoning_and_depth": 78.0,
                "communication_clarity": 85.0,
                "answer_structure": 80.0,
                "correct_concepts": ["Clear explanation of key concepts", "Accurate core terminology"],
                "missing_concepts": ["Edge cases handling", "Quantitative efficiency trade-offs"],
                "factual_errors": [],
                "strengths": ["Structured response", "Clear vocabulary"],
                "improvements": ["Elaborate on performance considerations and scale"],
                "example_stronger_answer": "A stronger answer would explicitly state time complexity O(N log N), explain space constraints, and mention fault isolation.",
                "confidence_level": 0.95,
                "evaluation_notes": "Solid answer with minor room for technical depth."
            }

        else:
            return {
                "mock_mode": True,
                "content": "Simulated response for interview process."
            }
