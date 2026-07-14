import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma.js';

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

function collectQuestionMeta(surveyConfig) {
  const meta = {};
  (surveyConfig?.pages || []).forEach((page) => {
    (page.elements || []).forEach((el) => {
      meta[el.name] = { title: el.title || el.name, type: el.type };
    });
  });
  return meta;
}

function isImageAnswer(value) {
  return typeof value === 'string' && /^data:image\/(png|jpe?g|webp|gif);base64,/.test(value);
}

// Flags an answer if its choice was picked by fewer than 15% of other
// respondents to the same question — needs at least 5 other responses to
// have any statistical meaning.
async function detectOutliers(task, assignment, questionMeta) {
  const flags = [];

  const others = await prisma.taskAssignment.findMany({
    where: {
      taskId: task.id,
      id: { not: assignment.id },
      status: { in: ['SUBMITTED', 'APPROVED'] }
    },
    select: { responseData: true }
  });

  const choiceQuestions = Object.entries(questionMeta).filter(([, q]) =>
    ['radiogroup', 'checkbox', 'dropdown', 'boolean', 'rating'].includes(q.type)
  );

  for (const [name, q] of choiceQuestions) {
    const answer = assignment.responseData?.[name];
    if (answer === undefined || answer === null || answer === '') continue;

    const distribution = {};
    let total = 0;
    for (const o of others) {
      const v = o.responseData?.[name];
      if (v === undefined || v === null || v === '') continue;
      const key = JSON.stringify(v);
      distribution[key] = (distribution[key] || 0) + 1;
      total++;
    }
    if (total < 5) continue;

    const freq = (distribution[JSON.stringify(answer)] || 0) / total;
    if (freq < 0.15) {
      flags.push({
        type: 'outlier',
        question: q.title,
        detail: `Chosen by only ${Math.round(freq * 100)}% of ${total} other respondents to this question.`,
        severity: 'medium'
      });
    }
  }

  return flags;
}

async function runAIReview(assignment, questionMeta) {
  if (!client) {
    return { flags: [], summary: 'AI review unavailable — no ANTHROPIC_API_KEY configured.' };
  }

  let promptText =
    "You are a quality-assurance reviewer for a crowdsourced field survey. Review this participant's " +
    'answers for signs of fake, low-effort, nonsensical, or implausible responses (and any attached ' +
    'images for relevance/plausibility). Questions and answers:\n\n';
  const imageBlocks = [];

  for (const [name, value] of Object.entries(assignment.responseData || {})) {
    const meta = questionMeta[name];
    if (!meta || meta.type === 'gpslocation') continue;
    if (isImageAnswer(value)) {
      const match = value.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        promptText += `Question "${meta.title}": [image attached below]\n`;
        imageBlocks.push({ type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } });
      }
    } else {
      promptText += `Question "${meta.title}": ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    }
  }

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      output_config: {
        format: {
          type: 'json_schema',
          schema: {
            type: 'object',
            properties: {
              verdict: { type: 'string', enum: ['pass', 'flag', 'fail'] },
              summary: { type: 'string' },
              flags: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    issue: { type: 'string' },
                    severity: { type: 'string', enum: ['low', 'medium', 'high'] }
                  },
                  required: ['question', 'issue', 'severity'],
                  additionalProperties: false
                }
              }
            },
            required: ['verdict', 'summary', 'flags'],
            additionalProperties: false
          }
        }
      },
      messages: [{ role: 'user', content: [{ type: 'text', text: promptText }, ...imageBlocks] }]
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    const parsed = JSON.parse(textBlock.text);

    return {
      flags: (parsed.flags || []).map((f) => ({
        type: 'ai_review',
        question: f.question,
        detail: f.issue,
        severity: f.severity
      })),
      summary: parsed.summary
    };
  } catch (error) {
    console.error('AI QA review error:', error);
    return { flags: [], summary: 'AI review failed (see server logs).' };
  }
}

export async function runQA(taskId, assignmentId) {
  const assignment = await prisma.taskAssignment.findFirst({
    where: { id: assignmentId, taskId },
    include: { task: true }
  });
  if (!assignment) throw new Error('Assignment not found');

  const questionMeta = collectQuestionMeta(assignment.task.surveyConfig);

  const [outlierFlags, aiResult] = await Promise.all([
    detectOutliers(assignment.task, assignment, questionMeta),
    runAIReview(assignment, questionMeta)
  ]);

  const flags = [...outlierFlags, ...aiResult.flags];
  const hasHigh = flags.some((f) => f.severity === 'high');
  const qaStatus = hasHigh ? 'FAILED' : flags.length > 0 ? 'FLAGGED' : 'PASSED';

  return prisma.taskAssignment.update({
    where: { id: assignmentId },
    data: {
      qaStatus,
      qaFlags: flags,
      qaSummary: aiResult.summary || null,
      qaRunAt: new Date()
    }
  });
}
