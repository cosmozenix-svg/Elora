export interface CartoonAvatar {
  id: string;
  name: string;
  category: 'adventurer' | 'robot' | 'avataaars' | 'fun' | 'stylized';
  url: string;
}

export const CARTOON_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'adventurer', label: 'Adventurers' },
  { id: 'robot', label: 'Robots' },
  { id: 'avataaars', label: 'Toon Folk' },
  { id: 'fun', label: 'Emojis & Fun' },
  { id: 'stylized', label: 'Stylized' },
] as const;

export const CARTOON_AVATARS: CartoonAvatar[] = [
  // 1. Adventurers (RPG cartoon characters)
  { id: 'adv-1', name: 'Felix', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-2', name: 'Aneka', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-3', name: 'Zack', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zack&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-4', name: 'Luna', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Luna&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-5', name: 'Milo', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Milo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-6', name: 'Aria', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aria&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-7', name: 'Jasper', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jasper&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'adv-8', name: 'Caspian', category: 'adventurer', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Caspian&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },

  // 2. Robots (Cute bot cartoons)
  { id: 'bot-1', name: 'Gizmo', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Gizmo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-2', name: 'Sparky', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sparky&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-3', name: 'Bolt', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Bolt&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-4', name: 'Byte', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Byte&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-5', name: 'Circuit', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Circuit&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-6', name: 'Pixel', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Pixel&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-7', name: 'Cosmo', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cosmo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'bot-8', name: 'Nova', category: 'robot', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Nova&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },

  // 3. Toon Folk (Avataaars cartoon people)
  { id: 'toon-1', name: 'Sammy', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sammy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-2', name: 'Chloe', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-3', name: 'Bailey', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bailey&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-4', name: 'Max', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-5', name: 'Sophie', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-6', name: 'Alex', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-7', name: 'Zoe', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'toon-8', name: 'Leo', category: 'avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },

  // 4. Emojis & Fun
  { id: 'fun-1', name: 'Joyful', category: 'fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Joyful&backgroundColor=ffd5dc,ffdfbf,d1d4f9' },
  { id: 'fun-2', name: 'Cheeky', category: 'fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cheeky&backgroundColor=b6e3f4,ffd5dc,c0aede' },
  { id: 'fun-3', name: 'Wink', category: 'fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Wink&backgroundColor=d1d4f9,b6e3f4,ffdfbf' },
  { id: 'fun-4', name: 'Cool', category: 'fun', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool&backgroundColor=c0aede,ffd5dc,b6e3f4' },
  { id: 'fun-5', name: 'Grin', category: 'fun', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Oliver&backgroundColor=b6e3f4,c0aede,d1d4f9' },
  { id: 'fun-6', name: 'Sunny', category: 'fun', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Maya&backgroundColor=ffd5dc,ffdfbf,c0aede' },
  { id: 'fun-7', name: 'Breeze', category: 'fun', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Ruby&backgroundColor=b6e3f4,d1d4f9,ffdfbf' },
  { id: 'fun-8', name: 'Star', category: 'fun', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=Liam&backgroundColor=c0aede,ffd5dc,b6e3f4' },

  // 5. Stylized (Chic illustrations)
  { id: 'style-1', name: 'Kiki', category: 'stylized', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Kiki&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-2', name: 'Finn', category: 'stylized', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Finn&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-3', name: 'Nora', category: 'stylized', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Nora&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-4', name: 'Toby', category: 'stylized', url: 'https://api.dicebear.com/7.x/micah/svg?seed=Toby&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-5', name: 'Daisy', category: 'stylized', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Daisy&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-6', name: 'Jack', category: 'stylized', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Jack&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-7', name: 'Lily', category: 'stylized', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Lily&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
  { id: 'style-8', name: 'Ethan', category: 'stylized', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Ethan&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf' },
];

export function getRandomCartoonAvatar(): string {
  const index = Math.floor(Math.random() * CARTOON_AVATARS.length);
  return CARTOON_AVATARS[index].url;
}

export function generateCustomCartoonAvatar(seed: string, style: 'adventurer' | 'bottts' | 'avataaars' | 'fun-emoji' | 'micah' = 'adventurer'): string {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}
