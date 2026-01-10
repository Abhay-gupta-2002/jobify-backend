async function generateEmail({ jobText, company }) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      messages: [
        {
  role: "system",
  content: `
You are writing a job application email on behalf of a user.

STRICT RULES:
- Do NOT assume the user's background, education, or profession
- Do NOT mention software, technology, academics, or experience unless clearly stated in the job description
- Do NOT invent past roles, skills, or experience
- Base the email ONLY on the job description
-Do NOT give like job description not provided etc just try to be that user and write best mail so that your chnaces of selection increases
- Do NOT include applicant name
- ALWAYS End email exactly with "Kind regards, "
`,
}
,
        {
          role: "user",
          content: `
Company: ${company}

Job Description:
${jobText}

Write a professional job application email based ONLY on the above job description.
          `,
        },
      ],
      temperature: 0.3,
      max_tokens: 220,
    }),
  });

  const data = await res.json();

  if (!data?.choices?.length) {
    console.log("GROQ RAW RESPONSE:", data);
    throw new Error("Invalid AI response");
  }

  return data.choices[0].message.content;
}

module.exports = { generateEmail };
