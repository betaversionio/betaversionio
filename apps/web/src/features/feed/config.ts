import {
  Heart,
  Lamp,
  Cup,
  Eye,
  Like1,
} from "iconsax-react";

export const reactionConfig: Record<
  string,
  { icon: typeof Heart; label: string; activeColor: string }
> = {
  Like: { icon: Heart, label: "Like", activeColor: "text-red-500" },
  Celebrate: { icon: Cup, label: "Celebrate", activeColor: "text-amber-500" },
  Insightful: { icon: Lamp, label: "Insightful", activeColor: "text-yellow-500" },
  Curious: { icon: Eye, label: "Curious", activeColor: "text-violet-500" },
  Support: { icon: Like1, label: "Support", activeColor: "text-green-500" },
};

export const postTypeLabels: Record<string, string> = {
  Text: "Post",
  Article: "Article",
  Snippet: "Code",
  Milestone: "Milestone",
  Link: "Link",
};
