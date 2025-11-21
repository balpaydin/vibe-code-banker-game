
import { Kingdom } from "../types";

export const generateWarNarrative = async (
  attacker: Kingdom,
  defender: Kingdom,
  winner: Kingdom,
  playerInvestment: number,
  supportType: 'gold' | 'weapons' | null
): Promise<string> => {
  
  const outcomes = [
    `${winner.name}, kanlı bir mücadelenin ardından ${attacker.name === winner.name ? defender.name : attacker.name} ordularını bozguna uğrattı.`,
    `Savaş meydanı sessizliğe gömüldü. ${winner.name} zafer bayrağını dikti.`,
    `${winner.name} stratejik bir hamleyle savaşı lehine çevirdi ve kazandı.`,
    `Tarih kitapları ${winner.name} krallığının bu kesin zaferini yazacak.`,
    `${winner.name} süvarileri düşman hatlarını yardı ve kesin bir zafer kazandı.`,
    `Kuşatma sona erdi, ${winner.name} sancağı surlarda dalgalanıyor.`
  ];

  let narrative = outcomes[Math.floor(Math.random() * outcomes.length)];

  if (playerInvestment > 0) {
    const bankerTemplates = [
       " Gönderilen silahlar savaşın kaderini belirledi.",
       " Bankerlerin desteği olmasa sonuç farklı olabilirdi.",
       " Paralı askerler ve yeni teçhizatlar zaferi getirdi.",
       " Perde arkasındaki finansal güç kendini gösterdi.",
       " Tüccarların sağladığı çelik, kandan daha değerliydi."
    ];
    narrative += bankerTemplates[Math.floor(Math.random() * bankerTemplates.length)];
  }

  // Simulate a small delay for effect, though not strictly necessary without API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(narrative);
    }, 500);
  });
};
