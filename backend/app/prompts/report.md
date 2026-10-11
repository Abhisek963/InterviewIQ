# Final Report Generator Prompt
Generate a comprehensive final report and 7-day practice plan for the candidate.

Session Info:
- Company: {company_name}
- Job Role: {job_title}
- Overall Score: {overall_score} / 100
- Dimension Scores: {dimension_scores}
- Answer Summary & Reviews: {answer_reviews}

Generate JSON format:
{
  "summary": "Executive summary of interview performance",
  "strengths": ["Key strength 1", "Key strength 2"],
  "improvements": ["Key improvement area 1", "Key improvement area 2"],
  "practice_plan": [
    {
      "day": 1,
      "focus_area": "Focus topic",
      "tasks": ["Task 1", "Task 2"],
      "resource_recommendations": ["Doc/Article link or book reference"]
    },
    ... (up to Day 7)
  ]
}
