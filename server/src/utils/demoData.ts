import { Types } from 'mongoose';

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export function buildDemoTasks(userId: unknown) {
  const q3ReviewId = new Types.ObjectId();

  return [
    {
      userId,
      title: 'Vastaa asiakkaan sähköpostiin',
      description: 'Kiireellinen kysymys hinnoittelusta',
      estimatedMinutes: 15,
      relevance: 5,
      category: 'viestintä',
      deadline: daysFromNow(1),
      status: 'todo',
      createdVia: 'user',
    },
    {
      userId,
      title: 'Siivoa sähköpostilaatikko',
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
      title: 'Kirjoita Q3-katsaus tiimille',
      description:
        'AI-agentin lisäämä tehtävä, pilkottu kahdeksi alitehtäväksi - kokeile merkitä alitehtävä valmiiksi ja anna palautetta arviosta',
      estimatedMinutes: 45,
      relevance: 4,
      category: 'kirjoittaminen',
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      parentTaskId: q3ReviewId,
      title: 'Kerää lukuja tiimin dashboardilta',
      estimatedMinutes: 20,
      relevance: 4,
      category: 'kirjoittaminen',
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      parentTaskId: q3ReviewId,
      title: 'Kirjoita yhteenveto ja lähetä tiimille',
      estimatedMinutes: 25,
      relevance: 4,
      category: 'kirjoittaminen',
      deadline: daysFromNow(5),
      status: 'todo',
      createdVia: 'agent',
    },
    {
      userId,
      title: 'Korjaa tuotantobugi kirjautumisessa',
      estimatedMinutes: 30,
      relevance: 5,
      category: 'koodaus',
      deadline: daysFromNow(2),
      status: 'done',
      createdVia: 'agent',
      actualMinutes: 90,
      estimateRating: 2,
      estimateFeedback: 'Bugi oli monimutkaisempi kuin arvioitu - vaati debuggausta useasta moduulista.',
    },
    {
      userId,
      title: 'Päivitä API-dokumentaatio',
      estimatedMinutes: 20,
      relevance: 3,
      category: 'kirjoittaminen',
      deadline: null,
      status: 'done',
      createdVia: 'agent',
      actualMinutes: 18,
      estimateRating: 5,
      estimateFeedback: '',
    },
  ];
}
