import { Heart, Users, Shield, Brain, AlertCircle } from "lucide-react";

export interface Article {
  id: number;
  category: string;
  title: string;
  description: string;
  imageUrl: string;
  fullContent: string;
  icon: React.ElementType;
}

export const ARTICLES: Article[] = [
  {
    id: 1,
    category: "Understanding Mental Health",
    title: "Recognizing Symptoms of Mental Health",
    description:
      "Learn to identify common signs and symptoms of mental health challenges",
    imageUrl:
      "resource3.jpg",
    fullContent:
      "Mental health is just as important as physical health. Recognizing symptoms early can lead to better outcomes. Common signs include persistent sadness, excessive worry, changes in sleep or appetite, difficulty concentrating, and withdrawal from activities you once enjoyed. Remember, experiencing these symptoms doesn't mean weakness - it means you're human and may benefit from support.",
    icon: Brain,
  },
  {
    id: 2,
    category: "Understanding Mental Health",
    title: "Managing Triggers and Emotions",
    description:
      "Strategies for identifying and coping with emotional triggers",
    imageUrl:
      "resource2.jpg",
    fullContent:
      "Triggers are situations, people, or experiences that provoke strong emotional responses. Learning to identify your triggers is the first step in managing them. Keep a journal to track patterns. When triggered, practice grounding techniques like deep breathing, the 5-4-3-2-1 method, or progressive muscle relaxation. Remember to be patient with yourself - healing takes time.",
    icon: Heart,
  },
  {
    id: 3,
    category: "Coping and Healing",
    title: "Building Resilience After Trauma",
    description:
      "Evidence-based approaches to strengthen your emotional resilience",
    imageUrl:
      "/resource1.avif",
    fullContent:
      "Resilience is the ability to bounce back from adversity. After trauma, building resilience involves creating a support network, practicing self-care, setting boundaries, and developing healthy coping mechanisms. Engage in activities that bring joy, maintain routines, and don't hesitate to seek professional help. Your strength lies not in avoiding difficulty, but in moving through it.",
    icon: Shield,
  },
  {
    id: 4,
    category: "Coping and Healing",
    title: "Self-Care Practices for Mental Wellness",
    description:
      "Daily practices to nurture your mental and emotional wellbeing",
    imageUrl:
      "/resource3.jpg",
    fullContent:
      "Self-care isn't selfish - it's essential. Start with small, consistent practices: maintain a regular sleep schedule, engage in physical activity you enjoy, eat nourishing foods, and set aside time for activities that bring you peace. Practice mindfulness, limit social media, and learn to say no. Remember, self-care looks different for everyone - find what works for you.",
    icon: Heart,
  },
  {
    id: 5,
    category: "GBV Awareness",
    title: "Understanding Gender-Based Violence",
    description: "Recognizing forms of GBV and available support resources",
    imageUrl:
      "resource1.avif",
    fullContent:
      "Gender-based violence (GBV) includes physical, sexual, emotional, and economic abuse. It affects millions of women worldwide. Recognizing GBV is crucial - it can be subtle or overt. No form of violence is acceptable. If you're experiencing GBV, know that it's not your fault and help is available. Reach out to trusted friends, family, or professional services for support.",
    icon: AlertCircle,
  },
  {
    id: 6,
    category: "GBV Awareness",
    title: "The Impact of Violence",
    description: "Understanding the psychological effects of trauma and abuse",
    imageUrl:
      "resource3.jpg",
    fullContent:
      "Violence and trauma can have profound psychological impacts including PTSD, anxiety, depression, and complex trauma responses. These reactions are normal responses to abnormal situations. Healing is possible through trauma-informed therapy, support groups, and self-care practices. Your experiences are valid, and you deserve support and healing.",
    icon: Brain,
  },
  {
    id: 7,
    category: "Rights & Protection",
    title: "Legal Rights and Resources for victims",
    description: "Know your rights and access legal protection services",
    imageUrl:
      "resource2.jpg",
    fullContent:
      "victims of abuse have legal rights including protection orders, access to justice, and the right to safety. Many organizations provide free legal assistance to victims. You have the right to report abuse, seek medical care, and access support services. Document incidents when safe to do so, and reach out to legal aid organizations in your area.",
    icon: Shield,
  },
  {
    id: 8,
    category: "Rights & Protection",
    title: "Safety Planning and Emergency Support",
    description:
      "Creating a comprehensive safety plan for yourself and loved ones",
    imageUrl:
      "/resource2.jpg",
    fullContent:
      "A safety plan is crucial if you're in an abusive situation. Identify safe places to go, keep important documents accessible, memorize emergency numbers, establish a code word with trusted contacts, and set aside emergency funds if possible. Have a bag packed with essentials. Remember, your safety is the priority - there are people and organizations ready to help.",
    icon: AlertCircle,
  },
  {
    id: 9,
    category: "Community Support",
    title: "Connecting with Peer Support Groups",
    description: "Find strength and understanding in shared experiences",
    imageUrl:
      "/resource1.avif",
    fullContent:
      "Peer support groups provide a space where victims can share experiences, receive validation, and learn coping strategies from others who understand. These groups can reduce feelings of isolation and provide practical advice. Whether in-person or online, connecting with others on similar healing journeys can be transformative.",
    icon: Users,
  },
  {
    id: 10,
    category: "Community Support",
    title: "Building Your Support Network",
    description: "Creating a circle of care for your healing journey",
    imageUrl:
      "/resource1.jpg",
    fullContent:
      "A strong support network is vital for healing. Include trusted friends, family members, counselors, support groups, and crisis hotlines. Be selective - surround yourself with people who believe you, respect your boundaries, and support your healing. It's okay if your network is small; quality matters more than quantity. Remember, asking for help is a sign of strength.",
    icon: Users,
  },
];
