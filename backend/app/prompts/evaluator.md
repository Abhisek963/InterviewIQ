# Answer Evaluator Prompt
Evaluate the candidate's answer for the following question.

Question: {question_text}
Category: {category}
Topic: {topic}
Candidate Answer: {candidate_answer}

Evaluation Rubric Weights:
- Technical correctness: 35%
- Relevance: 20%
- Reasoning & Depth: 20%
- Communication Clarity: 15%
- Answer Structure: 10%

Output JSON format:
{
  "technical_correctness": float (0-100),
  "relevance": float (0-100),
  "reasoning_and_depth": float (0-100),
  "communication_clarity": float (0-100),
  "answer_structure": float (0-100),
  "correct_concepts": ["concept 1", "concept 2"],
  "missing_concepts": ["missing concept 1"],
  "factual_errors": ["error if any"],
  "strengths": ["strength 1"],
  "improvements": ["area for improvement 1"],
  "example_stronger_answer": "Concrete example of a top-tier answer",
  "confidence_level": float (0.0-1.0),
  "evaluation_notes": "Brief notes"
}
