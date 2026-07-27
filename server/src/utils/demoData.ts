import { Types } from 'mongoose';

type Locale = 'en' | 'fi';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

const CONTENT: Record<
  Locale,
  {
    emailTitle: string;
    emailDescription: string;
    emailCategory: string;
    inboxTitle: string;
    q3Title: string;
    q3Description: string;
    q3Category: string;
    q3Sub1: string;
    q3Sub2: string;
    bugTitle: string;
    bugCategory: string;
    bugFeedback: string;
    docsTitle: string;
    docsCategory: string;
  }
> = {
  en: {
    emailTitle: 'Reply to customer email',
    emailDescription: 'Urgent question about pricing',
    emailCategory: 'communication',
    inboxTitle: 'Clean up inbox',
    q3Title: 'Write Q3 review for the team',
    q3Description:
      'Agent-added task, split into two subtasks - try marking a subtask done and rating the estimate',
    q3Category: 'writing',
    q3Sub1: 'Pull numbers from the team dashboard',
    q3Sub2: 'Write the summary and send it to the team',
    bugTitle: 'Fix production login bug',
    bugCategory: 'coding',
    bugFeedback: 'The bug was more complex than estimated - needed debugging across several modules.',
    docsTitle: 'Update API documentation',
    docsCategory: 'writing',
  },
  fi: {
    emailTitle: 'Vastaa asiakkaan sähköpostiin',
    emailDescription: 'Kiireellinen kysymys hinnoittelusta',
    emailCategory: 'viestintä',
    inboxTitle: 'Siivoa sähköpostilaatikko',
    q3Title: 'Kirjoita Q3-katsaus tiimille',
    q3Description:
      'AI-agentin lisäämä tehtävä, pilkottu kahdeksi alitehtäväksi - kokeile merkitä alitehtävä valmiiksi ja anna palautetta arviosta',
    q3Category: 'kirjoittaminen',
    q3Sub1: 'Kerää lukuja tiimin dashboardilta',
    q3Sub2: 'Kirjoita yhteenveto ja lähetä tiimille',
    bugTitle: 'Korjaa tuotantobugi kirjautumisessa',
    bugCategory: 'koodaus',
    bugFeedback: 'Bugi oli monimutkaisempi kuin arvioitu - vaati debuggausta useasta moduulista.',
    docsTitle: 'Päivitä API-dokumentaatio',
    docsCategory: 'kirjoittaminen',
  },
};

export function buildDemoTasks(userId: unknown, locale: Locale = 'en') {
  const c = CONTENT[locale] ?? CONTENT.en;
  const q3ReviewId = new Types.ObjectId();

  return [
    {
      userId,
      title: c.emailTitle,
      description: c.emailDescription,
      estimatedMinutes: 15,
      relevance: 5,
      category: c.emailCategory,
      deadline: daysFromNow(1),
      status: 'todo',
      createdVia: 'user',
    },
    {
      userId,
      title: c.inboxTitle,
      estimatedMinutes: 20,
      relevance: 1,
      category: '',
      deadline: null,
      status: 'todo',
      createdVia: 'user',
    },
    {
      _id: q3ReviewId,
      userId,
      title: c.q3Title,
      description: c.q3Description,
      estimatedMinutes: 45,
      relevance: 4,
      category: c.q3Category,
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      parentTaskId: q3ReviewId,
      title: c.q3Sub1,
      estimatedMinutes: 20,
      relevance: 4,
      category: c.q3Category,
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      parentTaskId: q3ReviewId,
      title: c.q3Sub2,
      estimatedMinutes: 25,
      relevance: 4,
      category: c.q3Category,
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      title: c.bugTitle,
      estimatedMinutes: 30,
      relevance: 5,
      category: c.bugCategory,
      deadline: daysFromNow(2),
      status: 'done',
      createdVia: 'agent',
      actualMinutes: 90,
      estimateRating: 2,
      estimateFeedback: c.bugFeedback,
    },
    {
      userId,
      title: c.docsTitle,
      estimatedMinutes: 20,
      relevance: 3,
      category: c.docsCategory,
      deadline: null,
      status: 'done',
      createdVia: 'agent',
      actualMinutes: 18,
      estimateRating: 5,
      estimateFeedback: '',
    },
  ];
}
