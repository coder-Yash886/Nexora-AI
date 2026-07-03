interface Props {
  seed: string;
  variant: "botttsNeutral" | "initials";
}

export const generateAvatarUri = ({ seed, variant }: Props) => {
  const style = variant === "botttsNeutral" ? "bottts-neutral" : "initials";
  return `https://api.dicebear.com/9.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
