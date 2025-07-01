import { type QuizConfig, StepType } from "./types"

export const DEFAULT_QUIZ_CONFIG: QuizConfig = {
  steps: [
    {
      id: "step-1",
      type: StepType.Welcome,
      title: "Uncover Your #1 Hidden Block to Inner Healing",
      buttonText: "Find Out Now!",
      media: {
        type: "video",
        url: "/placeholder.svg?height=400&width=600&text=Welcome+Video",
      },
    },
    {
      id: "step-2",
      type: StepType.Question,
      question: "What's your biggest life challenge?",
      answerInput: { type: "buttons" },
      options: [
        { id: "opt-2-1", text: "Repetitive Negative Beliefs" },
        { id: "opt-2-2", text: "Emotional Dysfunction (Sadness/Anxiety)" },
        { id: "opt-2-3", text: "Relational Dysfunction (Family, Work)" },
      ],
      media: {
        type: "image",
        url: "/placeholder.svg?height=400&width=600&text=Life+Challenge",
      },
    },
    {
      id: "step-3",
      type: StepType.Message,
      title: "You are NOT Alone!",
      buttonText: "Continue",
      media: {
        type: "audio",
        url: "/placeholder.svg?height=400&width=600&text=Audio+Message",
      },
    },
    {
      id: "step-4",
      type: StepType.Question,
      question: "In one sentence, what holds you back MOST from healing?",
      answerInput: { type: "text" },
      media: {
        type: "image",
        url: "/placeholder.svg?height=400&width=600&text=Healing+Block",
      },
    },
    {
      id: "step-5",
      type: StepType.Message,
      title: "The #1 Killer of Women of Color...",
      buttonText: "Continue",
      media: {
        type: "video",
        url: "/placeholder.svg?height=400&width=600&text=Important+Message",
      },
    },
    {
      id: "step-6",
      type: StepType.Question,
      question: "What would your ideal support system be?",
      answerInput: { type: "buttons" },
      options: [
        { id: "opt-6-1", text: "Self-Paced Programs" },
        { id: "opt-6-2", text: "Small Group Coaching" },
        { id: "opt-6-3", text: "Weekend Retreats" },
      ],
      media: {
        type: "image",
        url: "/placeholder.svg?height=400&width=600&text=Support+System",
      },
    },
    {
      id: "step-7",
      type: StepType.LeadCapture,
      title: "Hey Girl! Your Results are Ready!",
      subtitle:
        'Where should I send them to? Also note that if you enter your cell you are instantly the newest member of "The Hive" - our healing community!',
      namePlaceholder: "Name",
      emailPlaceholder: "Email",
      phonePlaceholder: "Phone Number",
      subscriptionText: "Yes, Please subscribe me to other helpful content from Coach Steph.",
      privacyPolicyUrl: "#",
      buttonText: "Send My Results!",
      socialLinks: [
        { id: "social-1", type: "instagram", url: "#" },
        { id: "social-2", type: "youtube", url: "#" },
      ],
      media: {
        type: "video",
        url: "/placeholder.svg?height=400&width=600&text=Results+Ready",
      },
    },
  ],
  theme: {
    font: "Inter",
    colors: {
      background: "#D9CFC4",
      primary: "#A97C7C",
      accent: "#A11D1F",
      text: "#374151",
      buttonText: "#FFFFFF",
    },
  },
}
