import type { Task } from '../types';

export function explainScore(task: Task): string {
  const relevancePart = `Relevanssi ${task.relevance}/5 antaa ${task.relevanceComponent.toFixed(2)} pistettä`;

  let urgencyPart: string;
  if (task.daysUntilDeadline === null) {
    urgencyPart = `ei määräaikaa, joten kiireellisyys on matala vakio (${task.urgencyComponent.toFixed(2)})`;
  } else if (task.isOverdue) {
    urgencyPart = `määräaika on jo ohi, joten kiireellisyys on maksimissaan (${task.urgencyComponent.toFixed(2)})`;
  } else {
    urgencyPart = `määräaikaan on ${Math.round(task.daysUntilDeadline)} pv, mikä antaa ${task.urgencyComponent.toFixed(2)} pistettä kiireellisyydestä`;
  }

  return `${relevancePart}, ja ${urgencyPart}. Yhteispisteet ${task.score.toFixed(2)} (molemmat painotettu 50 %).`;
}
